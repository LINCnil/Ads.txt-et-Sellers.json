var links = [
              "yahoo.com",
              "live.com",
              "leboncoin.fr",
              "orange.fr",
              "reddit.com",
              "vk.com",
              "ebay.fr",
              "twitch.tv"]
function openAdstxt() {
    var randIdx = Math.random() * links.length;
    randIdx = parseInt(randIdx, 10);
    var link = 'http://' + links[randIdx]+'/ads.txt';
    var win = window.open(link, '_blank');
     win.focus();
    };
