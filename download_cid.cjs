const https = require('https');
const fs = require('fs');

const url = "https://raw.githubusercontent.com/supliu/cid10-json/master/cid10.json";
const outputFile = "public/cid10.json";

console.log(`Downloading CID-10 from ${url}...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const jsonData = JSON.parse(data);
        fs.writeFileSync(outputFile, JSON.stringify(jsonData), 'utf8');
        console.log(`Successfully saved ${jsonData.length} CID records to ${outputFile}`);
    });

}).on('error', (err) => {
    console.error(`Error downloading: ${err.message}`);
});
