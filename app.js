

var http = require('https');
var cheerio = require('cheerio');
var clc = require('cli-color');
var xcolor = require('xcolor');

var keypress = require('keypress');
var title = 'Hacker News';

var terminalWidth = process.stdout.getWindowSize()[0]
// make `process.stdin` begin emitting "keypress" events
//keypress(process.stdin);

// listen for the "keypress" event
// process.stdin.on('keypress', function (ch, key) {
//   console.log('got "keypress"', key);
//   if (key && key.ctrl && key.name == 'c') {
//     process.stdin.pause();
//   }
// });

//process.stdin.setRawMode(true);
//process.stdin.resume();
  
var options = {
  host: 'news.ycombinator.com',
  path: '/news',
  port: 443
};

callback = function(response) {
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
  	parsePage(str);
  });
}

http.request(options, callback).end();

var parsePage = function(data){
	var $ = cheerio.load(data);
	var items = [];
    header(title)
    $('td.title > a').each(function(k,v){
    	var $this = $(this);
    	if ($this.text().toLowerCase() === 'more') return;
    	var item = {
            id: k<10 ? (" " + k + ". ") : (k + ". "),
    		title: $this.text() || '',
    		href: $this.attr('href') || '',
    		points: $this.parent('td').parent('tr').next('tr').children('td:nth-child(2)').children('span').html() || "0 points"
    	};
    	//items.push(item);

    	display(item)
    });
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

var header = function(title){
  xcolor.log('{{bg #ff6600}}{{#000000}}' + title + rowSpace(terminalWidth - title.length ));
}
var display = function(item){
	xcolor.log('{{bg #FFFFFF}}{{#000000}}' + item.id + item.title + rowSpace(rowWidth(item)) + '(' + item.points + ')' );
}

