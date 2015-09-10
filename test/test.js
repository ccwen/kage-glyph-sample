/*
   mocha -w test/test.js
*/
var assert=require("assert");

// 函式庫 dgg.js 載入
var dgg=require("../dgg");	
var infos={},glyphs={},points={},mbf={};

describe("基本函式建立",function(){

	// 木3 buhins['u6728-03']
	infos["木3"]="1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86"
	
	// dgg.decode 擷取筆畫資料 橫 起點 終點, 豎 起點 終點, 撇 起點 控點 終點, 捺 起點 控點 終點
	glyphs["木3"]=[
		{t:1,sd:0,ed:0,p:[[20,37],[180,37]]},
		{t:1,sd:0,ed:0,p:[[100,14],[100,86]]},
		{t:2,sd:32,ed:7,p:[[95,37],[64,76],[14,93]]},
		{t:2,sd:7,ed:0,p:[[105,37],[136,73],[178,86]]}
	]
	it("擷取筆畫資料",function(){
		assert.deepEqual(glyphs["木3"],dgg.decode(infos["木3"]));
	});

	// dgg.getPoints 蒐集所有 起點 控點 終點
	points["木3"]=[[20,37],[180,37],[100,14],[100,86],[95,37],[64,76],[14,93],[105,37],[136,73],[178,86]];
	it("蒐集所有 起點 控點 終點",function(){
		assert.deepEqual(points["木3"],dgg.getPoints(glyphs["木3"]));
	});

	// dgg.minimumBounding 計算 最小邊界範圍 left, top, right, bottom
	mbf["木3"]=[14,14,180,93];
	it("計算 最小邊界範圍",function(){
		assert.deepEqual(mbf["木3"],dgg.minimumBounding(points["木3"]));
	});

})

describe("dynamic glyph generation",function(){
	// 組字 杏＝李-子＋口
	// u674e 李 ＝ 框 0,-2,200,216 u6728-03 木3 + 框 0,-20,200,200 u5b50-04 子4
	// 以 交叉對角線 作測試

	// 李 buhins["u674e"]
	infos["李"]="99:0:0:0:-2:200:216:u6728-03$99:0:0:0:-20:200:200:u5b50-04"
	// dgg.getFrameSize 取部件 u5b50-04 子4 在 u674e 李 中的框
	var partRect=[[0,-20],[200,200]];
	it("取得 部件原始框",function(){
		glyphs["李"]=dgg.decode(infos["李"]);
		assert.deepEqual(partRect,dgg.getPartRect(glyphs["李"],"u5b50-04"));
	});

	// 子4 buhins["u5b50-04"]
	infos["子4"]="1:0:2:44:110:145:110$2:22:7:145:110:126:120:102:130$1:0:4:100:126:100:183$1:0:0:13:144:188:144"
	// dgg.minimumBounding 計算 最小邊界範圍 left, top, right, bottom
	mbf["子4"]=[13,110,188,183];
	it("計算 最小邊界範圍",function(){
		points["子4"]=dgg.getPoints(dgg.decode(infos["子4"]));
		assert.deepEqual(mbf["子4"],dgg.minimumBounding(points["子4"]));
	});

	// dgg.adjustMbf 以 子4 在 李 中框的寬高 調整 最小邊界範圍
	var adjustedMbf=[ 13, 101, 188, 181 ]
	it("調整 最小邊界範圍 作為 子4 的等效框",function(){
		assert.deepEqual(adjustedMbf,dgg.adjustMbf(mbf["子4"],partRect));
	});

	// 最後把 u674e 李 的部件 u5b50-04 子4 替換以 u53e3 口 為部件到對對應的等效框中
	var mock="1:0:0:0:200:200$1:0:0:0:200:200:0"
//	infos["李"]="99:0:0:0:-2:200:216:u6728-03$99:0:0:0:-20:200:200:u5b50-04"
//	infos["李"]="99:0:0:0:-2:200:216:u6728-03$99:0:0:13:101:188:181:u53e3"
})