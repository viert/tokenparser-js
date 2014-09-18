var Tokenparser = require('./index');

var parser = new Tokenparser();

var testString = '[28/Jun/2013 12:54:48] example.com "GET /some/url HTTP/1.0" "Mozilla" "_session=3829834;" 28.314\n';
parser.skip('[');
parser.upTo(' ', 'date');
parser.skip(' ');
parser.upTo(']', 'time');
parser.skipMultiple(2);
parser.upTo(' ', 'vhost');
parser.skip(' ');
parser.skipAny();
parser.upTo(' ', 'method');

var count = 1000000;
var t1 = new Date() / 1000;
for (var i = 0; i < count; ++i) {
    parser.parseLine(testString);
}
var t2 = new Date() / 1000;
var elapsed = t2 - t1;
console.log(count + " lines parsed in " + elapsed + " seconds");
console.log(Math.round(elapsed / count * 1000000000) + "ns/op");