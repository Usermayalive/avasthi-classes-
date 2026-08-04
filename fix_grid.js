const fs = require('fs');
const file = '/Users/manasvyas/Desktop/avasthi/client/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace specific inline grids with classes
content = content.replace(/style={{ display: 'grid', gridTemplateColumns: '260px 1fr'/g, 'className="dashboard-layout" style={{ display: \'grid\'');
content = content.replace(/style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr'/g, 'className="course-detail-layout" style={{ display: \'grid\'');
content = content.replace(/style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr'/g, 'className="pricing-layout" style={{ display: \'grid\'');
content = content.replace(/style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr'/g, 'className="grid-3col" style={{ display: \'grid\'');
content = content.replace(/style={{ display: 'grid', gridTemplateColumns: '1fr 1fr'/g, 'className="grid-2col" style={{ display: \'grid\'');
content = content.replace(/style={{ display: 'grid', gridTemplateColumns: 'repeat\\(4, 1fr\\)'/g, 'className="grid-4col" style={{ display: \'grid\'');

fs.writeFileSync(file, content);
console.log("Replaced grids!");
