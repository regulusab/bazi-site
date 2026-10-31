import {dailyRows,lifeToCel,fmt,parseDate,MS_D,RATIO} from './daily.js';
import {rateRow,dyEval} from './report.js';
import {ganWx,zhiWx,shiShen} from './bazi.js';
import {termsBetween,yearMonthPillar,inRange,SOURCE} from './terms.js';
const ROLE={用:'用神',喜:'喜神',輔:'輔助',忌:'忌神',閒:'閒神'};
const p2=n=>String(n).padStart(2,'0');
export const fmtS=ms=>{const d=new Date(ms);return fmt(ms)+':'+p2(d.getUTCSeconds());};
export function dur(ms){ms=Math.abs(ms);const s=Math.round(ms/1000);const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),x=s%60;return `${d}日${h}時${m}分${x}秒`;}
export function lifeDur(ms){const days=ms/MS_D;const y=Math.floor(days/360),mo=Math.floor((days-y*360)/30),d=days-y*360-mo*30;return `${y}年${mo}月${d.toFixed(1)}日（360日制）／實際 ${(days/365.2425).toFixed(3)} 年`;}
export function overviewRows(c){return c.yun.segs.map((s,i)=>({i,s,label:i?`第${i}運`:'上運前',gz:s.gz,ss:i?shiShen(c.dm,s.gz[0]):'月柱',
 jie:`${i?s.jieName:'出生'} ${fmtS(s.celFrom)} → ${s.jieName2||c.yun.J[0].name} ${fmtS(s.celTo)}`,cel:dur(s.celTo-s.celFrom),life:lifeDur(s.to-s.from),from:fmt(s.from),to:fmt(s.to),tone:i?dyEval(c,c.dayun[i-1]).tone:'—'}));}
