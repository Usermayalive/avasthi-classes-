const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = '/Users/manasvyas/Desktop/avasthi/server/uploads/pdfFile-1785157412074-599382535.pdf';
const dataBuffer = fs.readFileSync(path);
pdfParse(dataBuffer).then(function(data) {
    console.log("Pages:", data.numpages);
    console.log("Info:", data.info);
    console.log("Text length:", data.text.length);
    console.log("Trimmed text length:", data.text.trim().length);
    console.log("Text sample:", data.text.trim().substring(0, 500));
}).catch(console.error);
