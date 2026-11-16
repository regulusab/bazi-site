import {buildChart,yearPillar,liuYue,dayInfo,Solar,zhiRel} from './src/bazi.js';
const c=buildChart({name:'t',gender:1,date:'1990-01-01',time:'12:00'});
const got=c.pillars.map(p=>p.gan+p.zhi).join(' ');console.log(got, got==='己巳 丙子 丙寅 甲午'?'PASS':'FAIL');
console.log(c.lev,c.self.toFixed(2),c.xi,c.start,c.dayun.slice(0,3),c.pillars.map(p=>p.nayin+p.ss));
console.log(yearPillar(2026),liuYue(2026).map(x=>x.gz+x.jie).join(','),dayInfo(Solar.fromYmd(2026,11,1)),zhiRel('寅','申'));
const c2=buildChart({name:'t',gender:1,date:'2000-02-04',time:'21:00'});console.log(c2.pillars.map(p=>p.gan+p.zhi).join(' '));
import {buildReport} from './src/report.js';
const s=buildChart({name:'s',gender:1,date:'1962-08-08',time:'00:10'});
const ok=s.pillars.map(p=>p.gan+p.zhi).join('')==='壬寅丁未戊寅壬子'&&s.A.yong==='水'&&s.A.xi==='木'&&s.A.lev==='身強'&&s.startSolar.startsWith('1962-09-18');
const r=buildReport(s,new Date(2026,9,31));console.log('sample chart/用神/起運', ok?'PASS':'FAIL', 'report sections', (r.match(/<h2>/g)||[]).length);
const exp=['1962-09-18','1972-12-08','1983-01-02','1992-11-25','2002-08-28','2012-05-03','2022-01-09','2031-10-20','2041-09-22','2051-10-28'];
const got2=s.yun.segs.slice(1).map(x=>new Date(x.from).toISOString().slice(0,10));
console.log('1962 大運起點 vs 範本', JSON.stringify(got2)===JSON.stringify(exp.slice(0,got2.length))?"PASS":"FAIL", got2.join(' '));
const {dailyRows}=await import('./src/daily.js');const dr=dailyRows(s);const rr=dr.find(x=>x.gz==='癸巳'&&new Date(x.from).getUTCFullYear()===2026);
console.log('1962 天體日癸巳→2026-08-31~12-29', rr&&new Date(rr.from).toISOString().slice(0,10)==="2026-08-31"&&new Date(rr.to).toISOString().slice(0,10)==='2026-12-29'?'PASS':'FAIL');
const n=buildChart({name:'n',gender:1,date:'1990-01-01',time:'12:00'});console.log('1990 逆排起運', !n.forward&&n.startSolar.startsWith('1998-03-23')?'PASS':'FAIL', n.startSolar, n.yun.trad.text, dailyRows(n).length+'日');

// ---- DE421 ground truth (1962-08-08 00:10 male) ----
{
const {TERMS}=await import('./src/terms.js');const D=await import('./src/daily.js');
const f=ms=>new Date(ms).toISOString().slice(0,19).replace('T',' ');
const want={'立秋':'1962-08-08 08:33:33','白露':'1962-09-08 11:15:13','寒露':'1962-10-09 02:37:46','立冬':'1962-11-08 05:34:46','大雪':'1962-12-07 22:16:31','小寒':'1963-01-06 09:26:19','立春':'1963-02-04 21:07:36','驚蟄':'1963-03-06 15:17:02','清明':'1963-04-05 20:18:32','立夏':'1963-05-06 13:51:50','芒種':'1963-06-06 18:14:17'};
for(const [n,t] of Object.entries(want)){const x=TERMS.find(e=>e.name===n&&f(e.ms).slice(0,4)===t.slice(0,4));const dt=Math.abs(x.ms-Date.parse(t.replace(' ','T')+'Z'))/1000;if(dt>1)throw new Error(`${n} ${f(x.ms)} != ${t}`);}
const B=await import('./src/bazi.js');const c=B.buildChart({name:'t',gender:1,date:'1962-08-08',time:'00:10'});
const exp=[['丁未','1962-08-08 00:10'],['戊申','1962-09-18 23:16'],['己酉','1972-12-08 10:36'],['庚戌','1983-01-02 07:42'],['辛亥','1992-11-25 01:42'],['壬子','2002-08-28 13:12'],['癸丑','2012-05-03 08:48'],['甲寅','2022-01-09 19:22'],['乙卯','2031-10-20 14:14'],['丙辰','2041-09-22 17:14'],['丁巳','2051-10-28 11:50']];
c.yun.segs.forEach((s,i)=>{if(s.gz!==exp[i][0]||D.fmt(s.from)!==exp[i][1])throw new Error(`seg${i} ${s.gz} ${D.fmt(s.from)}`);});
if(D.fmt(c.yun.segs[10].to)!=='2062-01-25 08:44')throw new Error('end '+D.fmt(c.yun.segs[10].to));
if(c.dayun.length!==10)throw new Error('10 dayun');
const r=D.dailyRows(c).find(x=>x.gz==='癸巳'&&x.seg.gz==='甲寅');if(r.no!==16||D.fmt(r.from)!=='2026-08-31 04:10'||D.fmt(r.to)!=='2026-12-29 04:10')throw new Error('row16');
if(c.pillars.map(p=>p.gan+p.zhi).join(' ')!=='壬寅 丁未 戊寅 壬子')throw new Error('pillars');
console.log('DE421 ground truth PASS (11 節 ±1s, 11 大運, 甲寅 row16 癸巳)');
}

