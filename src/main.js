import {buildReport,rateRow,dyEval} from './report.js';
import {dailyRows,lifeToCel,fmt,parseDate,MS_D} from './daily.js';
import {buildChart,yearPillar,liuYue,dayInfo,Solar,zhiRel,ganRel,sanHe,shiShen,ganWx,zhiWx,WX,WXCLS} from './bazi.js';
const $=s=>document.querySelector(s);
const CITIES=[['不校正',''],['台北',121.56],['新北',121.46],['桃園',121.30],['新竹',120.97],['台中',120.68],['台南',120.21],['高雄',120.31],['花蓮',121.60],['台東',121.15],['宜蘭',121.75],['香港',114.17],['澳門',113.54],['北京',116.40],['上海',121.47],['廣州',113.26],['成都',104.07],['新加坡',103.82],['吉隆坡',101.69],['東京',139.69],['紐約',-74.0,'tz'],['洛杉磯',-118.24,'tz']];
$('#city').innerHTML=CITIES.map(c=>`<option value="${c[1]}">${c[0]}</option>`).join('');
const c_=w=>`<span class="${WXCLS[w]}">`;const col=ch=>{const w='甲乙丙丁戊己庚辛壬癸'.includes(ch)?ganWx(ch):zhiWx(ch);return `${c_(w)}${ch}</span>`;};
const gzH=gz=>col(gz[0])+col(gz[1]);
let chart=null;
function readForm(){const lonIn=$('#lon').value||$('#city').value;
 return {name:$('#name').value||'命主',gender:$('#gender').value,date:$('#date').value,time:$('#time').value||'12:00',lon:lonIn===''?null:Number(lonIn)};}
// profiles
const PK='bazi_profiles';const getP=()=>JSON.parse(localStorage.getItem(PK)||'[]');
function refreshP(){$('#profiles').innerHTML='<option value="">— 已存檔案 —</option>'+getP().map((p,i)=>`<option value="${i}">${p.name}（${p.date}）</option>`).join('');
 document.querySelectorAll('.pselect').forEach(s=>s.innerHTML='<option value="">— 從存檔帶入 —</option>'+getP().map((p,i)=>`<option value="${i}">${p.name}</option>`).join(''));}
