import {preciseYun} from './daily.js';
import {analyze} from './analysis.js';
import LJ from 'lunar-javascript';
const { Solar } = LJ;
const S='纳開订開会亲机竖涂盖门丧启钻坟动财猪鸡鸭养种经络酝酿网结渔头扫仓库灶补医疗词讼进斋绘庙观谢桥厕猎鱼归宁问筑发寿马坏馀余无伤杀贵龙时岁炉剑钗钏灯涧场腊杨锋雳长泽华东风临冲执满闭黄戏尝挂栋约签书买车帐处绝胜军阵兴缮张宫后业万与义乐乡云产众体达卖还运连远选间阴阳际难蜡驿啬节气惊蛰谷满种暑处霜寒罗丑纪审议设赏杂录欢织';
const T='納開訂開會親機豎塗蓋門喪啟鑽墳動財豬雞鴨養種經絡醞釀網結漁頭掃倉庫竈補醫療詞訟進齋繪廟觀謝橋廁獵魚歸寧問築發壽馬壞餘餘無傷殺貴龍時歲爐劍釵釧燈澗場臘楊鋒靂長澤華東風臨沖執滿閉黃戲嘗掛棟約簽書買車帳處絕勝軍陣興繕張宮後業萬與義樂鄉雲產眾體達賣還運連遠選間陰陽際難蠟驛嗇節氣驚蟄穀滿種暑處霜寒羅丑紀審議設賞雜錄歡織';
const MAP={};[...S].forEach((c,i)=>MAP[c]=T[i]);MAP['开']='開';MAP['陈']='陳';MAP['贼']='賊';MAP['宝']='寶';MAP['刘']='劉';
export const tw=s=>String(s).replace(/./g,c=>MAP[c]||c);
export const GAN='甲乙丙丁戊己庚辛壬癸', ZHI='子丑寅卯辰巳午未申酉戌亥';
export const WX=['木','火','土','金','水'], WXCLS={木:'wood',火:'fire',土:'earth',金:'metal',水:'water'};
export const ganWx=g=>WX[Math.floor(GAN.indexOf(g)/2)];
const ZWX='水土木木土火火土金金土水';export const zhiWx=z=>ZWX[ZHI.indexOf(z)];
const HIDE={子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙庚戊',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'};
export const hide=z=>[...HIDE[z]];
const gen=(a,b)=>(WX.indexOf(a)+1)%5===WX.indexOf(b), ctl=(a,b)=>(WX.indexOf(a)+2)%5===WX.indexOf(b);
export function shiShen(dm,g){const a=ganWx(dm),b=ganWx(g),same=GAN.indexOf(dm)%2===GAN.indexOf(g)%2;
 if(a===b)return same?'比肩':'劫財';if(gen(a,b))return same?'食神':'傷官';if(ctl(a,b))return same?'偏財':'正財';
 if(ctl(b,a))return same?'七殺':'正官';return same?'偏印':'正印';}
// relations
const CHONG=['子午','丑未','寅申','卯酉','辰戌','巳亥'],LIUHE={子丑:'土',寅亥:'木',卯戌:'火',辰酉:'金',巳申:'水',午未:'土'};
const HAI=['子未','丑午','寅巳','卯辰','申亥','酉戌'],XING=['子卯','寅巳','巳申','寅申','丑戌','戌未','丑未'],ZIXING='辰午酉亥';
const GANHE={甲己:'土',乙庚:'金',丙辛:'水',丁壬:'木',戊癸:'火'},GANCHONG=['甲庚','乙辛','丙壬','丁癸'];
const has=(arr,a,b)=>arr.includes(a+b)||arr.includes(b+a);
export function zhiRel(a,b){const r=[];if(has(CHONG,a,b))r.push('沖');const h=LIUHE[a+b]||LIUHE[b+a];if(h)r.push('六合('+h+')');
 if(has(XING,a,b)||(a===b&&ZIXING.includes(a)))r.push(a===b?'自刑':'刑');if(has(HAI,a,b))r.push('害');return r;}
export function ganRel(a,b){const r=[];const h=GANHE[a+b]||GANHE[b+a];if(h)r.push('合('+h+')');if(has(GANCHONG,a,b))r.push('沖');return r;}
const SANHE=[['申子辰','水'],['亥卯未','木'],['寅午戌','火'],['巳酉丑','金']];
export function sanHe(zs){return SANHE.filter(([s])=>[...s].every(c=>zs.includes(c))).map(([s,w])=>s+'三合'+w+'局');}
// true solar time
export function trueSolar(d,lon){if(lon==null||isNaN(lon))return {d,off:0};const st=new Date(d.getFullYear(),0,0);const N=Math.floor((d-st)/864e5);
 const B=2*Math.PI*(N-81)/364;const eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);const off=(lon-120)*4+eot;
 return {d:new Date(d.getTime()+off*6e4),off};}
