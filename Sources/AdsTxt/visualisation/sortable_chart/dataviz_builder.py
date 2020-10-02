#!/usr/bin/env python
import sqlite3
import json
import matplotlib.cm as cm
import matplotlib as mpl

num_website=25
conn = sqlite3.connect("../../adstxt.db")
c = conn.cursor()
c.execute("SELECT SITE_DOMAIN, COUNT(*), SITE_RANK FROM cleanadstxt GROUP BY SITE_DOMAIN ORDER BY SITE_RANK  LIMIT (?);",(num_website,))
list_website_table = c.fetchall()
json_data={}
json_data['list']=[]
norm = mpl.colors.Normalize(vmin=0, vmax=200)
#Voir https://matplotlib.org/examples/color/colormaps_reference.html
cmap = cm.magma_r
m = cm.ScalarMappable(norm=norm, cmap=cmap)
index=0
for  website in list_website_table:
    json_data['list'].append({"name":website[0],"numsite":website[1], "rank":index,"colour":mpl.colors.to_hex(m.to_rgba(website[1]+20))})
    index+=1

with open('data_sortable.json', 'w') as f:
    json.dump(json_data, f)