$('#save').onclick=()=>{const f=readForm();const ps=getP().filter(p=>p.name!==f.name);ps.push(f);localStorage.setItem(PK,JSON.stringify(ps));refreshP();alert('已儲存：'+f.name);};
$('#profiles').onchange=e=>{const p=getP()[e.target.value];if(!p)return;$('#name').value=p.name;$('#gender').value=p.gender;$('#date').value=p.date;$('#time').value=p.time;$('#lon').value=p.lon??'';$('#city').value='';run();};
$('#del').onclick=()=>{const i=$('#profiles').value;if(i==='')return;const ps=getP();ps.splice(i,1);localStorage.setItem(PK,JSON.stringify(ps));refreshP();};
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#tabs button,.pane').forEach(x=>x.classList.remove('on'));b.classList.add('on');$('#'+b.dataset.t).classList.add('on');location.hash=b.dataset.t;});
const SSD={比肩:'自主、同儕、競爭',劫財:'魄力、合夥、破耗',食神:'才華、口福、享受',傷官:'創意、表達、叛逆',偏財:'機遇財、人緣、投資',正財:'穩定收入、務實、家庭責任',七殺:'壓力、魄力、挑戰',正官:'名譽、規範、事業地位',偏印:'偏門學問、直覺、獨處',正印:'學業、貴人、長輩庇蔭'};
const WXD={木:'青色、綠色，東方，文教、出版、林業、設計',火:'紅色、紫色，南方，傳媒、餐飲、能源、演藝',土:'黃色、咖啡色，本地／中央，不動產、建築、農業、仲介',金:'白色、金色，西方，金融、機械、法律、科技硬體',水:'黑色、藍色，北方，貿易、物流、旅遊、資訊流通'};
const DMD={甲:'如參天大樹，正直向上、有擔當',乙:'如花草藤蔓，柔韌靈活、善於適應',丙:'如太陽，熱情開朗、慷慨外放',丁:'如燈燭，細膩溫暖、內斂有洞察力',戊:'如高山厚土，穩重可靠、包容',己:'如田園之土，務實細心、善於經營',庚:'如刀劍頑鐵，果斷剛毅、重義氣',辛:'如珠玉，精緻敏銳、重視品味',壬:'如江河大海，聰明奔放、志向遠大',癸:'如雨露，溫和聰慧、善於思考'};
function renderChart(c){
 const P=c.pillars;const zs=P.map(p=>p.zhi);
 const rels=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){zhiRel(P[i].zhi,P[j].zhi).forEach(r=>rels.push(`${P[i].label.slice(0,1)}${P[j].label.slice(0,1)}支 ${P[i].zhi}${P[j].zhi}${r}`));ganRel(P[i].gan,P[j].gan).forEach(r=>rels.push(`${P[i].label.slice(0,1)}${P[j].label.slice(0,1)}干 ${P[i].gan}${P[j].gan}${r}`));}
 rels.push(...sanHe(zs));
 const max=Math.max(...Object.values(c.score));const tot=Object.values(c.score).reduce((a,b)=>a+b);
 const ssCount={};P.forEach((p,i)=>{if(i!==2)ssCount[p.ss]=(ssCount[p.ss]||0)+1;p.hide.forEach((h,j)=>{if(j===0)ssCount[h.ss]=(ssCount[h.ss]||0)+.5});});
 const topSS=Object.entries(ssCount).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
 const now=new Date().getFullYear();
 $('#chart').innerHTML=`<h2>${c.name} 的八字命盤（${c.gender?'乾造':'坤造'}）</h2>
 <p class="muted">排盤時間：${c.solar.toYmdHms().slice(0,16)}${c.off?`（已依真太陽時校正 ${c.off.toFixed(1)} 分鐘）`:''}｜農曆 ${c.lunarText}｜生肖 ${c.shengXiao}</p>
 <div class="scroll"><table><tr><th></th>${P.map(p=>`<th>${p.label}</th>`).join('')}</tr>
 <tr><th>十神</th>${P.map(p=>`<td>${p.ss}</td>`).join('')}</tr>
 <tr><th>天干</th>${P.map(p=>`<td class="big">${col(p.gan)}</td>`).join('')}</tr>
 <tr><th>地支</th>${P.map(p=>`<td class="big">${col(p.zhi)}</td>`).join('')}</tr>
 <tr><th>藏干</th>${P.map(p=>`<td>${p.hide.map(h=>col(h.g)+'<small>'+h.ss+'</small>').join('<br>')}</td>`).join('')}</tr>
 <tr><th>納音</th>${P.map(p=>`<td>${p.nayin}</td>`).join('')}</tr></table></div>
 <h3>五行力量</h3>${WX.map(w=>`<div class="bar"><span class="${WXCLS[w]}">${w}</span><i style="width:${c.score[w]/max*70}%;background:currentColor" class="${WXCLS[w]}"></i><small>${(c.score[w]/tot*100).toFixed(0)}%</small></div>`).join('')}
 <p class="muted">計分：天干 1 分，地支藏干依本氣/中氣/餘氣 0.6/0.3/0.1，月令加倍。</p>
 <h3>日主強弱與喜用神</h3><p>日主 <b>${col(c.dm)}（${c.dw}）</b>，同黨（比劫＋印）佔 ${(c.self*100).toFixed(0)}% → <b>${c.lev}</b>。</p>
 <p>建議喜用：${c.xi.map(w=>`<span class="tag ${WXCLS[w]}">${w}</span>`).join('')}　宜少：${c.ji.map(w=>`<span class="tag">${w}</span>`).join('')}</p>
 <h3>合沖刑害</h3><p>${rels.length?rels.map(r=>`<span class="tag">${r}</span>`).join(''):'四柱間無明顯合沖刑害。'}</p>
 <h3>大運（起運：出生後 ${c.start}）</h3><div class="scroll"><table><tr>${c.dayun.map(d=>`<th>${d.age}歲<br><small>${d.year}</small></th>`).join('')}</tr>
 <tr>${c.dayun.map(d=>`<td class="big" style="${now>=d.year&&now<d.year+10?'background:#f8e0dc':''}">${gzH(d.gz)}</td>`).join('')}</tr><tr>${c.dayun.map(d=>`<td>${d.ss}</td>`).join('')}</tr></table></div>
 <h3>命盤解讀</h3><div class="text">
 <p>【日主性格】${c.dm}${c.dw}日生，${DMD[c.dm]}。</p>
 <p>【格局傾向】命局較顯著的十神為 ${topSS.join('、')}：${topSS.map(s=>s+'主'+SSD[s]).join('；')}。</p>
 <p>【強弱】${c.strong?'日主力量偏旺，宜透過「洩、耗、剋」來平衡，發揮才華、追求財富與事業規範，避免過度固執。':'日主力量偏弱，宜得「生、扶」，多借助學習、貴人與團隊合作，量力而為。'}</p>
 <p>【喜用參考】喜用 ${c.xi.join('、')}：${c.xi.map(w=>w+'——'+WXD[w]).join('；')}。</p>
 <p>【年月日時】年柱主祖上與早年，月柱主父母兄弟與青年，日支主配偶與自身，時柱主子女與晚年。日支 ${P[2].zhi} 藏 ${P[2].hide.map(h=>h.ss).join('、')}，可作為觀察感情模式的線索。</p></div>`;}
