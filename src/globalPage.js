import tzlookup from 'tz-lookup';
import {globalChart,fmtW,offTxt,LINE} from './global.js';
const $=s=>document.querySelector(s);
const CITIES=[['— 自訂 —'],['台北',25.0330,121.5654],['東京',35.6812,139.7671],['洛杉磯',34.0522,-118.2437],['波特蘭（奧勒岡）',45.52,-122.68],['紐約',40.7128,-74.0060],['倫敦',51.5074,-0.1278],['新德里',28.6139,77.2090],['喀什',39.4704,75.9898]];
$('#gCity').innerHTML=CITIES.map((c,i)=>`<option value="${i}">${c[0]}</option>`).join('');$('#gCity').value='4';
const autoZone=()=>{try{$('#gZone').value=tzlookup(+$('#gLat').value,+$('#gLon').value);}catch(e){}};
$('#gCity').onchange=()=>{const c=CITIES[$('#gCity').value];if(c[1]==null)return;$('#gLat').value=c[1];$('#gLon').value=c[2];autoZone();};
$('#gLat').onchange=$('#gLon').onchange=()=>{$('#gCity').value='0';autoZone();};
const F=['gName','gGender','gDate','gTime','gLat','gLon','gZone','gOff','gSecond','gRule'],KEY={gName:'n',gGender:'g',gDate:'d',gTime:'t',gLat:'lat',gLon:'lon',gZone:'tz',gOff:'off',gSecond:'sec',gRule:'rule'};
{const q=new URLSearchParams(location.search);for(const id of F){const v=q.get(KEY[id]);if(v!=null)$('#'+id).value=v;}if(q.get('r')==='1')$('#gRound').checked=true;if(q.get('lat')&&!q.get('tz'))autoZone();if(q.get('lat'))$('#gCity').value='0';}
const GAN='甲乙丙丁戊己庚辛壬癸',WXC={甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water',寅:'wood',卯:'wood',巳:'fire',午:'fire',辰:'earth',戌:'earth',丑:'earth',未:'earth',申:'metal',酉:'metal',子:'water',亥:'water'};
const col=s=>[...s].map(ch=>`<span class="${WXC[ch]||''}">${ch}</span>`).join('');
let last=null;
function stateUrl(){const q=new URLSearchParams();for(const id of F){const v=$('#'+id).value;if(v!=='')q.set(KEY[id],v);}if($('#gRound').checked)q.set('r','1');return location.origin+location.pathname+'?'+q;}
window.__gState=stateUrl;
const tbl=(t,p)=>`<div><h3>${t}</h3><div class="scroll"><table><tr><th>年柱</th><th>月柱</th><th>日柱</th><th>時柱</th></tr><tr>${['year','month','day','hour'].map(k=>`<td class="big">${col(p[k])}</td>`).join('')}</tr></table></div></div>`;
function run(){const [y,m,d]=$('#gDate').value.split('-').map(Number);const [hh,mi]=($('#gTime').value||'12:00').split(':').map(Number);
 const off=$('#gOff').value===''?null:Math.round(+$('#gOff').value*60);let c;
 try{if(!$('#gZone').value)autoZone();c=globalChart({y,m,d,hh,mi,lat:+$('#gLat').value,lon:+$('#gLon').value,gender:+$('#gGender').value,zone:$('#gZone').value,fixedOffMin:off,second:$('#gSecond').value==='1',rule:$('#gRule').value,roundJie:$('#gRound').checked});}
 catch(e){$('#gMsg').textContent='資料有誤：'+e.message;$('#gOut').innerHTML='';return;}
 $('#gMsg').textContent='';last=c;const name=$('#gName').value||'命主',sx=c.lon>=0?'東經':'西經',sy=c.lat>=0?'北緯':'南緯';
 const ruleTxt=c.rule==='23'?'23:00 換日（子初換日）':'真太陽時午夜換日（23–24 時為晚子時，日柱不換、時干依次日）';
 $('#gOut').innerHTML=`<div class="row xbar noprint"><button data-k="docx">下載 Word</button><button data-k="pdf">下載 PDF</button><button data-k="share">分享</button><small class="muted xmsg"></small></div>
 <h2>${name} 全球八字（${+$('#gGender').value?'乾造':'坤造'}）</h2>
 <p class="muted">出生：${fmtW(c.wall)}（當地鐘錶時間，${c.zone}${$('#gOff').value!==''?'，手動偏移':''} ${offTxt(c.off)}）｜${sy} ${Math.abs(c.lat)}°、${sx} ${Math.abs(c.lon)}°</p>
 ${c.warn.map(w=>`<p class="warn">⚠ ${w}</p>`).join('')}
 <div class="gcols">${tbl('干支換日線法（主盤，東經 70°）',c.main)}${tbl('一般民用日期（對照）',c.civil)}</div>
 <p>主盤日柱 <b>${col(c.main.day)}</b>${c.main.day!==c.civil.day?`，較一般民用日期之 ${col(c.civil.day)} 日前進一日（出生地位於東經 70° 以西／西半球，有效經度 L = ${c.L.toFixed(2)}°）`:'，與一般民用日期相同'}。若以出生證明鐘錶時間定時辰，時柱為 <b>${col(c.clockHour)}</b>（真太陽時版本為 ${col(c.main.hour)}）。</p>
 <h3>計算過程</h3><div class="scroll"><table class="calc">
 <tr><td>當地鐘錶時間</td><td>${fmtW(c.wall)}　${c.zone}　${offTxt(c.off)}${c.amb?'（時鐘回撥重複時段）':''}${c.gap?'（不存在之鐘點）':''}</td></tr>
 <tr><td>世界時 UT</td><td>${fmtW(c.ut,true)} UTC</td></tr>
 <tr><td>干支換日線</td><td>東經 ${LINE}°；出生地${c.east?'位於線之東（東經 70°–180°），日序同一般萬年曆':'位於線之西（含西半球），有效經度 L = 經度 + 360°'}</td></tr>
 <tr><td>有效經度 L</td><td>${c.L.toFixed(4)}°（實際經度 ${c.lon}°）</td></tr>
 <tr><td>干支地方平太陽時</td><td>${fmtW(c.meanG,true)}（UT + L÷15 = ${(c.L/15).toFixed(4)} 小時）</td></tr>
 <tr><td>均時差 EoT</td><td>${c.eot>=0?'+':''}${c.eot.toFixed(2)} 分鐘</td></tr>
 <tr><td>干支地方真太陽時</td><td><b>${fmtW(c.trueG,true)}</b>（日柱、時柱依此）</td></tr>
 <tr><td>一般地方真太陽時</td><td>${fmtW(c.trueC,true)}（實際經度，對照盤）</td></tr>
 <tr><td>換日規則</td><td>${ruleTxt}</td></tr>
 <tr><td>年柱／月柱</td><td>以 UT 瞬間比對節氣；目前節：${c.jieNow.name} ${c.jieNow.local}（出生地時間）</td></tr>
 <tr><td>民用日期之日柱</td><td>鐘錶日期 ${fmtW(c.wall).slice(0,10)} → ${col(c.civilClockDay)}</td></tr></table></div>
 <h3>大運（${c.forward?'順排':'逆排'}：年干${'陽陰'[GAN.indexOf(c.main.year[0])%2]}・${+$('#gGender').value?'男':'女'}命）</h3>
 <p>${c.forward?'下一':'上一'}個節：<b>${c.nextJie.name} ${c.nextJie.local}</b>（出生地時間 ${c.nextJie.off}；UT ${c.nextJie.utc}${$('#gRound').checked?'，已取整分':''}）。出生至交節實際時間差 <b>${c.trad.diffText}</b>。</p>
 <p>（a）三日折一年（1 日＝4 個月、1 時＝5 日、1 分＝2 時）：起運 <b>${c.trad.text}</b>，以曆法年月日時加到出生鐘錶時間 → 交運約 <b>${c.startA}</b>。<br>（b）時間差 × 120 加回出生瞬間（本站逐日對照口徑）→ 交運約 <b>${c.startB}</b>（出生地時間）。</p>
 <div class="scroll"><table><tr><th>步</th><th>大運</th><th>(a) 三日折一年 交運</th><th>虛齡起</th><th>(b) ×120 交運（出生地時間）</th><th>對應節氣</th></tr>
 ${c.dayun.map((d,i)=>`<tr><td>${i+1}</td><td class="big">${col(d.gz)}</td><td>${d.tradStart}</td><td>${d.tradAge} 歲</td><td>${d.x120Start} <small>${d.x120Off}</small></td><td><small>${d.jie}</small></td></tr>`).join('')}</table></div>
 <p class="muted">交運日期以出生地時區規則（含未來夏令時間現行規則）換算；(a)(b) 兩種換算方法原理不同，日期不同屬正常。×120 法中交節時刻差 1 分鐘，交運即差 2 小時。</p>`;
 bindBar();}
async function doExport(kind){const {toBlocks,makeDocx,makePdf}=await import('./export.js');const name=$('#gName').value||'命主';const d=new Date(),ds=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
 const blocks=[...toBlocks($('#gOut')),...toBlocks($('#gAbout'))];const title=`${name} 全球八字`,sub=`干支換日線（東經 70°）試算｜${fmtW(last.wall)} ${last.zone}`;
 const blob=kind==='pdf'?await makePdf(blocks,title,sub):await makeDocx(blocks,title,sub);return {blob,name:`${name.replace(/[\\/:*?"<>|\s]/g,'')}_全球八字_${ds}.${kind}`};}
window.__gExport=doExport;
let ready=null;
function bindBar(){const bar=$('#gOut .xbar');bar.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k,msg=bar.querySelector('.xmsg');
 try{if(k==='share'){const url=stateUrl();
   if(ready){const f=ready;ready=null;b.textContent='分享';try{await navigator.share({files:[f],title:'全球八字',text:url});}catch(err){if(err.name!=='AbortError')await copy(url);}return;}
   const canFiles=navigator.share&&navigator.canShare&&navigator.canShare({files:[new File(['x'],'t.pdf',{type:'application/pdf'})]});
   if(canFiles){msg.textContent='產生 PDF 中…';const r=await doExport('pdf');msg.textContent='';const f=new File([r.blob],r.name,{type:'application/pdf'});
    try{await navigator.share({files:[f],title:'全球八字',text:url});}catch(err){if(err.name==='NotAllowedError'){ready=f;b.textContent='PDF 已備妥，點此分享';}else if(err.name!=='AbortError')await copy(url);}}
   else if(navigator.share){try{await navigator.share({title:'全球八字',url});}catch(err){if(err.name!=='AbortError')await copy(url);}}else await copy(url);return;}
  msg.textContent=k==='pdf'?'產生 PDF 中（首次需載入字型）…':'產生 Word 中…';const r=await doExport(k);const u=URL.createObjectURL(r.blob);const a=document.createElement('a');a.href=u;a.download=r.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},4000);msg.textContent='已下載 '+r.name;}
 catch(err){console.error(err);msg.textContent='匯出失敗：'+err.message;}};}
async function copy(url){try{await navigator.clipboard.writeText(url);alert('已複製分享連結：\n'+url);}catch(e){prompt('分享連結（請複製）',url);}}
$('#gCalc').onclick=run;run();
