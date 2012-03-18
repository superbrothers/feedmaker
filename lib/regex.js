#!/usr/local/bin/node

function Regex (reg, str, options) {

    if (!options) options = {};
    options.limit = options.limit || 0;
    options.concat = options.concat || '$_';

    var flags = 'g';
    if (reg.ignoreCase) flags += 'i';
    if (reg.multiline) flags += 'm';
    var exp = new RegExp(reg.source, flags);

    var count = 0;
    var result = [];
    var match = null;

    while((match = exp.exec(str)) != null) {
        if (options.limit !== 0 && count >= options.limit) break;
        var template = options.concat;
        template = template.replace('$_', match[0]).replace('$1', match[1]).replace('$2', match[2]).replace('$3', match[3]);
        result.push(template);
        count++;
    }

    if (result.length == 0) result.push('');
    if (options.limit === 1) {
        return result[0]+'';
    }else {
        return result;
    }
}

module.exports = Regex;
