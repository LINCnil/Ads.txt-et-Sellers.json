#!/usr/bin/env python
import sqlite3
import json
import matplotlib.cm as cm
import matplotlib as mpl

size=20
num_website=size*size
num_adsystem=25
conn = sqlite3.connect("../../adstxt.db")
c = conn.cursor()
c.execute("SELECT adsystem_domain, COUNT(*) FROM cleanadstxt GROUP BY adsystem_domain ORDER BY COUNT(*) DESC LIMIT (?);",(num_adsystem,))
list_adystem_table = c.fetchall()
json_data={}
c.execute("SELECT DISTINCT SITE_DOMAIN, SITE_RANK FROM cleanadstxt ORDER BY SITE_RANK LIMIT (?);",(num_website,))
list_website_table = c.fetchall()
norm = mpl.colors.Normalize(vmin=400, vmax=1800)
cmap = cm.magma_r
m = cm.ScalarMappable(norm=norm, cmap=cmap)

for adsystem in list_adystem_table:
    print(adsystem)
    c.execute("SELECT SITE_DOMAIN FROM cleanadstxt WHERE adsystem_domain = (?);",(adsystem[0],))
    list_present_website_table = c.fetchall()
    json_data[adsystem[0]]={}
    json_data[adsystem[0]]["percent"]=0
    json_data[adsystem[0]]["color"]=mpl.colors.to_hex(m.to_rgba(adsystem[1]))
    json_data[adsystem[0]]["value"]=[]
    index=0;
    present=0;
    for  website in list_website_table:
        xpos=index%size
        ypos=int(index/size)
        if(website[0] in [x[0] for x in list_present_website_table]):
            json_data[adsystem[0]]["value"].append({"name":website[0],"x":xpos,"y":ypos,"present":True,"colour":mpl.colors.to_hex(m.to_rgba(adsystem[1]))})
            index+=1
            present+=1
        else:
            json_data[adsystem[0]]["value"].append({"name":website[0],"x":xpos,"y":ypos, "present":False,"colour":"#FFF"})
            index+=1
    json_data[adsystem[0]]["percent"]=100.0*present/num_website



with open('data_gridperadnetwork.json', 'w') as f:
    json.dump(json_data, f)
