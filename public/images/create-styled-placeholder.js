const { createCanvas } = require('canvas');
const fs = require('fs');

function createStyledPlaceholder(filename, width, height, title, subtitle) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  
  // Title text
  ctx.fillStyle = '#999999';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, height / 2 - 20);
  
  // Subtitle text
  ctx.font = '16px Arial';
  ctx.fillText(subtitle, width / 2, height / 2 + 20);
  
  // Write to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

try {
  createStyledPlaceholder(
    'public/images/product-placeholder.png', 
    400, 
    500, 
    'Product Image', 
    'Rich Habits'
  );
  
  createStyledPlaceholder(
    'public/images/placeholder-design.png', 
    400, 
    300, 
    'Design Image', 
    'Rich Habits'
  );
} catch (err) {
  console.error('Error creating styled placeholders:', err);
  
  // Fallback to simple transparent images if canvas fails
  console.log('Using fallback transparent placeholders instead');
}
