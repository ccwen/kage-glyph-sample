var Kage=require("kage").Kage;
var KageGlyph=require("./kageglyph");
var Polygons=require("kage").Polygons;
var React=require("react");
var E=React.createElement;


var Sampleglyph=React.createClass({
	componentWillMount:function() {
		KageGlyph.loadBuhins({
			"李":"99:0:0:0:-2:200:216:木3$99:0:0:13:101:188:181:口"
		,	"子4":"1:0:2:44:110:145:110$2:22:7:145:110:126:120:102:130$1:0:4:100:126:100:183$1:0:0:13:144:188:144"
		,	"木3":"1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86"
		,   "口":"1:12:13:42:46:42:154$1:2:2:42:46:158:46$1:22:23:158:46:158:154$1:2:2:42:154:158:154"
		});
	}
	,render:function() {
		return E(KageGlyph,{glyph:"口"})
	}
})
module.exports=Sampleglyph;