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

database_name="../sellersjs.db"
sellerlist_path="../data/sellerlist.json"

conn = sqlite3.connect(database_name)
c = conn.cursor()

top_20_list=[]
top_20_string=""
with open(sellerlist_path, 'rb') as json_file:
    data = json.load(json_file)
    top_20_list=[data[key] for key in data ]
    for website in top_20_list:
        top_20_string=top_20_string+' "'+website+'",'

c.execute("SELECT  COUNT(*)  FROM ACTORS  WHERE TYPE='INTERMEDIARY' or TYPE='BOTH'")
result=c.fetchall()
print("Nombre de SSP ",result[0][0])


c.execute("SELECT  COUNT(*)  FROM ACTORS  WHERE  TYPE='PUBLISHER'")
result=c.fetchall()
print("Nombre d'éditeur ",result[0][0])

query_string=("SELECT  COUNT(*)  FROM RELATION WHERE ACTOR_TO IN ("+top_20_string[:-1]+") AND ACTOR_FROM IN ("+top_20_string[:-1]+") AND ACTOR_TO!=ACTOR_FROM")
c.execute(query_string)
result=c.fetchall()
print("Nombre d'interco dans le top 20 ",result[0][0])


c.execute("SELECT  domain  FROM ACTORS  WHERE TYPE='INTERMEDIARY' or TYPE='BOTH'")
result=c.fetchall()
accumulator={'BOTH':0,'PUBLISHER':0,'INTERMEDIARY':0,'NUMSITE':0}
for website in result:
    c.execute("SELECT upper(TYPE), COUNT(*)  FROM RELATION  INNER JOIN ACTORS  ON ACTORS.DOMAIN = RELATION.ACTOR_FROM  WHERE ACTOR_TO=(?) GROUP BY lower(TYPE)",(website[0],))
    count=c.fetchall()
    if count != []:
        accumulator['NUMSITE']+=1
        result_dict = {item[0]: item[1:][0] for item in count}
        for key in ['PUBLISHER','INTERMEDIARY','BOTH']:
            if key in result_dict:
                accumulator[key]+=result_dict[key]
print("Nombre moyen d'éditeur par SSP ayant déclaré : ",accumulator["PUBLISHER"]/accumulator["NUMSITE"])
print("Nombre moyen de SSP par SSP ayant déclaré : ",(accumulator["INTERMEDIARY"]+accumulator["BOTH"])/accumulator["NUMSITE"])
