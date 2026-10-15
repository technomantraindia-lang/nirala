/**
 * Nirala Engineers - Zero-Database Static Backend Server
 * Built with 100% native Node.js (Zero external dependencies)
 * 
 * Manages:
 * 1. Products Catalog   -> data/products.json
 * 2. Machine Spares     -> data/spares.json
 * 3. Media Gallery      -> data/gallery.json
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// MIME Types map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Helper: Read JSON file safely
function readJson(filename, defaultVal) {
  const filepath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filepath)) {
      return defaultVal;
    }
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultVal;
  }
}

// Helper: Write JSON file safely with atomic write
function writeJson(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  const tempPath = `${filepath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filepath);
}

// Helper: Read request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Safety limit: 20MB
      if (body.length > 20 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Helper: Send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // ==========================================
  // API ROUTING (Zero-Database JSON Backend)
  // ==========================================
  
  // Status check
  if (pathname === '/api/status' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'online',
      message: 'Nirala Static Backend is running smoothly',
      timestamp: new Date().toISOString()
    });
  }

  // 1. PRODUCTS API
  if (pathname === '/api/products') {
    if (req.method === 'GET') {
      const products = readJson('products.json', []);
      return sendJson(res, 200, products);
    }
    if (req.method === 'POST') {
      try {
        const payload = await parseRequestBody(req);
        if (!Array.isArray(payload)) {
          return sendJson(res, 400, { error: 'Payload must be an array of products' });
        }
        writeJson('products.json', payload);
        return sendJson(res, 200, { success: true, count: payload.length });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
  }

  // 2. MACHINE SPARES API
  if (pathname === '/api/spares') {
    if (req.method === 'GET') {
      const spares = readJson('spares.json', []);
      return sendJson(res, 200, spares);
    }
    if (req.method === 'POST') {
      try {
        const payload = await parseRequestBody(req);
        if (!Array.isArray(payload)) {
          return sendJson(res, 400, { error: 'Payload must be an array of machine spares' });
        }
        writeJson('spares.json', payload);
        return sendJson(res, 200, { success: true, count: payload.length });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
  }

  // 3. GALLERY API (Videos & Photos)
  if (pathname === '/api/gallery') {
    if (req.method === 'GET') {
      const gallery = readJson('gallery.json', { videos: [], photos: [] });
      return sendJson(res, 200, gallery);
    }
    if (req.method === 'POST') {
      try {
        const payload = await parseRequestBody(req);
        if (!payload || typeof payload !== 'object') {
          return sendJson(res, 400, { error: 'Payload must be an object with videos and photos arrays' });
        }
        writeJson('gallery.json', payload);
        return sendJson(res, 200, { 
          success: true, 
          videosCount: (payload.videos || []).length,
          photosCount: (payload.photos || []).length 
        });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, safePath);

  // If path is directory, try index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`404 Not Found: ${pathname}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Handle video/audio streaming with partial range requests
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (range && (ext === '.mp4' || ext === '.webm')) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': contentType,
      'Cache-Control': ext === '.json' ? 'no-cache' : 'public, max-age=3600'
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Nirala Static Backend Server is running!`);
  console.log(` URL:   http://localhost:${PORT}`);
  console.log(` Admin: http://localhost:${PORT}/admin.html`);
  console.log(`=======================================================`);
});
