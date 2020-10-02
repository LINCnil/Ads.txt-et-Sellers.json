# Présentation (Fr)

Outil de crawl des informations Ads.txt.  Outil utilisé pour le développement de la visualisation [publiée sur le site LINC](https://linc.cnil.fr/webpub-adstxt-sellersjson/ads_study.html)

## License
Le code d'origine du crawler pour Ads.txt [a été publié](https://github.com/InteractiveAdvertisingBureau/adstxtcrawler) sous licence BSD 2-clause, par Neal Richter. Le code à substantiellement évolué, mais la licence d'origine est maintenue, et est compatible avec la [licence ouverte 2.0](../../LICENSE.md).

## Exemple d'usage

Initialisation de la base SQlite:

``` bash
sh reinit.sh
```
Lancement du crawl :

```
python3 adstxt_crawler.py -t data/top_alexa50fr.json -d adstxt.db

Options:
  -t FILE, --targets=FILE
                        list of domains to crawler ads.txt from. Use json file generated from tools (example in data/)
  -d FILE, --database=FILE
                        Database to dump crawled data into. Use adstxt.db
```
Il n'est malheureusement pas possible de mettre à disposition la liste des 5000 sites les plus consultés selon Alexa.
Si vous disposez d'un compte AWS vous pouvez la télécharger depuis la console, ou bien essayer avec la liste de 50 sites les plus consultés, qui est disponible gratuitement (et dans le dossier sous /data).

Pour cette même raison il n'est pas possible de diffuser la base de données en elle-même, celle-ci permettant d'accéder à cette liste.

## Processus de mise à jour des HostName des systèmes publicitaires

* Pour faciliter le processus, un fichier CSV est utilisé pour conserver la liste de correspondance des sociétés et de leurs domaines.
* Il est disponible sous data/adserver.csv pour être chargé lors de l'initialisation de la base.

# Presentation (En)

Crawling tool for the Ads.txt files. Used to develop the visualization [available on the LINC website](https://linc.cnil.fr/webpub-adstxt-sellersjson/en/ads_study.html)

## License
The original crawler code for Ads.txt [has been published](https://github.com/InteractiveAdvertisingBureau/adstxtcrawler) under a BSD 2-clause license buy Neal Richter. The code has been substantially modified, but the original license is maintained, and is compatible with the [open license 2.0](../../LICENSE.md).

## Usage

Initialization of the SQlite database:

``` bash
sh reinit.sh
```
Crawl launch :

```
python3 adstxt_crawler.py -t data/top_alexa50fr.json -d adstxt.db

Options:
  -t FILE, --targets=FILE
                        list of domains to crawler ads.txt from. Use json file generated from tools (example in data/)
  -d FILE, --database=FILE
                        Database to dump crawled data into. Use adstxt.db
```
It is unfortunately impossible to include in this folder the Alexa top 5000 French list.
If you have an AWS account, it is available to download through the AWS services. You can also try the code with the top 50, which is freely available and included in this folder (under /data).

For the same reason, the past months database is not available, as the Alexa top list can be found inside it.

## Process for the Ad systems HostName update

* To make the process easier, the mapping between companies and their hostnames is kept in CSV file.
* It is available under data/adserver.csv to be loaded during the database initialization.
