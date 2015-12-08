// singleGlyph.js
console.log('loading singleGlyph.js');
// http://127.0.0.1:2556/kage-glyph-sample/?q=邏羅寶貝𩀨從䞃致招&sz=512&chk
var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var getutf32=require("./uniutil").getutf32; // 回中文字對應的 unicode 數值
var ucs2string=require("./uniutil").ucs2string; // 回 unicode 數值對應的中文字
var dgg=require("../dgg");
var getParts=require("../parts").getParts;
//var GR=require("../glyphreplace"); // ?????? 如何放到 ksana2015 的 node_modules 中 ??????
//var glyph=require("../glyph"); // i=glyph['u3400']=0, j=glyph['u20003-jv']=80459, ...
//var glyphs=require("../glyphs"); // data['u3400']=glyphs[0], data['u20003-jv']=glyphs[j], ...
//      console.timeEnd('singleglyph load glyph data');
var glyph=GLYPH;
var glyphs=GLYPHS;

var E=React.createElement;
var ucs=function(c){ // 回 unicode 字串對應的中文字
	if(c)return ucs2string(parseInt(c.substr(1),16)).replace(/\r/,'');}
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
var getUtf32Codes=function(ws){
	var u, U=[], o={widestring:ws};
	while (u=getutf32(o)) U.push(u);
	return U;
}
var getUnicodes=function(utf32Codes){
	return utf32Codes.map(function(u){
		return 'u'+u.toString(16);
	})
}
var getWideChars=function(utf32Codes){
	return utf32Codes.map(function(u){
		return ucs2string(u);
	})
}
var SingleGlyph=React.createClass({
	getInitialState:function() {
	    var toload=getParamVal('q',"婆女卡"); // 婆女卡棚朋國組且系財才手閉才火邏羅人
	    var size=parseInt(getParamVal('sz',256));
	    return {toload:toload,size:size}
	}
	,unicodes:[], data:{}
	,componentDidMount:function() {
	     this.loadFromJSON();
	}
	,loadFromJSON:function() {
		var toload=this.state.toload;
		var utf32Codes=getUtf32Codes(toload);
		var unicodes=getUnicodes(utf32Codes);
		var widechars=getWideChars(utf32Codes);
		unicodes=unicodes.map(function(unicode,i){
			var j=parseInt(unicode.substr(1),16)-0x30;
			if(j>=1 && j<=9){ // 數字 1 ~ 9 代表 c 字符 的 組成部件 序號 
				var parts=getParts(unicodes[i-1]).split(' ');
				unicode=j<parts.length?parts[j]:unicode;
				if(unicode.match(/^u[0-9a-f]{4,5}/)){
					var utf32=parseInt(unicode.substr(1),16)
					utf32Codes[i]=utf32;
					widechars[i]=ucs2string(utf32);
				}
			}
			return unicode;
		});
		var data={};
		unicodes.forEach(function(u){
			dgg.getAllGlyphs(data,u);
		});
		this.data=this.reform(data,unicodes);
		this.setState({unicodes:unicodes,widechars:widechars,fontdataready:true});
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
	,reform:function(buhins,unicodes){
		var data={};
		for (var k in buhins) data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
	//	data['c']="99:0:0:-10:-10:140:140:d$99:0:0:60:60:240:240:b";
	//	data['b']="1:0:0:50:100:100:50$1:0:0:100:50:150:100$1:0:0:150:100:100:150$1:0:0:100:150:50:100";
	//	data['d']="1:0:0:50:50:150:50$1:0:0:150:50:150:150$1:0:0:150:150:50:150$1:0:0:50:150:50:50";
	//	data['a']="1:0:0:50:50:150:150$1:0:0:50:150:150:50";
		this.thefont=dgg.partsReplace(data,unicodes);
		KageGlyph.loadBuhins(data);
		return data;
	}
	,renderGlyphs:function(toload,that) {
		var size=this.state.size, out=[], data=this.data;
		var keys=Object.keys(data), ucs=dgg.ucs, thefont=this.thefont;
		var i=0;
		if(keys.length){
			if(thefont){
				out.push(E(KageGlyph,{glyph: thefont, key: i++, size: size})); // 組合產生的字
				out.push(E('br',{key:i++}));
			}
			if(checkParam('chk')) keys.forEach(function(key){
				var m=key.match(/^u[\da-f]+/), t='';
				if(m)
					t=ucs(key);
				out.push(E("span",{key:i++},t+key+' '));
				out.push(E(KageGlyph,{glyph: key, key:i++, size: 40}));
			})
		}
		return out;
	}
	,render:function() {
		var out='nothing yet';
		if(this.state.fontdataready)
			out=this.renderGlyphs(this.state.toload,this);
		return E("div", null, out);
	}
})
module.exports=SingleGlyph;