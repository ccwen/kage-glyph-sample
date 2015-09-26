// dgg.js -- functions for dynamic glyph generation
//
//browserify -t reactify index.js

var ucs2string=require("./src/uniutil").ucs2string;

var ucs=function(c){if(c)return ucs2string(parseInt(c.substr(1),16));}

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
var replace3=function(c,d,a,data){
	var ua=ucs(a), ud=ucs(d), uc=ucs(c);
	var out=uc+'-'+ud+'+'+ua;
// 1. 萌日目 遞迴搜尋 c 萌 中 明 的 部件 d 日 換成 a 目
// 2. 𩀨從䞃致招 遞迴運作 將 部件 從 換成 䞃 繼續 再將 部件 致 換成 招
// data= {"u5b50":"1:0:2:40:31:149:31$2:22:7:149:31:136:49:102:79$1:0:4:100:72:100:182$1:0:0:14:102:186:102","u53e3":"1:12:13:42:46:42:154$1:2:2:42:46:158:46$1:22:23:158:46:158:154$1:2:2:42:154:158:154","u674e":"99:0:0:0:-2:200:216:u6728-03$99:0:0:13:101:188:181:u53e3","u6728-03":"1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86","u5b50-04":"1:12:13:42:46:42:154$1:2:2:42:46:158:46$1:22:23:158:46:158:154$1:2:2:42:154:158:154","u674f":"1:0:0:16:49:185:49$1:0:0:100:18:100:109$2:32:7:94:49:71:90:16:118$2:7:0:105:49:135:89:178:111$0:0:0:0$99:0:0:14:-50:189:200:u53e3-04","u53e3-04":"99:0:0:0:118:200:190:u53e3"}
// c=‘u674e’, d='u5b50’, a=‘u53e3’ // 將 李 u674e 的部件 子 u5b50 換成 口 u53e3
	if(c===undefined) return;
	var dc=data[c], sd='99[^$]+:('+d+'[^$:]*)', pd=RegExp(sd), md; // 直接搜尋 部件 d
	// data['u840c']='99:0:0:0:2:200:175:u8279-03$99:0:0:0:47:200:195:u660e'
	// u840c 萌, u8279-03 艹3, u660e 明 
	// data['u660e']='99:0:0:-2:-1:234:177:u65e5-01$99:0:0:-3:0:197:200:u6708-02'
	// u660e 明, u65e5-01 日1, u6708-02 月2
	// "99:0:0:0:-2:200:216:u6728-03$99:0:0:0:-20:200:200:u5b50-04" // 取得 李 的 資訊
	if(md=dc.match(pd)){ // 若 c 含 部件 d, 則 dd 為實際 d 的 unocode
		var ds=md[0], dd=md[1]; // ds 為待替換的資訊 準備改以 rr 資訊 將 dd 換為 a 並修正 範圍
		var m=ds.match(/^(\d+:\d+:\d+:)([-\d]+):([-\d]+):([-\d]+):([-\d]+)/);
		var r=[[parseInt(m[2]),parseInt(m[3])],[parseInt(m[4]),parseInt(m[5])]];
		var mbf=minimumBounding(getPoints(decode(data[dd])));
		var adj=adjustMbf(mbf,r);
		var rr=m[1]+adj.join(':')+':'+a;
		data[out]=dc.replace(ds,rr);
	//	console.log(out);
		data.newfonts=data.newfonts||[];
		data.newfonts.push(out);
		return out;
	};
	var sp='99[^$]+:([^$:]*)', pg=RegExp(sp,'g'), mg;
	if(mg=dc.match(pg)){ // 若 c 中 含 其他組合部件, 檢視每個部件是否含 部件 d
		for(var i=0; i<mg.length; i++){
			var pp=RegExp('^'+sp+'$'), pc=mg[i].match(pp)[1], mp;
			if(mp=data[pc].match(pd)){ // c 的 組合部件 含 部件 d
				var result=replace3(pc,mp[1],a,data);
				if(result){
					data[out]=dc.replace(pc,result);
				//	console.log(out);
					data.newfonts.push(out);
					return out;
				}
			}
		}
	}
}


module.exports={
	getPoints: getPoints,
	decode: decode,
	minimumBounding: minimumBounding,
	getPartRect: getPartRect,
	adjustMbf: adjustMbf,
	ucs: ucs,
	replace: replace3
}