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

module.exports={
	getPoints: getPoints,
	decode: decode,
	minimumBounding: minimumBounding,
	getPartRect: getPartRect,
	adjustMbf: adjustMbf
}