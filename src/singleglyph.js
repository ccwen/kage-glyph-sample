// singleGlyph.js
// http://127.0.0.1:2556/kage-glyph-sample/?q=邏羅(寶貝(𩀨從䞃致招))&sz=512

var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var getutf32=require("./uniutil").getutf32; // 回中文字對應的 unicode 數值
var ucs2string=require("./uniutil").ucs2string; // 回 unicode 數值對應的中文字
var dgg=require("../dgg");

var E=React.createElement;
var ucs=function(c){if(c)return ucs2string(parseInt(c.substr(1),16));} // 回 unicode 字串對應的中文字
var getParamVal=function(key,def){ // get url parameter value by key
    var search=window.location.search;
    var parms=search?decodeURIComponent(search.substr(1)):"";
    var m=parms.match(RegExp('\\b'+key+'=([^&]+)')); return m?m[1]:def;
}
var checkParam=function(key){ // get url parameter value by key
    var search=window.location.search;
    var parms=search?decodeURIComponent(search.substr(1)):"";
    var m=parms.match(RegExp('\\b'+key+'\\b')); return m;
}
var SingleGlyph=React.createClass({
	getInitialState:function() {
	    var toload=getParamVal('q',"婆女卡"); // 棚朋國組且系財才手閉才火邏羅人
	    var size=parseInt(getParamVal('sz',256));
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
			.then(function(response){
				return response.json(); 
			})
			.then(function(buhins) {
				var data=that.data=that.reform(buhins); // 增加新字
				KageGlyph.loadBuhins(data);
				that.setState({fontdataready:true});
			});
	}
	,reform:function(buhins){
		var data={};
		for (var k in buhins) data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
		this.thefont=dgg.partsReplace(data,this.unicodes);
		return data;
	}
	,renderGlyphs:function(toload) {
		var size=this.state.size, out=[], data=this.data;
		var keys=Object.keys(data), ucs=dgg.ucs, thefont=this.thefont;
		if(keys.length){
			if(thefont){
				out.push(E(KageGlyph,{glyph: thefont, size: size})); // 組合產生的新字
				out.push(E('br'));
			}
			if(checkParam('chk')) keys.forEach(function(key){
				var m=key.match(/^u[\da-f]+/);
				if(m){
					var c=m?m[0]:m, dc=data[c];
					if(c && !dc){
					  out.push(c+ucs(c)+' ');
					}
				}
				out.push(key);
				out.push(E(KageGlyph,{glyph: key, size: 40}));
			})
		}
		return out;
	}
	,render:function() {
		var out='nothing yet';
		if(this.state.fontdataready)
			out=this.renderGlyphs(this.state.toload);
		return E("div", null, out);
	}
})
module.exports=SingleGlyph;