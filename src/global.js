// 全球八字試算：干支換日線（東經 70°）模型。純邏輯，瀏覽器與 Node 皆可用。
import {JIE,inRange,yearMonthPillar,prevJieIdx} from './terms.js';
export const LINE=70, RATIO=120;
const GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥';
const H=36e5,D=864e5,p2=n=>String(n).padStart(2,'0');
export const gz=i=>GAN[((i%10)+10)%10]+ZHI[((i%12)+12)%12];
// 日干支：JDN+49 mod 60（0=甲子）；以「牆鐘毫秒」(Date.UTC 形式) 的日期部分計
export const dayIdx=wallMs=>{const jdn=Math.floor(wallMs/D)+2440588;return ((jdn+49)%60+60)%60;};
export const fmtW=(ms,sec)=>{const d=new Date(ms);return `${d.getUTCFullYear()}-${p2(d.getUTCMonth()+1)}-${p2(d.getUTCDate())} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}${sec?':'+p2(d.getUTCSeconds()):''}`;};
// ---- 時區 ----
const dtfCache={};
export function zoneOffsetMin(zone,utMs){const f=dtfCache[zone]||(dtfCache[zone]=new Intl.DateTimeFormat('en-US',{timeZone:zone,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}));
 const o={};for(const p of f.formatToParts(new Date(utMs)))o[p.type]=p.value;const w=Date.UTC(+o.year,+o.month-1,+o.day,+o.hour%24,+o.minute,+o.second);return Math.round((w-Math.floor(utMs/1000)*1000)/6e4);}
// 牆鐘 → UT；回傳 {ut, off, ambiguous:[ut1,ut2]|null, gap:bool}
export function wallToUt(zone,wall,second=false){const o1=zoneOffsetMin(zone,wall-36*H),o2=zoneOffsetMin(zone,wall+36*H);const c=[...new Set([o1,o2])].map(o=>({o,u:wall-o*6e4})).filter(x=>zoneOffsetMin(zone,x.u)===x.o).sort((a,b)=>a.u-b.u);
 if(!c.length){const u=wall-o1*6e4;return {ut:u,off:zoneOffsetMin(zone,u),gap:true,ambiguous:null};}
 const pick=c.length>1&&second?c[1]:c[0];return {ut:pick.u,off:pick.o,gap:false,ambiguous:c.length>1?c.map(x=>x.u):null};}
export const utToWall=(zone,ut,fixedOff)=>ut+(fixedOff!=null?fixedOff:zoneOffsetMin(zone,ut))*6e4;
export const offTxt=m=>`UTC${m<0?'−':'+'}${p2(Math.floor(Math.abs(m)/60))}:${p2(Math.abs(m)%60)}`;
// ---- 均時差（Meeus 低精度太陽位置，誤差數秒）----
export function eotMin(ut){const jd=ut/D+2440587.5,T=(jd-2451545)/36525,r=Math.PI/180;
 const L0=(280.46646+T*(36000.76983+0.0003032*T))%360,M=357.52911+T*(35999.05029-0.0001537*T),e=0.016708634-T*(0.000042037+0.0000001267*T);
 const C=(1.914602-T*(0.004817+0.000014*T))*Math.sin(M*r)+(0.019993-0.000101*T)*Math.sin(2*M*r)+0.000289*Math.sin(3*M*r);
 const om=125.04-1934.136*T,lam=L0+C-0.00569-0.00478*Math.sin(om*r);const eps0=23+(26+(21.448-T*(46.815+T*(0.00059-T*0.001813)))/60)/60,eps=eps0+0.00256*Math.cos(om*r);
 const y=Math.tan(eps*r/2)**2;const E=y*Math.sin(2*L0*r)-2*e*Math.sin(M*r)+4*e*y*Math.sin(M*r)*Math.cos(2*L0*r)-0.5*y*y*Math.sin(4*L0*r)-1.25*e*e*Math.sin(2*M*r);
 return E/r*4;}
// 三日折一年：1日=4月、1時=5日、1分=2時、1秒=2分（月以 30 日計）
export function tradSpan(ms){let s=Math.round(ms/1000);const d=Math.floor(s/86400);s-=d*86400;const h=Math.floor(s/3600);s-=h*3600;const mi=Math.floor(s/60);const se=s-mi*60;
 let Y=Math.floor(d/3),M=(d%3)*4;let minutes=h*5*1440+mi*120+se*2;let DD=Math.floor(minutes/1440);minutes-=DD*1440;let HH=Math.floor(minutes/60),MM=minutes%60;M+=Math.floor(DD/30);DD%=30;Y+=Math.floor(M/12);M%=12;
 return {Y,M,D:DD,H:HH,Mi:MM,text:`${Y}年${M}月${DD}日${HH}時${MM?MM+'分':''}`,diffText:`${d}日${h}時${mi}分${se?se+'秒':''}`};}
