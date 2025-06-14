import express from 'express';
import path from 'path';

const app = express();
const PORT = 3002;

const publicPath = path.resolve(process.cwd(), "public");
console.log(`Serving static files from: ${publicPath}`);

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

app.use(express.static(publicPath));

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Test logo: http://localhost:${PORT}/Cursive-Logo.webp`);
});