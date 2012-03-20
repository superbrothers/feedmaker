#!/usr/local/bin/node

var util = require('util');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var crypto = require('crypto');
var async = require("async");

var scrape = require(path.join('..', 'lib', 'scrape.js'));
var regex = require(path.join('..', 'lib', 'regex.js'));

var config = fs.readFileSync(path.join(__dirname, '..', 'conf', 'config'));
var access_token = new RegExp('ACCESS_TOKEN="([^"]+)"').exec(config)[1];
var title = path.basename(process.argv[2]);
var content;

try {
    content = fs.readFileSync(process.argv[3], 'utf8');
}
catch (err) {
    console.log(err);
    process.exit(1);
}

scrape.request({uri:"https://api.github.com/gists?access_token=" + access_token + '&per_page=1000'}, function (err, res, data) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    var gists = JSON.parse(data);
    var gist_id = null;
    gists.forEach(function (gist) {
        if (gist.public === true) return;
        if (gist.description !== title) return;
        gist_id = gist.id;
    });
    gist_upload(gist_id);
});

function gist_upload (gist_id) {
    var body = JSON.stringify({
        description: title,
        public: false,
        files: {
            'feed.xml': {
                content: content+''
            }
        }
    });
    console.log('https://api.github.com/gists' + ((gist_id) ? '/' + gist_id : '') + '?access_token=' + access_token);
    scrape.request({
        method: (gist_id) ? 'PATCH' : 'POST',
        uri: 'https://api.github.com/gists' + ((gist_id) ? '/' + gist_id : '') + '?access_token=' + access_token,
        body: body,
        headers: {
            'Content-Type': 'application/json',
        }
    }, function (err, res, data) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
    });
}
