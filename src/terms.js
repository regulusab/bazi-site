// JPL DE421 節氣表（skyfield 計算太陽地心視黃經每 15° 交點，1900–2050），時刻以台北標準時間 UTC+8 存為「牆鐘毫秒」
import RAW from './terms-data.js';
export const TERM_NAMES=['春分','清明','穀雨','立夏','小滿','芒種','夏至','小暑','大暑','立秋','處暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒','立春','雨水','驚蟄'];
export const TERMS=RAW.map(([u,k])=>({ms:u*1000+8*36e5,k,name:TERM_NAMES[k],lon:k*15,jie:k%2===1}));
export const JIE=TERMS.filter(t=>t.jie);
export const RANGE=[JIE[1].ms,JIE[JIE.length-2].ms];
export const inRange=ms=>ms>RANGE[0]&&ms<RANGE[1];
export const SOURCE='JPL DE421 星曆（台北標準時間 UTC+8）';
function bs(ms){let lo=0,hi=JIE.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(JIE[m].ms<=ms)lo=m;else hi=m-1;}return lo;}
export const prevJieIdx=ms=>bs(ms); // index of last 節 <= ms
export function jieAround(ms){const i=bs(ms);return {prev:JIE[i],next:JIE[i+1]};}
const GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥';
// 年柱（立春換年）、月柱（節換月）
export function yearMonthPillar(ms){const i=bs(ms);const j=JIE[i];const mIdx=((j.k-21+24)%24)/2; // 0=寅月
 // 找最近立春
 let li=i;while(JIE[li].k!==21)li--;const Y=new Date(JIE[li].ms).getUTCFullYear();
 const yg=(Y-4)%10,yz=(Y-4)%12;const yGz=GAN[(yg+10)%10]+ZHI[(yz+12)%12];
 const mg=((yg%5)*2+2+mIdx)%10;const mz=(2+mIdx)%12;return {year:yGz,month:GAN[mg]+ZHI[mz],jie:j};}
export function termsBetween(a,b){return TERMS.filter(t=>t.ms>=a&&t.ms<=b);}

/** 節氣表存為台北標準時間 UTC+8 牆鐘毫秒；與世界時差 8 小時。 */
export const TERM_OFFSET_MIN = 8 * 60;
/** 出生地地方平時相對 UT 的分鐘數：經度 × 4（東經正、西經負），不加夏令。老師 2026-11-19 裁定。 */
export const lmtOffsetMin = lon => lon * 4;
/** 節氣表時刻 → 出生地地方平時牆鐘毫秒（UT + 經度×4 分，不加夏令）。 */
export function jieMsToLmt(jieMs, lon) {
  return jieMs - TERM_OFFSET_MIN * 6e4 + lmtOffsetMin(lon) * 6e4;
}
/** 出生地地方平時牆鐘毫秒 → 節氣表（台北 UTC+8）尺度，供 yearMonthPillar／prevJieIdx／inRange 沿用。出生時間照輸入（地方平時，不換算）。 */
export function lmtToTermScale(lmtMs, lon) {
  return lmtMs - lmtOffsetMin(lon) * 6e4 + TERM_OFFSET_MIN * 6e4;
}
