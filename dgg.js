// dgg.js -- functions for dynamic glyph generation
console.log('loading ddg.js');
//browserify -t reactify index.js
//var glyph=GLYPH;
//var glyphs=GLYPHS;
var ucs2string=require("./src/uniutil").ucs2string;
var ucs=function(c){ // 回 unicode 字串對應的中文字
	if(c)return ucs2string(parseInt(c.substr(1),16)).replace(/\r/,'');}
var decode=function(infos){
	var glyphs=infos.split('$').map(function(info){
		var values=info.split(":");
		var t=values[0], sd=values[1], ed=values[2], x, y;
		var points=[], xyPairs=t=='99'?values.slice(3,7):values.slice(3);
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
		glyph=glyphs[i]; // .replace(/~/g,"99:0:0:");
		if(glyph.partId===partId){
			return glyph.p;
		}n
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
var mbf=function(data,a){
	return minimumBounding(getPoints(decode(data[a])));
}
var mapX=function(x,f1,f2){
  var L1=f1[0],R1=f1[2],W1=R1-L1;
  var L2=f2[0],R2=f2[2],W2=R2-L2;
  return Math.round((x-L1)*W2/W1+L2); 
}
var mapY=function(y,f1,f2){
  var T1=f1[1],B1=f1[3],H1=B1-T1;
  var T2=f2[1],B2=f2[3],H2=B2-T2;
  return Math.round((y-T1)*H2/H1+T2); 
}
var mapRect=function(rect,f1,f2){
	return rect.map(function(v,i){
		return i%2?mapY(v,f1,f2):mapX(v,f1,f2);
	})
}
var deepMbf=function(data,u){ // mbf in given rect ?????
//	if(u==="𩀨從䞃致招")
//		console.log('u==="𩀨從䞃致招"');
	var xmi=999, xma=-999, ymi=999, yma=-999;
	var items=data[u].split('$');
	for(var i=0; i<items.length; i++){
		var item=items[i];
		var m=item.match(/((:[-0-9]+){4}):([^-0-9:][^:]+)/);
		if(m){ // nested //////////////////////////////////////////
			var p=m[3], fs=m[1].substr(1).replace(/:/g,',');
			var frame=fs.split(',').map(function(n){return parseInt(n);});
			var r=[0,0,200,200];
			var f=deepMbf(data,p);
			console.log('map '+JSON.stringify(f)+' from '+JSON.stringify(r)+' to '+JSON.stringify(frame));
			f.forEach(function(v,i){
				if(i%2===0){
					var x=mapX(v,r,frame); xmi=Math.min(x,xmi), xma=Math.max(x,xma);
				} else {
					var y=mapY(v,r,frame); ymi=Math.min(y,ymi), yma=Math.max(y,yma);
				}
			});
		} else {
			m=item.match(/^(\d+:){3}([-0-9:]+)/);
			if(m){
				var xy=m[2].split(':').map(function(v,i){return parseInt(v)});
				xy.forEach(function(v,i){
					if(i%2===0){
						var x=v; xmi=Math.min(x,xmi), xma=Math.max(x,xma);
					} else {
						var y=v; ymi=Math.min(y,ymi), yma=Math.max(y,yma);
					}
				});
			}
		}
	}
	if( xmi>xma || ymi>yma )
		return; // not found
	var mbf=[xmi,ymi,xma,yma];
	console.log('deepMbf(data,"'+u+'")=['+mbf.join()+']');
	return mbf;
}
var adjustMbf=function (dMbf,aMbf,rect){
	var Ld=dMbf[0], Td=dMbf[1], Rd=dMbf[2], Bd=dMbf[3], Wd=Rd-Ld, Hd=Bd-Td;
	var La=aMbf[0], Ta=aMbf[1], Ra=aMbf[2], Ba=aMbf[3], Wa=Ra-La, Ha=Ba-Ta;
	var Lc=rect[0], Tc=rect[1], Rc=rect[2], Bc=rect[3], Wc=Rc-Lc, Hc=Bc-Tc;
/*															// 2015/11/28 sam
	var L=Math.round(Lc-(Wd-Wa)/400), T=Math.round(Tc-(Hd-Ha)/400);
	var Wx=Wc*Wd/Wa, Hx=Hc*Hd/Ha; // sam
	var R=Math.round(L+Wx), B=Math.round(T+Hx);
//	var Cx=Lf+(Ld+Rd)/2*Wf/200, Cy=Tf+(Td+Bd)/2*Hf/200;
//	var Dx=Wf*Wd/Wa/2, Dy=Hf*Hd/Ha/2;
//	var L=Math.round(Cx-Dx), T=Math.round(Cy-Dy), R=Math.round(Cx+Dx), B=Math.round(Cy+Dy);
*/															// 2015/11/28 sam
// (Ld-L)=(La-Lc)											// 2015/11/28 sam
//	==> L=Lc-La+Ld // Lc 平移								// 2015/11/28 sam
//	==> T=Tc-Ta+Td // Tc 平移								// 2015/11/28 sam
// (R-L)/Wc=Wd/Wa ==> R/Wc-L/Wc=Wd/Wa ==> R/Wc=Wd/Wa+L/Wc	// 2015/11/28 sam
//	==> R=Wd/Wa*Wc+L // Wc 縮放 							// 2015/11/28 sam
//	==> B=Hd/Ha*Hc+T // Hc 縮放								// 2015/11/28 sam
	var L=Math.round(Lc+(1-Wa/Wd)*Wc/2), R=Math.round(Wc*Wa/Wd*.9+L);
	var T=Math.round(Tc+(1-Ha/Hd)*Hc/2), B=Math.round(Hc/Ha*Hd*.9+T);
	var result=[L,T,R,B];
	return result;
}
var stack=[];
var partsReplace=function(data,unicodes){
	var c=unicodes.shift(), d, a;
	if(unicodes.length){
		d=unicodes.shift();
		var xTmp=unicodes.shift();					// 20151208 sam
		if(xTmp && xTmp!=='u78') 							// 20151208 sam
			unicodes.unshift(xTmp), xTmp=undefined;	// 20151208 sam
		if(unicodes.length>2){
			a=partsReplace(data,unicodes)
		} else {
			a=unicodes.shift();
		}
		c=partReplace(data,c,d,a,xTmp);
	}
    return c;
}
var adjPatch=function(a){var L=a[0],T=a[1],R=a[2],B=a[3],W=(R-L)*.9,H=(B-T)*.9; R=L+W,B=T+H; return[L,T,R,B]}
var partReplace=function(data,c,d,a,xTmp){
// 0. 婆女子 換 c 婆 的 部件 d 女 為 a 子 // okay
// 1. 萌日目 遞迴搜尋部件 換 c 萌 的 部件 明 的 部件 d 日 為 a 目 // okay
// 2. 虭虫礻 換 c 虭 的 部件 d 虫 的變形 虫1 為 a 礻 // ????
// 3. 𩀨從䞃致招 遞迴運作 換 c 𩀨 的 部件 d 從 為 c 䞃 再換 其 部件 d 致 為 a 招 // ????
	if(!Object.keys(data).length) return; // 無 data
	if(!c) return; // 無 c
	var mc=c.match(/^u[0-9a-f]{4,5}(.*)$/); // 檢視 c 是否 unicode
	if(!mc) return // 非 unicode
	var c1=mc[1]; // 取 c 的變形序碼 c1;
	var dc=data[c]; // 取 data[c]
	if(!dc) return; // 無 data[c]
	if(!d) return; // 無 d
	a=a||'';
	var uc=ucs(c)+c1, ud=ucs(d), ua=a.match(/^u\d+/)?ucs(a):a, out=uc+ud+ua;
	var sd='(99(:[0-9]+){2})((:[-0-9]+){4})(:'+d+'[^$:]*)';
	var pd=RegExp(sd); // 直接搜尋 部件 d
	var md=dc.match(pd); // 在 data[c] 中搜尋 部件 d
	if(md){ // d 不是 c 的 直接部件 遞迴搜尋 檢視 部件 的 部件 // 萌日目
		if(!data[a]){ // 無 a 表示 刪除 部件 d
			data[out]=dc.replace(md[0],'').replace(/^\$|\$$/,'');
			return out;
		}
	// data['u840c']='99:0:0:0:2:200:175:u8279-03$99:0:0:0:47:200:195:u660e'
	// u840c 萌, u8279-03 艹3, u660e 明 
	// data['u660e']='99:0:0:-2:-1:234:177:u65e5-01$99:0:0:-3:0:197:200:u6708-02'
	// u660e 明, u65e5-01 日1, u6708-02 月2
	// "99:0:0:0:-2:200:216:u6728-03$99:0:0:0:-20:200:200:u5b50-04" // 取得 李 的 資訊
		var ds=md[0]; // ds 為待替換的資訊 準備改以 rr 資訊 將 dd 換為 a 並修正 範圍
		var dd=md[5].substr(1);
		var f=md[3].substr(1).split(':').map(function(n){
			return parseInt(n);
		});
//		console.log('mbf(data,"'+dd+'")',mbf(data,dd));
//		console.log('deepMbf(data,"'+dd+'")',deepMbf(data,dd));
		// mbf(data,u8864-01) [11, 13, 94, 186] // 衤
		// mbf(data,u866b-01) [15, 14, 88, 173] // 虫
//		console.log('mbf(data,"'+a+'")',mbf(data,a));
//		console.log('deepMbf(data,"'+a+'")',deepMbf(data,a));
		// mbf(data,u793b) [40, 0, 260, 200]
		var dMbf=deepMbf(data,dd);
		var aMbf=deepMbf(data,a);
		var adj=mapRect(f,aMbf,dMbf);						// 20151130 sam
//		var adj=adjPatch(adj);								// 20151203 sam
//		var adj=adjustMbf(dMbf,aMbf,f);						// 20151128 sam
//		var adj=f[0].concat(f[1]).map(function(x,i){		// 20151128 sam
//			return i%2?mapY(x,dMbf,aMbf):mapX(x,dMbf,aMbf)	// 20151128 sam
//		});													// 20151128 sam
		console.log('"'+uc+'" ['+f.join()+'] 的 "'+ud+'" 筆畫 ['+dMbf.join()+'] 換為 ['+adj.join()+'] 的 "'+ua+'" 筆畫 ['+aMbf.join()+']');
		if(xTmp){													// 20151208 sam
	//	var m=dc.match(/99(:[0-9]+){2}:0:0:200:200:[a-z][^:]+/);	// 20151208 sam
	//	if(m&&f[3]-f[1]<100)										// 20151208 sam
	//		console.log('matching '+m[0])							// 20151208 sam
	//	if(m&&f[3]-f[1]<100){										// 20151208 sam
			data[out]=dc.replace(dd,a);
			return out;
		}
//在 虭 字形 [2,7,177,195] 的 虫 筆畫範圍 [15,14,88,173] 換為 [-35,8,107,181] 的 礻 筆畫範圍 [52,13,142,186]
//在 初 字形 [3,0,188,200] 的 衤 筆畫範圍 [11,13,94,186] 換為 [-38,0,133,200] 的 礻 筆畫範圍 [52,13,142,186]
		var rr=md[1]+':'+adj.join(':')+':'+a;
		data[out]=dc.replace(ds,rr);
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
var pp=/99[:-\d]+([a-z][a-z0-9-]*)/;
var pg=/99[:-\d]+([a-z][a-z0-9-]*)/g;
var getAllGlyphs=function(data,u){
    if(data[u])
      return;
    var i=GLYPH[u];
    if(!i)
      return;
    var d=GLYPHS[i]; // .replace(/~/g,"99:0:0:");
    data[u]=d;
    var uu=d.match(pg); // 所有部件組字資訊
    if(!uu)
      return;
    var up=uu.map(function(u){return u.match(pp)[1];});
//  console.log('data["'+u+'"]=\n"'+data[u]+'"');
    console.log(ucs(u)+u+' <-- '+uu.map(function(d){
    	var u=d.match(pp)[1];
    	var r=d.match(/((:[-0-9]+){4}):[a-z]/)[1].substr(1).replace(/:/g,',');
    	return '['+r+']'+ucs(u)+u;
    }).join(' '));
	up.forEach(function(u){
    	getAllGlyphs(data,u);
    //	console.log('data["'+u+'"]=\n"'+data[u]+'"');
	});
}
module.exports={
	getPoints: getPoints,
	decode: decode,
	minimumBounding: minimumBounding,
	getPartRect: getPartRect,
	adjustMbf: adjustMbf,
	ucs: ucs,
	partsReplace: partsReplace,
	partReplace: partReplace,
	getAllGlyphs: getAllGlyphs
}