function renderYearPane(){$('#year').innerHTML=`<h2>流年運勢</h2><div class="row"><label>年份<input type="number" id="ly" value="${new Date().getFullYear()}" style="width:8em"></label><button class="pri" id="lyGo">查看</button></div><div id="lyOut"></div>`;$('#lyGo').onclick=renderYear;}
function relsWith(gz,c){const out=[];c.pillars.forEach(p=>{zhiRel(gz[1],p.zhi).forEach(r=>out.push({t:`${gz[1]}與${p.label}${p.zhi}${r}`,r,lab:p.label}));ganRel(gz[0],p.gan).forEach(r=>out.push({t:`${gz[0]}與${p.label}${p.gan}${r}`,r,lab:p.label}));});return out;}
const RELTXT={年柱:'祖輩、長輩、外部環境',月柱:'工作、父母、同事',日柱:'自身、配偶、健康',時柱:'子女、部屬、計畫'};
function renderYear(){if(!chart)return;const c=chart,Y=Number($('#ly').value);const gz=yearPillar(Y);const ss=shiShen(c.dm,gz[0]),ssz=shiShen(c.dm,(ZH=>ZH)(require_hide(gz[1])));
 const rs=relsWith(gz,c);const age=Y-c.solar.getYear();const dy=[...c.dayun].reverse().find(d=>Y>=d.year);
 const wg=ganWx(gz[0]),wz=zhiWx(gz[1]);const fav=[wg,wz].filter(w=>c.xi.includes(w)).length,bad=[wg,wz].filter(w=>c.ji.includes(w)).length;
 const lvl=fav-bad-(rs.some(r=>r.r==='沖'&&r.lab==='日柱')?1:0);
 const lines=rs.map(r=>`<p>・${r.t}：${r.r.startsWith('沖')?'動盪變化，留意':r.r.startsWith('六合')||r.r.startsWith('合')?'和合助力，有利':r.r.includes('刑')?'摩擦是非，謹慎':'暗中損耗，留心'}${RELTXT[r.lab]}方面。</p>`).join('');
 const lm=liuYue(Y);
 $('#lyOut').innerHTML=`<h3>${Y} ${gz}年（虛歲約 ${age+1}）</h3><p>流年天干 ${col(gz[0])} 為 <b>${ss}</b>，地支 ${col(gz[1])} 本氣為 <b>${ssz}</b>；${dy?`行 ${gzH(dy.gz)} 大運（${dy.ss}）`:'尚未起運'}。</p>
 <p>整體傾向：<span class="tag ${lvl>0?'good':lvl<0?'bad':''}">${lvl>0?'順勢較佳':lvl<0?'宜守穩健':'平穩中有起伏'}</span></p>
 <div class="text"><p>【年度主題】${ss}當令：${SSD[ss]}；地支${ssz}：${SSD[ssz]}。</p><p>【五行】流年五行 ${wg}／${wz}，${fav?'含喜用神 '+[wg,wz].filter(w=>c.xi.includes(w)).join('、')+'，助力較多':'未直接帶喜用神'}${bad?'；帶忌神 '+[wg,wz].filter(w=>c.ji.includes(w)).join('、')+'，宜保守':''}。</p>
 ${lines||'<p>・流年與原局無明顯合沖刑害，變動較少。</p>'}</div>
 <h3>流月</h3><div class="scroll"><table><tr><th>節氣起</th><th>月柱</th><th>十神</th><th>與日支</th><th>提示</th></tr>${lm.map(m=>{const r=zhiRel(m.gz[1],c.pillars[2].zhi);const w=ganWx(m.gz[0]);const g=c.xi.includes(w)||c.xi.includes(zhiWx(m.gz[1]));
 return `<tr><td>${m.jie}<br><small>${m.date}</small></td><td class="big">${gzH(m.gz)}</td><td>${shiShen(c.dm,m.gz[0])}</td><td>${r.join('、')||'—'}</td><td class="${r.includes('沖')?'bad':g?'good':''}">${r.includes('沖')?'變動，宜穩':g?'得喜用，可積極':'平'}</td></tr>`}).join('')}</table></div>`;}
