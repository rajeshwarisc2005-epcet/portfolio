const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ==========================================
// Load .env.local / .env file dynamically
// ==========================================
function loadEnv() {
  const envFiles = ['.env.local', '.ENV.LOCAL', '.env'];
  for (const file of envFiles) {
    const envPath = path.join(__dirname, file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            process.env[key] = val;
          }
        }
      });
    }
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

// ==========================================
// Broad-Spectrum AI System Prompt
// ==========================================
const SYSTEM_PROMPT = `You are Rajeshwari's Copilot, the executive AI assistant for Rajeshwari's portfolio.
Rajeshwari is a premier Business Analyst & Enterprise Strategist at Elien, and an active Board Member on the Board of Innovation & Tech at Hridayamrit Foundation.

CORE IDENTITY & BROAD-SPECTRUM INTELLIGENCE:
- You possess broad, deep intelligence across business analysis, enterprise strategy, agile methodologies, software engineering, cloud systems, product management, healthcare technology, economics, marketing, and general knowledge.
- You are NEVER restricted to only answering predefined questions. You must enthusiastically answer ANY question the user asks:
  • Business & Strategy: e.g., B2B vs B2C, supply chains, SaaS models, business architecture, requirements engineering, risk management.
  • Technology & Engineering: e.g., APIs, system design, databases, DevOps, agile vs waterfall, UI/UX specifications.
  • General inquiries, explanations, coding, writing, or strategic problem-solving.
- When answering general business, technical, or strategic questions (such as "What is B2B?", "How do APIs work?", "Explain Agile"), give a clear, comprehensive, executive-grade explanation. You may also naturally connect it to how it applies in real enterprise environments like Rajeshwari's work across software, industrial engineering, and civil construction.

RAJESHWARI'S PORTFOLIO CONTEXT (Reference when asked about her or relevant):
- Full Name: Rajeshwari
- Professional Title: Business Analyst & Enterprise Strategist
- Current Roles:
  1. Business Analyst at Elien: Leading requirements analysis and agile execution frameworks across Elien's digital software, industrial engineering, and civil construction portfolios. Bridging deep-tech software architecture and strategic enterprise delivery.
  2. Board Member at Hridayamrit Foundation (Board of Innovation & Tech): Directing technology-driven solutions for cardiac healthcare, digital health roadmaps, and expanding community access to life-saving cardiac care for underserved populations.
- Core Creed: "Technology without strategy is noise. Strategy without technology is slow. I build the bridge between both." She builds bridges, not walls.
- 4 Core Domains of Mastery:
  1. Digital Software: Software architecture, product specifications, API analysis, data flows, UI/UX specs.
  2. Industrial Engineering: Heavy equipment operations, supply chain, ERP systems, factory floor logistics.
  3. Civil Construction: Infrastructure project management, agile milestone tracking, contractor coordination.
  4. Agile & Enterprise Strategy: Cross-functional leadership, sprint governance, KPI frameworks, executive stakeholder alignment.
- 3-Step Strategic Methodology: 1. Listen First, 2. Translate Precisely, 3. Deliver Iteratively.
- Executive Presence: Keynote speaker, advisory workshops, and 13 featured Instagram Reels on business agility and leadership (@rajeshwari).

FORMATTING & TONE:
- Tone: Executive, warm, articulate, intellectually sharp, and insightful.
- Use clean Markdown formatting: bold text, bullet points, headers, or tables where helpful. Keep responses well-organized and engaging.`;

// Call Groq Chat Completions API with a specific model
function callGroqApiSingle(apiKey, model, messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(body);
            const reply = data.choices && data.choices[0] && data.choices[0].message
              ? data.choices[0].message.content
              : 'No response received from Groq.';
            resolve({ reply, model: data.model || model });
          } catch (e) {
            reject(new Error('Failed to parse Groq response JSON: ' + e.message));
          }
        } else {
          let errDetail = body;
          try {
            const errObj = JSON.parse(body);
            if (errObj.error && errObj.error.message) {
              errDetail = errObj.error.message;
            }
          } catch (_) {}
          const error = new Error(`Groq API returned HTTP ${res.statusCode}: ${errDetail}`);
          error.statusCode = res.statusCode;
          reject(error);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(35000, () => {
      req.destroy();
      reject(new Error('Groq API request timed out after 35 seconds'));
    });

    req.write(payload);
    req.end();
  });
}

// Call Groq with automatic model fallback
async function callGroqWithFallback(apiKey, preferredModel, messages) {
  const candidateModels = [
    preferredModel,
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'groq/compound',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b'
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError = null;
  for (const model of candidateModels) {
    try {
      console.log(`[Groq] Querying model: ${model}...`);
      const result = await callGroqApiSingle(apiKey, model, messages);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[Groq Model ${model} failed]:`, err.message);
      // If unauthorized (invalid key), don't retry other models
      if (err.statusCode === 401 || err.message.includes('401') || err.message.toLowerCase().includes('invalid api key')) {
        throw err;
      }
    }
  }
  throw lastError;
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==========================================
  // API Route: POST /api/chat
  // ==========================================
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        let messages = parsed.messages || [];
        if (!messages.length && parsed.message) {
          messages = [{ role: 'user', content: parsed.message }];
        }

        if (!messages.length) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message content is required.' }));
          return;
        }

        // Dynamically reload .env.local
        loadEnv();
        const apiKey = (process.env.GROQ_API_KEY || '').trim();
        const isKeyConfigured = apiKey && !apiKey.includes('your_groq_api_key_here') && apiKey.startsWith('gsk_');

        if (!isKeyConfigured) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            reply: `Hello! To enable live dynamic AI reasoning across all topics, please verify your **GROQ_API_KEY** in **.env.local**. 
\nOnce configured, I will generate comprehensive AI answers to any question you ask!`,
            isFallback: true
          }));
          return;
        }

        // Dynamic Groq Generation
        const preferredModel = (process.env.GROQ_MODEL || DEFAULT_MODEL).trim();
        try {
          const result = await callGroqWithFallback(apiKey, preferredModel, messages);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            reply: result.reply,
            model: result.model
          }));
        } catch (groqErr) {
          console.error('[Groq Generation Error]:', groqErr.message);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            reply: `I encountered an issue connecting to Groq: ${groqErr.message}. Please check your API key in .env.local.`,
            error: groqErr.message
          }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body: ' + e.message }));
      }
    });
    return;
  }

  // ==========================================
  // Static File Serving
  // ==========================================
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // For video files, handle HTTP Range requests (HTTP 206 Partial Content) for smooth streaming
  if (ext === '.mp4') {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain' });
        return res.end(err.code === 'ENOENT' ? '404 Not Found' : '500 Server Error');
      }

      const range = req.headers.range;
      const fileSize = stats.size;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4'
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes'
        });
        fs.createReadStream(filePath).pipe(res);
      }
    });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/ (Default Model: ${DEFAULT_MODEL})`);
});