const addCal=(wall,t)=>{const d=new Date(wall);d.setUTCFullYear(d.getUTCFullYear()+t.Y);d.setUTCMonth(d.getUTCMonth()+t.M);return d.getTime()+t.D*D+t.H*H+(t.Mi||0)*6e4;};
const hourIdx=h=>Math.floor((h+1)/2)%12; // h: 小數小時
const hourStem=(dayStemIdx,zi)=>((dayStemIdx%5)*2+zi)%10;
// 主計算
// inp: {y,m,d,hh,mi, lat, lon, gender(1男0女), zone, fixedOffMin(null|分鐘), second(重複時段取第二次), rule:'midnight'|'23'}
export function globalChart(inp){const wall=Date.UTC(inp.y,inp.m-1,inp.d,inp.hh,inp.mi);
 let ut,off,amb=null,gap=false;if(inp.fixedOffMin!=null&&inp.fixedOffMin!==''){off=+inp.fixedOffMin;ut=wall-off*6e4;}else{const r=wallToUt(inp.zone,wall,inp.second);ut=r.ut;off=r.off;amb=r.ambiguous;gap=r.gap;}
 const lon=+inp.lon,east=lon>=LINE,L=east?lon:lon+360,eot=eotMin(ut);
 const meanG=ut+L/15*H,trueG=meanG+eot*6e4; // 干支換日線法：牆鐘（日期可能比民用日期多一日）
 const meanC=ut+lon/15*H,trueC=meanC+eot*6e4; // 一般：實際經度
 const rule=inp.rule==='23'?'23':'midnight';
 const pillarsAt=(tw)=>{const dt=new Date(tw);const h=dt.getUTCHours()+dt.getUTCMinutes()/60+dt.getUTCSeconds()/3600;let di=dayIdx(tw);const zi=hourIdx(h);
  let hsDay=di;if(h>=23){if(rule==='23')di=(di+1)%60;hsDay=(dayIdx(tw)+1)%60;} // 23 點後：子時時干依次日（晚子時）
  return {day:gz(di),dayI:di,hour:GAN[hourStem(hsDay,zi)]+ZHI[zi],h};};
 const G=pillarsAt(trueG),C=pillarsAt(trueC);
 const clockWall=wall;const ch=new Date(clockWall).getUTCHours()+new Date(clockWall).getUTCMinutes()/60;const czi=hourIdx(ch);
 const clockHour=GAN[hourStem(ch>=23?(G.dayI+(rule==='23'?0:1))%60:G.dayI,czi)]+ZHI[czi];
 const tpe=ut+8*H;if(!inRange(tpe))throw new Error('出生時刻超出 DE421 節氣表範圍（1900–2050）');
 const ym=yearMonthPillar(tpe);
 // 大運
 const yStem=GAN.indexOf(ym.year[0]);const forward=(yStem%2===0)===(+inp.gender===1);
 const i=prevJieIdx(tpe);const seq=[];for(let k=0;k<11;k++){const j=JIE[forward?i+1+k:i-k];if(j){let u=j.ms-8*H;if(inp.roundJie)u=Math.round(u/6e4)*6e4;seq.push({name:j.name,ut:u});}}
 const diff=Math.abs(seq[0].ut-ut);const trad=tradSpan(diff);
 const mI=(()=>{for(let k=0;k<60;k++)if(gz(k)===ym.month)return k;})();
 const toLocal=u=>utToWall(inp.zone,u,inp.fixedOffMin!=null&&inp.fixedOffMin!==''?+inp.fixedOffMin:null);
 const startA=addCal(clockWall,trad);
 const dayun=[];for(let k=0;k<10;k++){const b=seq[k]?ut+Math.abs(seq[k].ut-ut)*RATIO:null;const aW=addCal(startA,{Y:10*k,M:0,D:0,H:0});
  dayun.push({gz:gz(mI+(forward?k+1:-(k+1))),tradStart:fmtW(aW),tradAge:trad.Y+10*k,x120Start:b!=null?fmtW(toLocal(b)):'—',x120Off:b!=null?offTxt(zoneOffsetMin(inp.zone,b)):'',jie:seq[k]?seq[k].name+' '+fmtW(toLocal(seq[k].ut),true):''});}
 // 交界警示
 const warn=[];const near=(h,b)=>{const x=(((h-b)%24)+24)%24;return Math.min(x,24-x)<0.25;};
 for(const b of [1,3,5,7,9,11,13,15,17,19,21,23])if(near(G.h,b)){warn.push(`真太陽時 ${fmtW(trueG).slice(11)} 距時辰交界 ${p2(b)}:00 不到 15 分鐘，時柱可能改變`);break;}
 if(near(G.h,0))warn.push(`真太陽時距午夜換日不到 15 分鐘，日柱可能改變`);if(rule==='23'&&near(G.h,23))warn.push('真太陽時距 23:00 換日不到 15 分鐘');
 const jPrev=JIE[i],jNext=JIE[i+1];for(const j of [jPrev,jNext])if(Math.abs(j.ms-tpe)<15*6e4)warn.push(`出生距 ${j.name} 交節不到 15 分鐘，年／月柱可能改變`);
 if(Math.abs(lon-LINE)<1)warn.push('出生地經度接近東經 70° 干支換日線，日柱依線之東西兩側不同');
 if(amb)warn.push(`當地時鐘回撥，${fmtW(wall)} 出現兩次（${amb.map(u=>offTxt(Math.round((wall-u)/6e4))).join(' / ')}），目前採${inp.second?'第二次（標準時間）':'第一次（夏令時間）'}`);
 if(gap)warn.push('當地時鐘撥快，此鐘點不存在（夏令時間開始），已按撥快前偏移推算，請核對出生紀錄');
 return {wall,ut,off,zone:inp.zone,lon,lat:+inp.lat,east,L,eot,meanG,trueG,meanC,trueC,rule,amb,gap,
  main:{year:ym.year,month:ym.month,day:G.day,hour:G.hour},civil:{year:ym.year,month:ym.month,day:C.day,hour:C.hour},clockHour,civilClockDay:gz(dayIdx(wall)),
  jieNow:{name:jPrev.name,local:fmtW(toLocal(jPrev.ms-8*H),true)},forward,nextJie:{name:seq[0].name,local:fmtW(toLocal(seq[0].ut)),off:offTxt(zoneOffsetMin(inp.zone,seq[0].ut)),utc:fmtW(seq[0].ut,true)},
  diffMs:diff,trad,startA:fmtW(startA),startB:fmtW(toLocal(ut+diff*RATIO)),dayun,warn};}
