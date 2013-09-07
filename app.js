
'use strict';

var http = require('https');
var cheerio = require('cheerio');
var xcolor = require('xcolor');
var readline = require('readline');
var exec = require('child_process').exec;

var logo = '[Y]';
var title = ' Hacker News';
var menu = '    [F]ront Page   [N]ewest   [A]sk   [J]obs   [#] Open News in Browser   [Q]uit';

var terminalWidth = process.stdout.getWindowSize()[0];
var host = 'news.ycombinator.com';
var uri = 'news';
var cache = {}; //Need to impliment.  


var getHackerNews = function(page){
    
    var options = {
        host: host,
        path: '/' + page,
        port: 443
    };

    var callback = function(response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            display(str);
        });
    };

    http.request(options, callback).end();
};

var parsePage = function(data){
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
    return items;
};

var rowWidth = function(item){
  return terminalWidth
    - (item.id.length)
    - (item.title.length)
    - (item.points.length + 2 );
};

var rowSpace = function(size){
    var s = '';
    for (var i=0; i<size; i++)
        s += ' ';
    
    return s;
};

var displayHeader = function(title){
    var spaceLen = terminalWidth - title.length - menu.length - logo.length;
    xcolor.log('{{bg #ff6600}}{{#FFFFFF}}{{bold}}'  + logo + '{{#000000}}' + title + '{{/bold}}' +  menu +  rowSpace(spaceLen));
};

var displayRow = function(item){
    xcolor.log('{{bg #f6f6ef}}{{#000000}}' + item.id + item.title + rowSpace(rowWidth(item)) + '(' + item.points + ')' );
};

var display = function(str){
    

    var items = parsePage(str);
    if (items.length === 0) process.exit();
    
    displayHeader(title);

    items.forEach(function(item){
        displayRow(item);
    });
    
    getInput(items);
};

var clearScreen = function(){
    var cmd = 'clear';
    if (!!process.platform.match(/^win/))
        cmd = 'cls';

    exec(cmd,  function (error, stdout, stderr) {
        console.log(stdout);
        if (error !== null) {
          console.log('exec error: ' + error);
          process.exit();
        }
    });
};


var openUrl = function(url){
    var cmd = 'xdg-open';
    if (!!process.platform.match(/^win/))
        cmd = 'start';
    else if(!!process.platform.match(/^dar/))
        cmd = 'open';

    exec(cmd + ' ' + url,  function (error, stdout, stderr){
        //console.log(stdout)
        if (error !== null) {
          console.log('exec error: ' + error);
          process.exit();
        }
    });
};


var getInput = function(items){
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('HN> ', function(cmd) {
        
        if (isNaN(cmd)){
            uri = getPageUri(cmd);
            go(uri);
            rl.close();
        }else{
            var timeout = 0;
            if (cmd > 0 && cmd <= items.length){
                openUrl(items[cmd - 1].href);
            }else{
                timeout = 1000;
                console.log('Invalid Command');
            }

            setTimeout(function(){
                go(uri);
                rl.close();
            }, timeout);
        }
    });
};

var getPageUri = function(cmd){
    switch(cmd){
        case 'n':
        case 'N':
            return 'newest';
        case 'a':
        case 'A':
            return 'jobs';
        case 'j':
        case 'J':
            return 'jobs';
        case 'y':
        case 'Y':
            openUrl('https://' + host + '/news');
            return uri;
        case 'q':
        case 'Q':
            process.exit();
            break;
        default:
            return 'news';
    }
};

var go = function(uri){
    clearScreen();
    getHackerNews(uri);
};

go(uri);
