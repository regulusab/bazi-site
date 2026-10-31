// 精確起運與逐日對照：天體時間差 × 120 = 人生時間（三日折一年、一日折四個月、一時辰折十日）
import LJ from 'lunar-javascript';
import {tw,shiShen} from './bazi.js';
import {JIE,inRange,prevJieIdx} from './terms.js';
const {Solar}=LJ;
export const RATIO=120, MS_D=864e5;
const toMs=s=>Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond());
export const fromMs=ms=>{const d=new Date(ms);return Solar.fromYmdHms(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds());};
const p2=n=>String(n).padStart(2,'0');
export const fmt=(ms,withTime=true)=>{const d=new Date(ms);return `${d.getUTCFullYear()}-${p2(d.getUTCMonth()+1)}-${p2(d.getUTCDate())}`+(withTime?` ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`:'');};
export const parseDate=v=>{const [y,m,d]=v.split('-').map(Number);return Date.UTC(y,m-1,d);};
// 列出出生後（順）或出生前（逆）連續 n 個「節」
export function jieSeq(birthMs,forward,n=11,useDE=true){if(useDE&&inRange(birthMs)){const i=prevJieIdx(birthMs);const out=[];for(let k=0;k<n;k++){const j=JIE[forward?i+1+k:(JIE[i].ms===birthMs?i-1:i)-k];if(!j)break;out.push({name:j.name,ms:j.ms,lon:j.lon,de:true});}if(out.length===n)return out;}
 const out=[];let cur=birthMs;
 for(let k=0;k<n;k++){const l=fromMs(cur).getLunar();const j=forward?l.getNextJie(false):l.getPrevJie(false);let ms=toMs(j.getSolar());
  if(forward?ms<=cur:ms>=cur){const l2=fromMs(cur+(forward?60e3:-60e3)).getLunar();const j2=forward?l2.getNextJie(false):l2.getPrevJie(false);ms=toMs(j2.getSolar());out.push({name:tw(j2.getName()),ms});}
  else out.push({name:tw(j.getName()),ms});cur=out[out.length-1].ms+(forward?60e3:-60e3);}
 return out;}
export const life=(birthMs,celMs)=>birthMs+Math.abs(celMs-birthMs)*RATIO;
export function spanText(ms){const days=ms/MS_D;const y=Math.floor(days/360),m=Math.floor((days-y*360)/30),d=Math.floor(days-y*360-m*30),h=Math.round((days-Math.floor(days))*24);return `${y}年${m}個月${d}天${h?h+'時':''}`;}
// 傳統口訣：天數÷3=年，餘1日=4個月，1時辰=10日，1小時=5日
export function traditional(diffMs){const tot=diffMs/MS_D;const D=Math.floor(tot);const hours=(tot-D)*24;const y=Math.floor(D/3),remD=D%3;const extraDays=hours*5;const m=remD*4+Math.floor(extraDays/30);const d=Math.round(extraDays%30);
 return {y,m,d,text:`${D}日${hours.toFixed(1)}小時 → ${y}年${m}個月${d}天`};}
export function preciseYun(birthMs,forward,dayunGz,monthGz,dm,useDE=true){
 const J=jieSeq(birthMs,forward,dayunGz.length+1,useDE);
 const segs=[{gz:monthGz,label:'上運前',celFrom:birthMs,celTo:J[0].ms,from:birthMs,to:life(birthMs,J[0].ms),jie:'出生'}];
 dayunGz.forEach((gz,i)=>segs.push({gz,label:`第${i+1}運`,idx:i,celFrom:J[i].ms,celTo:J[i+1].ms,from:life(birthMs,J[i].ms),to:life(birthMs,J[i+1].ms),jie:`${J[i].name} ${fmt(J[i].ms)}`,jieName:J[i].name,jieName2:J[i+1].name,ss:shiShen(dm,gz[0])}));
 return {J,segs,startMs:segs[1].from,trad:traditional(Math.abs(J[0].ms-birthMs))};}
// 逐日：出生日至最後一節之間每個公曆日（00:00 換日）
export function dailyRows(c){const {birthMs,forward}=c;const segs=c.yun.segs;const rows=[];
 for(const seg of segs){const lo=Math.min(seg.celFrom,seg.celTo),hi=Math.max(seg.celFrom,seg.celTo);let no=0;
  let d=forward?Math.floor(lo/MS_D)*MS_D:Math.ceil(hi/MS_D)*MS_D-MS_D;
  for(let k=0;k<400;k++){const ds=d,de=d+MS_D;const a=Math.max(ds,lo),b=Math.min(de,hi);if(b>a){no++;
    const A=forward?a:b,B=forward?b:a;const l=fromMs(ds+12*36e5).getLunar();
    rows.push({no,cel:ds,celA:Math.min(a,b),celB:Math.max(a,b),gz:l.getDayInGanZhiExact(),from:life(birthMs,A),to:life(birthMs,B),seg,partial:(b-a)<MS_D});}
   d+=forward?MS_D:-MS_D;if(forward?d>=hi:d+MS_D<=lo)break;}}
 return rows;}
export function lifeToCel(c,lifeMs){return c.birthMs+(c.forward?1:-1)*(lifeMs-c.birthMs)/RATIO;}
