
## Présentation (Fr)

Outil de crawl des informations Sellers.json.  Outil utilisé pour le développement de la visualisation [publiée sur le site LINC](https://linc.cnil.fr/webpub-adstxt-sellersjson/sellers_study.html)

## License
Le code d'origine du crawler pour Ads.txt [a été publié](https://github.com/InteractiveAdvertisingBureau/adstxtcrawler) sous licence BSD 2-clause, par Neal Richter. Le code à substantiellement évolué, mais la licence d'origine est maintenue, et est compatible avec la [licence ouverte 2.0](../../LICENSE.md).


## Exemple d'usage

Initialisation de la base SQlite:

``` bash
sh reinit.sh
```
Lancement du crawl :
```
python3 crawlsellers.py -t data/sellerlist.json -d sellersjs.db

Options:
  -h, --help            show this help message and exit
  -t FILE, --targets=FILE
                        list of domains to start crawling the sellers.json from. Use json file generated from tools (exemple in data/)
  -d FILE, --database=FILE
                        Database to dump crawlered data into. Use sellersjs.db
```


# Presentation (En)

Crawling tool for the Sellers.json files. Used to develop the visualization [available on the LINC website](https://linc.cnil.fr/webpub-adstxt-sellersjson/en/sellers_study.html)

## License
The original crawler code for Ads.txt [has been published](https://github.com/InteractiveAdvertisingBureau/adstxtcrawler) under a BSD 2-clause license buy Neal Richter. The code has been substantially modified, but the original license is maintained, and is compatible with the [open license 2.0](../../LICENSE.md).

## Usage

Initialization of the SQlite database:

``` bash
sh reinit.sh
```
Crawl launch :

```
python3 crawlsellers.py -t data/sellerlist.json -d sellersjs.db

Options:
  -h, --help            show this help message and exit
  -t FILE, --targets=FILE
                        list of domains to start crawling the sellers.json from. Use json file generated from tools (exemple in data/)
  -d FILE, --database=FILE
                        Database to dump crawlered data into. Use sellersjs.db
```
