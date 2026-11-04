// 「詳細命盤」分頁：輸入論命資料 → 星僑格式八字論斷單頁，可下載 PDF／Word
import tzlookup from 'tz-lookup';
import {sheetData} from './sheetData.js';
import {layoutSheet} from './sheetLayout.js';
import {sheetSvg,loadFonts,sheetPdf,sheetDocx} from './sheetRender.js';
const $=s=>document.querySelector(s);
const CITIES=[['台灣（台北）',25.0330,121.5654,'Asia/Taipei'],['台中',24.1477,120.6736,'Asia/Taipei'],['高雄',22.6273,120.3014,'Asia/Taipei'],['香港',22.3193,114.1694,'Asia/Hong_Kong'],['澳門',22.1987,113.5439,'Asia/Macau'],['上海',31.2304,121.4737,'Asia/Shanghai'],['北京',39.9042,116.4074,'Asia/Shanghai'],['新加坡',1.3521,103.8198,'Asia/Singapore'],['吉隆坡',3.1390,101.6869,'Asia/Kuala_Lumpur'],['東京',35.6812,139.7671,'Asia/Tokyo'],
 ['波特蘭（奧勒岡）',45.52,-122.68,'America/Los_Angeles'],['洛杉磯',34.0522,-118.2437,'America/Los_Angeles'],['舊金山',37.7749,-122.4194,'America/Los_Angeles'],['西雅圖',47.6062,-122.3321,'America/Los_Angeles'],['溫哥華',49.2827,-123.1207,'America/Vancouver'],['紐約',40.7128,-74.0060,'America/New_York'],['多倫多',43.6532,-79.3832,'America/Toronto'],['倫敦',51.5074,-0.1278,'Europe/London'],['雪梨',-33.8688,151.2093,'Australia/Sydney'],['— 自訂經緯度 —']];
