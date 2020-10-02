#!/usr/bin/env python
import sys
import csv
import sqlite3
import collections
from optparse import OptionParser
from urllib.parse import urlparse


conn = sqlite3.connect("adstxt.db")
with open('data/adserver.csv', 'rt', encoding= "ascii") as csvfile:
    reader = csv.reader(csvfile, delimiter=';', quotechar='|')
    for row in reader:
        c = conn.cursor()
        url=str(row[0])
        domain= str(row[1]) or url
        print(url,domain)
        c.execute("INSERT OR IGNORE INTO adsystem (DOMAIN) VALUES (?);", (domain,))
        c.execute("SELECT ID from adsystem WHERE DOMAIN = (?);",(domain,))
        result = c.fetchone()
        id=result[0]
        c.execute("INSERT OR IGNORE INTO adsystem_domain (URL,ID) VALUES (?,?);", (url,id,))
        conn.commit()

conn.close()
