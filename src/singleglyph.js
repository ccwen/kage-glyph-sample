// singleGlyph.js
// http://127.0.0.1:2556/kage-glyph-sample/?sz=256&q=婆女卡棚朋國組且系財才手閉才火邏羅人

var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var getutf32=require("./uniutil").getutf32; // 回中文字對應的 unicode 數值
var ucs2string=require("./uniutil").ucs2string; // 回 unicode 數值對應的中文字

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
		fetch(url)
			.then(function(response){ return response.json(); })
			.then(function(buhins) {
				var data=that.data=that.reform(buhins); // 增加新字
				KageGlyph.loadBuhins(data);
				that.setState({fontdataready:true});
			});
	}
	,reform:function(buhins){
		var data={}, newfonts=[];
		for (var k in buhins) data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
		for(var i=0; i<this.unicodes.length; i+=3){
		  var c=this.unicodes[i], d=this.unicodes[i+1], a=this.unicodes[i+2];
		  var uc=ucs(c), ud=ucs(d), ua=ucs(a); // 三個字 cda 用以組成ㄧ個新字, 將字 c 部件 d 換字 a
		  var p=RegExp(d+'[^$:]*'); // 用以搜尋部件 d 在 c 中的樣式 （不一定有變體, 變體代碼也不一定是數字）
		  var m=data[c].match(p);
		  if(m){
		    var newdata=dgg.replace(c,m[0],a,data);
		    if(newdata){
		      var n=newfonts.length, name=[uc,ud,ua].join('');
		      data[name]=newdata, newfonts.push(name);
		    }
		  }
		}
		data.newfonts=newfonts;
		return data;
	}
	,renderGlyphs:function(toload) {
		var size=this.state.size, out=[], newfonts=this.data.newfonts;
		if(newfonts) newfonts.forEach(function(newfont,idx){
			out.push(newfont);
			out.push(E(KageGlyph,{glyph: newfont, size: size, key:idx})); // 組合產生的新字
		})
		return out;
	}
	,render:function() {
		return E("div", null, this.renderGlyphs(this.state.toload));
	}
})
module.exports=SingleGlyph;