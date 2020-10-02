#!/usr/bin/env python
import sys
import json
import sqlite3
import matplotlib.cm as cm
import matplotlib as mpl

def check_actor_type(conn, domain):
    c = conn.cursor()
    c.execute("SELECT TYPE  FROM ACTORS WHERE DOMAIN=(?);", (domain,))
    data=c.fetchone()
    if(data is not None):
        return data[0]
    return False

def find_next_links(conn,domain):
    c = conn.cursor()
    c.execute("SELECT ACTOR_FROM  FROM RELATION WHERE ACTOR_TO=(?);", (domain,))
    data=c.fetchall()
    if(data is not None):
        return domain, [element[0] for element in data]
    return domain,[]

def find_connection(link_list, source,target):
    count_connection=0
    for connection in link_list:
        if connection['root'] == source and connection['target'] == target and target!=source:
            count_connection+=0.5
        if connection['root'] == target and connection['target'] == source and target!=source:
            count_connection+=1
    return count_connection

database_name="../../sellersjs.db"
sellerlist_path="../../data/sellerlist.json"
conn = sqlite3.connect(database_name)
c = conn.cursor()
websites_to_crawl=[]
with open(sellerlist_path, 'rb') as json_file:
    data = json.load(json_file)
    websites_to_crawl=[data[key] for key in data ]
json_data={"data":[],"names":[],"color":[]}
json_data["names"]=websites_to_crawl
for site in websites_to_crawl:
    c.execute("SELECT ACTOR_TO  FROM RELATION WHERE ACTOR_FROM=(?);", (site,))
    data=c.fetchall()
    targets= [element[0] for element in data]
    for target in targets:
        if target in websites_to_crawl:
            json_data['data'].append({"root":site,"target":target,"count":1})
matrix=[]
print(json_data)
for matrixx in json_data['names']:
    temp_list=[]
    for matrixy in json_data['names']:
        temp_list+=[find_connection(json_data['data'],matrixx,matrixy)]
    matrix.append(temp_list)
json_data["matrix"]=matrix

norm = mpl.colors.Normalize(vmin=1, vmax=6+len(json_data["names"]))
#Voir https://matplotlib.org/examples/color/colormaps_reference.html
cmap = cm.magma_r
m = cm.ScalarMappable(norm=norm, cmap=cmap)
for index in range(len(json_data["names"])):
    json_data["color"].append(mpl.colors.to_hex(m.to_rgba(5+index)))
with open('data_chorded.json', 'w') as f:
    json.dump(json_data, f)
