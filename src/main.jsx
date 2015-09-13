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
    var toload="國朋棚"; // 口子李 方東陳 國朋棚
    return {searchresult:[],toload:toload,components:["a","b","c","dd"]}
  }
  ,reformcase03:function(c,d,a,data,list){
    var p=RegExp('^'+d+'-\\d+'), m;
    for (var i=0; i<list.length; i++){
      if(m=list[i].match(p)){
        data['new']=dgg.replace(c,m[0],a,data); return;
      }
    }
  }
  ,reformcase02:function(c,d,a,data,list){
    var p=RegExp('^'+d+'-\\d+'), m;
    for (var i=0; i<list.length; i++){
      if(m=list[i].match(p)){
        data[m[0]]=data[a]; return;
      }
    }
  }
  ,reformcase01:function(c,d,a,data,list){
      data[c]=data[c].replace(d,a);
  }
  ,reform:function(buhins){
    var data = {}, list = [];
    for (var k in buhins) {
      var b= buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
      data[k] = b;
      list.push(k)
    }
    var ucs=this.ucs, unicodes=this.state.unicodes, a=unicodes[0], d=unicodes[1], c=unicodes[2];
    console.log('use',ucs(a),a,'to replace',ucs(d),d,'in',ucs(c),c);
  //this.reformcase01(c,d,a,data,list);
  //this.reformcase02(c,d,a,data,list);
    this.reformcase03(c,d,a,data,list);
    return data;
  }
  ,componentDidMount:function(){
    this.loadFromServer();
  }
  ,ucs:function(c){return ucs2string(parseInt(c.substr(1),16));}
  ,load:function(buhins) {
    var data=this.reform(buhins);
    KageGlyph.loadBuhins(data);
    var components=[];
    for (var k in data) {
      var str=this.ucs(k); if(!str.charCodeAt(0))break;
      var j=k.lastIndexOf('-');
      if(j>-1) str+=parseInt(k.substr(j+1));
      components.push(str);
    }
    this.setState({components:components,data:data});
    this.fontdataready=true;
    this.setState({kagegkyph:this.renderGlyphs(this.state.toload)});
    return;
  }
  ,renderGlyphs:function(toload) {
    var opts={widestring:toload};
    var unicodes=this.state.unicodes;
    var widechars=this.state.widechars;
    var out=[];
    var a=unicodes[0], d=unicodes[1], c=unicodes[2];
    out.push('用');
    out.push(E(KageGlyph,{glyph: a}));
    out.push('換');
    out.push(E(KageGlyph,{glyph: d}));
    out.push('於');
    out.push(E(KageGlyph,{glyph: c}));
    out.push('生');
    out.push(E(KageGlyph,{glyph: 'new', size: 128})); // 組合產生的新字
    out.push(E('br'));
    out.push(E('br'));
    out.push('相關文字或部件');
    out.push(E('br'));
    Object.keys(this.state.data).map(function(key){
      out.push(key);
      out.push(E(KageGlyph,{glyph: key}))
    });
    return out;
  }
  ,loadFromServer:function() {
    var toload=this.state.toload;
    var url=fontserverurl+toload;
    var opts={widestring:toload};
    var unicodes=[],widechars=[],unicode,widechar,i=0,out=['用'];
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
    this.setState({toload:toload});
    this.timer1=setTimeout(function(){
      this.loadFromServer();
    }.bind(this),0)
  }
  ,onComponentChange:function(e) {
    var idx=parseInt(e.target.dataset.idx);
    var newvalue=e.target.value;
    var components=this.state.components;
    components[idx]=newvalue;
    console.log(newvalue);
    this.setState({components:components});

  }
  ,renderItems:function(item,idx) {
    return E("input",{key:idx,"data-idx":idx,size:3,
      onChange:this.onComponentChange,style:styles.component,value:item});
  }
  ,render: function() {
    return E("div", null, "在下列輸入格, 給三個中文字, 可用以組成新字"
            ,E("input"
              ,{ref:"toload"
              ,value:this.state.toload
              ,onChange:this.onChange
              ,style:styles.input})
          //,E("br")
          //,this.state.components.map(this.renderItems)
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