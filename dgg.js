// dgg.js -- functions for dynamic glyph generation

var decode=function(infos){
	var glyphs=infos.split('$').map(function(info){
		var values=info.split(":");
		var t=values[0], sd=values[1], ed=values[2], x, y;
		var points=[], xyPairs=values.slice(3);
		xyPairs.forEach(function(v,i){ var n=v;
			if(i%2===0) x=n;
			else { y=n, points.push([parseInt(x),parseInt(y)]), x=undefined; }
		});
		var glyph={t:parseInt(t),sd:parseInt(sd),ed:parseInt(ed),p:points};
		if(x!==undefined) {
			glyph.partId=x;
		//	console.log("partId",x);
		}
		return glyph;
	})
	return glyphs;
}

var getPoints=function(glyphs){ 
	var points=[];
	glyphs.forEach(function(glyph){
		glyph.p.forEach(function(point){
			points.push(point);
		})
	});
	return points;
}
var getPartRect=function(glyphs,partId){ 
	var frameHieght, frameWidth;
	for(var i=0; i<glyphs.length; i++){
		glyph=glyphs[i];
		if(glyph.partId===partId){
			return glyph.p;
		}
	}
}
var minimumBounding=function(points){
	if (typeof points=="string") {
		g=decode(points);
		points=getPoints(g);
	}
	var mbf=[1000,1000,-1000,-1000];
	points.forEach( function(p){
		var x=p[0],y=p[1];
		if (x<mbf[0]) mbf[0]=p[0];
		if (y<mbf[1]) mbf[1]=p[1];

		if (x>mbf[2]) mbf[2]=x;
		if (y>mbf[3]) mbf[3]=y;
	});
	return mbf;
}
var adjustMbf=function (mbf,rect){
	var L=mbf[0], T=mbf[1], R=mbf[2], B=mbf[3];
	var x=rect[0][0], y=rect[0][1];
	var W=rect[1][0]-x, H=rect[1][1]-y;
	return [Math.round(L*W/200)+x,Math.round(T*H/200)+y,Math.round(R*W/200)+x,Math.round(B*H/200)+y]
}
var replace=function(c,d,a,data){
// data= {"u5b50":"1:0:2:40:31:149:31$2:22:7:149:31:136:49:102:79$1:0:4:100:72:100:182$1:0:0:14:102:186:102","u53e3":"1:12:13:42:46:42:154$1:2:2:42:46:158:46$1:22:23:158:46:158:154$1:2:2:42:154:158:154","u674e":"99:0:0:0:-2:200:216:u6728-03$99:0:0:13:101:188:181:u53e3","u6728-03":"1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86","u5b50-04":"1:12:13:42:46:42:154$1:2:2:42:46:158:46$1:22:23:158:46:158:154$1:2:2:42:154:158:154","u674f":"1:0:0:16:49:185:49$1:0:0:100:18:100:109$2:32:7:94:49:71:90:16:118$2:7:0:105:49:135:89:178:111$0:0:0:0$99:0:0:14:-50:189:200:u53e3-04","u53e3-04":"99:0:0:0:118:200:190:u53e3"}
// c=‘u674e’, d='u5b50’, a=‘u53e3’ // 將 李 u674e 的部件 子 u5b50 換成 口 u53e3
	var dc=data[c]; // "99:0:0:0:-2:200:216:u6728-03$99:0:0:0:-20:200:200:u5b50-04" // 取得 李 的 資訊
	var m=dc.match(RegExp('[^"$]+:('+d+'[^"]*)')) // 李 的 資訊 中 搜尋 部件 d
	if(!m){ // 若無 部件 d 就警示錯誤訊息
		console.log('error 01 ---- data[c] 無部件 d 資訊'); return;
	}
	var ds=m[0] // "99:0:0:0:-20:200:200:u5b50-04"
	var L=ds.split(':').map(function(n){
    	return n.match(/^-?\d+$/)?parseInt(n):n;
	}) // [99,0,0,0,-20,200,200,"u5b50-04"] d 的 邊框資訊
	main.dd=d; // "u5b50-04" d 的變形 dd
	r=[L.slice(3,5),L.slice(5,7)] // [[0,-20],[200,200]]
	m=dgg.minimumBounding(dgg.getPoints(dgg.decode(data[d]))) // dd 的 最小邊界 []
	rr=L.slice(0,3).join(':')+':'+dgg.adjustMbf(m,r).join(':')+':'+a;
	return dc.replace(ds,rr); // "99:0:0:0:-2:200:216:u6728-03$99:0:0:13:101:188:181:u53e3"
}

module.exports={
	getPoints: getPoints,
	decode: decode,
	minimumBounding: minimumBounding,
	getPartRect: getPartRect,
	adjustMbf: adjustMbf,
	replace: replace
}