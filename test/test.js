/*
   mocha -w test/test.js
*/
var dgg=require("../dgg");
console.log("../dgg", dgg);
var assert=require("assert");
describe("dynamic glyph generation",function(){
	var infos="1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86"
	console.log('infos',infos);
	var glyphs=[ // u6728-03 木3 
		{t:1,x:0,y:0,p:[{x:20,y:37},{x:180,y:37}]},
		{t:1,x:0,y:0,p:[{x:100,y:14},{x:100,y:86}]},
		{t:2,x:32,y:7,p:[{x:95,y:37},{x:64,y:76},{x:14,y:93}]},
		{t:2,x:7,y:0,p:[{x:105,y:37},{x:136,y:73},{x:178,y:86}]}
	]
	console.log('glyphs '+JSON.stringify(glyphs));
	var Glyphs=dgg.decode(infos);
	it("Get Glyphs",function(){
		var Glyphs=dgg.getGlyphs(infos);
		assert.deepEqual(glyphs,Glyphs);
		console.log('Glyphs '+JSON.stringify(Glyphs));
	})
//	var glyphs=[1:0:0:20:37:180:37","1:0:0:100:14:100:86","2:32:7:95:37:64:76:14:93","2:7:0:105:37:136:73:178:86"]
	var points=[{x:20,y:37},{x:180,y:37},{x:100,y:14},{x:100,y:86},{x:95,y:37},{x:64,y:76},{x:14,y:93},{x:105,y:37},{x:136,y:73},{x:178,y:86}]
	console.log('points',points);
	var mbf={left:14,top:14,right:180,bottom:93};
	console.log('mbf',mbf);
	it("Get Points",function(){
		var Points=dgg.getPoints(glyphs);
		assert.deepEqual(points,Points);
		console.log('Points',Points);
	})
	it("Get minimum bounding frame",function(){
		var Mbf=dgg.minimumBounding(points);
		assert.deepEqual(mbf,Mbf);
		console.log('Mbf',Mbf)
	});
	it("Get Normalized glyphs",function(){
		var Mbf=dgg.normalize(points);
		assert.deepEqual(mbf,Mbf);
		console.log('Mbf',Mbf)
	});
})