var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var SingleGlyph=require("./singleglyph");
var dgg=require("../dgg");

var styles={
  candidates:{outline:0,cursor:"pointer"}
  ,input:{fontSize:"200%"}
  ,component:{fontSize:"150%"}
};
var E=React.createElement;
var getutf32=require("./uniutil").getutf32;
var ucs2string=require("./uniutil").ucs2string;
var fontserverurl="http://chikage.linode.caasih.net/exploded/?inputs=";

var maincomponent = React.createClass({
  getInitialState:function() {
    window.main=this; // just for debugging
    // var toload="婆女卡棚朋國組且系財才手閉才火邏羅人";
    // 1. 萌日目 遞迴搜尋 找到 萌 中 明 的 部件 日 換成 目
    // var toload="萌日目";
    // 2. 𩀨從䞃致招 遞迴運作 將 部件 從 換成 䞃 繼續 再將 部件 致 換成 招
    // var toload="𩀨從䞃致招";
    // 3. b push e pop
    var toload="邏羅(𩀨從䞃致招)";
    return {searchresult:[],toload:toload}
  }, stack:[]
  ,reform2:function(buhins){
    var data={}, newfonts=[];
    for (var k in buhins) {
      data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
      data[k].key=k;
    }
    var unicodes=this.state.unicodes;
    var c=unicodes.shift(), d, a, da;
    while(unicodes.length){
      d=unicodes.shift();
      if(d==='u29'){ // )
        a=c, cd=this.stack.pop(), c=cd.c, d=cd.d; 
      }else{
        a=unicodes.shift();
      }
      if(a==='u28') // (
        this.stack.push({c:c,d:d}), c=unicodes.shift();
      else
        c=dgg.replace(data,c,d,a);
    }
    return data;
  }
  ,componentDidMount:function(){
    this.loadFromServer();
  }
  ,ucs:function(c){if(c)return ucs2string(parseInt(c.substr(1),16));}
  ,load:function(buhins) {
    var data=this.reform2(buhins); // 增加新字
    KageGlyph.loadBuhins(data);
    this.setState({data:data});
    this.fontdataready=true;
    this.setState({kagegkyph:this.renderGlyphs(this.state.toload)});
    return;
  }
  ,renderGlyphs:function(toload) {
    var keys=Object.keys(this.state.data);
    if(keys===[])return;
    var opts={widestring:toload};
    var unicodes=this.state.unicodes;
    var newfonts=this.state.data.newfonts;
    if(!newfonts)return[];
    var out=[], data=this.state.data, ucs=this.ucs;
    for(var i=0; i<newfonts.length; i++){
      var newfont=newfonts[i];
      var widechars=newfont.split(':');
      if(this.state.data[newfont]){
        out.push(E(KageGlyph,{glyph: newfont, size: 80})); // 組合產生的新字
      }
    }
    out.push(E('br'));
    out.push(E('br'));
    out.push('相關參考文字或部件');
    out.push(E('br'));
    Object.keys(this.state.data).forEach(function(key){
      if(key==='newfonts')return;
      var m=key.match(/^u[\da-f]+/);
      if(m){
        var c=m?m[0]:m, dc=data[c];
        if(c && !dc){
          data[c]=c;
          out.push(c+ucs(c)+' ');
        }
      }
      out.push(key);
      out.push(E(KageGlyph,{glyph: key, size: 40}));
    });
    return out;
  }
  ,loadFromServer:function() {
    var toload=this.state.toload;
    var url=fontserverurl+toload;
    var opts={widestring:toload};
    var unicodes=[],widechars=[],unicode,widechar,i=0;
    while (unicode=getutf32(opts)){
      unicodes[i]='u'+unicode.toString(16);
      widechars[i]=widechar=ucs2string(unicode); i++;
    }
    this.setState({unicodes:unicodes,widechars:widechars});
    fetch(url.replace(/[\(\)]/g,''))
      .then(function(response){
        var json=response.json();
        return json; })
      .then(this.load);
  }  
  ,onChange:function(e) {
    clearTimeout(this.timer1);
    var toload=e.target.value;
    if(this.state.data)
      this.state.data['new']=undefined;
    this.setState({toload:toload});
    this.timer1=setTimeout(function(){
      this.loadFromServer();
    }.bind(this),0)
  }
  ,render: function() {
    if (window.location.search) {
      return E(SingleGlyph,{expression:window.location.search.substr(1)})
    }
    return E("div", null, "先取原字 c, 連續取 da 以生新字 c, 將原字 c 部件 d 換字 a"
            ,E("br")
            ,E("input"
              ,{ref:"toload"
              ,value:this.state.toload
              ,onChange:this.onChange
              ,style:styles.input,size:50})
            ,E("br")
            ,E("span"
              ,{ref:"candidates"
              ,onMouseUp:this.onselect
              ,onTouchTap:this.onselect
              ,style:styles.candidates}
            ,this.state.kagegkyph)
            );
  }
});
module.exports=maincomponent;