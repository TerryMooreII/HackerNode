

var http = require('https');
var cheerio = require('cheerio');
var xcolor = require('xcolor');
var _ = require('underscore');
var readline = require('readline');
var exec = require('child_process').exec;

var title = '  Hacker News';
var menu = '    [F] Front Page   [N] Newest   [#] Open News in Browser'

var terminalWidth = process.stdout.getWindowSize()[0];
var host = 'news.ycombinator.com';

var getHackerNews = function(page){
    
    var options = {
        host: host,
        path: '/' + page,
        port: 443
    };

    callback = function(response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var items = parsePage(str);
            
            if (items.length === 0) process.exit();
            
            displayHeader(title);

            _.each(items, function(item){
                display(item);
            });
            getInput(items);            
        });
    }

    http.request(options, callback).end();
};


var parsePage = function(data){
	var $ = cheerio.load(data);
	var items = [];
    $('td.title > a').each(function(k,v){
    	var $this = $(this);
    	if ($this.text().toLowerCase() === 'more') return;
    	var item = {
            id: k<9 ? (" " + (k+1) + ". ") : ((k+1) + ". "),
    		title: $this.text() || '',
    		href: $this.attr('href') || '',
    		points: $this.parent('td').parent('tr').next('tr').children('td:nth-child(2)').children('span').html() || "0 points"
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
}

var rowSpace = function(size){
    var s = "";
    for (var i=0; i<size; i++)
        s += " "
    
    return s;
}

var displayHeader = function(title){
    xcolor.log('{{bg #ff6600}}{{#000000}}' + title + menu + rowSpace(terminalWidth - title.length - menu.length ));
}

var display = function(item){
    xcolor.log('{{bg #FFFFFF}}{{#000000}}' + item.id + item.title + rowSpace(rowWidth(item)) + '(' + item.points + ')' );
}

var clearScreen = function(){
    var cmd = 'clear';
    if (!!process.platform.match(/^win/))
        cmd = 'cls';

    exec(cmd,  function (error, stdout, stderr) {
        console.log(stdout)
        if (error !== null) {
          console.log('exec error: ' + error);
          process.exit();
        }
    });
}


var openUrl = function(url){
    var cmd = 'xdg-open';
    if (!!process.platform.match(/^win/))
        cmd = 'start';

    exec(cmd + ' ' + url,  function (error, stdout, stderr) {
        //console.log(stdout)
        if (error !== null) {
          console.log('exec error: ' + error);
          process.exit();
        }
    });
}


var getInput = function(items){
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Command> ", function(cmd) {
        
        if (isNaN(cmd)){
            var page = doCommand(cmd);
            go(page);
            rl.close();                    
        }else{
            if (cmd > 0 && cmd <= items.length){
                openUrl(items[cmd - 1].href);    
            }

            console.log('Invalid Command');
            
            setTimeout(function(){
                go('news');
                rl.close();    
            }, 500)
            
        }
    });
}

var doCommand = function(cmd){
    switch(cmd){
        case "n":
        case "N":
            return "newest";
            break;
        case "q":
        case "Q":
            process.exit();
            break;
        default:
            return "news"
            break;
    }   
}

var go = function(page){
    
    clearScreen();
    getHackerNews(page);
    
}

go('news');


