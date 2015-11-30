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
var SingleGlyph=React.createClass({
	getInitialState:function() {
	    var toload=getParamVal('q',"婆女卡"); // 棚朋國組且系財才手閉才火邏羅人
	    var size=parseInt(getParamVal('sz',256));
	    return {toload:toload,size:size}
	}
	,unicodes:[], data:{}
	,componentDidMount:function() {
	     this.loadFromJSON();
	}
	,loadFromJSON:function() {
		var toload=this.state.toload;
		var opts={widestring:toload};
		var unicodes=[],widechars=[],unicode,widechar,i=0;
		var data={}, u;
		while (unicode=getutf32(opts)){
		  widechar=ucs2string(unicode);
		  if(widechar>='1' && widechar<='9'){
		  	  var j=unicode-0x31; // part index in widechars[i-1]
		  	  var c=widechars[i-1], u='u'+getutf32({widestring:c}).toString(16);
		  	  var t=getParts(u), L=t.split(' '); L.shift();
		  	  console.log(c+u+' <-- '+L.map(function(u,i){
		  	  	return (i+1)+' '+ucs(u)+u;
		  	  }).join(' '));
		  	  u=L[j];
		  	  widechar=u.match(/^u[0-9a-f]{4,5}/)?ucs(u):u;
		  } else u='u'+unicode.toString(16);
		  unicodes[i]=u;
		  dgg.getAllGlyphs(data,u);
		  data[u]=glyphs[glyph[u]].replace(/~/g,"99:0:0:");
		  widechars[i]=widechar; i++;
		}
		this.unicodes=unicodes;
	//	this.widechars=widechars;
		this.data=this.reform(data);
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
	,reform:function(buhins){
		var data={};
		for (var k in buhins) data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
	//	data['c']="99:0:0:-10:-10:140:140:d$99:0:0:60:60:240:240:b";
	//	data['b']="1:0:0:50:100:100:50$1:0:0:100:50:150:100$1:0:0:150:100:100:150$1:0:0:100:150:50:100";
	//	data['d']="1:0:0:50:50:150:50$1:0:0:150:50:150:150$1:0:0:150:150:50:150$1:0:0:50:150:50:50";
	//	data['a']="1:0:0:50:50:150:150$1:0:0:50:150:150:50";
		this.thefont=dgg.partsReplace(data,this.unicodes);
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