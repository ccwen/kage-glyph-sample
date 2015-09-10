// dgg.js -- functions for dynamic glyph generation

// var infos="1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86"
var decode=function(infos){
	var glyphs=infos.split('$').map(function(info){
		var values=info.split(":");
		var t=values[0], gx=values[1], gy=values[2], x, y;
		var points=[], xyPairs=values.slice(3);
		xyPairs.forEach(function(v,i){ var n=parseInt(v);
			if(i%2===0) x=n;
			else { y=n, points.push({x:x,y:y}); }
		});
		var glyph={x:parseInt(gx),y:parseInt(gy),t:parseInt(t),p:points};
		return glyph;
	})
	return glyphs;
}
/* var glyphs=[ // 木3 http://glyphwiki.org/wiki/u6728-03?action=edit
		{t:1,x:0,y:0,p:[{x:20,y:37},{x:180,y:37}]},
		{t:1,x:0,y:0,p:[{x:100,y:14},{x:100,y:86}]},
		{t:2,x:32,y:7,p:[{x:95,y:37},{x:64,y:76},{x:14,y:93}]},
		{t:2,x:7,y:0,p:[{x:105,y:37},{x:136,y:73},{x:178,y:86}]}
	]
*/
var getPoints=function(glyphs){ var points, x, y;
	points=[];
	console.log('getPoint input glyphs '+JSON.stringify(glyphs));
	glyphs.forEach(function(glyph){
		glyph.p.forEach(function(point){
			points.push(point);
		})
	});
	return points;
}
// points=[{x:20,y:37},{x:180,y:37},{x:100,y:14},{x:100,y:86},{x:95,y:37},{x:64,y:76},{x:14,y:93},{x:105,y:37},{x:136,y:73},{x:178,y:86}]
var minimumBounding=function(points){
	var point=points[0], x=point.x, y=point.y, left=x, top=y, right=x, bottom=y, mbf={};
	for(i=1;i<points.length;i++){
		point=points[i], x=point.x, y=point.y;
		if(left>x)left=x; if(right <x)right =x;
		if(top >y)top =y; if(bottom<y)bottom=y;
	}
	var width=right-left, height=top-bottom;
	points=points.map(function(point){
		var x=point.x-left, y=point.y-top;
		if(width ) x=x/width ;
		if(height) y=y/height;
		return {x:x,y:y}
	})
	mbf={left:left,top:top,right:right,bottom:bottom,points:points};
	return mbf;
}
// mbf={left:14,top:14,right:180,bottom:93}
var normalize=function(mbf,glyphs){
	var point=points[0], x=point.x, y=point.y, left=x, top=y, right=x, bottom=y, mbf={};
	for(i=1;i<points.length;i++){
		point=points[i], x=point.x, y=point.y;
		if(left>x)left=x; if(right <x)right =x;
		if(top >y)top =y; if(bottom<y)bottom=y;
	}
	mbf={left:left,top:top,right:right,bottom:bottom};
	return mbf;
}
module.exports={
	getPoints: getPoints,
	decode: decode,
	minimumBounding: minimumBounding,
	normalize: normalize
}