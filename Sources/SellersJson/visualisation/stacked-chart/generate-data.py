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

database_name="../../sellersjs.db"
sellerlist_path="../../data/sellerlist.json"
conn = sqlite3.connect(database_name)
c = conn.cursor()
num_domain=30

json_data={"data":[],"color":[]}
with open(sellerlist_path, 'rb') as json_file:
    data = json.load(json_file)
    websites_to_crawl=[data[key] for key in data ]
    for website in websites_to_crawl:
        print(website)
        c.execute("SELECT upper(TYPE), COUNT(*)  FROM RELATION  INNER JOIN ACTORS  ON ACTORS.DOMAIN = RELATION.ACTOR_FROM  WHERE ACTOR_TO=(?) GROUP BY lower(TYPE)",(website,))
        result=c.fetchall()
        if(result != []):
            print(result)
            result_dict = {item[0]: item[1:][0] for item in result}
            for key in ['PUBLISHER','INTERMEDIARY','BOTH']:
                if key in result_dict:
                    pass
                else:
                    result_dict[key]=0
            json_data["data"].append({"site":website, "Editeur":result_dict['PUBLISHER'],"SSP":result_dict['INTERMEDIARY'],"Mixte":result_dict['BOTH']})

norm = mpl.colors.Normalize(vmin=0, vmax=4)
cmap = cm.magma_r
m = cm.ScalarMappable(norm=norm, cmap=cmap)
for index in range(3):
    json_data["color"].append(mpl.colors.to_hex(m.to_rgba(1+index)))

with open('data_stacked.json', 'w') as f:
    json.dump(json_data, f)
