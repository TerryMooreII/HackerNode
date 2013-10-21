
'use strict';

var async       = require('async');
var hnService   = require("./hnService");
var hnDisplay   = require("./hnDisplay")

var uri = 'news';

var go = function(uri){
    
    async.waterfall([
        function(callback){
            hnDisplay.clearScreen(function(){
                callback();
            });
        },
        function(callback){
            hnService.getHackerNews(uri, function(news){
                callback(null, news);
            });
        },
        function(news, callback){
            hnDisplay.display(news);
            callback();
        },
        function(news, callback){
            hnDisplay.getInput(news, function(uri){
                go(uri);
                //callback();
            });
        }
    ], function(err){
        if (err)
            console.log('Something when wrong....');       
    });
};

go(uri);
