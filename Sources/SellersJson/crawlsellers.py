#!/usr/bin/env python
import sys
import json
import ssl
import csv
import socket
import sqlite3
import logging
import collections
from optparse import OptionParser
from urllib.parse import urlparse
import http
import urllib
import validators
import unicodedata
import requests
import tldextract
from io import BytesIO
import gzip

def insert_seller_to_db(conn, domain, type):
    c = conn.cursor()
    c.execute("SELECT rowid,type  FROM ACTORS WHERE DOMAIN=(?);", (domain,))
    data=c.fetchone()
    if data is None:
        c.execute("INSERT OR IGNORE INTO ACTORS (DOMAIN, TYPE) VALUES (?,?);", (domain,type,))
        conn.commit()
        return True
    else:
        if((type=="BOTH" or type=="INTERMEDIARY") and data[1]=="PUBLISHER"):
            c.execute("UPDATE ACTORS SET type=(?) WHERE DOMAIN=(?);", ("BOTH",domain,))
            conn.commit()
            return True
        else:
            conn.commit()
            return False

def insert_link(conn, domainfrom, domainto):
    c = conn.cursor()
    c.execute("INSERT OR IGNORE INTO RELATION (ACTOR_FROM, ACTOR_TO) VALUES (?,?);", (domainfrom,domainto,))
    conn.commit()
    return True

def normalize_url(url):
    try:
        cleanurl=url.lower()
        cleanurl=tldextract.extract(cleanurl)
        return cleanurl.domain+"."+cleanurl.suffix
    except:
        return url

def crawl_actor(conn,crawled_url):
    ssl._create_default_https_context = ssl._create_unverified_context
    seller_json_url = 'http://{thehost}/sellers.json'.format(thehost=crawled_url)
    print(seller_json_url)
    try:
        req = urllib.request.Request(seller_json_url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/74.0')
        req.add_header('Accept','application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
        response = urllib.request.urlopen(req,timeout=40)
        try:
            data=response.read()
            if response.info().get('Content-Encoding') == 'gzip':
                buf = BytesIO(data)
                f = gzip.GzipFile(fileobj=buf)
                data = f.read()
            data = json.loads(data.decode(response.info().get_param('charset') or 'utf-8'))
            seller_list={}
            try:
                seller_list=data['sellers']
            except TypeError:
                seller_list=data[0]['sellers']
            for seller in seller_list:
                try:
                    domain=seller['domain']
                    type=seller['seller_type'].upper()
                    domain=normalize_url(domain)
                    if type=="INTERMEDIARY" or type=="BOTH" or type=="PUBLISHER":
                        new_actor = insert_seller_to_db(conn,domain,type)
                        insert_link(conn,domain,crawled_url)
                        if (type=="INTERMEDIARY" or type=="BOTH") and  new_actor :
                            crawl_actor(conn,domain)
                except KeyError:
                    #Not a website
                    pass
        except (json.decoder.JSONDecodeError,UnicodeDecodeError) :
            pass
    except Exception  as err:
        print(err)
    except urllib2.URLError as err:
	    print("timeout")

def crawl_to_db(conn, crawl_url_queue):
    for aurl in crawl_url_queue:
        ahost = str(crawl_url_queue[aurl][0])
        arank = int(crawl_url_queue[aurl][1])
        if insert_seller_to_db(conn,ahost, "INTERMEDIARY"):
            print(ahost)
            crawl_actor(conn,ahost)
    return True

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
                sellersjs_url = 'http://{thehost}/sellers.json'.format(thehost=host)
                logging.info("  pushing %s" % sellersjs_url)
                url_queue[sellersjs_url] = [host,key]
                cnt = cnt + 1
            else:
                print("host %s not found" %host)
    return cnt

arg_parser = OptionParser()
arg_parser.add_option("-t", "--targets", dest="target_filename",
                  help="list of domains to crawl sellersjs from", metavar="FILE")
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