const pad=n=>String(n).padStart(2,'0');
const todayStr=()=>{const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;};
const F={sName:'n',sGender:'g',sDate:'d',sTime:'t',sLat:'lat',sLon:'lon',sZone:'tz',sDayRule:'dr',sList:'ld'};
export function initSheet(){const pane=$('#sheet');if(pane.dataset.init)return;pane.dataset.init='1';
 pane.innerHTML=`<section class="card noprint"><h2>詳細命盤（八字論斷）</h2>
 <div class="grid">
 <label>姓名<input id="sName" value="命主"></label>
 <label>性別<select id="sGender"><option value="1">男（乾造）</option><option value="0">女（坤造）</option></select></label>
 <label>出生日期（國曆）<input type="date" id="sDate" value="1990-01-01"></label>
 <label>出生時間（時：分）<input type="time" id="sTime" value="12:00"></label>
 <label>出生地<select id="sCity">${CITIES.map((c,i)=>`<option value="${i}">${c[0]}</option>`).join('')}</select></label>
 <label>時區（IANA）<input id="sZone" value="Asia/Taipei"></label>
 <label>緯度<input id="sLat" type="number" step="0.0001" value="25.0330"></label>
 <label>經度<input id="sLon" type="number" step="0.0001" value="121.5654"></label>
 <label class="chk"><span><input type="checkbox" id="sStd" checked> 以當地標準時間排盤（自動扣除夏令時間）</span><small class="muted">台灣 1945–1961、1974–1975、1979 年夏令時間依時區資料自動判斷</small></label>
 <label>日柱換日<select id="sDayRule"><option value="line">干支換日線（東經70°以西加一日，與星僑相同）</option><option value="civil">依出生地當地日期</option></select></label>
 <label>列表日期<input type="date" id="sList"></label>
 </div>
 <div class="row"><button id="sGen" class="pri">產生詳細命盤</button><button id="sPdf" disabled>下載 PDF</button><button id="sDocx" disabled>下載 Word</button><button id="sFrom">帶入「命主資料」</button><button id="sShare" disabled>分享連結</button></div>
 <p id="sMsg" class="muted"></p><p id="sNote" class="muted"></p></section>
 <div id="sOut" class="sheetwrap"></div>
 <p class="muted noprint">※ 版面依「星僑」八字論斷格式重製；節氣採 JPL DE421。日主旺度、用神／喜神／閒神／仇神／忌神、命格、編號等欄位依原格式留空。本文件依傳統命理規則自動生成，僅供參考與娛樂。</p>`;
 $('#sList').value=todayStr();
 const autoZone=()=>{try{$('#sZone').value=tzlookup(+$('#sLat').value,+$('#sLon').value);}catch(e){}};
 $('#sCity').onchange=()=>{const c=CITIES[$('#sCity').value];if(c[1]==null)return;$('#sLat').value=c[1];$('#sLon').value=c[2];$('#sZone').value=c[3];};
 $('#sLat').onchange=$('#sLon').onchange=()=>{$('#sCity').value=String(CITIES.length-1);autoZone();};
 $('#sFrom').onclick=()=>{$('#sName').value=$('#name')?.value||'命主';$('#sGender').value=$('#gender')?.value||'1';$('#sDate').value=$('#date')?.value||'';$('#sTime').value=$('#time')?.value||'12:00';$('#sStd').checked=true;gen();};
 const q=new URLSearchParams(location.search);if(location.hash==='#sheet'&&q.get('d')){for(const [id,k] of Object.entries(F)){const v=q.get(k);if(v!=null&&$('#'+id))$('#'+id).value=v;}
  if(q.get('std')==='0')$('#sStd').checked=false;if(q.get('lat')){const i=CITIES.findIndex(c=>c[1]==+q.get('lat')&&c[2]==+q.get('lon'));$('#sCity').value=String(i>=0?i:CITIES.length-1);}}
 $('#sGen').onclick=gen;$('#sPdf').onclick=()=>dl('pdf');$('#sDocx').onclick=()=>dl('docx');
 $('#sShare').onclick=async()=>{const url=shareUrl();try{if(navigator.share){await navigator.share({title:'八字論斷 '+$('#sName').value,url});return;}}catch(e){if(e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(url);$('#sMsg').textContent='已複製分享連結';}catch(e){prompt('分享連結（請複製）',url);}};
 gen();}
function input(){return {name:$('#sName').value.trim()||'命主',gender:+$('#sGender').value,date:$('#sDate').value,time:$('#sTime').value||'12:00',zone:$('#sZone').value.trim()||'Asia/Taipei',lon:+$('#sLon').value,useStd:$('#sStd').checked,dayRule:$('#sDayRule').value,listDate:$('#sList').value||todayStr()};}
function shareUrl(){const q=new URLSearchParams();for(const [id,k] of Object.entries(F))q.set(k,$('#'+id).value);if(!$('#sStd').checked)q.set('std','0');return location.origin+location.pathname+'?'+q+'#sheet';}
let cur=null;
export async function gen(){const msg=$('#sMsg'),note=$('#sNote');const inp=input();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(inp.date)){msg.textContent='請輸入出生日期';return;}
 const y=+inp.date.slice(0,4);if(y<1901||y>2050){msg.textContent='出生年份需在 1901–2050 之間（DE421 節氣表範圍）';return;}
 let r;try{r=sheetData(inp);}catch(e){msg.textContent='排盤失敗：'+e.message;return;}
 const glyphs=layoutSheet(r.W);cur={inp,W:r.W,info:r.info,glyphs};
 const i=r.info,notes=[];
 if(i.dst&&inp.useStd)notes.push(`出生時為夏令時間，已扣除 ${i.dst} 分鐘`);if(i.shift)notes.push('出生地在東經70°以西，依干支換日線日柱加一日');
 if(i.gap)notes.push('此時刻在夏令時間切換的跳空區間內，請確認');if(i.amb)notes.push('此時刻在夏令時間切換的重複區間內（採第一次）');
 note.textContent=`八字：${[...r.W.bazi].reverse().join(' ')}（年月日時）${notes.length?'｜'+notes.join('；'):''}`;
 msg.textContent='載入字型中…';
 try{await loadFonts(glyphs.map(g=>g[2]).join(''));}catch(e){}
 $('#sOut').innerHTML=sheetSvg(glyphs,r.W.gua,'class="sheetsvg" role="img" aria-label="八字論斷"');
 msg.textContent='';['#sPdf','#sDocx','#sShare'].forEach(s=>$(s).disabled=false);}
const fname=(ext)=>`八字論斷_${(cur.inp.name||'命主').replace(/[\\/:*?"<>|\s]/g,'')}.${ext}`;
async function dl(kind){if(!cur)return;const msg=$('#sMsg');const b=$(kind==='pdf'?'#sPdf':'#sDocx');b.disabled=true;
 try{msg.textContent=kind==='pdf'?'產生 PDF 中（首次需載入字型）…':'產生 Word 中（高解析圖）…';const title='八字論斷 '+cur.inp.name;
  let blob,extra='';if(kind==='pdf'){const r=await sheetPdf(cur.glyphs,cur.W.gua,title);blob=r.blob;if(r.missing.length)extra=`（缺字：${[...new Set(r.missing)].join('')}）`;}
  else{const r=await sheetDocx(cur.glyphs,cur.W.gua,title);blob=r.blob;extra=`（${r.dpi} dpi）`;}
  const name=fname(kind);const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},4000);
  msg.textContent='已下載 '+name+extra;}catch(e){msg.textContent='產生失敗：'+e.message;}finally{b.disabled=false;}}
