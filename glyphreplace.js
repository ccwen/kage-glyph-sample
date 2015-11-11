// glyphreplace.js
console.log('loading glyphreplace.js');
var ucs2string=require("./src/uniutil").ucs2string;
var getUnicodeParts=require("./parts").getUnicodeParts;
var ucs=function(c){
	if(c)
		return c.match(/^u/)?ucs2string(parseInt(c.substr(1),16)):c;
}
var partsReplace=function(data,unicodes){
	var c=unicodes.shift(), d, a;
	if(unicodes.length>1){
		d=unicodes.shift();
		if(unicodes.length>2){
			a=partsReplace(data,unicodes)
		} else {
			a=unicodes.shift();
		}
		c=partReplace(data,c,d,a);
	}
    return c;
}
var mbf=function (d){
	var L=d.split('$').filter(function(a){
		return a.match(/^[^9]/)
	}).map(function(a){
		return a.split(':').slice(3).join()
	}).join().split(',').map(function(a){
		return parseInt(a)
	});
	var x=[],y=[];L.forEach(function(n,i){
		if(i%2)y.push(n);else x.push(n)
	});
	var xmin = Math.min.apply(null, x),
		ymin = Math.min.apply(null, y),
		xmax = Math.max.apply(null, x),
		ymax = Math.max.apply(null, y);
	return [xmin,ymin,xmax,ymax]
}
var adjustFrame=function (dMbf,aMbf,Lf,Tf,Rf,Bf){
	var Ld=dMbf[0], Td=dMbf[1], Rd=dMbf[2], Bd=dMbf[3], Wd=Rd-Ld, Hd=Bd-Td;
	var La=aMbf[0], Ta=aMbf[1], Ra=aMbf[2], Ba=aMbf[3], Wa=Ra-La, Ha=Ba-Ta;
//	var Lf=rect[0][0], Tf=rect[0][1], Rf=rect[1][0], Bf=rect[1][1], Wf=Rf-Lf, Hf=Bf-Tf;
	var Cx=Lf+(Ld+Rd)/2*Wf/200, Cy=Tf+(Td+Bd)/2*Hf/200;
	var Dx=Wf*Wd/Wa/2, Dy=Hf*Hd/Ha/2;
	var L=Math.round(Cx-Dx), T=Math.round(Cy-Dy), R=Math.round(Cx+Dx), B=Math.round(Cy+Dy);
	var result=[L,T,R,B];
	return result;
}
var showFrame(rect){
	return '['+rect.join()+']';
}
var partReplace=function(data,c,d,a){
//	c='c',d='d',a='a';
	if(!Object.keys(data).length) return;
	var ua=a.match(/^u/)?ucs(a):a, ud=ucs(d), uc=ucs(c), out=uc+ud+ua;
// 1. 萌日目 遞迴搜尋 c 萌 中 明 的 部件 d 日 換成 a 目
// 2. 𩀨從䞃致招 遞迴運作 將 部件 從 換成 䞃 繼續 再將 部件 致 換成 招
// data= {"u5b50":"1:0:2:40:31:149:31$2:22:7:149:31:136:49:102:79$1:0:4:100:72:100:182$1:0:0:14:102:186:102","u53e3":"1:12:13:42:46:42:154$1:2:2:42:46:158:46$1:22:23:158:46:158:154$1:2:2:42:154:158:154","u674e":"99:0:0:0:-2:200:216:u6728-03$99:0:0:13:101:188:181:u53e3","u6728-03":"1:0:0:20:37:180:37$1:0:0:100:14:100:86$2:32:7:95:37:64:76:14:93$2:7:0:105:37:136:73:178:86","u5b50-04":"1:12:13:42:46:42:154$1:2:2:42:46:158:46$1:22:23:158:46:158:154$1:2:2:42:154:158:154","u674f":"1:0:0:16:49:185:49$1:0:0:100:18:100:109$2:32:7:94:49:71:90:16:118$2:7:0:105:49:135:89:178:111$0:0:0:0$99:0:0:14:-50:189:200:u53e3-04","u53e3-04":"99:0:0:0:118:200:190:u53e3"}
// c=‘u674e’, d='u5b50’, a=‘u53e3’ // 將 李 u674e 的部件 子 u5b50 換成 口 u53e3
	if(!c) return;
	var dc=data[c], sd='99[^$]+:('+d+'[^$:]*)', pd=RegExp(sd), md; // 直接搜尋 部件 d
	// data['u840c']='99:0:0:0:2:200:175:u8279-03$99:0:0:0:47:200:195:u660e'
	// u840c 萌, u8279-03 艹3, u660e 明 
	// data['u660e']='99:0:0:-2:-1:234:177:u65e5-01$99:0:0:-3:0:197:200:u6708-02'
	// u660e 明, u65e5-01 日1, u6708-02 月2
	// "99:0:0:0:-2:200:216:u6728-03$99:0:0:0:-20:200:200:u5b50-04" // 取得 李 的 資訊
	if(md=dc.match(pd)){ // 若 c 含 部件 d, 則 dd 為實際 d 的 unocode
		var ds=md[0], dd=md[1]; // ds 為待替換的資訊 準備改以 rr 資訊 將 dd 換為 a 並修正 範圍
		var m=ds.match(/^(\d+:\d+:\d+:)([-\d]+):([-\d]+):([-\d]+):([-\d]+)/);
		var dMbf=mbf(data[dd]), aMbf=mbf(data[a]);
		var L=parseInt(m[2]), T=parseInt(m[3]), R=parseInt(m[4]), B=parseInt(m[5])
		var adj=adjustFrame(dMbf,aMbf,L,T,R,B);
		var rr=m[1]+adj.join(':')+':'+a;
		console.log(uc,c,'換',ud,d,'為',ua,a);
		console.log(ud,d,'mbf',showFrame(dMbf),ua,a,'mbf',showFrame(aMbf));
		console.log(uc,c,'oldFrame',showFrame([L,T,R,B]),'newFrame',showFrame(adj));
		console.log(ds,'換為',rr,'生成',out);
		data[out]=dc=dc.replace(ds,rr);
		return out;
	};
	var sp='99[^$]+:([^$:]*)', pp=RegExp('^\\$?'+sp+'$'), pg=RegExp('(^|\\$)'+sp,'g'), mg;
	if(mg=dc.match(pg)){ // 若 c 中 含 其他組合部件, 檢視每個組合部件內是否含 部件 d
		return mg.map(function(x){
			var mp=x.match(pp), part=mp[1], temp=partReplace(data,part,d,a);
			if(temp){
				data[out]=dc=dc.replace(part,temp);
				return out;
			}
		}).reduce(function(x,y){return x||y;});
	}
}
module.exports={
	partsReplace: partsReplace
}