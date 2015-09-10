
var getPoints=function(glyphs){ var points, point;
// glyphs="1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86"
// points=[{x:20,y:37},{x:180,y:37},{x:100,y:14},{x:100,y:86},{x:95,y:37},{x:64,y:76},{x:14,y:93},{x:105,y:37},{x:136,y:73},{x:178,y:86}]
	console.log('getPoints input glyphs',glyphs);
	points=[], point={x:0,y:0};
	glyphs.split('$').forEach(function(glyph){
		glyph.split(':').slice(3).forEach(function(v,i){
			if(i&1===0) point.x=v;
			else point.y=v, points.push(point);
		})
	});
	console.log('getPoints output points',points);
	return points;
}
var minimumbounding=function(points){
// points=[{x:20,y:37},{x:180,y:37},{x:100,y:14},{x:100,y:86},{x:95,y:37},{x:64,y:76},{x:14,y:93},{x:105,y:37},{x:136,y:73},{x:178,y:86}]
// mbf={left:20,top:14,right:180,bottom:93}
	console.log('minimumbounding input points',points);
	var point=points[0], x=point.x, y=point.y, left=x, top=y, right=x, bottom=y, mbf={};
	for(i=1;i<points.length;i++){
		point=points[0], x=point.x, y=point.y;
		if(left>x)left=x; if(right <x)right =x;
		if(top >y)top =y; if(bottom<y)bottom=y;
	}
	mbf={left:left,top:top,right:right,bottom:bottom};
	console.log('minimumbounding output mbf',mbf);
	return mbf;
}

module.exports={getPoints:getPoints,minimumbounding:minimumbounding}