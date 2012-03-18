#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var request = require('request');
var Iconv = require('iconv').Iconv;

var doamin_regex = new RegExp('://([^/]+)[/$]?');
var iconv = {
    'sjis' : new Iconv('CP943', 'UTF-8//TRANSLIT//IGNORE'),
    'euc-jp' : new Iconv('EUC-JP', 'UTF-8//TRANSLIT//IGNORE')
};

var max_proc = 0;
var proc_cnt = 0;

function set_max_proc (n) {
    max_proc = n;
}

function request_wrap (options, callback) {
    var lock_link = null;
    if (options.lock) {
        try {
            lock_link = path.join(__dirname, '..', 'lock', doamin_regex.exec(options.uri)[1]);
            fs.symlinkSync('/dummy', lock_link);
            if (options.lock <= 0) {
                setTimeout(function () {
                    fs.unlinkSync(lock_link);
                }, options.lock * -1);
            }
        }
        catch (err) {
            if (err.message.indexOf('EEXIST') > -1) return setTimeout(request_wrap, 1000, options, callback);
            return callback(err, null, null);
        }
    }
    if (max_proc != 0) {
        if (proc_cnt >= max_proc) return setTimeout(request_wrap, 0, options, callback);
        proc_cnt = proc_cnt + 1;
    }
    var encoding = options.encoding || 'utf8';
    if (options.encoding) options.encoding = null;
    request(options, function (err, res, data) {
        if (options.lock > 0 && lock_link) {
            setTimeout(function () {
                try { fs.unlinkSync(lock_link); } catch (err) { console.log(err); }
            }, options.lock);
        }
        if (max_proc != 0) proc_cnt = proc_cnt - 1;
        var content = null;
        if (data) content = (encoding == 'utf8') ? data.toString() : iconv[encoding].convert(data).toString();
        if (options.debug == true) {
            if (res && res.request && !res.request.body) res.request.body = '';
            try {
                console.log({
                    'Request URL' : res.request.uri.href,
                    'Request Method': res.request.method,
                    'Status Code': res.statusCode,
                    'Request Headers': res.request.headers,
                    'Form Data': res.request.body.toString('utf8'),
                    'Response Headers': res.headers
                });
            } catch (err) {
                console.error(err.stack);
            }
        }
        callback(err, res, content);
    });
}

exports.max_proc = set_max_proc;
exports.request = request_wrap;
