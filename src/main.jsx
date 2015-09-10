var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var Polygons=require("kage").Polygons;
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
    return {searchresult:[],toload:"子口李杏",components:["a","b","c","dd"]}
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
  ,reform:function(buhins){
    var data = {}, list = [];
    for (var k in buhins) {
      var b= buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
      data[k] = b;
      list.push(k)
    }
    var d=list.shift(), a=list.shift(), c=list.shift();
    console.log('del',this.ucs(d),d,'add',this.ucs(a),a,'in',this.ucs(c),c,list);
  //this.reformcase01(d,a,c,data,list);
    this.reformcase02(d,a,c,data,list);
    return data;
  }
  ,reformcase03:function(d,a,c,data,list){
    var p=RegExp('^'+d+'-\\d+');
    for (var i=0; i<list.length; i++){
      var m=list[i].match(p);
      if(m){
        d=m[0];
        console.log('data['+d+']','before',data[d]);
        var xys=data[d].split(':').slice(3);
        console.log(xys);
        data[d]=data[a];
        console.log('data['+d+']','after',data[d]);
        break;
      }
    }
  }
  ,reformcase02:function(d,a,c,data,list){
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
  ,reformcase01:function(d,a,c,data,list){
      console.log('before',data[c]);
      data[c]=data[c].replace(d,a);
      console.log('after',data[c]);
  }
  ,minimumbounding:function(xypairs){
    var xmi=xypairs[0],ymi=xypairs[1],xma=xypairs[0],yma=xypairs[1];
    for(var i=2;i<xypairs.length;i+=2){
      var x=xypairs[i], y=xypairs[i+1];
      if(xmi>x)xmi=x; if(xma<x)xma=x;
      if(ymi>y)ymi=y; if(yma<y)yma=y;
    }
    return {xmi:xmi, ymi:ymi, xma:xma, yma:yma}
  }
  ,renderGlyphs:function(toload) {
    var opts={widestring:toload};
    var ic=0,out=[];;
    while (ic=getutf32(opts)){
      out.push(E(KageGlyph,{glyph:"u"+ic.toString(16)}));  
    }
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
    return E("div"
            ,null
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