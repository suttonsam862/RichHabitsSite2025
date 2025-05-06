const fs = require('fs');

// Create a 1x1 pixel transparent PNG
const transparent1px = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
fs.writeFileSync('public/images/product-placeholder.png', Buffer.from(transparent1px, 'base64'));
fs.writeFileSync('public/images/placeholder-design.png', Buffer.from(transparent1px, 'base64'));

console.log('Created placeholder PNG images');
