/*
   mocha -w test/test.js
*/
var dgg=require("../dgg");
 
var assert=require("assert");

describe("dynamic glyph generation",function(){
	var infos="1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86"
	var points=[[20,37],[180,37],[100,14],[100,86],[95,37],[64,76],[14,93],[105,37],[136,73],[178,86]];

	var glyphs=[ // u6728-03 木3 
		{t:1,sd:0,ed:0,p:[[20,37],[180,37]]},
		{t:1,sd:0,ed:0,p:[[100,14],[100,86]]},
		{t:2,sd:32,ed:7,p:[[95,37],[64,76],[14,93]]},
		{t:2,sd:7,ed:0,p:[[105,37],[136,73],[178,86]]}
	]		

	it("decode",function(){
		assert.deepEqual(glyphs,dgg.decode(infos));
	});

	it("extract point",function(){
		assert.deepEqual(points,dgg.getPoints(glyphs));
	});

	var mbf=[14,14,180,93];
	it("mbf",function(){
		assert.deepEqual(mbf,dgg.minimumBounding(points));
	});

	it("mbf directly from raw data",function(){
		assert.deepEqual(mbf,dgg.minimumBounding(infos));
	});

	it("mbf directly from raw data",function(){
		assert.deepEqual(mbf,dgg.minimumBounding(infos));
	});

})