// ---- 全球八字：干支換日線（東經 70°）----
{
const {globalChart}=await import('./src/global.js');const tz=(await import('tz-lookup')).default;
const G=(y,m,d,hh,mi,lat,lon,o={})=>globalChart({y,m,d,hh,mi,lat,lon,gender:1,zone:tz(lat,lon),roundJie:true,...o});
const chk=(name,c,e)=>{const bad=Object.entries(e).filter(([k,v])=>{const got=k.split('.').reduce((a,b)=>a[b],c);return got!==v;}).map(([k,v])=>`${k}=${k.split('.').reduce((a,b)=>a[b],c)}≠${v}`);console.log(name,bad.length?'FAIL '+bad.join('; '):'PASS');if(bad.length)process.exitCode=1;};
const pj=p=>[p.year,p.month,p.day,p.hour].join(' ');
// 虛構命例（波特蘭）：近午夜換日、逆排大運；冬令時間
const a=G(1993,9,8,1,20,45.52,-122.68);a.mainS=pj(a.main);a.ts=new Date(a.trueG).toISOString().slice(11,16);
chk('全球 波特蘭 虛構 1993-09-08 01:20',a,{mainS:'癸酉 辛酉 癸巳 壬子','civil.day':'壬辰',clockHour:'癸丑',ts:'00:11','nextJie.local':'1993-09-07 08:08','trad.diffText':'0日17時12分','trad.text':'0年2月26日0時',startA:'1993-12-04 01:20',startB:'1993-12-03 00:20','dayun.0.gz':'庚申',off:-420,'warn.length':1});
const b=G(2001,11,20,15,30,45.52,-122.68);b.mainS=pj(b.main);
chk('全球 波特蘭 虛構 2001-11-20 15:30',b,{mainS:'辛巳 己亥 戊子 庚申','civil.day':'丁亥',clockHour:'庚申','nextJie.local':'2001-11-07 00:37','nextJie.off':'UTC−08:00','trad.diffText':'13日14時53分','trad.text':'4年6月14日10時',startA:'2006-06-04 01:30',startB:'2006-05-13 02:30','dayun.0.gz':'戊戌',off:-480});
// 星僑範本兩例（真實個人）放在 repo 外，找不到就略過
{const fs=await import('fs'),path=await import('path');const PL=process.env.PRIVATE_LUO||(process.env.PRIVATE_CASES?path.join(path.dirname(process.env.PRIVATE_CASES),'bazi-site-luo.mjs'):'/workspace/jiaodui/八字/private-cases/bazi-site-luo.mjs');
 if(fs.existsSync(PL)){const {GLOBAL_CASES}=await import(PL);for(const g of GLOBAL_CASES){const c=G(...g.a);c.mainS=pj(c.main);c.ts=new Date(c.trueG).toISOString().slice(11,16);chk('全球 '+g.name+'（私有命例）',c,g.exp);}}
 else console.log('全球 私有命例 SKIP（找不到 '+PL+'）');}
const B=await import('./src/bazi.js');
for(const t of ['2026-11-03 12:00','1990-01-01 12:00','1962-08-08 08:40','2024-02-04 16:30']){const [ds,ts]=t.split(' ');const [y,m,d]=ds.split('-').map(Number),[hh,mi]=ts.split(':').map(Number);
 const g=G(y,m,d,hh,mi,25.033,121.565,{roundJie:false});const n=B.buildChart({name:'t',gender:1,date:ds,time:ts});const ref=n.pillars.map(p=>p.gan+p.zhi).join(' ');
 const o={mainS:pj(g.main),civilS:pj(g.civil)};chk('全球 台北 '+t+' = 萬年曆',o,{mainS:ref,civilS:ref});}
const t=G(2026,11,3,12,0,25.033,121.565);chk('全球 台北 2026-11-03 辛巳日',t,{'main.day':'辛巳'});
// 夏令時間回撥重複時段
const amb=globalChart({y:2026,m:11,d:1,hh:1,mi:30,lat:45.52,lon:-122.68,gender:1,zone:'America/Los_Angeles'});const amb2=globalChart({y:2026,m:11,d:1,hh:1,mi:30,lat:45.52,lon:-122.68,gender:1,zone:'America/Los_Angeles',second:true});
chk('全球 DST 回撥判定',{a:!!amb.amb,o1:amb.off,o2:amb2.off},{a:true,o1:-420,o2:-480});
}

