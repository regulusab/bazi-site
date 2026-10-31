// 精確起運與逐日對照：天體時間差 × 120 = 人生時間（三日折一年、一日折四個月、一時辰折十日）
import LJ from 'lunar-javascript';
import {tw,shiShen} from './bazi.js';
const {Solar}=LJ;
export const RATIO=120, MS_D=864e5;
const toMs=s=>Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond());
export const fromMs=ms=>{const d=new Date(ms);return Solar.fromYmdHms(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds());};
const p2=n=>String(n).padStart(2,'0');
export const fmt=(ms,withTime=true)=>{const d=new Date(ms);return `${d.getUTCFullYear()}-${p2(d.getUTCMonth()+1)}-${p2(d.getUTCDate())}`+(withTime?` ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`:'');};
export const parseDate=v=>{const [y,m,d]=v.split('-').map(Number);return Date.UTC(y,m-1,d);};
// 列出出生後（順）或出生前（逆）連續 n 個「節」
export function jieSeq(birthMs,forward,n=11){const out=[];let cur=birthMs;
 for(let k=0;k<n;k++){const l=fromMs(cur).getLunar();const j=forward?l.getNextJie(false):l.getPrevJie(false);let ms=toMs(j.getSolar());
  if(forward?ms<=cur:ms>=cur){const l2=fromMs(cur+(forward?60e3:-60e3)).getLunar();const j2=forward?l2.getNextJie(false):l2.getPrevJie(false);ms=toMs(j2.getSolar());out.push({name:tw(j2.getName()),ms});}
  else out.push({name:tw(j.getName()),ms});cur=out[out.length-1].ms+(forward?60e3:-60e3);}
 return out;}
export const life=(birthMs,celMs)=>birthMs+Math.abs(celMs-birthMs)*RATIO;
export function spanText(ms){const days=ms/MS_D;const y=Math.floor(days/360),m=Math.floor((days-y*360)/30),d=Math.floor(days-y*360-m*30),h=Math.round((days-Math.floor(days))*24);return `${y}年${m}個月${d}天${h?h+'時':''}`;}
// 傳統口訣：天數÷3=年，餘1日=4個月，1時辰=10日，1小時=5日
export function traditional(diffMs){const tot=diffMs/MS_D;const D=Math.floor(tot);const hours=(tot-D)*24;const y=Math.floor(D/3),remD=D%3;const extraDays=hours*5;const m=remD*4+Math.floor(extraDays/30);const d=Math.round(extraDays%30);
 return {y,m,d,text:`${D}日${hours.toFixed(1)}小時 → ${y}年${m}個月${d}天`};}
export function preciseYun(birthMs,forward,dayunGz,monthGz,dm){
 const J=jieSeq(birthMs,forward,dayunGz.length+1);
 const segs=[{gz:monthGz,label:'上運前',celFrom:birthMs,celTo:J[0].ms,from:birthMs,to:life(birthMs,J[0].ms),jie:'出生'}];
 dayunGz.forEach((gz,i)=>segs.push({gz,label:`第${i+1}運`,idx:i,celFrom:J[i].ms,celTo:J[i+1].ms,from:life(birthMs,J[i].ms),to:life(birthMs,J[i+1].ms),jie:`${J[i].name} ${fmt(J[i].ms)}`,ss:shiShen(dm,gz[0])}));
 return {J,segs,startMs:segs[1].from,trad:traditional(Math.abs(J[0].ms-birthMs))};}
// 逐日：出生日至最後一節之間每個公曆日（00:00 換日）
export function dailyRows(c){const {birthMs,forward}=c;const segs=c.yun.segs;const end=segs[segs.length-1].celTo;const rows=[];
 const step=forward?1:-1;let d0=Math.floor(birthMs/MS_D)*MS_D;
 for(let k=0;k<5000;k++){const dayStart=d0+k*step*MS_D,dayEnd=dayStart+MS_D;
  const a=forward?Math.max(dayStart,birthMs):Math.min(dayEnd,birthMs), b=forward?Math.min(dayEnd,end):Math.max(dayStart,end);
  if(forward?a>=end:a<=end)break; if(forward?b<=a:b>=a)continue;
  const mid=(a+b)/2;const seg=segs.find(s=>forward?mid>=s.celFrom&&mid<s.celTo:mid<=s.celFrom&&mid>s.celTo)||segs[segs.length-1];
  const l=fromMs(dayStart+12*36e5).getLunar();rows.push({cel:dayStart,celA:a,celB:b,gz:l.getDayInGanZhiExact(),from:life(birthMs,a),to:life(birthMs,b),seg});}
 return rows;}
export function lifeToCel(c,lifeMs){return c.birthMs+(c.forward?1:-1)*(lifeMs-c.birthMs)/RATIO;}
