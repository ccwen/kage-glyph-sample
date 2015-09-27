// singleGlyph.js
// http://127.0.0.1:2556/kage-glyph-sample/?sz=256&q=婆女卡棚朋國組且系財才手閉才火邏羅人

var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var getutf32=require("./uniutil").getutf32; // 回中文字對應的 unicode 數值
var ucs2string=require("./uniutil").ucs2string; // 回 unicode 數值對應的中文字
var dgg=require("../dgg");

var E=React.createElement;
var ucs=function(c){if(c)return ucs2string(parseInt(c.substr(1),16));} // 回 unicode 字串對應的中文字
var getParmVal=function(key,def){ // get url parameter value by key
    var search=window.location.search;
    var parms=search?decodeURIComponent(search.substr(1)):"";
    var m=parms.match(RegExp('\\b'+key+'=([^&]+)')); return m?m[1]:def;
}
var SingleGlyph=React.createClass({
	getInitialState:function() {
	    var toload=getParmVal('q',"婆女卡"); // 棚朋國組且系財才手閉才火邏羅人
	    var size=parseInt(getParmVal('sz',256));
	    return {toload:toload,size:size}
	}
	,unicodes:[], data:{}
	,componentDidMount:function() {
	     this.loadFromServer();
	}
	,loadFromServer:function() {
		var toload=this.state.toload;
		var url="http://chikage.linode.caasih.net/exploded/?inputs="+toload;
		var opts={widestring:toload};
		var unicode,i=0,that=this;
		while (unicode=getutf32(opts))
			this.unicodes[i++]='u'+unicode.toString(16);
		fetch(url.replace(/[\(\)]/g,''))
			.then(function(response){ return response.json(); })
			.then(function(buhins) {
				var data=that.data=that.reform(buhins); // 增加新字
				KageGlyph.loadBuhins(data);
				that.setState({fontdataready:true});
			});
	}
	,reform:function(buhins){
		var data={};
		for (var k in buhins) data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
		dgg.replace(data,this.unicodes);
		return data;
	}
	,renderGlyphs:function(toload) {
		var size=this.state.size, out=[], data=this.data;
		var keys=Object.keys(data);
		if(keys.length){
			var lastkey=keys[keys.length-1];
			if(!lastkey.match(/^[^a-z]/))return;
			out.push(E(KageGlyph,{glyph: lastkey, size: size})); // 組合產生的新字
		}
		return out;
	}
	,render:function() {
		return E("div", null, this.renderGlyphs(this.state.toload));
	}
})
module.exports=SingleGlyph;