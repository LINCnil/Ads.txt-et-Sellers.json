#!/usr/bin/env python
import sys
import json
import csv
import socket
import sqlite3
import logging
import collections
from optparse import OptionParser
from urllib.parse import urlparse
import validators
import unicodedata
import requests

def process_row_to_db(conn, data_row, comment, hostname,rank):
    insert_stmt = "INSERT OR IGNORE INTO adstxt (SITE_DOMAIN, SITE_RANK,  EXCHANGE_DOMAIN, SELLER_ACCOUNT_ID, ACCOUNT_TYPE, TAG_ID, ENTRY_COMMENT) VALUES (?,?, ?, ?, ?, ?, ? );"
    exchange_host     = ''
    seller_account_id = ''
    account_type      = ''
    tag_id            = ''
    if len(data_row) >= 3:
        exchange_host     = data_row[0].lower()
        seller_account_id = data_row[1].lower()
        account_type      = data_row[2].lower()

    if len(data_row) == 4:
        tag_id            = data_row[3].lower()
    data_valid = 1;
    if(len(hostname) < 3):
        data_valid = 0
    if(not validators.url("http://"+exchange_host)):
        data_valid = 0
    if(len(seller_account_id) < 1):
        data_valid = 0
    if(len(account_type) < 6):
        data_valid = 0
    if(data_valid > 0):
        c = conn.cursor()
        c.execute(insert_stmt, (hostname, rank, exchange_host, seller_account_id, account_type, tag_id, comment))
        conn.commit()
        return 1
    return 0

def crawl_to_db(conn, crawl_url_queue):
    hosts_using_adstxt=0
    hosts_not_using_adtstxt=0
    myheaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/74.0',
            'Accept': 'text/plain',
            'Accept-encoding': 'gzip;q=0,deflate,sdch'
        }
    for aurl in crawl_url_queue:
        ahost = str(crawl_url_queue[aurl][0])
        arank = int(crawl_url_queue[aurl][1])
        rowcnt = 0
        print(" Crawling  %s : %s " % (aurl, ahost))
        try:
            r = requests.get(aurl, headers=myheaders,timeout=10)
            logging.info("  %d" % r.status_code)
        except:
            r = collections.namedtuple("response","status_code")(404)
        if(r.status_code == 200):
            logging.debug("-------------")
            logging.debug(r.request.headers)
            logging.debug("-------------")
            logging.debug("%s" % r.text)
            logging.debug("-------------")
            tmpfile = 'tmpads.txt'
            try:
                with open(tmpfile, 'wt', encoding='utf-8') as tmp_csv_file:
                    tmp_csv_file.write( r.text)
                    tmp_csv_file.close()

                with open(tmpfile, 'rt') as tmp_csv_file:
                    line_reader = csv.reader(tmp_csv_file, delimiter='#', quotechar='|')
                    comment = ''
                    try:
                        for line in line_reader:
                            try:
                                data_line = line[0]
                            except:
                                data_line = "";
                            if data_line.find(",") != -1:
                                data_delimiter = ','
                            elif data_line.find("\t") != -1:
                                data_delimiter = '\t'
                            else:
                                data_delimiter = ' '

                            data_reader = csv.reader([data_line], delimiter=',', quotechar='|')
                            for row in data_reader:
                                if len(row) > 0 and row[0].startswith( '#' ):
                                    continue
                                if (len(line) > 1) and (len(line[1]) > 0):
                                     comment = line[1]
                                rowcnt = rowcnt + process_row_to_db(conn, row, comment, ahost, arank)
                    except csv.Error:
                        rowcnt=0
                    if(rowcnt>0):
                        hosts_using_adstxt+=1
                    else:
                        hosts_not_using_adtstxt+=1
                        print("No Ads file")
            except (UnicodeEncodeError, PermissionError) as e:
                print(e)
                print("failure to parse %s" %aurl)
                hosts_not_using_adtstxt+=1
        else:
            print("no record for %s" %aurl)
            hosts_not_using_adtstxt+=1
    print("total host %s, with %s pour cents are using ads.txt" %(hosts_not_using_adtstxt+hosts_using_adstxt , 100*hosts_using_adstxt/float(hosts_not_using_adtstxt+hosts_using_adstxt)))
    return rowcnt

def load_url_queue(jsonfilename, url_queue):
    cnt = 0
    with open(jsonfilename, 'rb') as json_file:
        data = json.load(json_file)
        for key in data:
            host = data[key]
            skip = 0
            try:
                ip = socket.gethostbyname(host)
            except:
                try:
                    ip = socket.gethostbyname("www."+host)
                except:
                    skip = 1
            if(skip < 1):
                ads_txt_url = 'http://{thehost}/ads.txt'.format(thehost=host)
                logging.info("  pushing %s" % ads_txt_url)
                url_queue[ads_txt_url] = [host,key]
                cnt = cnt + 1
            else:
                print("host %s not found" %host)
    return cnt

arg_parser = OptionParser()
arg_parser.add_option("-t", "--targets", dest="target_filename",
                  help="list of domains to crawl ads.txt from", metavar="FILE")
arg_parser.add_option("-d", "--database", dest="target_database",
                  help="Database to dump crawled data into", metavar="FILE")
arg_parser.add_option("-v", "--verbose", dest="verbose", action='count',
                  help="Increase verbosity (specify multiple times for more)")

(options, args) = arg_parser.parse_args()

if len(sys.argv)==1:
    arg_parser.print_help()
    exit(1)

crawl_url_queue = {}
conn = None
cnt_urls = 0
cnt_records = 0

cnt_urls = load_url_queue(options.target_filename, crawl_url_queue)
print("found %s urls" %cnt_urls)

if (cnt_urls > 0) and options.target_database and (len(options.target_database) > 1):
    conn = sqlite3.connect(options.target_database)

with conn:
    cnt_records = crawl_to_db(conn, crawl_url_queue)
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
