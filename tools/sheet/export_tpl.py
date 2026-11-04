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
lines=[[r4(v) for v in l[:4]]+([1] if len(l)>4 else []) for l in N.lines_p1]
chars=set()
for r in recs+[dict(glyphs=ltc)]:
    for x in r['glyphs']: chars.update(x[2])
chars.update(''.join(map(chr,range(32,127))))
adv={f:{c:round(gen.FONTS[f].getlength(c)/1000,5) for c in sorted(chars) if ord(c)<0x2000 or c in '•・：【】'} for f in ['serif','mono','cjk']}
out=dict(W=1512,H=2016,lines=lines,tri=N.tri_p1,ltc=ltc,recs=recs,tpl=tpl,adv=adv,SIZEL=gen.SIZEL)
open('/workspace/bazi-site/src/sheet-template.js','w').write('// 由 tools/sheet/export_tpl.py 產生：星僑八字論斷範本（羅章雲頁）量測之格線與字形座標\nexport default '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
# expected for regression
exp=dict(W={k:(list(v) if isinstance(v,tuple) else v) for k,v in N.W.items()},glyphs=[[r4(x),r4(y),t,f,r4(s)] for x,y,t,f,s in N.glyphs])
json.dump(exp,open('/workspace/bazi-site/tests/wang-expected.json','w'),ensure_ascii=False)
print(len(tpl),len(recs),len(ltc),len(lines))
