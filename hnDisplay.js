var xcolor = require('xcolor');
var readline = require('readline');
var exec = require('child_process').exec;

var terminalWidth = process.stdout.getWindowSize()[0];
var logo = '[Y]';
var title = ' Hacker News';
var menu = '    [F]ront Page   [N]ewest   [A]sk   [J]obs   [#] Open News in Browser   [Q]uit';


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

exports.display = function(items){
    
    if (items.length === 0) process.exit();
     
    displayHeader(title);
   
    items.forEach(function(item){
        displayRow(item);
    });
   
};

exports.clearScreen = function(callback){
    var cmd = 'clear';
    if (!!process.platform.match(/^win/))
        cmd = 'cls';

    exec(cmd,  function (error, stdout, stderr) {
        console.log(stdout);
        callback()
        if (error) {
          callback('exec error: ' + error);
          process.exit(1);
        }
    });
};


exports.getInput = function(items, callback){
    var uri; 
    
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('HN> ', function(cmd) {
        
        if (isNaN(cmd)){
            uri = getPageUri(cmd);
            callback(uri)
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
                callback(uri)
                rl.close();
            }, timeout);
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

var getPageUri = function(cmd){
    switch(cmd){
        case 'n':
        case 'N':
            return 'newest';
        case 'a':
        case 'A':
            return 'ask';
        case 'j':
        case 'J':
            return 'jobs';
        case 'y':
        case 'Y':
            return 'news';  //this should return current uri.
        case 'q':
        case 'Q':
            process.exit();
            break;
        default:
            return 'news';
    }
};