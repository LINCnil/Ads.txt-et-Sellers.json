#!/usr/bin/env python
import sys
import json
import sqlite3

database_name="../adstxt.db"
conn = sqlite3.connect(database_name)
c = conn.cursor()
c.execute("SELECT  COUNT(DISTINCT SITE_DOMAIN)  FROM cleanadstxt")
result=c.fetchall()
print("Pourcentage de site avec Ads.txt ",100*result[0][0]/5000)
c.execute("SELECT  COUNT(*)  FROM cleanadstxt GROUP BY SITE_DOMAIN")
result=[x[0] for x in c.fetchall()]
max_value = max(result)
min_value = min(result)
avg_value = sum(result)/len(result)
print("Max num of Adsystem: ",max_value)
print("Min num of Adsystem: ",min_value)
print("Mean num of Adsystem: ",avg_value)
