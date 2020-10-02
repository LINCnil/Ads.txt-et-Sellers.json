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
    c.execute("SELECT ACTOR_TO  FROM RELATION WHERE ACTOR_FROM=(?);", (domain,))
    data=c.fetchall()
    if(data is not None):
        return domain, [element[0] for element in data]
    return domain,[]

def crawl(conn,origin):
    origin, targets= find_next_links(conn, origin)
    queue=[{"domain":target, "level":1} for target in targets]
    visited=[{"domain":origin, "level":0}]
    raw_link=[[origin,target] for target in targets]
    while len(queue)>0:
        target=queue.pop(0)
        if target["domain"] in [site["domain"] for site in visited]:
            pass
        else:
            visited.append(target)
            new_origin, next_targets= find_next_links(conn, target["domain"])
            raw_link+=[[target["domain"],next_target] for next_target in next_targets]
            queue+=[{"domain":next_target, "level":target["level"]+1} for next_target in next_targets]
    #NOW PRUNE LINK THAT DON'T GO FORWARD
    visited_dict = dict((site["domain"], site["level"]) for site in visited)
    pruned_link=[]
    for link in raw_link:
        if(visited_dict[link[1]]>visited_dict[link[0]]):
            pruned_link.append(link)
    return visited,pruned_link

database_name="../../sellersjs.db"
domain_list="../../data/top_alexa50fr.json"

conn = sqlite3.connect(database_name)
pruned_list={}
with open(domain_list) as json_file:
    data = json.load(json_file)
    for number in data:
        target_site=data[number]
        result_node,result_link=crawl(conn,target_site)
        json_data={"nodes":[], "links":[]}
        index_node=0
        node_dict={}
        norm = mpl.colors.Normalize(vmin=1, vmax=15)
        #Voir https://matplotlib.org/examples/color/colormaps_reference.html
        cmap = cm.magma_r
        m = cm.ScalarMappable(norm=norm, cmap=cmap)
        data_available=False
        for node in result_node:
            json_data["nodes"].append({"node":index_node,"name":node["domain"],"colour":mpl.colors.to_hex(m.to_rgba(5+node["level"]))})
            node_dict[node["domain"]] = [index_node,node["level"]]
            index_node+=1
        for link in result_link:
            data_available=True
            json_data["links"].append({"source":node_dict[link[0]][0],"target":node_dict[link[1]][0], "value":1,"colour": mpl.colors.to_hex(m.to_rgba(5+node_dict[link[0]][1]))})
        if data_available:
            pruned_list[number]=data[number]
            with open('sankey_data/'+target_site+'.json', 'w') as f:
                json.dump(json_data, f)
with open('top_alexa50fr_pruned.json', 'w') as f:
    json.dump(pruned_list, f)