export function termTable(c){const segs=c.yun.segs;const a=Math.min(c.birthMs,segs[segs.length-1].celTo)-32*MS_D,b=Math.max(c.birthMs,segs[segs.length-1].celTo)+2*MS_D;return termsBetween(a,b);}
export function shareUrl(f){const q=new URLSearchParams({n:f.name,d:f.date,t:f.time,g:f.gender});if(f.lon!=null)q.set('lon',f.lon);if(f.dst)q.set('dst','1');return location.origin+location.pathname+'?'+q+'#daily';}
export function renderDaily(c,$,gzH,dl,form){
 const rows=dailyRows(c),segs=c.yun.segs,t=new Date(),nowMs=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate(),t.getHours(),t.getMinutes());
 const ov=overviewRows(c);const last=segs[segs.length-1];
 const leap=[];for(let y=new Date(c.birthMs).getUTCFullYear();y<=new Date(last.to).getUTCFullYear();y++)if((y%4===0&&y%100!==0)||y%400===0)leap.push(y);
 const stats=segs.map(s=>{const rs=rows.filter(r=>r.seg===s);const lv={高:0,平:0,低:0};rs.forEach(r=>lv[rateRow(c,r).lv]++);return {n:rs.length,part:rs.filter(r=>r.partial).length,lv};});
 const tot=stats.reduce((a,b)=>({n:a.n+b.n,part:a.part+b.part,高:a.高+b.lv.高,平:a.平+b.lv.平,低:a.低+b.lv.低}),{n:0,part:0,高:0,平:0,低:0});
 const rowHtml=(r,idx)=>{const x=rateRow(c,r);const s=r.seg;const prog=((Math.abs(r.celB-s.celFrom))/Math.abs(s.celTo-s.celFrom)*100).toFixed(1);const cur=nowMs>=r.from&&nowMs<r.to;
  const ml=inRange(r.celA)?yearMonthPillar(c.forward?r.celA:r.celB-1).month:s.gz;
  return `<tr id="dr${idx}" class="${cur?'cur':''}"><td>${r.no}${r.partial?' ⚠':''}</td><td>${fmt(r.cel,false)}<br><small>${fmt(r.celA).slice(11)}–${r.celB%MS_D===0?'24:00':fmt(r.celB).slice(11)}</small></td><td class="big">${gzH(r.gz)}</td><td>${ml}</td><td>${fmt(r.from)}</td><td>${fmt(r.to)}</td><td>${prog}%</td><td>${ROLE[c.A.role(ganWx(r.gz[0]))]}／${ROLE[c.A.role(zhiWx(r.gz[1]))]}</td><td>${x.ly}</td><td><span class="lv-${x.lv}">${x.lv}${x.chong?'▲':''}</span></td></tr>`;};
 const head='<tr><th>序號</th><th>天體日期</th><th>日干支</th><th>月令</th><th>大運對應起點</th><th>大運對應迄點</th><th>歷程推進</th><th>干／支喜忌</th><th>流年</th><th>綜合</th></tr>';
 $('#daily').innerHTML=`<h2>大運逐日對照</h2>
 <p>節氣：${c.useDE?SOURCE+'，太陽地心視黃經每 15° 交節，精確至秒（±1 秒）':'超出 DE421 表範圍，改用 lunar-javascript 演算法'}。出生 ${fmt(c.birthMs)}${c.dst?'（已扣夏令時 1 小時）':''}，${c.gender?'男':'女'}命，年干${'陽陰'[('甲乙丙丁戊己庚辛壬癸'.indexOf(c.pillars[0].gan))%2]}，大運<b>${c.forward?'順':'逆'}排</b>。起運 <b>${c.startSolar}</b>（${c.yun.trad.text}）。</p>
 <div class="row noprint"><button id="dShare">複製分享連結</button><button id="dCsv">下載 CSV</button><label>人生日期→天體日<input type="date" id="dLife"></label><label>天體日→人生區間<input type="date" id="dCel"></label></div><p id="dHit"></p>
 <h3>折算口訣</h3><p>天體 3 日 = 人生 1 年；1 日 = 4 個月；1 時辰 = 10 日；1 小時 = 5 日；1 分 = 2 小時；1 秒 = 2 分（即天體時間 × ${RATIO}）。</p>
 <h3>大運總覽（上運前＋十運）</h3><div class="scroll"><table><tr><th>序號</th><th>大運干支</th><th>十神</th><th>對應節氣區間</th><th>天體時長</th><th>折算人生時長</th><th>人生起點</th><th>人生終點</th><th>底色</th></tr>${ov.map(o=>`<tr class="${nowMs>=o.s.from&&nowMs<o.s.to?'cur':''}"><td>${o.label}</td><td class="big">${gzH(o.gz)}</td><td>${o.ss}</td><td><small>${o.jie}</small></td><td><small>${o.cel}</small></td><td><small>${o.life}</small></td><td>${o.from}</td><td>${o.to}</td><td>${o.tone}</td></tr>`).join('')}</table></div>
 <h3>銜接驗證</h3><div class="scroll"><table><tr><th>前段</th><th>前段終點</th><th>後段起點</th><th>結果</th></tr>${ov.slice(0,-1).map((o,i)=>{const ok=o.s.to===ov[i+1].s.from;return `<tr><td>${o.label} ${o.gz} → ${ov[i+1].label} ${ov[i+1].gz}</td><td>${o.to}</td><td>${ov[i+1].from}</td><td>${ok?'✓ 無縫銜接':'✗ 有落差'}</td></tr>`;}).join('')}</table></div>
 <p><b>人生時間跨度：</b>${fmt(c.birthMs)} → ${fmt(last.to)}，共 ${((last.to-c.birthMs)/MS_D/365.2425).toFixed(2)} 年（天體 ${dur(last.celTo-c.birthMs)}）。期間閏年：${leap.join('、')}。</p>
 <h3>節氣精確時間</h3><details><summary>展開（${termTable(c).length} 筆）</summary><div class="scroll"><table><tr><th>節氣</th><th>太陽黃經</th><th>台北時間（UTC+8）</th><th>類別</th></tr>${termTable(c).map(x=>`<tr${x.jie?' class="good"':''}><td>${x.name}</td><td>${x.lon}°</td><td>${fmtS(x.ms)}</td><td>${x.jie?'節（換月）':'中氣'}</td></tr>`).join('')}</table></div></details>
 <h3>摘要統計</h3><p>逐日共 ${tot.n} 列（⚠ 不足 24 小時之首尾日 ${tot.part} 列）；綜合評等 高 ${tot.高}、平 ${tot.平}、低 ${tot.低}。</p>
 <h3>逐日表（依大運展開）</h3>${segs.map((s,i)=>{const rs=rows.map((r,k)=>[r,k]).filter(([r])=>r.seg===s);const st=stats[i];const open=nowMs>=s.from&&nowMs<s.to;
  return `<details ${open?'open':''} class="dseg"><summary><b>${i?`第${i}運`:'上運前'} ${s.gz}</b>　${fmt(s.from,false)} → ${fmt(s.to,false)}　${st.n} 日　高${st.lv.高}／平${st.lv.平}／低${st.lv.低}</summary><div class="scroll dtable"><table><thead>${head}</thead><tbody>${rs.map(([r,k])=>rowHtml(r,k)).join('')}</tbody></table></div></details>`;}).join('')}
 <p class="muted">每列為一個天體日（台北時間 00:00–24:00；⚠ 為出生日或交節日不足 24 小時之部分日），人生時間 = 出生時刻 + |天體時刻 − 出生時刻| × 120。月令依 DE421 節氣判定。綜合＝大運 45%＋流年 35%＋日干支 20%（依用喜忌）；▲ 為日支沖命主日支或年支。僅供參考。</p>`;
 const hit=i=>{if(i<0){$('#dHit').textContent='超出對照範圍';return;}const r=rows[i];const el=$('#dr'+i);el.closest('details').open=true;document.querySelectorAll('tr.hit').forEach(x=>x.classList.remove('hit'));el.classList.add('hit');el.scrollIntoView({block:'center'});const x=rateRow(c,r);
  $('#dHit').innerHTML=`天體日 <b>${fmt(r.cel,false)} ${r.gz}日</b>（${ROLE[c.A.role(ganWx(r.gz[0]))]}／${ROLE[c.A.role(zhiWx(r.gz[1]))]}）↔ 人生 <b>${fmt(r.from)} → ${fmt(r.to)}</b>，${r.seg.gz}運、${x.ly}年，綜合 ${x.lv}。`;};
 $('#dLife').onchange=e=>{const cel=lifeToCel(c,parseDate(e.target.value)+12*36e5);hit(rows.findIndex(r=>c.forward?cel>=r.celA&&cel<r.celB:cel<=r.celB&&cel>r.celA));};
 $('#dCel').onchange=e=>{const d=parseDate(e.target.value);hit(rows.findIndex(r=>r.cel===d));};
 $('#dShare').onclick=()=>{const u=shareUrl(form());(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>alert('已複製：'+u),()=>prompt('分享連結',u));};
 $('#dCsv').onclick=()=>dl(`${c.name}_逐日對照.csv`,'text/csv',['序,天體日,天體起,天體迄,日干支,人生起,人生迄,大運,流年,綜合,部分日',...rows.map(r=>{const x=rateRow(c,r);return [r.no,fmt(r.cel,false),fmtS(r.celA),fmtS(r.celB),r.gz,fmt(r.from),fmt(r.to),r.seg.gz,x.ly,x.lv,r.partial?'⚠':''].join(',');})].join('\n'));
}
