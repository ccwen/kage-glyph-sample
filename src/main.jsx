var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var Polygons=require("kage").Polygons;
var styles={candidates:{outline:0,cursor:"pointer"}};
var E=React.createElement;
var getutf32=require("./uniutil").getutf32;

var fontserverurl="http://chikage.linode.caasih.net/exploded/?inputs=";

var maincomponent = React.createClass({
  getInitialState:function() {
    return {searchresult:[],toload:"陳"}
  }
  ,componentDidMount:function(){
    this.loadFromServer();
  }
  ,load:function(buhins) {
    var that = this;
    var data = {};
    var k;
    for (k in buhins) {
      data[k] = buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
    }
    KageGlyph.loadBuhins(data);
    this.fontdataready=true;
    this.setState({kagegkyph:this.renderGlyphs(this.state.toload)});
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
  ,render: function() {
    return E("div",null,
       E("input", {ref:"toload", value:this.state.toload, onChange:this.onChange})
       ,E("br")
      ,E("span",{ref:"candidates",
        onMouseUp:this.onselect,onTouchTap:this.onselect,
        style:styles.candidates},
      this.state.kagegkyph)
    );
  }
});
module.exports=maincomponent;