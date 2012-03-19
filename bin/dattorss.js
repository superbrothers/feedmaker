#!/usr/local/bin/node

var util = require('util');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var crypto = require('crypto');

var scrape = require(path.join('..', 'lib', 'scrape.js'));
var regex = require(path.join('..', 'lib', 'regex.js'));
var async = require(path.join('..', 'lib', 'async', 'lib', 'async.js'));
var generateXML = require(path.join('..', 'lib', 'xml.js');
var res = [];

function parse_res (thread, uri, item) {
    var date_str = regex(/([0-9]{4}\/[0-9]{2}\/[0-9]{2})[^0-9]+([0-9]{2}:[0-9]{2}:[0-9]{2})/g, item, {concat:'$1 $2', limit:1});
    var date = new Date(date_str);
    var mailto = regex(/<a href="mailto[^"]+"><b>([^<]+)<\/b><\/a>/g, item, {concat:'$1', limit:1});
    var time = regex(/[0-9]{4}\/([0-9]{2}\/[0-9]{2})[^0-9]+([0-9]{2}:[0-9]{2}):[0-9]{2}/g, item, {concat:'$1 $2', limit:1});
    var ids = regex(/ID:([^<]+)<dd>/g, item, {concat:'$1', limit:1});
    var body = regex(/ID:[^<]+<dd>(.*?)$/g, item, {concat:'$1', limit:1});
    var title = body.replace(/<[^>]+>/g, '').replace(/[ 　]/g, '').slice(0, 30);
    var num = +(regex(/([0-9]+)/g, item, {concat:'$1', limit:1}));
    return {date:+date, mailto:mailto, ids:ids, date_str:date, num:num, thread:thread, title:title, time:time, body:body, link:uri+'/'+num};
}

function attach_css (item, anc) {
    var html = "";
    if (anc === false) {
        html += "<dt><span style=\"color:#696969\"><strong>"+item.thread+"</strong></span></dt><br />";
    }
    html += "<dt><span style=\"color:#4169e1\"><strong>"+item.num+"</strong></span>: ";
    html += "<span style=\"color:#008000\"><strong>"+item.mailto+"</strong></span>: ";
    html += item.time+": <span style=\"color:#696969\"><strong>"+item.ids+"</strong></span>";
    html += "<dd>" + item.body + "</dd>";
    if (anc === false) {
        html += item.anc_html;
    }
    return html;
}

function attach_anc (html) {
    return "<div style=\"border-radius: 5px; border: 1px solid #CCC; padding:10px 10px 10px 10px; margin-bottom:10px;\">" + html + "</div>";
}

function unique (array) {
    var storage = {};
    var uniqueArray = [];
    var i,value;
    for ( i=0; i<array.length; i++) {
        value = array[i];
        if (!(value in storage)) {
            storage[value] = true;
            uniqueArray.push(value);
        }
    }
    return uniqueArray;
}

function search_anc (res_json, res_ary) {
    if (res_json.num < 2) return "";
    var anc_html = "";
    var anc_ary = regex(/&gt;&gt;([0-9]{1,3})/g, res_json.body, {concat:'$1', limit:10});
    anc_ary = unique(anc_ary);
    anc_ary.forEach(function (i) {
        if (i === '1' || +i === 1) return;
        res_ary.forEach(function (item) {
            if (item.indexOf("<dt>"+i+" ：") !== 0) return;
            var obj = parse_res("", "", item);
            var cssed = attach_css(obj, true);
            anc_html += attach_anc(cssed);
        });
    });
    return anc_html;
}

var queue = async.queue(function (task, callback) {
    scrape.request({uri:task.uri, encoding:'sjis'}, function (err, status, data) {
        var thread = regex(/<title>([^<]+)<\/title>/g, data, {concat:'$1', limit:1});
        var res_ary = data.split('\n');
        if (!res_ary) res_ary = [];
        res_ary.forEach(function (item) {
            if (item.indexOf('<a href="mailto:') == -1) return;
            var json = parse_res(thread, task.uri, item);
            if (json) {
                json.anc_html = search_anc(json, res_ary);
                json.content = attach_css(json, false);
                res.push(json);
            }
        });
        setTimeout(function () {
            callback();
        }, 3000);
    });
}, 1);

function zP(val) {
    vS = val.toString(16) ;
    tmpS = ("00" + vS).slice(-2) ;
    return tmpS ;
}

queue.drain = function() {
    res.sort(function (a, b) { return a.date > b.date ? -1 : 1; });
    var xml = generateXML(process.argv[2], res, attach_css);
    console.log(xml);
}

process.argv.splice(3, process.argv.length-3).forEach(function (uri) {
    console.error(uri);
    queue.push({uri:uri}, function (err) {
        return;
    });
});

/* vim: set ts=4 sts=4 sw=4: */
