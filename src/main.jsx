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
    return {searchresult:[],toload:"陳",components:["a","b","c","dd"]}
  }
  ,componentDidMount:function(){
    this.loadFromServer();
  }
  ,load:function(buhins) {
    var that = this;
    var data = {};
    var k;
    var components=[];
    for (k in buhins) {
      data[k] = buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
      var code=k.substr(1).replace(/-.*/,"");

      components.push(ucs2string(parseInt("0x"+code)));
    }
    KageGlyph.loadBuhins(data);
    this.fontdataready=true;
    this.setState({components:components,kagegkyph:this.renderGlyphs(this.state.toload)});
    return;
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
      .then(function(response){ return response.json(); })
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
    console.log(e.target.dataset.idx)
    var idx=parseInt(e.target.dataset.idx);
    var newvalue=e.target.value;
    var components=this.state.components;
    components[idx]=newvalue;
    this.setState({components:components});

  }
  ,renderItems:function(item,idx) {
    return E("input",{key:idx,"data-idx":idx,size:2,
      onChange:this.onComponentChange,style:styles.component,value:item});
  }
  ,render: function() {
    return E("div",null,
       E("input", {ref:"toload", value:this.state.toload, onChange:this.onChange,style:styles.input})
       ,E("br")
       ,this.state.components.map(this.renderItems)
       ,E("br")
      ,E("span",{ref:"candidates",
        onMouseUp:this.onselect,onTouchTap:this.onselect,
        style:styles.candidates},
      this.state.kagegkyph)
    );
  }
});
module.exports=maincomponent;