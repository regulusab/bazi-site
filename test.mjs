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
const a=G(2026,4,17,1,17,45.52,-122.68);a.mainS=pj(a.main);a.ts=new Date(a.trueG).toISOString().slice(11,16);
chk('全球 波特蘭 2026-04-17 01:17',a,{mainS:'丙午 壬辰 壬戌 庚子','civil.day':'辛酉',clockHour:'辛丑',ts:'00:06','nextJie.local':'2026-05-05 04:49','trad.diffText':'18日3時32分','trad.text':'6年0月17日16時',startA:'2032-05-04 17:17',startB:'2032-04-02 17:17','dayun.0.gz':'癸巳',off:-420});
const b=G(2026,10,12,13,1,45.52,-122.68);b.mainS=pj(b.main);
chk('全球 波特蘭 2026-10-12 13:01',b,{mainS:'丙午 戊戌 庚申 壬午','civil.day':'己未',clockHour:'癸未','nextJie.local':'2026-11-07 01:52','nextJie.off':'UTC−08:00','trad.diffText':'25日13時51分','trad.text':'8年6月9日6時',startA:'2035-04-21 19:01',startB:'2035-03-08 18:01','dayun.0.gz':'己亥'});
const B=await import('./src/bazi.js');
for(const t of ['2026-11-03 12:00','1990-01-01 12:00','1962-08-08 08:40','2024-02-04 16:30']){const [ds,ts]=t.split(' ');const [y,m,d]=ds.split('-').map(Number),[hh,mi]=ts.split(':').map(Number);
 const g=G(y,m,d,hh,mi,25.033,121.565,{roundJie:false});const n=B.buildChart({name:'t',gender:1,date:ds,time:ts});const ref=n.pillars.map(p=>p.gan+p.zhi).join(' ');
 const o={mainS:pj(g.main),civilS:pj(g.civil)};chk('全球 台北 '+t+' = 萬年曆',o,{mainS:ref,civilS:ref});}
const t=G(2026,11,3,12,0,25.033,121.565);chk('全球 台北 2026-11-03 辛巳日',t,{'main.day':'辛巳'});
// 夏令時間回撥重複時段
const amb=globalChart({y:2026,m:11,d:1,hh:1,mi:30,lat:45.52,lon:-122.68,gender:1,zone:'America/Los_Angeles'});const amb2=globalChart({y:2026,m:11,d:1,hh:1,mi:30,lat:45.52,lon:-122.68,gender:1,zone:'America/Los_Angeles',second:true});
chk('全球 DST 回撥判定',{a:!!amb.amb,o1:amb.off,o2:amb2.off},{a:true,o1:-420,o2:-480});
}
