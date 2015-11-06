var uniutil		=require("./src/uniutil"	);
var ucs2string	=uniutil.ucs2string; // 回應 unicode 數值 的 中文字
var getutf32	=uniutil.getutf32; // 回應 中文字 的 unicode 數值
var pp=/99[:-\d]+([a-z][a-z0-9-]*)/;
var pg=/99[:-\d]+([a-z][a-z0-9-]*)/g;

var getParts=function(u){
  var i=GLYPH[u];
  var d=GLYPHS[i].replace(/~/g,'99:0:0:');
  if(!d) return;
  var out=u;
  var uu=d.match(pg); // 所有部件組字資訊
  if(!uu) return out;
  for(var i=0; i<uu.length; i++){
    var child=uu[i].match(pp)[1]; // 每個部件名
    if(out.indexOf(child)<0)
      out+=' '+getParts(child);
  }
  console.log(out.replace(/ /,' <-- '));
  return out;
}
var getUnicodeParts=function(unicode) {
	var code=getutf32({widestring:unicode});
	var res=getParts('u'+code.toString(16)).split(' ');
//	res.shift();
	var out=[];
	for (var i in res) {
		var unicode=res[i].substr(1);
		var at=unicode.indexOf("-");
		if (at>-1) unicode=unicode.substr(0,at);
		var str=ucs2string( parseInt(unicode,16));
		if (out.indexOf(str)==-1)	out.push(str);
	}
	out.shift();//drop first
	return out;
}
console.log("萌",getUnicodeParts("萌"));
module.exports={getParts:getParts,getUnicodeParts};