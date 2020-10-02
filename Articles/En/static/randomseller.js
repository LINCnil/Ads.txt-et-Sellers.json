var links_object ={ "1": "appnexus.com", "2": "rubiconproject.com", "3": "openx.com", "4": "pubmatic.com", "5": "indexexchange.com", "6": "verizonmedia.com", "7": "pulsepoint.com","8": "spotx.tv", "9": "smartadserver.fr", "10": "freewheel.com","11":"districtm.io","12":"rhythmone.com","13":"improvedigital.com","14":"gumgum.com","15":"teads.tv","16":"amazon.com","17":"adform.com","18":"emxdigital.com","19":"loopme.com","20":"beachfront.com"}
var links = Object.keys(links_object).map(function (key) { return links_object[key]; });
function openSellerjson() {
    var randIdx = Math.random() * links.length;
    randIdx = parseInt(randIdx, 10);
    var link = 'http://' + links[randIdx]+'/sellers.json';
    var win = window.open(link);
    win.focus();
    };
