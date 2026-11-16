// 排盤時間口徑（鐘錶時間／真太陽時）與夏令時間處理。
// 引擎函式（buildChart、globalChart）的 timeMode 預設仍是 'solar'，以保持呼叫端相容；
// 網站介面預設為 'clock'（鐘錶時間，依時鐘所示，不去掉夏令時間）。
// sheetData 原本即鐘錶時間，預設維持 clock。CLOCK_STRIP_DST 預設 false（老師裁定）。
import {zoneOffsetMin, wallToUt, CLOCK_STRIP_DST, standardOffsetMin} from './global.js';
export {CLOCK_STRIP_DST, standardOffsetMin};

export const TIME_MODE_KEY = 'bazi_time_mode';
export const TIME_MODE_UI_DEFAULT = 'clock';

export function normalizeTimeMode(v){return v==='solar'?'solar':'clock';}

export function loadTimeMode(search){
  try{
    const q=new URLSearchParams(search??(typeof location!=='undefined'?location.search:''));
    const u=q.get('tm')||q.get('timeMode');
    if(u==='solar'||u==='clock')return u;
  }catch(e){}
  try{const s=typeof localStorage!=='undefined'?localStorage.getItem(TIME_MODE_KEY):null;if(s==='solar'||s==='clock')return s;}catch(e){}
  return TIME_MODE_UI_DEFAULT;
}

export function saveTimeMode(mode){
  const m=normalizeTimeMode(mode);
  try{if(typeof localStorage!=='undefined')localStorage.setItem(TIME_MODE_KEY,m);}catch(e){}
  return m;
}

const p2=n=>String(n).padStart(2,'0');
export const fmtYmdHm=(y,m,d,hh,mi)=>`${y}-${p2(m)}-${p2(d)} ${p2(hh)}:${p2(mi)}`;
export const utcParts=ms=>{const x=new Date(ms);return {y:x.getUTCFullYear(),m:x.getUTCMonth()+1,d:x.getUTCDate(),hh:x.getUTCHours(),mi:x.getUTCMinutes()};};

/**
 * 把「當地牆鐘」轉成排盤用的標準時間（可去掉夏令）。
 * 回傳 {y,m,d,hh,mi, ut, off, stdOff, dstMin, stripped, wall, standardMs}
 */
export function resolveStandard(zone,y,m,d,hh,mi,opt={}){
  const wall=Date.UTC(y,m-1,d,hh,mi);
  let ut,off,amb=null,gap=false;
  if(opt.fixedOffMin!=null&&opt.fixedOffMin!==''){off=+opt.fixedOffMin;ut=wall-off*6e4;}
  else if(zone){const r=wallToUt(zone,wall,!!opt.second);ut=r.ut;off=r.off;amb=r.ambiguous;gap=r.gap;}
  else{off=8*60;ut=wall-off*6e4;}
  const wantStrip=opt.stripDst!=null?!!opt.stripDst:CLOCK_STRIP_DST;
  const stdOff=(wantStrip&&zone&&(opt.fixedOffMin==null||opt.fixedOffMin===''))?standardOffsetMin(zone,y,off):off;
  const dstMin=off-stdOff;
  const stripped=!!(dstMin&&wantStrip);
  const standardMs=ut+stdOff*6e4;
  const p=utcParts(standardMs);
  return {y:p.y,m:p.m,d:p.d,hh:p.hh,mi:p.mi,ut,off,stdOff,dstMin,stripped,wall,standardMs,amb,gap,zone};
}

export function timeModeLabel(mode,info={}){
  if(mode==='solar')return '真太陽時（經度＋均時差校正）';
  if(info.stripped&&info.dstMin){
    const from=info.inputTime,to=info.standardTime;
    if(from&&to)return `鐘錶時間（當地標準時間，已將夏令時間 ${from} 改為 ${to}）`;
    return `鐘錶時間（當地標準時間，已去掉夏令時間 ${info.dstMin} 分鐘）`;
  }
  return '鐘錶時間（依時鐘所示）';
}


/** 把下拉選單與 URL（tm）／localStorage 同步；回傳目前口徑。 */
export function bindTimeMode(id, onChange){
  const el=typeof id==='string'?document.getElementById(id):id;
  if(!el)return loadTimeMode();
  const mode=loadTimeMode();
  el.value=mode;
  const apply=()=>{const m=saveTimeMode(el.value);onChange&&onChange(m);};
  el.addEventListener('change',apply);
  return mode;
}

/** 表單用的下拉選單 HTML（標籤文字依老師指定）。 */
export function timeModeSelectHtml(id,mode){
  const m=normalizeTimeMode(mode);
  return `<label>排盤時間口徑<select id="${id}">`
    +`<option value="clock"${m==='clock'?' selected':''}>鐘錶時間（預設）</option>`
    +`<option value="solar"${m==='solar'?' selected':''}>真太陽時</option>`
    +`</select></label>`;
}
