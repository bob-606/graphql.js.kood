import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

const type = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
};

const server = createServer((req, res) => {
  const filePath = req.url === '/' ? './index.html' : `.${req.url}`;
  const ext = extname(filePath).toLowerCase();
  const contentType = type[ext] || 'application/octet-stream';

  try {
    const data = readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data, 'utf-8');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error reading ${filePath}`);
  }
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});
