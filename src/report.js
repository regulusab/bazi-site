import {dailyRows,lifeToCel,fmt,spanText} from './daily.js';
import {GAN,WX,ganWx,zhiWx,hide,shiShen,zhiRel,ganRel,sanHe,yearPillar} from './bazi.js';
import {rel,ssNature,SEASON} from './analysis.js';
const ROLE_T={用:'用神',喜:'喜神',輔:'輔助',忌:'忌神',閒:'閒神'};
const PALACE=['幼年・祖蔭・父母家世','青年・父母兄弟・事業環境','中年・自身・配偶宮','晚運・子女・部屬'];
const ORG={木:'肝膽、筋骨、眼目',火:'心臟、小腸、血液循環',土:'脾胃、消化代謝、肌肉',金:'肺、大腸、呼吸道、皮膚',水:'腎、膀胱、泌尿生殖、耳'};
const EMO={木:'怒（怒傷肝）',火:'喜與驚（過則心神不寧）',土:'思（思慮過度傷脾）',金:'憂悲（憂傷肺）',水:'恐（恐傷腎）'};
const CARE={木:'綠色蔬菜、伸展筋骨、23 點前入睡、少動怒',火:'規律作息、適度有氧運動、保持愉悅、留意血壓',土:'定時定量、少甜膩與久坐、適度勞動、少鑽牛角尖',金:'深呼吸、晨間散步、白色食物、保持室內空氣品質',水:'充足飲水、保暖腰腹、不憋尿、早睡養腎'};
const GBODY={甲:'頭',乙:'頸肩',丙:'額、肩',丁:'心',戊:'脅、胃',己:'腹、脾',庚:'臍、大腸',辛:'股、肺',壬:'脛、膀胱',癸:'足、腎'};
const ZBODY={子:'耳、泌尿生殖',丑:'腹、脾',寅:'膽、腿',卯:'肝、手指',辰:'背、胸',巳:'面、齒、咽',午:'心、眼目',未:'胃、脊樑',申:'肺、大腸、經絡',酉:'肺、精血',戌:'命門、腿足',亥:'頭、腎'};
const SSP={比肩:'自立、同輩、競爭',劫財:'魄力、合夥、分財耗財',食神:'才藝、口福、溫和表達',傷官:'創意、口才、叛逆不羈',偏財:'機遇之財、交際、父緣',正財:'正職收入、務實、妻緣（男命）',七殺:'壓力、權威、魄力、挑戰',正官:'名位、規範、責任、夫緣（女命）',偏印:'偏門學問、直覺、孤獨',正印:'學識、貴人、母緣、庇蔭'};
const KIN_M={正印:'母親',偏印:'繼母／長輩',比肩:'兄弟',劫財:'姊妹／同輩',食神:'晚輩',傷官:'祖母／晚輩',正財:'妻子',偏財:'父親',正官:'女兒',七殺:'兒子'};
const KIN_F={正印:'母親',偏印:'繼母／長輩',比肩:'姊妹',劫財:'兄弟',食神:'女兒',傷官:'兒子',正財:'父親之財／婆家',偏財:'父親',正官:'丈夫',七殺:'情人／夫星'};
const GROUPOF=s=>({比肩:0,劫財:0,食神:1,傷官:1,偏財:2,正財:2,七殺:3,正官:3,偏印:4,正印:4})[s];
const isClashGan=(a,b)=>{const x=ganWx(a),y=ganWx(b),same=GAN.indexOf(a)%2===GAN.indexOf(b)%2;return same&&((WX.indexOf(x)+2)%5===WX.indexOf(y)||(WX.indexOf(y)+2)%5===WX.indexOf(x));};
const mainHide=z=>hide(z)[0];
export function dyFor(c,Y){return [...c.dayun].reverse().find(d=>Y>=d.year);}
export function wScore(c,w,k){const r=c.A.role(w);return ({用:2,喜:1.2,輔:.5,忌:-1.5,閒:0})[r]*k;}
export function yearEval(c,Y){
 const gz=yearPillar(Y),g=gz[0],z=gz[1],P=c.pillars,dy=dyFor(c,Y);let s=wScore(c,ganWx(g),1)+wScore(c,zhiWx(z),1.2);const sp=[],notes=[];
 P.forEach((p,i)=>{zhiRel(z,p.zhi).forEach(r=>{notes.push(`${r==='沖'?'沖':r.startsWith('六合')?'合':r}${p.label.slice(0,1)}支${p.zhi}`);if(r==='沖'&&(i===1||i===2))s-=0.8;});
  if(p.gan+p.zhi===gz)sp.push('伏吟'+p.label);if(isClashGan(g,p.gan)&&zhiRel(z,p.zhi).includes('沖'))sp.push('天剋地沖'+p.label);
  ganRel(g,p.gan).filter(r=>r.startsWith('合')).forEach(()=>notes.push(`${g}合${p.label.slice(0,1)}干${p.gan}`));});
 if(zhiRel(z,P[1].zhi).includes('沖'))sp.push('沖提綱');
 if(dy){if(dy.gz===gz)sp.push('歲運併臨');if(zhiRel(z,dy.gz[1]).includes('沖'))sp.push('沖運支');}
 const yg=ganWx(g),dg=c.dw;if((WX.indexOf(yg)+2)%5===WX.indexOf(dg))sp.push('日犯歲君');if((WX.indexOf(dg)+2)%5===WX.indexOf(yg))sp.push('歲傷日干');
 const tri=sanHe([...P.map(p=>p.zhi),z]).filter(x=>!sanHe(P.map(p=>p.zhi)).includes(x));notes.push(...tri);
 const lv=s>=1.5?'高':s<=-0.8?'低':'平';const warn=sp.some(x=>/伏吟|天剋地沖|沖提綱|併臨/.test(x));
 return {Y,gz,dy,s,lv,mark:lv+(warn?'▲':''),sp,notes,ssG:shiShen(c.dm,g),ssZ:shiShen(c.dm,mainHide(z))};}
