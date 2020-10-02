import sqlite3
conn = sqlite3.connect("adstxt.db")
import csv

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
with conn:
    c = conn.cursor()
    c.execute('SELECT * FROM adstxt')
    table = c.fetchall()
    for row in table:
        c.execute("SELECT DOMAIN from adsystem INNER JOIN adsystem_domain ON adsystem_domain.ID = adsystem.ID WHERE adsystem_domain.URL  = (?);",(row[2],))
        try:
            adexchange=c.fetchone()[0]
            c.execute("INSERT OR IGNORE INTO cleanadstxt (SITE_DOMAIN,SITE_RANK,ADSYSTEM_DOMAIN) VALUES (?,?,?);", (row[0],row[1],adexchange))
        except TypeError: #SEEMS LIKE THE DOMAIN IS UNKNOWN
            print("WARNING: UNKNOWN DOMAIN %s PLEASE ADD TO THE EXCEL FILE" % row[2])
    conn.commit()
