const xmindToJSON = require('./lib/xmind-to-json');
const fs = require('fs');
const { filter } = require('jszip');
const parser = new xmindToJSON(fs.readFileSync('./test.xmind'));
parser.parse().then(data => {
    fs.writeFileSync('test.json', JSON.stringify(data));
});