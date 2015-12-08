(function(){
  var o={};
  GLYPH=GLYPH.split(";"); // GLYPH="u3400;u3401;u3402;..." ==> GLYPH=["u3400","u3401","u3402", ...]
  for (var i=0;i<GLYPH.length;i++) {
    o[GLYPH[i]]=i;
    // o["u3400"]=0, o["u3401"]=1, o["u3402"]=2, ...
    // 從 714895 組 GLYPHS 資料中 快取某 unicode 對應的資料
    // 例如: "u3400" 的資料 為 GLYPHS[GLYPH["u3400"]]
  }
  window.GLYPH=o; // GLYPH["u3400"]=0, GLYPH["u3401"]=1, GLYPH["u3402"]=2, ...
  window.GLYPHS=GLYPHS.map(function(d){
    return d.replace(/~/g,'99,0,0');
  });
})();

var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var SingleGlyph=require("./singleglyph");
var dgg=require("../dgg");
      console.time('main load glyph data');
//var glyph=require("../glyph"); // i=glyph['u3400']=0, j=glyph['u20003-jv']=80459, ...
//var glyphs=require("../glyphs"); // data['u3400']=glyphs[0], data['u20003-jv']=glyphs[j], ...
var glyphs=GLYPHS;
var glyph=GLYPH;


      console.timeEnd('main load glyph data');
      var styles={
  candidates:{outline:0,cursor:"pointer"}
  ,input:{fontSize:"200%"}
  ,component:{fontSize:"150%"}
};
var E=React.createElement;
var uniutil=require("./uniutil");
var getutf32=uniutil.getutf32;
var ucs2string=uniutil.ucs2string;
// var fontserverurl="http://chikage.linode.caasih.net/exploded/?inputs=";

var maincomponent = React.createClass({
  getInitialState:function() {
    window.main=this; // just for debugging
    // var toload="婆女卡棚朋國組且系財才手閉才火邏羅人";
    // 1. 萌日目 遞迴搜尋 找到 萌 中 明 的 部件 日 換成 目
    // var toload="萌日目";
    // 2. 𩀨從䞃致招 遞迴運作 將 部件 從 換成 䞃 繼續 再將 部件 致 換成 招
    // var toload="𩀨從䞃致招";
    // 3. b push e pop
    var toload=""; // 邏羅寶貝𩀨從䞃致招";
    return {searchresult:[],toload:toload}
  }, stack:[]
  ,reform2:function(buhins){
    var data={}, newfonts=[];
    for (var k in buhins) {
      data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
      data[k].key=k;
    }
    var unicodes=this.state.unicodes;
    if(unicodes){
      var c=unicodes.shift(), d, a;
      while(unicodes.length){
        d=unicodes.shift();
        a=unicodes.shift();
        if(a)
          c=dgg.partReplace(data,c,d,a);
      }
    }
    return data;
  }
  ,componentDidMount:function(){
    //this.loadFromServer();
      this.loadFromJSON();
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
    if(!this.state.data)return;
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
  ,loadFromJSON:function() {
    var toload=this.state.toload;
    var opts={widestring:toload};
    var unicodes=[],widechars=[],unicode,widechar,i=0;
    var data={}, u;
    while (unicode=getutf32(opts)){
      unicodes[i]=u='u'+unicode.toString(16);
      dgg.getAllGlyphs(data,u);
      data[u]=glyphs[glyph[u]]; // .replace(/~/g,"99:0:0:");
      widechars[i]=widechar=ucs2string(unicode); i++;
    }
    this.load(data);
    this.setState({unicodes:unicodes,widechars:widechars});
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
    //this.loadFromServer();
      this.loadFromJSON();
    }.bind(this),0)
  }
  ,render: function() {
    if (window.location.search)
        return E(SingleGlyph,{expression:window.location.search.substr(1)})
    else
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