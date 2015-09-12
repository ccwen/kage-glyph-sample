var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var Polygons=require("kage").Polygons;
var dgg=require("../dgg");
window.dgg=dgg; // just for debugging
var Sampleglyph=require("./sampleglyph");

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
    return {searchresult:[],toload:"口子李",components:["a","b","c","dd"]}
  }
  ,reformcase03:function(c,d,a,data,list){
    var p=RegExp('^'+d+'-\\d+');
    for (var i=0; i<list.length; i++){
      var m=list[i].match(p);
      if(m){
        data['x']=dgg.replace(c,m[0],a,data); return;
      }
    }
  }
  ,reformcase02:function(c,d,a,data,list){
    var chinese=function(c){return ucs2string(parseInt(c.substr(1),16))}
    console.log(d,chinese(d),a,chinese(a),c,chinese(c));
    var p=RegExp('^'+d+'-\\d+');
    for (var i=0; i<list.length; i++){
      var m=list[i].match(p);
      if(m){
        d=m[0];
        console.log('data['+d+']','before',data[d]);
        data[d]=data[a];
        console.log('data['+d+']','after',data[d]);
        break;
      }
    }
  }
  ,reformcase01:function(c,d,a,data,list){
      console.log('before',data[c]);
      data[c]=data[c].replace(d,a);
      console.log('after',data[c]);
  }
  ,reform:function(buhins){
    var data = {}, list = [];
    for (var k in buhins) {
      var b= buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
      data[k] = b;
      list.push(k)
    }
    var a=list.shift(), d=list.shift(), c=list.shift();
    console.log('use',this.ucs(a),a,'to replace',this.ucs(d),d,'in',this.ucs(c),c,list);
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
      var str=this.ucs(k);
      var j=k.indexOf('-');
      if(j>-1) str+=parseInt(k.substr(j+1));
      components.push(str);
    }
    this.setState({components:components});
    this.fontdataready=true;
    this.setState({components:components,kagegkyph:this.renderGlyphs(this.state.toload)});
    return;
  }
  ,renderGlyphs:function(toload) {
    var opts={widestring:toload};
    var ic=[],i=0,out=['用'];
    while (ic[i]=getutf32(opts)){
      var unicode="u"+ic[i].toString(16); i++;
      out.push(E(KageGlyph,{glyph: unicode}));  // 畫出 ic 對應的 字
    }
    out.push('組成');
    out.push(E(KageGlyph,{glyph: 'x'}));
    out.push(E('br'));
    out.push('(use '+ucs2string(ic[0])+' to replace '+ucs2string(ic[1])+' in '+ucs2string(ic[2])+')')
    return out;
  }
  ,loadFromServer:function() {
    var url=fontserverurl+this.state.toload;
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
    }.bind(this),500)
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
    return E("div", null, "在下列輸入格, 給三個中文字用以動態組成新字"
            ,E("input"
              ,{ref:"toload"
              ,value:this.state.toload
              ,onChange:this.onChange
              ,style:styles.input})
            ,E("br")
            ,this.state.components.map(this.renderItems)
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