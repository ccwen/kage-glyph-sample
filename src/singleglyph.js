// singleGlyph.js
// http://127.0.0.1:2556/kage-glyph-sample/?s=120&q=婆女卡棚朋國組且系財才手閉才火邏羅人

var React=require("react");
var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var getutf32=require("./uniutil").getutf32;
var ucs2string=require("./uniutil").ucs2string;
var E=React.createElement;
var SingleGlyph=React.createClass({
	
	getInitialState:function() {
	    var q=decodeURIComponent(this.props.expression);
	    var parm={};
	    q.split("&").forEach(function(t){
	    	var L=t.split("=");
	    	parm[L[0]]=L[1];
	    });
	    var toload=parm.q||"婆女卡棚朋國組且系財才手閉才火邏羅人", size=parseInt(parm.s||40);
	    console.log(toload+' of size '+size);
	    this.timer1=setTimeout(function(){
	      this.loadFromServer();
	    }.bind(this),0)
	    return {searchresult:[],toload:toload,size:size,data:{newfonts:{}}}
	}
	,loadFromServer:function() {
		var toload=this.state.toload;
		var url="http://chikage.linode.caasih.net/exploded/?inputs="+toload;
		var opts={widestring:toload};
		var unicodes=[],widechars=[],unicode,widechar,i=0;
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
	,load:function(buhins) {
		var data=this.reform(buhins); // 增加新字
		KageGlyph.loadBuhins(data);
		this.setState({data:data});
		this.fontdataready=true;
		this.setState({kagegkyph:this.renderGlyphs(this.state.toload)});
		return;
	}
	,reform:function(buhins){
		var data={}, newfonts=[];
		for (var k in buhins) {
		  data[k]=buhins[k].replace(/@\d+/g, ""); //workaround @n at the end
		}
		var ucs=this.ucs, unicodes=this.state.unicodes;
		for(var i=0; i<unicodes.length; i+=3){
		  var c=unicodes[i], d=unicodes[i+1], a=unicodes[i+2];
		  var ua=ucs(a), ud=ucs(d), uc=ucs(c);
		  var p=RegExp(d+'[^$:]*'); // 不一定有變體, 變體代碼也不一定是數字
		  var m=data[c].match(p);
		  if(m){
		    var newdata=dgg.replace(c,m[0],a,data);
		    if(newdata){
		      var n=newfonts.length, newName=[ua,ud,uc].join(':');
		      data[newName]=newdata;
		      newfonts.push(newName);
		      console.log('use',ua,a,'to replace',ud,d,'in',uc,c);
		    }
		  }
		}
		data.newfonts=newfonts;
		return data;
	}
	,ucs:function(c){if(c)return ucs2string(parseInt(c.substr(1),16));}
	,renderGlyphs:function(toload) {
		var opts={widestring:toload};
		var unicodes=this.state.unicodes;
		var newfonts=this.state.data.newfonts;
		var out=[];
		for(var i=0; i<newfonts.length; i++){
			var newfont=newfonts[i];
			var widechars=newfont.split(':');
			if(this.state.data[newfont]){
			out.push(E(KageGlyph,{glyph: newfont, size: this.state.size})); // 組合產生的新字
			}
		}
		return out;
	}
	,render:function() {
		var toload=this.state.toload;
		return E("div",null,
			this.renderGlyphs(this.state.toload));
	}
})
module.exports=SingleGlyph;