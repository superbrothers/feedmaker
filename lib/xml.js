// 数値の前に"0"を追加して桁を合わせる
function fillZero(n) {
    return n < 10 ? "0" + n : n;
}

function iso8601(date) {
    return [
        date.getUTCFullYear() + "-",
        fillZero(date.getUTCMonth() + 1) + "-",
        fillZero(date.getUTCDate()) + "T",
        fillZero(date.getUTCHours()) + ":",
        fillZero(date.getUTCMinutes()) + ":",
        fillZero(date.getUTCSeconds()) + "+09:00"
    ].join("");
}

module.exports = function generateXML(title, res) {
    var xml = [];

    xml.push("<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns=\"http://purl.org/rss/1.0/\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:content=\"http://purl.org/rss/1.0/modules/content/\" xmlns:cc=\"http://web.resource.org/cc/\" xml:lang=\"ja\">");
    xml.push("<channel rdf:about=\"https://github.com/Ajido/\">");
    xml.push("<title>" + title + "</title>");
    xml.push("<link>https://github.com/Ajido/</link>");
    xml.push("<description></description>");
    xml.push("<dc:language>ja</dc:language>");
    xml.push("<items>");
    xml.push("<rdf:Seq>");
    res.forEach(function (item) {
        xml.push("<rdf:li rdf:resource=\"" + item.link + "\"/>");
    });
    xml.push("</rdf:Seq>");
    xml.push("</items>");
    xml.push("</channel>");
    res.forEach(function (item) {
        xml.push("<item rdf:about=\"" + item.link + "\">");
        xml.push("<link>" + item.link + "</link>");
        xml.push("<title>" + item.title + "</title>");
        xml.push("<description>");
        xml.push("</description>");
        xml.push("<content:encoded>");
        xml.push("<![CDATA[" + item.content + "]]>");
        xml.push("</content:encoded>");
        xml.push("<dc:subject>2ch</dc:subject>");
        xml.push("<dc:date>" + iso8601(item.date) + "</dc:date>");
        xml.push("<dc:creator>Ajido</dc:creator>");
        xml.push("<dc:publisher>GitHub</dc:publisher>");
        xml.push("</item>");
    });
    xml.push("</rdf:RDF>");

    return xml.join("");
}
/* vim: set ts=4 sts=4 sw=4: */