export function buildChart({name,gender,date,time,lon}){
 const [Y,M,D]=date.split('-').map(Number),[h,m]=time.split(':').map(Number);
 const {d,off}=trueSolar(new Date(Y,M-1,D,h,m),lon);
 const solar=Solar.fromYmdHms(d.getFullYear(),d.getMonth()+1,d.getDate(),d.getHours(),d.getMinutes(),0);
 const lunar=solar.getLunar(),ec=lunar.getEightChar();
 const gz=[ec.getYear(),ec.getMonth(),ec.getDay(),ec.getTime()];const dm=gz[2][0];
 const ny=[ec.getYearNaYin(),ec.getMonthNaYin(),ec.getDayNaYin(),ec.getTimeNaYin()].map(tw);
 const pillars=gz.map((p,i)=>({label:['年柱','月柱','日柱','時柱'][i],gan:p[0],zhi:p[1],ss:i===2?'日主':shiShen(dm,p[0]),
   hide:hide(p[1]).map(g=>({g,ss:shiShen(dm,g)})),nayin:ny[i]}));
 // strength
 const score={木:0,火:0,土:0,金:0,水:0},W=[.6,.3,.1];
 pillars.forEach((p,i)=>{score[ganWx(p.gan)]+=1;const k=i===1?2:1;p.hide.forEach((x,j)=>score[ganWx(x.g)]+=(p.hide.length===1?1:W[j])*k*1.0);});
 const dw=ganWx(dm),yin=WX[(WX.indexOf(dw)+4)%5];const tot=Object.values(score).reduce((a,b)=>a+b);
 const self=(score[dw]+score[yin])/tot;const strong=self>=0.5;
 const lev=self>=.62?'身強':self>=.5?'偏強':self>=.38?'偏弱':'身弱';
 const out=WX[(WX.indexOf(dw)+1)%5],cai=WX[(WX.indexOf(dw)+2)%5],guan=WX[(WX.indexOf(dw)+3)%5];
 const xi=strong?[out,cai,guan].sort((a,b)=>score[a]-score[b]).slice(0,2):[yin,dw].sort((a,b)=>score[a]-score[b]);
 const ji=strong?[yin,dw]:[guan,cai];
 const yun=ec.getYun(Number(gender));const ss0=yun.getStartSolar();const dayun=yun.getDaYun().slice(1,11).map((x,i)=>({gz:x.getGanZhi(),age:x.getStartAge(),end:x.getEndAge(),year:x.getStartYear(),endYear:x.getEndYear(),start:`${ss0.getYear()+10*i}-${String(ss0.getMonth()).padStart(2,'0')}-${String(ss0.getDay()).padStart(2,'0')}`,ss:shiShen(dm,x.getGanZhi()[0])}));
 const res={name,gender:Number(gender),solar,lunar,pillars,dm,dw,score,self,lev,strong,xi,ji,off,
  startSolar:ss0.toYmd(),prevJie:[tw(lunar.getPrevJie(false).getName()),lunar.getPrevJie(false).getSolar().toYmdHms().slice(0,16)],nextJie:[tw(lunar.getNextJie(false).getName()),lunar.getNextJie(false).getSolar().toYmdHms().slice(0,16)],forward:yun.isForward(),start:`${yun.getStartYear()}年${yun.getStartMonth()}個月${yun.getStartDay()}天`,dayun,
  lunarText:tw(lunar.toString()),shengXiao:tw(lunar.getYearShengXiaoExact())};
 res.birthMs=Date.UTC(solar.getYear(),solar.getMonth()-1,solar.getDay(),solar.getHour(),solar.getMinute(),0);res.forward=yun.isForward();
 res.yun=preciseYun(res.birthMs,res.forward,dayun.map(d=>d.gz),gz[1],dm);const by=solar.getYear();
 res.yun.segs.slice(1).forEach((s,i)=>{const d=dayun[i];const a=new Date(s.from),b=new Date(s.to);d.start=s.jie&&new Date(s.from).toISOString().slice(0,16).replace('T',' ');d.end_=new Date(s.to).toISOString().slice(0,16).replace('T',' ');d.fromMs=s.from;d.toMs=s.to;d.year=a.getUTCFullYear();d.endYear=b.getUTCFullYear();d.age=d.year-by+1;d.end=d.endYear-by+1;});
 res.startSolar=new Date(res.yun.startMs).toISOString().slice(0,16).replace('T',' ');
 const A=analyze(res);res.A=A;res.xi=[A.yong,A.xi];res.ji=A.ji;res.lev=A.lev;res.strong=A.strong;return res;}
export function yearPillar(Y){return Solar.fromYmd(Y,6,1).getLunar().getYearInGanZhiExact();}
export function liuYue(Y){const r=[];for(let i=0;i<12;i++){const mo=(i+1)%12+1,yy=i>=11?Y+1:Y;const l=Solar.fromYmd(yy,mo,15).getLunar();
 const jq=l.getPrevJie(true);r.push({gz:l.getMonthInGanZhiExact(),jie:tw(jq.getName()),date:jq.getSolar().toYmd()});}return r;}
export function dayInfo(s){const l=s.getLunar();return {gz:l.getDayInGanZhiExact(),yi:l.getDayYi().map(tw),ji:l.getDayJi().map(tw),
 chong:tw(l.getDayChongDesc()),sha:tw(l.getDaySha()),zhixing:tw(l.getZhiXing()),tianshen:tw(l.getDayTianShen()),luck:tw(l.getDayTianShenLuck()),lunar:tw(l.getMonthInChinese()+'月'+l.getDayInChinese())};}
export {Solar};
