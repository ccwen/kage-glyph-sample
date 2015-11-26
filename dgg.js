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
		glyph=glyphs[i].replace(/~/g,"99:0:0:");
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
  var L1=f1[0],T1=f1[1],R1=f1[2],B1=f1[3],W1=R1-L1,H1=B1-T1;
  var L2=f2[0],T2=f2[1],R2=f2[2],B2=f2[3],W2=R2-L2,H2=B2-T2;
  return Math.round((x-L1)*W2/W1+L2); 
}
var mapY=function(y,f1,f2){
  var L1=f1[0],T1=f1[1],R1=f1[2],B1=f1[3],W1=R1-L1,H1=B1-T1;
  var L2=f2[0],T2=f2[1],R2=f2[2],B2=f2[3],W2=R2-L2,H2=B2-T2;
  return Math.round((y-T1)*H2/H1+T2); 
}
var deepMbf=function(data,d){
	var xmi=999, xma=-999, ymi=999, yma=-999;
	var items=data[d].split('$');
	for(var i=0; i<items.length; i++){
		var item=items[i];
		var m=item.match(/^99.+?:([-0-9]+):([-0-9]+):([-0-9]+):([-0-9]+):(u[^:]+)/);
		if(m){ // nested //////////////////////////////////////////
			var p=m[5], frame=m.slice(1,5);
			var f=deepMbf(data,p);
			var xmi=mapX(f[0],frame,[0,0,200,200]);
			var ymi=mapY(f[1],frame,[0,0,200,200]);
			var xma=mapX(f[2],frame,[0,0,200,200]);
			var yma=mapY(f[3],frame,[0,0,200,200]);
			console.log('['+m.slice(1,5).join()+'] '+m[5]);
			return [xmi,ymi,xma,yma];
		} else {
			m=item.match(/^(\d+:){3}([-0-9:]+)/);
			if(m){
				var t=m.slice(2)[0];
				var points=t.match(/([-0-9]+):([-0-9]+)/g).map(function(s){
					var i=s.indexOf(':');
					return {x:parseInt(s.substr(0,i)),y:parseInt(s.substr(i+1))}
				})
				points.forEach(function(p){
					var x=p.x, y=p.y;
					if (xmi>x)
						xmi=x;
					else if (xma<x)
						xma=x;
					if (ymi>y)
						ymi=y;
					else if (yma<y)
						yma=y;
				})
			}
		}
	}
	if( xmi>xma || ymi>yma )
		return; // not found
	return [xmi,ymi,xma,yma];
}
var adjustMbf=function (dMbf,aMbf,rect){
	var Ld=dMbf[0], Td=dMbf[1], Rd=dMbf[2], Bd=dMbf[3], Wd=Rd-Ld, Hd=Bd-Td;
	var La=aMbf[0], Ta=aMbf[1], Ra=aMbf[2], Ba=aMbf[3], Wa=Ra-La, Ha=Ba-Ta;
	var Lc=rect[0][0], Tc=rect[0][1], Rc=rect[1][0], Bc=rect[1][1], Wc=Rc-Lc, Hc=Bc-Tc;	// sam
	var L=Math.round(Lc-(Wd-Wa)/400), T=Math.round(Tc-(Hd-Ha)/400); // sam
	var Wx=Wc*Wd/Wa, Hx=Hc*Hd/Ha; // sam
	var R=Math.round(L+Wx), B=Math.round(T+Hx);
//	var Cx=Lf+(Ld+Rd)/2*Wf/200, Cy=Tf+(Td+Bd)/2*Hf/200;
//	var Dx=Wf*Wd/Wa/2, Dy=Hf*Hd/Ha/2;
//	var L=Math.round(Cx-Dx), T=Math.round(Cy-Dy), R=Math.round(Cx+Dx), B=Math.round(Cy+Dy);
	var result=[L,T,R,B];
	return result;
}
var stack=[];
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
var partReplace=function(data,c,d,a){
//	c='c',d='d',a='a';
	if(!Object.keys(data).length) return;
	var m=c.match(/^u[0-9a-f]+(.*)$/);
	var ua=a.match(/^u/)?ucs(a):a, ud=ucs(d), uc=ucs(c)+m[1], out=uc+ud+ua;
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
		var md=dd.match(RegExp('^'+d+'(.+)$')); // sam 20151119
		if(md && data[dd].match(pd)){ // sam 20151119
			var x=partReplace(data,dd,d,a); // sam 20151119
			data[out]=dc.replace(dd,x);
			return out; // sam 20151119
		} // sam 20151119
		var m=ds.match(/^(\d+:\d+:\d+:)([-\d]+):([-\d]+):([-\d]+):([-\d]+)/);
		var x=m.slice(2,6).map(function(n){
			return parseInt(n);
		})
		var r=[[x[0],x[1]],[x[2],x[3]]];
		var dMbf=mbf(data,dd), aMbf=deepMbf(data,a);
		console.log('在 '+uc+' 200x200 字形中 框 ['+x.join()+'] 內 將 '+ud+' 200x200 字形 框 ['+dMbf.join()+'] 內筆畫 換為 '+ua+' 200x200 字形 框 ['+aMbf.join()+'] 內筆畫');
//		var adj=adjustMbf(dMbf,aMbf,r);
		var adj=r[0].concat(r[1]).map(function(x,i){
			return i%2?mapY(x,dMbf,aMbf):mapX(x,dMbf,aMbf)
		});
		var rr=m[1]+adj.join(':')+':'+a;
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
var pp=/99[:-\d]+([a-z][a-z0-9-]*)/;
var pg=/99[:-\d]+([a-z][a-z0-9-]*)/g;
var getAllGlyphs=function(data,u){
    if(data[u])
      return;
    var i=GLYPH[u];
    if(!i)
      return;
    var d=GLYPHS[i].replace(/~/g,"99:0:0:");
    data[u]=d;
    var uu=d.match(pg); // 所有部件組字資訊
    if(!uu)
      return;
    var up=uu.map(function(u){return u.match(pp)[1];});
    console.log('data["'+u+'"]="'+data[u]+'"');
    console.log(ucs(u)+u+' <-- '+up.map(function(u){
    	return ucs(u)+u;
    }).join(' '));
	up.forEach(function(u){
    	getAllGlyphs(data,u);
    	console.log('data["'+u+'"]="'+data[u]+'"');
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