export function dyEval(c,d){const s=wScore(c,ganWx(d.gz[0]),1)+wScore(c,zhiWx(d.gz[1]),1.2);const first=wScore(c,ganWx(d.gz[0]),1),second=wScore(c,zhiWx(d.gz[1]),1);
 let tone=s>=1.5?'順線':s<=-0.8?'滯線':'平線';if(first>0&&second<0&&s>-0.8)tone='前順後滯';if(first<0&&second>0&&s<1.5)tone='前滯後順';
 const notes=[];c.pillars.forEach(p=>{zhiRel(d.gz[1],p.zhi).forEach(r=>notes.push(`${r.startsWith('六合')?'合':r}${p.label.slice(0,1)}支${p.zhi}`));if(p.gan+p.zhi===d.gz)notes.push('伏吟'+p.label);});
 notes.push(...sanHe([...c.pillars.map(p=>p.zhi),d.gz[1]]).filter(x=>!sanHe(c.pillars.map(p=>p.zhi)).includes(x)));
 return {tone,notes,s};}
function pillarNat(c,i){const p=c.pillars[i];const a=i===2?null:p.ss,b=p.hide[0].ss;const ns=[a,b].filter(Boolean).map(ssNature);
 const base=ns.every(n=>n==='吉')?'吉':ns.every(n=>n==='凶')?'凶':ns.includes('凶')&&!ns.includes('吉')?'凶中有平':ns.includes('吉')&&!ns.includes('凶')?'吉':'吉凶參半';
 const roles=[i===2?null:ganWx(p.gan),zhiWx(p.zhi)].filter(Boolean).map(w=>c.A.role(w));const adj=roles.filter(r=>r==='用'||r==='喜').length-roles.filter(r=>r==='忌').length;
 return {conf:i===2?`${p.gan}${p.zhi}：日主坐${b}`:`${a}坐${b}`,base,adj:adj>0?'逢喜用，吉象增強、凶象可轉化':adj<0?'屬忌神，吉象打折、凶象須防':'喜忌參半，以運勢引動為斷'};}
