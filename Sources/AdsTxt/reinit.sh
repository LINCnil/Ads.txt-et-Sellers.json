#!/bin/sh
set -x
sqlite3 adstxt.db < adstxt_crawler.sql
rm adstxt_crawler.log
python3 load_ad_systemDB.py
