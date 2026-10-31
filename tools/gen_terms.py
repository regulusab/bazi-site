from skyfield.api import load
from skyfield.searchlib import find_discrete
from skyfield.framelib import ecliptic_frame
import json
ts=load.timescale(); eph=load('de421.bsp'); sun=eph['sun']; earth=eph['earth']
def idx(t):
    lat,lon,_=earth.at(t).observe(sun).apparent().frame_latlon(ecliptic_frame)
    return (lon.degrees//15).astype(int)
idx.step_days=7
t0=ts.utc(1899,12,1); t1=ts.utc(2050,12,31)
t,v=find_discrete(t0,t1,idx)
out=[[int(round((x-ts.utc(1970,1,1)).item()*86400 if False else x.utc_datetime().timestamp())),int(k)] for x,k in zip(t,v)]
open('terms-data.js','w').write('export default '+json.dumps(out,separators=(',',':'))+';')
print(len(out))
import datetime as dt
for s,k in out:
    d=dt.datetime.utcfromtimestamp(s)+dt.timedelta(hours=8)
    if d.year in(1962,1963) and k*15 in(135,165,195,225,255,285,315,345,15,45,75): print(k*15,d)