const t=(tag,inner,attr='')=>`<${tag}${attr}>${inner}</${tag}>`;
const tbl=(head,rows)=>`<div class="scroll"><table><tr>${head.map(h=>t('th',h)).join('')}</tr>${rows.map(r=>'<tr>'+r.map(x=>t('td',x)).join('')+'</tr>').join('')}</table></div>`;
export function buildReport(c,now=new Date()){
 const A=c.A,P=c.pillars,Yn=now.getFullYear(),age=y=>y-c.solar.getYear()+1,KIN=c.gender?KIN_M:KIN_F;
 const pctS=WX.map(w=>[w,A.pct[w]]).sort((a,b)=>b[1]-a[1]);const cur=dyFor(c,Yn);const ss=s=>s;
 const H=[];
 H.push(`<h1 class="rt">${c.name}　${P[0].gan}${P[0].zhi}${c.gender?'乾造':'坤造'}綜合論命報告</h1><p class="rc">國曆 ${c.solar.toYmdHms().slice(0,16)}・${c.lunarText}・生成日期 ${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}</p>`);
 // 一
 const ints=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){ganRel(P[i].gan,P[j].gan).forEach(r=>ints.push(`${P[i].label}干${P[i].gan}與${P[j].label}干${P[j].gan}${r}`));zhiRel(P[i].zhi,P[j].zhi).forEach(r=>ints.push(`${P[i].label}支${P[i].zhi}與${P[j].label}支${P[j].zhi}${r}`));if(P[i].zhi===P[j].zhi)ints.push(`${P[i].label}、${P[j].label}${P[i].zhi}${P[j].zhi}同支`);}
 for(let i=0;i<3;i++){const a=P[i].gan,b=P[i+1].gan,x=ganWx(a),y=ganWx(b);if((WX.indexOf(x)+2)%5===WX.indexOf(y))ints.push(`${P[i].label}干${a}剋${P[i+1].label}干${b}`);if((WX.indexOf(y)+2)%5===WX.indexOf(x))ints.push(`${P[i+1].label}干${b}剋${P[i].label}干${a}`);}
 ints.push(...A.zh,...sanHe(P.map(p=>p.zhi)));
 H.push(`<h2>一、命盤總覽</h2><p>${c.gender?'乾造':'坤造'} ${c.solar.toYmdHms().slice(0,16)}，八字 <b>${P.map(p=>p.gan+p.zhi).join('　')}</b>，${c.dm}${c.dw}日主生於${P[1].zhi}月（${c.prevJie[0]} ${c.prevJie[1]} 後、${c.nextJie[0]} ${c.nextJie[1]} 前），${['陽','陰'][GAN.indexOf(P[0].gan)%2]}年生${c.gender?'男':'女'}・大運${c.forward?'順':'逆'}行，起運 ${c.startSolar}（${c.yun.trad.text}；距${c.yun.J[0].name} ${new Date(c.yun.J[0].ms).toISOString().slice(0,16).replace('T',' ')}）。${c.off?`已作真太陽時校正 ${c.off.toFixed(1)} 分鐘。`:''}</p>`);
 H.push(tbl(['柱','年柱','月柱','日柱','時柱'],[['天干',...P.map(p=>`${p.gan}（${ganWx(p.gan)}）${p.ss}`)],['地支',...P.map(p=>`${p.zhi}（${zhiWx(p.zhi)}）`)],['藏干・十神',...P.map(p=>p.hide.map(h=>h.g+h.ss).join('・'))],['納音',...P.map(p=>p.nayin)],['宮位',...PALACE]]));
 H.push(`<p>五行氣數（天干 1、藏干依本中餘氣 0.6/0.3/0.1 加權、月令加倍）：${pctS.map(([w,v])=>`${w} ${(v*100).toFixed(1)}%${v<0.03?'（缺）':''}`).join('、')}。以${P[1].zhi}月令論旺衰：${WX.map(w=>w+A.wx[w]).join('、')}。</p><p>干支作用：${ints.length?ints.join('；'):'四柱間無明顯合沖刑害'}。</p>`);
 H.push(tbl(['序','大運','十神（干／支）','虛歲','起迄（精確，×120 折算）'],c.dayun.map((d,i)=>[i+1,d.gz,`${d.ss}／${shiShen(c.dm,mainHide(d.gz[1]))}`,`${d.age}–${d.end}`,`${d.start} → ${d.end_}`])));
 if(cur)H.push(`<p>現行 <b>${cur.gz}運</b>（${cur.start} 起），${Yn} 年${yearPillar(Yn)}流年，虛歲 ${age(Yn)}。</p>`);
 // 二
 H.push(`<h2>二、用神喜忌判定</h2><p>日主${A.delin?'得令':'失令'}（月令${P[1].zhi}屬${SEASON[P[1].zhi]}，${c.dw}${A.wx[c.dw]}）；通根於${A.roots.length?A.roots.join('、'):'無'}；天干${A.help.length?A.help.join('、')+'透比印相助':'無比印相助'}。同黨（比劫＋印）佔 ${(c.self*100).toFixed(0)}%，綜合計分 ${A.pts} 分 → 判 <b>${A.lev}</b>。</p>
 <p>取法為${A.method}：<b>${A.yong}</b>（${GROUPOF(shiShen(c.dm,GAN[WX.indexOf(A.yong)*2]))!=null?['比劫','食傷','財星','官殺','印星'][GROUPOF(shiShen(c.dm,GAN[WX.indexOf(A.yong)*2]))]:''}）為用神、<b>${A.xi}</b>為喜神${A.fu?`、${A.fu}為有條件之輔助`:''}；${A.ji.join('、')}為忌，不宜再增。調候：${A.tiao}。</p>
 <p>格局要點：月令${P[1].zhi}藏${hide(P[1].zhi).join('')}，取 <b>${A.geName}</b>。${A.combos.map(x=>`見「${x[0]}」：${x[1]}`).join('；')||'無明顯成格組合，以喜忌平衡論之'}。${A.zh.length?A.zh.join('；')+'，合而不專，主心思分散或事有兩頭。':''}</p>`);
 H.push(tbl(['五行','角色','原局占比','月令旺衰'],WX.map(w=>[w,ROLE_T[A.role(w)],(A.pct[w]*100).toFixed(1)+'%',A.wx[w]])));
 H.push(`<p>大運定底色、流年調高低：</p>`+tbl(['大運','五行','底色','要點'],c.dayun.map(d=>{const e=dyEval(c,d);return [`${d.gz}（${d.age}–${d.end}歲）`,`${ganWx(d.gz[0])}／${zhiWx(d.gz[1])}`,e.tone,`干為${ROLE_T[A.role(ganWx(d.gz[0]))]}、支為${ROLE_T[A.role(zhiWx(d.gz[1]))]}${e.notes.length?'；'+e.notes.join('、'):''}`];})));
 // 三
 const nats=P.map((p,i)=>pillarNat(c,i));
 H.push(`<h2>三、十神論斷</h2>`+tbl(['柱','配置','本象','斷語','喜忌校正'],P.map((p,i)=>{const n=nats[i];const k=[i===2?null:p.ss,p.hide[0].ss].filter(Boolean);
  return [p.label,n.conf,n.base,`${PALACE[i]}：${k.map(s=>`${s}主${SSP[s]}`).join('；')}${k.map(s=>KIN[s]).filter(Boolean).length?'；六親對應'+[...new Set(k.map(s=>KIN[s]))].join('、'):''}`,n.adj];})));
 const top=Object.entries(P.reduce((m,p,i)=>{if(i!==2)m[p.ss]=(m[p.ss]||0)+1;p.hide.forEach((h,j)=>m[h.ss]=(m[h.ss]||0)+(j?0.3:0.6));return m;},{})).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
 const shiW=rel(c.dw,1);const lowShi=A.pct[shiW]<0.08;
 H.push(`<p><b>性格側寫：</b>${c.dm}${c.dw}日主，${({甲:'正直進取、有擔當',乙:'柔韌靈活、善於適應',丙:'熱情開朗、慷慨外放',丁:'細膩溫暖、內斂有洞察',戊:'厚重沉穩、可靠包容',己:'務實細心、善於經營',庚:'果斷剛毅、重義氣',辛:'精緻敏銳、重品味',壬:'聰明奔放、志向遠大',癸:'溫和聰慧、善於思考'})[c.dm]}；日支坐${P[2].hide[0].ss}，${SSP[P[2].hide[0].ss]}之性藏於內。命局以 ${top.join('、')} 最顯：${top.map(s=>SSP[s]).join('；')}。${c.strong?'身強能任事，敢做決斷，弱點是固執與承擔過多。':'身弱心思細，善借力，弱點是猶豫與耗神。'}${lowShi?`食傷（${shiW}）偏弱，表達與變通須靠後天練習。`:''}</p>`);
 H.push(`<p><b>大運十神本象：</b>${c.dayun.map(d=>{const z=shiShen(c.dm,mainHide(d.gz[1]));const n=[ssNature(d.ss),ssNature(z)];const b=n.every(x=>x==='吉')?'大吉':n.every(x=>x==='凶')?'大凶':n.includes('凶')&&n.includes('吉')?'吉凶參半':n.includes('吉')?'吉':n.includes('凶')?'凶':'平';return `${d.gz}${d.ss}坐${z}${b}`;}).join('、')}（本象未計喜忌，請與第二節底色合看）。</p>`);
 // 四 健康
 const weak=pctS.slice().reverse().slice(0,2).map(x=>x[0]),over=pctS[0][0];const sick=[];
 P.forEach((p,i)=>{const hits=[];P.forEach((q,j)=>{if(i!==j)zhiRel(p.zhi,q.zhi).filter(r=>!r.startsWith('六合')).forEach(r=>hits.push(`與${q.label}${q.zhi}${r}`));});
  const gk=P.filter((q,j)=>j!==i&&Math.abs(i-j)===1&&(WX.indexOf(ganWx(q.gan))+2)%5===WX.indexOf(ganWx(p.gan))).map(q=>`受${q.label}干${q.gan}剋`);
  if(i!==2&&(gk.length||A.role(ganWx(p.gan))==='忌'))sick.push([p.label+'干',p.gan,GBODY[p.gan],[...gk,A.role(ganWx(p.gan))==='忌'?'屬忌神':''].filter(Boolean).join('；')]);
  if(hits.length||A.role(zhiWx(p.zhi))==='忌')sick.push([p.label+'支',p.zhi,ZBODY[p.zhi],[...hits,A.role(zhiWx(p.zhi))==='忌'?'屬忌神':''].filter(Boolean).join('；')]);});
 const hy=[];for(let y=Yn;y<Yn+12;y++){const e=yearEval(c,y);const gw=ganWx(e.gz[0]),zw=zhiWx(e.gz[1]);const hitW=weak.filter(w=>(WX.indexOf(gw)+2)%5===WX.indexOf(w)||(WX.indexOf(zw)+2)%5===WX.indexOf(w));
  const k=e.sp.filter(x=>/沖|伏吟/.test(x)).concat(e.notes.filter(x=>/^沖|刑|害/.test(x)));if(hitW.length||k.length)hy.push(`${y} ${e.gz}：${hitW.length?'剋最弱之'+hitW.join('、')+'（'+hitW.map(w=>ORG[w].split('、')[0]).join('、')+'）':''}${hitW.length&&k.length?'；':''}${k.join('、')}`);}
 H.push(`<h2>四、健康參考</h2><p>體質總斷：${over}最旺（${(A.pct[over]*100).toFixed(0)}%）、${weak.map(w=>w+(A.pct[w]<0.03?'（缺）':'')).join('、')}最弱。最需養護者為 ${weak.map(w=>`${ORG[w]}（${w}弱）`).join('；')}；${over}過亢則 ${ORG[over].split('、')[0]} 易負擔過重（旺病衰亦病）。</p>`);
 if(sick.length)H.push(`<p>宮位病位（受沖剋或屬忌神者）：</p>`+tbl(['宮位','字','口訣定位','狀態'],sick));
 H.push(`<p>最大機率留意部位排序：${[...weak.map(w=>ORG[w]),ORG[over],...new Set(sick.map(s=>s[2]))].slice(0,5).map((x,i)=>`${i+1}. ${x}`).join('；')}。</p><p>流年健康留意（未來十二年）：${hy.length?hy.join('；'):'無明顯沖剋年份'}。</p><p>養生建議：${weak.map(w=>`補${w}——${CARE[w]}`).join('；')}；洩${over}——${CARE[over]}。</p><p class="muted">※ 命理健康推論僅供自我保健參考，不能取代醫師診斷；身體不適請就醫。</p>`);
 // 五 情志
 H.push(`<h2>五、身心情志對照</h2><p>依中醫五志：${[...weak,over].map(w=>`${w}——${EMO[w]}，對應${ORG[w].split('、').slice(0,2).join('、')}`).join('；')}。此對照只呈現傳統相關性，不代表因果。</p><p>自我覺察提問：${c.strong?'我是否承擔過多、硬撐不說？哪些惱怒被我嚥下？':'我是否過度擔憂、遲遲不敢決定？我是否把力氣分散在太多事上？'}${lowShi?'有什麼話我一直沒有說出口？':''}</p>`);
 // 六 大運流年
 const past=c.dayun.filter(d=>d.endYear<Yn),fut=c.dayun.filter(d=>d.endYear>=Yn);const row=d=>{const e=dyEval(c,d);const z=shiShen(c.dm,mainHide(d.gz[1]));return [d.gz,`${d.start}（${d.age}–${d.end}歲）`,`${d.ss}坐${z}`,e.notes.join('、')||'—',`${e.tone}：${[...new Set([d.ss,z])].map(x=>x+'主'+SSP[x].split('、')[0]).join('、')}${e.tone==='順線'?'，宜把握開展':e.tone==='滯線'?'，宜守成保養':'，穩中求進'}`];};
 H.push(`<h2>六、大運流年對照</h2>${cur?`<p>現行 ${cur.gz} 運：${dyEval(c,cur).tone}，干${cur.gz[0]}為${ROLE_T[A.role(ganWx(cur.gz[0]))]}、支${cur.gz[1]}為${ROLE_T[A.role(zhiWx(cur.gz[1]))]}；前五年重天干、後五年重地支。</p>`:''}`);
 if(past.length)H.push(`<h3>過去大運回顧（請以實際經歷核對）</h3>`+tbl(['大運','起始','十神','會遇','預期'],past.map(row)));
 H.push(`<h3>現行與未來大運</h3>`+tbl(['大運','起始','十神','會遇','預期'],fut.map(row)));
 H.push(`<h3>近兩年流年</h3>`+tbl(['流年','十神','引動','判定'],[Yn,Yn+1].map(y=>{const e=yearEval(c,y);return [`${y} ${e.gz}（虛歲 ${age(y)}）`,`${e.ssG}坐${e.ssZ}`,[...e.notes,...e.sp].join('、')||'—',`${e.mark}：干${ROLE_T[A.role(ganWx(e.gz[0]))]}、支${ROLE_T[A.role(zhiWx(e.gz[1]))]}`];})));
 // 八 years
 const ys=[];for(let y=Yn;y<Yn+36;y++)ys.push(yearEval(c,y));
 const per=[];ys.forEach(e=>{const k=e.lv;const last=per[per.length-1];if(last&&last.k===k)last.to=e.Y,last.items.push(e);else per.push({k,from:e.Y,to:e.Y,items:[e]});});
 const bestDy=c.dayun.filter(d=>dyEval(c,d).tone==='順線'),worstDy=c.dayun.filter(d=>dyEval(c,d).tone==='滯線');
 // 七
 const cai=rel(c.dw,2),guan=rel(c.dw,3);
 H.push(`<h2>七、綜合論斷</h2><p>此造為${A.lev}之${A.geName}${A.combos.length?'，兼'+A.combos.map(x=>x[0]).join('、'):''}，以${A.yong}為用、${A.xi}為喜，${A.ji.join('、')}為忌。</p>
 <p><b>事業與財運：</b>財星（${cai}）為${ROLE_T[A.role(cai)]}、官殺（${guan}）為${ROLE_T[A.role(guan)]}。${A.role(cai)==='用'||A.role(cai)==='喜'?'財由己力而來，宜主動經營、正偏兼營。':A.role(cai)==='忌'?'財多耗身，宜穩健理財、不宜高槓桿投機。':'財運隨運而動，宜量力。'}${A.role(guan)==='用'||A.role(guan)==='喜'?'官殺為喜，宜任職掌權、承擔管理之責。':''}順運：${bestDy.map(d=>`${d.gz}（${d.age}–${d.end}歲）`).join('、')||'無明顯'}；宜守之運：${worstDy.map(d=>`${d.gz}（${d.age}–${d.end}歲）`).join('、')||'無明顯'}。</p>
 <p><b>六親：</b>年柱${P[0].ss}，${KIN[P[0].ss]?'與'+KIN[P[0].ss]+'之緣顯於早年；':''}月柱${P[1].ss}坐${P[1].hide[0].ss}，${nats[1].base==='凶'?'早年家庭環境多挑戰':'長輩家庭有助'}；日支${P[2].zhi}藏${P[2].hide[0].ss}，${c.gender?'妻宮':'夫宮'}${P[2].hide[0].ss}，${SSP[P[2].hide[0].ss]}之象投射於配偶${zhiRel(P[2].zhi,P[1].zhi).concat(zhiRel(P[2].zhi,P[3].zhi)).some(r=>r==='沖'||r==='刑')?'，日支受沖刑，婚姻宜多溝通包容':''}；時柱${P[3].ss}，${KIN[P[3].ss]||'晚輩'}之事與晚運相關。</p>
 <p><b>健康：</b>以${weak.join('、')}弱為一生短板，${ORG[weak[0]]}宜長期保養。</p>
 <p><b>趨避：</b>${per.filter(p=>p.k==='低').slice(0,3).map(p=>`${p.from}${p.to>p.from?'–'+p.to:''} 宜守成、不擴張不擔保`).join('；')||'近年無明顯低谷'}；${per.filter(p=>p.k==='高').slice(0,3).map(p=>`${p.from}${p.to>p.from?'–'+p.to:''} 宜把握開展`).join('；')}。日常宜多親近${A.yong}、${A.xi}之顏色方位與行業。</p>
 <p class="muted">核對說明：以上為規則推論，斷語皆為本象並經身強弱、喜忌校正。請以六親事實（父母、婚姻、子女、重大財務年份）核對第六節過去大運之預期，不合者剔除。</p>`);
 H.push(`<h2>八、未來喜忌時段（${Yn}–${Yn+35}）</h2><p>判準：${A.yong}為用、${A.xi}為喜、${A.ji.join('')}為忌；再以伏吟、歲運併臨、沖提綱、天剋地沖、日犯歲君（歲干剋日干）、歲傷日干（日干剋歲干）等特例加註。高＝順線、平＝平線、低＝滯線、▲＝有沖剋特例。</p>`);
 H.push(tbl(['年','流年','大運','判定','要點'],ys.map(e=>[e.Y,e.gz,e.dy?e.dy.gz:'—',`<span class="lv-${e.lv}">${e.mark}</span>`,[`干${ROLE_T[A.role(ganWx(e.gz[0]))]}・支${ROLE_T[A.role(zhiWx(e.gz[1]))]}`,...e.sp,...e.notes].join('；')])));
 H.push(`<h3>喜忌時段總表</h3>`+tbl(['時段','判定','宜'],per.map(p=>[`${p.from}${p.to>p.from?'–'+p.to:''}`,{高:'順線',平:'平線',低:'滯線'}[p.k],{高:'開展、置產、進修、名位之事宜把握',平:'整備、穩中求進',低:'守成、保養、不擴張不擔保'}[p.k]])));
 H.push(dailySection(c));
 H.push(`<h2>十、計算工具與方法</h2><p><b>節氣：</b>${c.useDE?'NASA JPL DE421 行星星曆（skyfield 計算），以太陽地心視黃經每 15° 為一節氣，時間換算為台北標準時間（UTC+8），精確至秒（±1 秒）；預先計算 1900–2050 年資料隨網站附帶。':'出生時間超出 DE421 表範圍（1900–2050），改用 lunar-javascript 壽星天文曆演算法。'}</p><p><b>四柱：</b>年柱以立春交節時刻換年，月柱以「節」換月（五虎遁定月干），日柱、時柱由 lunar-javascript 推算${c.off?'，並作真太陽時校正':''}${c.dst?'；出生時間已扣除夏令時 1 小時':''}。</p><p><b>大運：</b>陽男陰女順排、陰男陽女逆排，共十步；起運與各運交接時刻 = 出生時刻 + |節氣時刻 − 出生時刻| × 120（天體 1 分 = 人生 2 小時，1 秒 = 2 分）。</p><p><b>論斷：</b>旺衰、格局、用神、調候及流年評分為規則式推演，僅供參考。</p>`);
 H.push(`<p class="muted">※ 本報告依傳統命理規則自動生成，僅供參考與娛樂，不構成醫療、財務、法律或人生決策建議。</p>`);
 return H.join('\n');}

