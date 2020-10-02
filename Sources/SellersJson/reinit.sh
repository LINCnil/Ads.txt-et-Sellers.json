#!/bin/sh
set -x
sqlite3 sellersjs.db < sellersjs_crawler.sql
rm sellersjs_crawler.log
