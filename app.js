

var http = require('https');
var cheerio = require('cheerio');
var clc = require('cli-color');
var xcolor = require('xcolor');

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
  	//console.log

  });
}

http.request(options, callback).end();


var parsePage = function(data){
	var $ = cheerio.load(data);
	var items = [];
    $('td.title > a').each(function(k,v){
    	var $this = $(this);
    	if ($this.text().toLowerCase() === 'more') return;
    	var item = {
    		title: $this.text(),
    		href: $this.attr('href'),
    		points: $this.parent('td').parent('tr').next('tr').children('td:nth-child(2)').children('span').html()
    	};
    	//items.push(item);

    	display(item)
    });
};

var display = function(item){

	xcolor.log('{{bg #FFFFFF}}{{#000000}}' + item.title)
}