#!/usr/bin/env python
import sqlite3
import json
import matplotlib.cm as cm
import matplotlib as mpl

size=20
num_website=size*size
conn = sqlite3.connect("../../adstxt.db")
c = conn.cursor()
# FINDS MAX SITE RANK ACCORDING TO THE NUM OF WEBSITE WE WANT
c.execute("SELECT SITE_DOMAIN, COUNT(*), SITE_RANK FROM cleanadstxt GROUP BY SITE_DOMAIN ORDER BY SITE_RANK  LIMIT (?);",(num_website,))
list_website_table = c.fetchall()
json_data={}
json_data['list']=[]
norm = mpl.colors.Normalize(vmin=0, vmax=150)
#Voir https://matplotlib.org/examples/color/colormaps_reference.html
cmap = cm.magma_r
m = cm.ScalarMappable(norm=norm, cmap=cmap)
index=0;
for  website in list_website_table:
    xpos=index%size
    ypos=int(index/size)
    json_data['list'].append({"name":website[0],"x":xpos,"y":ypos, "numsite":website[1],"colour":mpl.colors.to_hex(m.to_rgba(website[1]+20))})
    index+=1
print(json_data)
with open('data_grid.json', 'w') as f:
    json.dump(json_data, f)
