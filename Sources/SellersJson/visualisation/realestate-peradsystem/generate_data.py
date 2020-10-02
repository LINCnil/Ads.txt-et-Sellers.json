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
        return data[0].upper()
    return False

def find_past_links(conn,domain):
    c = conn.cursor()
    c.execute("SELECT ACTOR_FROM  FROM RELATION WHERE ACTOR_TO=(?);", (domain,))
    data=c.fetchall()
    if(data is not None):
        return domain, [element[0] for element in data]
    return domain,[]

def crawl(conn,origin):
    origin, targets= find_past_links(conn, origin)
    queue=[{"domain":target, "level":1} for target in targets if check_actor_type(conn,target)!="PUBLISHER"]
    publisher_visited=[{"domain":target, "level":0} for target in targets  if check_actor_type(conn,target)=="PUBLISHER" ]

    visited=[{"domain":origin, "level":0}]
    while len(queue)>0:
        target=queue.pop(0)
        if target["domain"] in [site["domain"] for site in visited]:
            pass
        else:
            visited.append(target)
            new_origin, next_targets= find_past_links(conn, target["domain"])
            publisher_visited+=[{"domain":element, "level":target["level"]} for element in next_targets  if check_actor_type(conn,element)=="PUBLISHER" ]
            #Add to queue if not editor, else, no point in crawling
            queue+=[{"domain":next_target, "level":target["level"]+1} for next_target in next_targets if check_actor_type(conn,next_target)!="PUBLISHER"]
    return publisher_visited

database_name="../../sellersjs.db"
sellerslist_path="../../data/sellerlist.json"
conn = sqlite3.connect(database_name)
c = conn.cursor()
return_data={"subgroups":[],"color":[],"data":[]}
maxlevel=0
with open(sellerslist_path, 'rb') as json_file:
    data = json.load(json_file)
    websites_to_crawl=[data[key] for key in data ]
    for website in websites_to_crawl:
        print("starting with", website)
        all_editors=crawl(conn,website)
        publisher_grouped={}
        for element in all_editors:
            level=element['level']
            if level not in publisher_grouped:
                publisher_grouped[level]= [element['domain']]
            else:
                publisher_grouped[level].append(element['domain'])
        accumulator_set=set()
        for key in publisher_grouped:
            if key>maxlevel:
                maxlevel=key
            website_set=set(publisher_grouped[key]).difference(accumulator_set)
            publisher_grouped[key]=len(website_set)
            accumulator_set=accumulator_set.union(website_set)
        publisher_grouped["site"]=website
        return_data["data"].append(publisher_grouped)
        print(return_data)

norm = mpl.colors.Normalize(vmin=1, vmax=15)
#Voir https://matplotlib.org/examples/color/colormaps_reference.html
cmap = cm.magma_r
m = cm.ScalarMappable(norm=norm, cmap=cmap)
norm = mpl.colors.Normalize(vmin=1, vmax=9)
cmap = cm.magma_r
m = cm.ScalarMappable(norm=norm, cmap=cmap)
for index in range(maxlevel+1):
    return_data["subgroups"].append(str(index))
    return_data["color"].append(mpl.colors.to_hex(m.to_rgba(2+index)))
    for element in return_data["data"]:
        if index not in element:
            element[index]=0

with open('estate_data.json', 'w') as f:
    json.dump(return_data, f)
