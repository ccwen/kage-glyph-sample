var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var dgg=require("../dgg");
window.dgg=dgg; // just for debugging

var styles={
  candidates:{outline:0,cursor:"pointer"}
  ,input:{fontSize:"200%"}
  ,component:{fontSize:"150%"}
};
var E=React.createElement;
var getutf32=require("./uniutil").getutf32;
var ucs2string=require("./uniutil").ucs2string;
var chinese=function(c){
  return ucs2string(parseInt(c.substr(1),16))
}
var fontserverurl="http://chikage.linode.caasih.net/exploded/?inputs=";

var maincomponent = React.createClass({
  getInitialState:function() {
    window.main=this; // just for debugging
    var toload="口子李子口杏方東陳國朋棚系且組手才財火才閉人羅邏"; // 口子李 方東陳 國朋棚
    return {searchresult:[],toload:toload}
  }
  ,reformcase03:function(c,d,a,data){
    var p=RegExp(d+'[^$:]*'); // 不一定有變體, 變體代碼也不一定是數字
    var m=data[c].match(p);
    if(m) data['new']=dgg.replace(c,m[0],a,data);
  }
  ,reformcase02:function(c,d,a,data){
    var p=RegExp(d+'[^$:]*'); // 不一定有變體, 變體代碼也不一定是數字
    var m=data[c].match(p);
    if(m) data[m[0]]=data[a];
  }
  ,reformcase01:function(c,d,a,data){
      data[c]=data[c].replace(d,a);
  }
  ,reform:function(buhins){
    var data={}, newfonts=[];
    for (var k in buhins) {
      data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
    }
    var ucs=this.ucs, unicodes=this.state.unicodes;
    for(var i=0; i<unicodes.length; i+=3){
      var a=unicodes[i], d=unicodes[i+1], c=unicodes[i+2];
      var ua=ucs(a), ud=ucs(d), uc=ucs(c);
      var p=RegExp(d+'[^$:]*'); // 不一定有變體, 變體代碼也不一定是數字
      var m=data[c].match(p);
      if(m){
        var newdata=dgg.replace(c,m[0],a,data);
        if(newdata){
          var n=newfonts.length, newName=[ua,ud,uc].join(':');
          data[newName]=newdata;
          newfonts.push(newName);
          console.log('use',ua,a,'to replace',ud,d,'in',uc,c);
        }
      }
    }
    data.newfonts=newfonts;
    return data;
  }
  ,componentDidMount:function(){
    this.loadFromServer();
  }
  ,ucs:function(c){if(c)return ucs2string(parseInt(c.substr(1),16));}
  ,load:function(buhins) {
    var data=this.reform(buhins); // 增加新字
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
      var a=widechars[0], d=widechars[1], c=widechars[2];
      if(this.state.data[newfont]){
        out.push('用'+a+'換'+d+'於'+c);
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
    return E("div", null, "在下列輸入格, 給三個中文字, 可用以組成新字"
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