export function rateRow(c,r){const A=c.A;const dayS=wScore(c,ganWx(r.gz[0]),1)+wScore(c,zhiWx(r.gz[1]),1.2);
 const segGz=r.seg.gz;const dyS=wScore(c,ganWx(segGz[0]),1)+wScore(c,zhiWx(segGz[1]),1.2);
 const ly=fromLife(r.from),ly2=fromLife(r.to-1);const yS=wScore(c,ganWx(ly[0]),1)+wScore(c,zhiWx(ly[1]),1.2);
 const chong=zhiRel(r.gz[1],c.pillars[2].zhi).includes('沖')||zhiRel(r.gz[1],c.pillars[0].zhi).includes('沖');
 const tot=0.45*dyS+0.35*yS+0.2*dayS-(chong?0.4:0);return {dayS,dyS,yS,ly:ly===ly2?ly:ly+'→'+ly2,chong,tot,lv:tot>=1?'高':tot<=-0.6?'低':'平'};}
import LJ from 'lunar-javascript';
export function fromLife(ms){const d=new Date(ms);return LJ.Solar.fromYmdHms(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),0).getLunar().getYearInGanZhiExact();}
function dailySection(c,now=new Date()){const rows=dailyRows(c);const nowMs=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),now.getMinutes());
 const i=rows.findIndex(r=>nowMs>=r.from&&nowMs<r.to);const pick=i<0?[]:rows.slice(Math.max(0,i-1),i+10);
 return `<h2>九、大運逐日對照（一日≈120日）</h2><p>方法：出生時刻至每一「節」的實際時間差 × 120 即為人生時間（三日折一年、一日折四個月、一時辰折十日）。出生後${c.forward?'順數':'逆數'}之每一個公曆日（00:00 換日）對應人生一段約 120 天的區間；該日日干支之喜忌，配合所屬大運與流年，作為該區間的參考底色。</p>
 ${i>=0?`<p>今天（${fmt(nowMs,false)}）對應天體日 <b>${fmt(rows[i].cel,false)} ${rows[i].gz}日</b>（所屬 ${rows[i].seg.gz} 運）。</p>`:''}`+(pick.length?tbl(['天體日','日干支','人生區間','大運','流年','綜合'],pick.map(r=>{const x=rateRow(c,r);return [fmt(r.cel,false),`${r.gz}（${ROLE_T[A_role(c,r.gz[0],1)]}／${ROLE_T[A_role(c,r.gz[1],0)]}）`,`${fmt(r.from,false)} → ${fmt(r.to,false)}`,r.seg.gz,x.ly,`<span class="lv-${x.lv}">${x.lv}${x.chong?'▲':''}</span>`];})):'');}
function A_role(c,ch,isGan){return c.A.role(isGan?ganWx(ch):zhiWx(ch));}