// ---- 鐘錶時間／真太陽時（引擎預設仍為真太陽時；介面另傳 timeMode:'clock'）----
{
const {buildChart,trueSolar}=await import('./src/bazi.js');
const {globalChart,CLOCK_STRIP_DST}=await import('./src/global.js');
const {sheetData}=await import('./src/sheetData.js');
const pj=c=>c.pillars.map(p=>p.gan+p.zhi).join(' ');
const g=globalChart;const tz='Asia/Taipei';
if(CLOCK_STRIP_DST)throw new Error('CLOCK_STRIP_DST 預設應為 false（老師裁定：不去掉夏令時間）');
// 預設行為不變：不傳 timeMode 仍為真太陽時
const def=buildChart({name:'t',gender:1,date:'1988-06-15',time:'09:30',lon:121.56,zone:tz});
const sol=buildChart({name:'t',gender:1,date:'1988-06-15',time:'09:30',lon:121.56,zone:tz,timeMode:'solar'});
const clk=buildChart({name:'t',gender:1,date:'1988-06-15',time:'09:30',lon:121.56,zone:tz,timeMode:'clock'});
if(pj(def)!==pj(sol)||def.timeMode!=='solar')throw new Error('buildChart 預設應為 solar');
if(pj(clk)!=='戊辰 戊午 辛丑 癸巳')throw new Error('clock 1988-06-15 09:30 '+pj(clk));
if(pj(sol)!=='戊辰 戊午 辛丑 癸巳')throw new Error('solar 1988-06-15 09:30 '+pj(sol));
if(clk.solar.toYmdHms().slice(0,16)!=='1988-06-15 09:30')throw new Error('clock time '+clk.solar.toYmdHms());
if(Math.abs(sol.off-trueSolar(new Date(1988,5,15,9,30),121.56).off)>1e-6)throw new Error('solar off');
// 時辰交界：10:55 鐘錶仍為巳，真太陽時進午
const c1055=buildChart({name:'t',gender:1,date:'1988-06-15',time:'10:55',lon:121.56,zone:tz,timeMode:'clock'});
const s1055=buildChart({name:'t',gender:1,date:'1988-06-15',time:'10:55',lon:121.56,zone:tz,timeMode:'solar'});
if(pj(c1055)!=='戊辰 戊午 辛丑 癸巳')throw new Error('clock 10:55 '+pj(c1055));
if(pj(s1055)!=='戊辰 戊午 辛丑 甲午')throw new Error('solar 10:55 '+pj(s1055));
// 年、月柱相同（非節氣交界）
if(clk.pillars[0].gan+clk.pillars[0].zhi!==sol.pillars[0].gan+sol.pillars[0].zhi)throw new Error('year differs');
if(clk.pillars[1].gan+clk.pillars[1].zhi!==sol.pillars[1].gan+sol.pillars[1].zhi)throw new Error('month differs');
// 1960-07-01 台北 10:00：老師裁定鐘錶模式不去掉夏令，仍依時鐘 10:00
const dstc=buildChart({name:'t',gender:1,date:'1960-07-01',time:'10:00',lon:121.56,zone:tz,timeMode:'clock'});
if(dstc.dstStripped)throw new Error('1960 should NOT strip DST by default');
if(dstc.solar.toYmdHms().slice(0,16)!=='1960-07-01 10:00')throw new Error('1960 clock should stay 10:00, got '+dstc.solar.toYmdHms());
const dstOpt=buildChart({name:'t',gender:1,date:'1960-07-01',time:'10:00',lon:121.56,zone:tz,timeMode:'clock',stripDst:true});
if(!dstOpt.dstStripped||dstOpt.standardTime!=='1960-07-01 09:00')throw new Error('stripDst:true should still convert 10:00→09:00 '+dstOpt.standardTime);
// 1962 無夏令，鐘錶 00:10 不變
const n62=buildChart({name:'t',gender:1,date:'1962-08-08',time:'00:10',zone:tz,timeMode:'clock'});
if(n62.dstStripped)throw new Error('1962 should not strip DST');
if(pj(n62)!=='壬寅 丁未 戊寅 壬子')throw new Error('1962 clock pillars '+pj(n62));
// 全球引擎：預設仍為真太陽時；鐘錶＋70°E
const G=(o)=>globalChart({y:1988,m:6,d:15,hh:9,mi:30,lat:25.033,lon:121.56,gender:1,zone:tz,...o});
const gs=G({}),gc=G({timeMode:'clock'});
if(gs.timeMode!=='solar')throw new Error('global default');
if([gs.main.year,gs.main.month,gs.main.day,gs.main.hour].join(' ')!==pj(sol))throw new Error('global solar '+[gs.main.year,gs.main.month,gs.main.day,gs.main.hour].join(' '));
if([gc.main.year,gc.main.month,gc.main.day,gc.main.hour].join(' ')!==pj(clk))throw new Error('global clock');
if(gs.main.year!==gc.main.year||gs.main.month!==gc.main.month)throw new Error('global year/month should match');
// 西經：鐘錶模式仍依 70°E 加一日
const nyC=globalChart({y:1990,m:1,d:20,hh:5,mi:30,lat:40.71,lon:-74.01,gender:1,zone:'America/New_York',timeMode:'clock'});
const nyCivil=nyC.civil.day,nyMain=nyC.main.day;
if(nyMain===nyCivil)throw new Error('NY clock should apply 70E day+1 '+nyMain+' '+nyCivil);
const nyS=globalChart({y:1990,m:1,d:20,hh:5,mi:30,lat:40.71,lon:-74.01,gender:1,zone:'America/New_York',timeMode:'solar'});
if(nyS.main.day===nyS.civil.day)throw new Error('NY solar should apply 70E');
// 詳細命盤：鐘錶預設、真太陽時可切
const shC=sheetData({name:'t',gender:1,date:'1988-06-15',time:'09:30',zone:tz,lon:121.56,listDate:'2026-01-01'});
const shS=sheetData({name:'t',gender:1,date:'1988-06-15',time:'10:55',zone:tz,lon:121.56,timeMode:'solar',listDate:'2026-01-01'});
const shC2=sheetData({name:'t',gender:1,date:'1988-06-15',time:'10:55',zone:tz,lon:121.56,timeMode:'clock',listDate:'2026-01-01'});
if(shC.info.timeMode!=='clock')throw new Error('sheet default clock');
if([...shC.W.bazi].reverse().join(' ')!==pj(clk))throw new Error('sheet clock 09:30 '+[...shC.W.bazi].reverse().join(' '));
if([...shC2.W.bazi].reverse().join(' ')!==pj(c1055))throw new Error('sheet clock 10:55');
if([...shS.W.bazi].reverse().join(' ')!==pj(s1055))throw new Error('sheet solar 10:55 '+[...shS.W.bazi].reverse().join(' '));
// 1979 夏令：鐘錶自動扣除
const shD=sheetData({name:'t',gender:0,date:'1979-07-15',time:'12:30',zone:tz,listDate:'2026-01-01',timeMode:'clock'});
if(shD.info.dst!==60)throw new Error('sheet 1979 dst');
console.log('timeMode clock/solar + DST-strip + 70E PASS');
}
