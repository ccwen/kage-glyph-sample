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
    var toload="𩀨從䞃致招";
    return {searchresult:[],toload:toload}
  }
  ,reform2:function(buhins){
    var data={}, newfonts=[];
    for (var k in buhins) {
      data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
      data[k].key=k;
    }
    var unicodes=this.state.unicodes;
    var c=unicodes.shift(), d, a;
    while(unicodes.length>1){
      d=unicodes.shift(), a=unicodes.shift();
      c=dgg.replace(c,d,a,data);
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
    var opts={widestring:toload};
    var unicodes=this.state.unicodes;
    var newfonts=this.state.data.newfonts;
    var out=[];
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
      out.push(key);
      out.push(E(KageGlyph,{glyph: key, size: 40}))
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
    fetch(url)
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
    return E("div", null, "下列輸入格, 三個字 cda 用以組成ㄧ個新字, 將字 c 部件 d 換字 a"
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