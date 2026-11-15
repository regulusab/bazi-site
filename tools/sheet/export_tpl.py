# -*- coding: utf-8 -*-
import json, io, contextlib, sys
with contextlib.redirect_stdout(io.StringIO()):
    import newpage as N
import gen
from data import COMMON
# marker data -> item template
class M(dict):
    def get(self,k,d=None): return self[k] if k in self else d
mk=lambda f:'§'+f
D=M(serial=mk('serial'),name=mk('name'),zodiac=mk('zodiac'),sex=mk('sex'),xiyuan=mk('xiyuan'),minguo=mk('minguo'),listdate=mk('listdate'),
  xiantian=[mk('xiantian.%d'%i) for i in range(10)],rikong=mk('rikong'),niankong=mk('niankong'),mingge=mk('mingge'),minggong=mk('minggong'),
  renyuan_top=mk('renyuan_top'),renyuan_bot=mk('renyuan_bot'),taixi=mk('taixi'),taiyuan=mk('taiyuan'),wang=[mk('wang.0'),mk('wang.1')],
  yong=[(mk('yong.%d.0'%i),mk('yong.%d.1'%i),mk('yong.%d.2'%i),mk('yong.%d.3'%i)) for i in range(5)],
  solar_tail=mk('solar_tail'),lunar_tail=mk('lunar_tail'),week=mk('week'),chusheng=mk('chusheng'),meifeng=mk('meifeng'),
  gongzhi=[mk('gongzhi.%d'%i) for i in range(12)],sui_zhi=[mk('sui_zhi.%d'%i) for i in range(12)],bazhai_dir=[mk('bazhai_dir.%d'%i) for i in range(8)],
  dongxi=mk('dongxi'),gua=mk('gua'))
for f,n in [('zhuxing',4),('bazi',4),('cang',4),('fu_top',4),('fu_bot',4),('yun',4),('nayin',4),('dy_age',8),('dy_zx',8),('dy_gz',8),('dy_cang',8),('dy_fu_top',8),('dy_fu_bot',8),('csheng',12)]:
    D[f]=[mk('%s.%d'%(f,i)) for i in range(n)]
D['shensha4']=[[mk('shensha4.%d'%i)] for i in range(4)]; D['shensha12']=[[mk('shensha12.%d'%i)] for i in range(12)]
tpl=[]
for it in gen.items(D):
    if it['mode']=='ltcell': continue
    t=it['text']
    tpl.append(dict(box=[round(v,4) for v in it['box']],mode=it['mode'],text=t,font=it.get('font')))
r4=lambda v:round(float(v),3)
recs=[dict(box=[round(v,4) for v in it['box']],mode=it['mode'],text=it['text'] if isinstance(it['text'],str) else list(it['text']),glyphs=[[r4(x),r4(y),t,f,r4(s)] for x,y,t,f,s in g]) for it,g in N.REC if not it.get('ltc')]
ltc=[[r4(x),r4(y),t,f,r4(s)] for it,g in N.REC if it.get('ltc') for x,y,t,f,s in g]
# chars / adv 仍以原始量測計算（與去識別前相同），之後才去識別 recs
lines=[[r4(v) for v in l[:4]]+([1] if len(l)>4 else []) for l in N.lines_p1]
chars=set()
for r in recs+[dict(glyphs=ltc)]:
    for x in r['glyphs']: chars.update(x[2])
chars.update(''.join(map(chr,range(32,127))))
adv={f:{c:round(gen.FONTS[f].getlength(c)/1000,5) for c in sorted(chars) if ord(c)<0x2000 or c in '•・：【】'} for f in ['serif','mono','cjk']}
# recs 去識別：範本命主為真實個人。與 tpl 固定文字相同的欄位（標題、標籤）保留；
# 可變欄位只保留 box/mode 與字形座標、字型、字級，原字改為佔位字（中文→〇、與 '0' 等寬之數字→0），並且不輸出 text。
# sheetLayout.js 只用字形種類（中文／拉丁／•）、座標與拉丁字寬，故排版結果不變。
r1=lambda v:round(v*10)/10
kf=lambda b,m:(tuple(r1(v) for v in b),m)
hasm=lambda t:any(isinstance(x,str) and x[:1]=='§' for x in t) if isinstance(t,list) else str(t)[:1]=='§'
fixed={}
for t in tpl:
    if not hasm(t['text']): fixed.setdefault(kf(t['box'],t['mode']),[]).append(json.dumps(t['text'],ensure_ascii=False))
ADVC=set(adv['cjk'])
def ph(c,f):
    if c=='•' or (ord(c)>=0x2000 and c in ADVC): return c
    if ord(c)>=0x2000: return '〇'
    if c.isdigit() and adv[f].get(c)==adv[f].get('0'): return '0'
    assert not c.isalpha(), c
    return c
def sanit(r):
    if json.dumps(r['text'],ensure_ascii=False) in fixed.get(kf(r['box'],r['mode']),[]):
        return dict(box=r['box'],mode=r['mode'],glyphs=r['glyphs'])
    return dict(box=r['box'],mode=r['mode'],glyphs=[[x,y,''.join(ph(c,f) for c in t),f,s] for x,y,t,f,s in r['glyphs']])
recs=[sanit(r) for r in recs]
out=dict(W=1512,H=2016,lines=lines,tri=N.tri_p1,ltc=ltc,recs=recs,tpl=tpl,adv=adv,SIZEL=gen.SIZEL)
open('/workspace/bazi-site/src/sheet-template.js','w').write('// 由 tools/sheet/export_tpl.py 產生：星僑八字論斷範本量測之格線與字形座標。\n// recs 已去識別：可變欄位只保留格子、排版模式與字形座標／字型／字級，原字改為佔位字（中文→〇、數字→0），不含範本命主資料。\nexport default '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
# expected for regression
exp=dict(W={k:(list(v) if isinstance(v,tuple) else v) for k,v in N.W.items()},glyphs=[[r4(x),r4(y),t,f,r4(s)] for x,y,t,f,s in N.glyphs])
json.dump(exp,open('/workspace/bazi-site/tests/wang-expected.json','w'),ensure_ascii=False)
print(len(tpl),len(recs),len(ltc),len(lines))