function require_hide(z){return {子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'}[z];}
// match
function renderMatchPane(){$('#match').innerHTML=`<h2>合婚／合盤</h2><p class="muted">以上方命主為甲方，輸入乙方資料：</p><div class="grid">
 <label>存檔<select class="pselect" id="mP"></select></label><label>姓名<input id="mName" value="對方"></label><label>性別<select id="mG"><option value="0">女</option><option value="1">男</option></select></label>
 <label>出生日期<input type="date" id="mD" value="1992-06-15"></label><label>出生時間<input type="time" id="mT" value="08:00"></label></div><div class="row"><button class="pri" id="mGo">合盤</button></div><div id="mOut"></div>`;
 $('#mP').onchange=e=>{const p=getP()[e.target.value];if(!p)return;$('#mName').value=p.name;$('#mG').value=p.gender;$('#mD').value=p.date;$('#mT').value=p.time;};$('#mGo').onclick=renderMatch;refreshP();}
function renderMatch(){if(!chart)return;const a=chart,b=buildChart({name:$('#mName').value,gender:$('#mG').value,date:$('#mD').value,time:$('#mT').value||'12:00'});
 let s=60;const notes=[];const P=(c,i)=>c.pillars[i];
 const chk=(i,lab,wt)=>{const zr=zhiRel(P(a,i).zhi,P(b,i).zhi),gr=ganRel(P(a,i).gan,P(b,i).gan);
  zr.forEach(r=>{if(r.startsWith('六合')){s+=wt;notes.push(['good',`${lab}地支 ${P(a,i).zhi}${P(b,i).zhi}六合，彼此契合 +${wt}`]);}else if(r==='沖'){s-=wt;notes.push(['bad',`${lab}地支 ${P(a,i).zhi}${P(b,i).zhi}相沖，觀念易衝突 −${wt}`]);}else{s-=wt/2;notes.push(['bad',`${lab}地支${r}，需多包容 −${wt/2}`]);}});
  gr.forEach(r=>{if(r.startsWith('合')){s+=wt/2;notes.push(['good',`${lab}天干 ${P(a,i).gan}${P(b,i).gan}相合 +${wt/2}`]);}else{s-=wt/2;notes.push(['bad',`${lab}天干相沖 −${wt/2}`]);}});};
 chk(2,'日柱',12);chk(0,'年柱（生肖）',8);
 const sh=(x,y)=>[...'申子辰','亥卯未','寅午戌','巳酉丑'].length&&['申子辰','亥卯未','寅午戌','巳酉丑'].some(g=>g.includes(x)&&g.includes(y)&&x!==y);
 if(sh(P(a,0).zhi,P(b,0).zhi)){s+=6;notes.push(['good','生肖三合 +6']);}
 const comp=(x,y)=>x.xi.filter(w=>{const t=Object.values(y.score).reduce((m,n)=>m+n);return y.score[w]/t>=.22;});
 const ab=comp(a,b),ba=comp(b,a);s+=ab.length*5+ba.length*5;
 notes.push([ab.length?'good':'',`${b.name}五行中 ${ab.join('、')||'無'} 較旺，${ab.length?'可補':'未能明顯補'}${a.name}之喜用（${a.xi.join('、')}）${ab.length?' +'+ab.length*5:''}`]);
 notes.push([ba.length?'good':'',`${a.name}五行中 ${ba.join('、')||'無'} 較旺，${ba.length?'可補':'未能明顯補'}${b.name}之喜用（${b.xi.join('、')}）${ba.length?' +'+ba.length*5:''}`]);
 const dg=shiShen(a.dm,b.dm);notes.push(['',`對 ${a.name} 而言，${b.name} 日主 ${b.dm} 為「${dg}」：${SSD[dg]}。`]);
 s=Math.max(30,Math.min(98,Math.round(s)));
 $('#mOut').innerHTML=`<div class="grid"><div><h3>${a.name}</h3><p class="big">${a.pillars.map(p=>gzH(p.gan+p.zhi)).join(' ')}</p><p>${a.dm}${a.dw}・${a.lev}・喜 ${a.xi.join('')}</p></div>
 <div><h3>${b.name}</h3><p class="big">${b.pillars.map(p=>gzH(p.gan+p.zhi)).join(' ')}</p><p>${b.dm}${b.dw}・${b.lev}・喜 ${b.xi.join('')}</p></div></div>
 <div class="score">${s}<small style="font-size:1rem"> / 100</small></div><p style="text-align:center">${s>=80?'上佳之配':s>=65?'良好，可互相扶持':s>=50?'中平，需經營溝通':'挑戰較多，宜多體諒'}</p>
 <h3>評分說明（基準 60 分）</h3><div class="text">${notes.map(n=>`<p class="${n[0]}">・${n[1]}</p>`).join('')}</div>`;}
// pick days
const PURP=[['嫁娶',['嫁娶']],['搬家／入宅',['入宅','移徙']],['開業／開市',['開市']],['簽約／交易',['立券','交易']],['出行／旅遊',['出行']],['動土／裝修',['動土','修造']],['安床',['安床']],['祈福',['祈福']],['求醫／治病',['治病','求醫']]];
function renderPickPane(){const t=new Date(),iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 $('#pick').innerHTML=`<h2>擇日</h2><div class="grid"><label>事項<select id="pP">${PURP.map((p,i)=>`<option value="${i}">${p[0]}</option>`).join('')}</select></label>
 <label>起<input type="date" id="pS" value="${iso(t)}"></label><label>迄<input type="date" id="pE" value="${iso(new Date(t.getTime()+60*864e5))}"></label></div>
 <div class="row"><label style="flex-direction:row;gap:6px"><input type="checkbox" id="pHd" checked>只顯示黃道吉日</label><button class="pri" id="pGo">擇吉</button></div><div id="pOut"></div>`;$('#pGo').onclick=renderPick;}
function renderPick(){if(!chart)return;const c=chart,[lab,keys]=PURP[$('#pP').value];const pd=v=>{const[a,b,c]=v.split('-').map(Number);return new Date(a,b-1,c,12)};const s=pd($('#pS').value),e=pd($('#pE').value);const rows=[];
 if((e-s)/864e5>366)return alert('範圍請在一年內');
 for(let d=new Date(s);d<=e;d=new Date(d.getTime()+864e5)){const sol=Solar.fromYmd(d.getFullYear(),d.getMonth()+1,d.getDate());const i=dayInfo(sol);
  if(!keys.some(k=>i.yi.includes(k))||keys.some(k=>i.ji.includes(k)))continue;
  if($('#pHd').checked&&i.luck!=='吉')continue;
  const z=i.gz[1];const clash=['日支','年支'].filter((_,k)=>zhiRel(z,c.pillars[k?0:2].zhi).includes('沖'));if(clash.length)continue;
  const he=zhiRel(z,c.pillars[2].zhi).some(r=>r.startsWith('六合'))||c.xi.includes(ganWx(i.gz[0]));rows.push({sol,i,he});}
 $('#pOut').innerHTML=`<p>${lab}：共 ${rows.length} 個合適日子（已排除宜忌不符、${$('#pHd').checked?'黑道日、':''}沖命主日支 ${c.pillars[2].zhi} 或年支 ${c.pillars[0].zhi} 之日）。★ 為與命主相合或天干屬喜用。</p>
 <div class="scroll"><table><tr><th>日期</th><th>農曆</th><th>日柱</th><th>建除／值神</th><th>沖煞</th><th>宜</th><th>忌</th></tr>${rows.map(r=>`<tr class="${r.he?'good':''}"><td>${r.he?'★ ':''}${r.sol.toYmd()}<br><small>週${'日一二三四五六'[r.sol.getWeek()]}</small></td><td>${r.i.lunar}</td><td>${gzH(r.i.gz)}</td><td>${r.i.zhixing}／${r.i.tianshen}</td><td>沖${r.i.chong}<br>煞${r.i.sha}</td><td style="text-align:left"><small>${r.i.yi.join(' ')}</small></td><td style="text-align:left"><small>${r.i.ji.join(' ')}</small></td></tr>`).join('')}</table></div>`;}
function run(){try{chart=buildChart(readForm());}catch(e){alert('資料有誤：'+e.message);return;}
 $('#tstNote').textContent=chart.off?`真太陽時校正：${chart.off>0?'+':''}${chart.off.toFixed(1)} 分鐘`:'';renderChart(chart);renderYear();$('#rBody').innerHTML=buildReport(chart);renderDaily();if($('#mOut').innerHTML)renderMatch();if($('#pOut').innerHTML)renderPick();}
{const q=new URLSearchParams(location.search);if(q.get('d'))$('#date').value=q.get('d');if(q.get('t'))$('#time').value=q.get('t');if(q.get('g'))$('#gender').value=q.get('g');if(q.get('n'))$('#name').value=q.get('n');}
renderYearPane();renderMatchPane();renderPickPane();refreshP();$('#calc').onclick=run;run();
const h=location.hash.slice(1);if(h)document.querySelector(`#tabs [data-t=${h}]`)?.click();

const docCss='body{font-family:"PMingLiU","Noto Serif TC",serif;line-height:1.7}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:3px 5px;font-size:10.5pt}th{background:#f3e8cc}h1{color:#7a1f1f;text-align:center}h2{color:#7a1f1f;border-bottom:1px solid #b8893b}.muted{color:#777;font-size:9pt}';
function dl(name,type,data){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff',data],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
const docHtml=()=>`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${chart.name}論命報告</title><style>${docCss}</style></head><body>${$('#rBody').innerHTML}</body></html>`;
$('#rPrint').onclick=()=>{document.querySelector('#tabs [data-t=report]').click();window.print();};
$('#rDoc').onclick=()=>dl(`${chart.name}_八字論命報告.doc`,'application/msword',docHtml());
$('#rHtml').onclick=()=>dl(`${chart.name}_八字論命報告.html`,'text/html',docHtml());

var ROLE={用:'用神',喜:'喜神',輔:'輔助',忌:'忌神',閒:'閒神'};
var dRows=[];
function renderDaily(){const c=chart;dRows=dailyRows(c);const segs=c.yun.segs;const today=new Date();const nowMs=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate(),12);
 $('#daily').innerHTML=`<h2>大運逐日對照</h2><p class="muted">出生 ${c.solar.toYmdHms().slice(0,16)}，大運${c.forward?'順':'逆'}排。起運：${c.yun.trad.text}（口訣：三日一年、一日四月、一時辰十日）；精確以「交節時間差 × 120」折算，起運於 <b>${c.startSolar}</b>。</p>
 <h3>精確大運起迄</h3><div class="scroll"><table><tr><th>運次</th><th>大運</th><th>十神</th><th>天體區間（交節）</th><th>人生起點</th><th>人生迄點</th><th>底色</th></tr>${segs.map((s,i)=>{const now=nowMs>=s.from&&nowMs<s.to;const e=i?dyEval(c,c.dayun[i-1]):null;
  return `<tr class="${now?'cur':''}" data-seg="${i}" style="cursor:pointer"><td>${s.label}</td><td class="big">${gzH(s.gz)}</td><td>${s.ss||'月柱'}</td><td><small>${fmt(s.celFrom)} → ${fmt(s.celTo)}</small></td><td>${fmt(s.from)}</td><td>${fmt(s.to)}</td><td>${e?e.tone:'—'}</td></tr>`}).join('')}</table></div>
 <h3>逐日表</h3><div class="row"><label>大運<select id="dSeg"><option value="all">全部</option>${segs.map((s,i)=>`<option value="${i}">${s.label} ${s.gz}</option>`).join('')}</select></label>
 <label>人生日期→天體日<input type="date" id="dLife"></label><label>天體日→人生區間<input type="date" id="dCel"></label><button id="dCsv">下載 CSV</button></div><p id="dHit"></p>
 <div class="scroll dtable"><table><thead><tr><th>#</th><th>天體日</th><th>日干支</th><th>干／支喜忌</th><th>人生區間（約120日）</th><th>大運</th><th>流年</th><th>綜合</th></tr></thead><tbody id="dBody"></tbody></table></div>
 <p class="muted">每一列為出生後${c.forward?'順數':'逆數'}一個公曆日（00:00 換日；首尾日按交節時刻切分），對應人生約 120 天。綜合＝大運 45%＋流年 35%＋日干支 20%（依用喜忌計分），▲ 表示該日支沖命主日支或年支。僅供參考。</p>`;
 const seg=$('#dSeg');const draw=()=>{const v=seg.value;const rs=dRows.map((r,i)=>[r,i]).filter(([r])=>v==='all'||r.seg===segs[v]);
  $('#dBody').innerHTML=rs.map(([r,i])=>{const x=rateRow(c,r);const cur=nowMs>=r.from&&nowMs<r.to;return `<tr id="dr${i}" class="${cur?'cur':''}"><td>${i+1}</td><td>${fmt(r.cel,false)}</td><td class="big">${gzH(r.gz)}</td><td>${ROLE[c.A.role(ganWx(r.gz[0]))]}／${ROLE[c.A.role(zhiWx(r.gz[1]))]}</td><td>${fmt(r.from,false)} → ${fmt(r.to,false)}</td><td>${r.seg.gz}</td><td>${x.ly}</td><td><span class="lv-${x.lv}">${x.lv}${x.chong?'▲':''}</span></td></tr>`;}).join('');};
 seg.onchange=draw;const cs=segs.findIndex(s=>nowMs>=s.from&&nowMs<s.to);if(cs>=0)seg.value=cs;draw();
 document.querySelectorAll('#daily tr[data-seg]').forEach(tr=>tr.onclick=()=>{seg.value=tr.dataset.seg;draw();});
 const hit=i=>{if(i<0){$('#dHit').textContent='超出對照範圍';return;}const r=dRows[i];seg.value=segs.indexOf(r.seg);draw();const el=$('#dr'+i);el.classList.add('hit');el.scrollIntoView({block:'center'});const x=rateRow(c,r);$('#dHit').innerHTML=`天體日 <b>${fmt(r.cel,false)} ${r.gz}日</b>（${ROLE[c.A.role(ganWx(r.gz[0]))]}／${ROLE[c.A.role(zhiWx(r.gz[1]))]}）↔ 人生 <b>${fmt(r.from)} → ${fmt(r.to)}</b>，${r.seg.gz}運、${x.ly}年，綜合 ${x.lv}。`;};
 $('#dLife').onchange=e=>{const L=parseDate(e.target.value)+12*36e5;const cel=lifeToCel(c,L);hit(dRows.findIndex(r=>c.forward?cel>=r.celA&&cel<r.celB:cel<=r.celA&&cel>r.celB));};
 $('#dCel').onchange=e=>{const d=parseDate(e.target.value);hit(dRows.findIndex(r=>r.cel===d));};
 $('#dCsv').onclick=()=>dl(`${c.name}_逐日對照.csv`,'text/csv',['序,天體日,日干支,人生起,人生迄,大運,流年,綜合',...dRows.map((r,i)=>{const x=rateRow(c,r);return [i+1,fmt(r.cel,false),r.gz,fmt(r.from),fmt(r.to),r.seg.gz,x.ly,x.lv].join(',');})].join('\n'));}
