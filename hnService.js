var http = require('https');
var cheerio = require('cheerio');

var host = 'news.ycombinator.com';
var cache = {}; //Need to impliment.  


exports.getHackerNews = function(uri, callback){
    
    var options = {
        host: host,
        path: '/' + uri,
        port: 443
    };

    var request = function(response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var items = parsePage(str, uri);
            callback(items);
        });
    };
    
    if (cache[uri] && cache[uri].data){
        callback(cache[uri].data);
    }else{
        http.request(options, request).end();
    }
};

var addToCache = function(data, uri){
    cache[uri] = {};
    cache[uri].time = new Date().getTime();
    cache[uri].data = data;
};


var parsePage = function(data, uri){
    var $ = cheerio.load(data);
    var items = [];
    $('td.title > a').each(function(k){
        var $this = $(this);
        if ($this.text().toLowerCase() === 'more') return;
        var item = {
            id: k<9 ? (' ' + (k+1) + '. ') : ((k+1) + '. '),
            title: $this.text() || '',
            href: $this.attr('href') || '',
            points: $this.parent('td').parent('tr').next('tr').children('td:nth-child(2)').children('span').html() || '0 points'
        };
        items.push(item);
    });
    addToCache(items, uri);
    return items;
};



