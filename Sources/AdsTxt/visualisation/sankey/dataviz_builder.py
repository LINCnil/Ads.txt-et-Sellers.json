#!/usr/bin/env python
import sqlite3
import json
import matplotlib.cm as cm
import matplotlib as mpl

cutout_adsystem=30
num_website=100
conn = sqlite3.connect("../../adstxt.db")
c = conn.cursor()
c.execute("SELECT SITE_RANK FROM cleanadstxt GROUP BY SITE_DOMAIN ORDER BY SITE_RANK  LIMIT 1 OFFSET (?);",(num_website,))
cutout_website=c.fetchone()[0]
print(cutout_website)
c.execute("SELECT adsystem_domain, COUNT(case when SITE_RANK<(?) then 1 else null end) FROM cleanadstxt GROUP BY adsystem_domain ORDER BY COUNT(case when SITE_RANK<(?) then 1 else null end) DESC LIMIT (?);",(cutout_website,cutout_website,cutout_adsystem,))
adsystem_table = c.fetchall()
result=""
index=0
json_data={}
json_data['nodes']=[]
json_data['links']=[]
node_index=0
#To generate color
norm = mpl.colors.Normalize(vmin=20, vmax=120)
#Voir https://matplotlib.org/examples/color/colormaps_reference.html
cmap = cm.magma_r
m = cm.ScalarMappable(norm=norm, cmap=cmap)
for adsystem in adsystem_table:
    name=adsystem[0]
    prevalence=float(num_website*adsystem[1]/num_website)
    #domain=todo, add most common domain as canonical
    c.execute("SELECT SITE_DOMAIN, SITE_RANK FROM cleanadstxt WHERE adsystem_domain = (?) AND SITE_RANK<(?);",(name,cutout_website))
    connection_table = c.fetchall()
    for connection in connection_table:
        c.execute("SELECT SITE_DOMAIN, SITE_RANK FROM cleanadstxt WHERE adsystem_domain = (?) AND SITE_RANK<(?);",(name,cutout_website))

        if(name not in [node["name"] for node in json_data["nodes"]]):
            json_data['nodes'].append({"node":node_index,"name":name, "colour":mpl.colors.to_hex(m.to_rgba(prevalence))})
            advertiser_node_number=node_index
            node_index+=1
        else:
            advertiser_node_number=[index_node["node"] for index_node in json_data['nodes'] if index_node["name"]== name][0]

        if(connection[0] not in [node["name"] for node in json_data["nodes"]]):
            json_data['nodes'].append({"node":node_index,"name":connection[0], "colour":"#000"})
            website_node_number=node_index
            node_index+=1
        else:
            website_node_number=[index_node["node"] for index_node in json_data['nodes'] if index_node["name"]== connection[0]][0]
        json_data['links'].append({"source":advertiser_node_number,"target":website_node_number,"value":1,"colour":mpl.colors.to_hex(m.to_rgba(prevalence))})
    index+=1
print(json_data)
with open('data_sankey.json', 'w') as f:
    json.dump(json_data, f)
