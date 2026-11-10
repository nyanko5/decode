'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');
const env = process.env;
const num = (num1, num2) => {
  const formatNum1 = Number(num1);
  
  return Number.isFinite(formatNum1) ? formatNum1 : num2;
};

const DEFAULT_WORKERS = ['https://api-tool.nemu0001.workers.dev/', 'https://api-tool.nemu01.workers.dev', 'https://api-tool.myproxy0109.workers.dev', 'https://api-tool.myproxy0109.workers.dev/'];
const MAX_ATTEMPTS = Math.max(1, num(env.MAX_ATTEMPTS, 3));
const HEADER_TIMEOUT = num(env.HEADER_TIMEOUT_MS, 15000);
const MAX_BODY = num(env.MAX_BODY_MB, 4) * 1024 * 1024;
const CACHE_ON = String(env.CACHE || '').toLowerCase() !== 'off';
const CACHE_BYTES = num(env.CACHE_MB, 64) * 1024 * 1024;
const CACHE_ITEM_MAX = num(env.CACHE_MAX_ITEM_MB, 4) * 1024 * 1024;
const CACHE_DEFAULT_TTL = num(env.CACHE_DEFAULT_TTL_S, 900) * 1000;
const CACHE_MAX_TTL = num(env.CACHE_MAX_TTL_S, 21600) * 1000;
const REDIS_URL = (env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || '').replace(/\/+$/,'');
const REDIS_TOKEN = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || '';
const PEEK_STATUS = new Set([429, 500, 502, 503, 504]);
const PEEK_MAX = 64 * 1024;
const SAFE_ERR = new Set(['ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN']);
const rawList = env.CF_WORKER_URLS && env.CF_WORKER_URLS.trim() ? env.CF_WORKER_URLS : DEFAULT_WORKERS.join(',');
const RESET_OFFSET = (num(env.RESET_UTC_HOUR, 0) % 24 + 24) % 24 * 3600000;
const utcDay = () => Math.floor((Date.now() - RESET_OFFSET) / 86400000);
const nextUtcMidnight = () => (utcDay() + 1) * 86400000 + RESET_OFFSET;
const jst = blockedUntil => new Date(blockedUntil + 9 * 3600000).toISOString().replace('T',' ').slice(0, 16) + JST;
const workers = [];

for (const s of rawList.split(/[ ,]+/).map(raw => raw.trim().replace(/\/+$/,'')).filter(Boolean)) {
  try {
    const u = new URL(s);
    
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('protocol');
    
    workers.push({
      'id': workers.length + 1,
      'url': u,
      'used': 0,
      'day': utcDay(),
      'blockedUntil': 0,
      'reason': '',
      'fails': 0
    });
  } catch (error) {
    console.warn('[config] 無効な Worker URL を無視:' + s);
  }
}

function rollover(worker) {
  const today = utcDay();
  
  if (worker.day !== today) {
    worker.day = today;
    worker.used = 0;
    
    if (worker.reason === 'quota') {
      worker.blockedUntil = 0;
      worker.reason = '';
      worker.fails = 0;
    }
  };
}

function block(workers, duration, reason) {
  workers.blockedUntil = Date.now() + duration;
  workers.reason = reason;
  
  console.log(`[worker#${workers.id}] 停止${reason}\ →\ ${new Date(workers.blockedUntil).toISOString()} (${jst(workers.blockedUntil)})`);
}

function markOk(workers) {
  workers.fails = 0;
}

function markFail(workers, reason) {
  workers.fails++;
  
  if (workers.fails >= 2) block(workers, Math.min(15000 * Math.pow(2, workers.fails - 2), 300000), reason);
}

async function applyKind(workers, reason) {
  if (reason === 'quota') {
    block(workers, nextUtcMidnight() - Date.now() + 30000, 'quota');
    workers.fails = 0;
    await shareBlock(workers);
  } else {
    if (reason === 'rate') {
      block(workers, 60000, 'rate');
      await shareBlock(workers);
    } else {
      if (reason === 'workererr') {
        markFail(workers, 'worker-error');
      }
    }
  }
}

function pick(set) {
  const now = Date.now();
  const newWorkers = [];
  
  for (const worker of workers) {
    rollover(worker);
    
    if (set && set.has(worker.id)) continue;
    if (worker.blockedUntil > now) continue;
    
    newWorkers.push(worker);
  }
  
  if (!newWorkers.length) return null;
  
  return (
    newWorkers.sort(() => Math.random() - 0.5),
    newWorkers.sort((a, b) => a.used - b.used),
    newWorkers[0]
  );
}

function soonestRetrySec() {
  const now = Date.now();
  let minTime = Infinity;
  
  for (const worker of workers){
    if (worker.blockedUntil > now) {
      minTime = Math.min(minTime, worker.blockedUntil - now);
    }
  
    return Number.isFinite(minTime) ? Math.max(1, Math.min(3600, Math.ceil(minTime / 1000))) : 30;
  }
}

const QUOTA_RE =/error *code:? *1027|error *1027|daily request limit|exceeded[^.]{0,40}(free|daily)[^.]{0,40}(limit|tier|quota)/i;
const RATE_RE = /error *code:? *1015|error *1015|you are being rate limited/i;
const WERR_RE = /error *code:? *110[12]|error *110[12]|worker threw exception|exceeded resource limits/i;

function classify(statusCode, buf) {
  if (!PEEK_STATUS.has(statusCode)) return null;
  
  const reason = buf.toString('utf8', 0, 4096);
  
  if (QUOTA_RE.test(reason)) return 'quota';
  if (RATE_RE.test(reason)) return 'rate';
  if (WERR_RE.test(reason)) return 'workererr';
  
  return null;
}

const shareKey = workers => 'wproxy:block:' + workers.url.host;

async function rest(path) {  
  if (!REDIS_URL) return null;
  
  try {
    const controller = new AbortController();
    const interruptTimer = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(REDIS_URL + path, {
      'headers': {
        'Authorization': 'Bearer' + REDIS_TOKEN
      },
      'signal': controller.signal
    });
    
    return (
      clearTimeout(interruptTimer),
      await response.json()
    )
  } catch (error) {
    return null;
  }
}

async function shareBlock(workers) {
  if (!REDIS_URL) return;
  
  const time = Math.max(1, Math.ceil((workers.blockedUntil - Date.now()) / 1000));
  
  await rest('/set/' + encodeURIComponent(shareKey(workers)) + '/' + workers.blockedUntil + '/EX/' + time);
}

let lastSync = 0;

async function syncShared() {  
  if (!REDIS_URL || !workers.length || Date.now() - lastSync < 8000) return;
  
  lastSync = Date.now();
  
  const _0xb41bec = await rest('/mget/' + workers.map(worker => encodeURIComponent(shareKey(worker))).join('/'));
  
  if (!_0xb41bec || !Array.isArray(_0xb41bec.result)) return;
  
  const _0x3aae34 = Date.now();
  
  workers.forEach((_0x32a7dc, _0x739b29) => {
    const _0x152522 = Number(_0xb41bec.result[_0x739b29]);
    
    if (Number.isFinite(_0x152522) && _0x152522 > _0x3aae34) {
      if (_0x32a7dc.blockedUntil < _0x152522) {
        _0x32a7dc.blockedUntil = _0x152522;
        _0x32a7dc.reason = 'shared';
      }
    } else {
      if (_0x32a7dc.reason === 'shared') {
        _0x32a7dc.blockedUntil = 0;
        _0x32a7dc.reason = '';
      }
    }
  });
}

const cache = new Map();
let cacheBytes = 0;
let cacheHits = 0;
let cacheMiss = 0;

function cacheGet(_0x254554) {
  const _0x5336d0 = cache.get(_0x254554);
  
  if (!_0x5336d0) return null;
  if (_0x5336d0.exp < Date.now()) return (
    cache.delete(_0x254554),
    cacheBytes -= _0x5336d0.size,
    null
  );
  
  return (
    cache.delete(_0x254554),
    cache.set(_0x254554, _0x5336d0),
    _0x5336d0
  );
}

function cacheSet(_0x1e6e00, _0x50c0ba) {
  const _0x1a9a62 = cache.get(_0x1e6e00);
  
  if (_0x1a9a62) {
    cacheBytes -= _0x1a9a62.size;
    cache.delete(_0x1e6e00);
  }
  _0x50c0ba.size = _0x50c0ba.body.length + 1024;
  cache.set(_0x1e6e00, _0x50c0ba);
  cacheBytes += _0x50c0ba.size;
  
  while (cacheBytes > CACHE_BYTES && cache.size) {
    const [_0x596d1c, _0x15703d] = cache.entries().next().value;
    cache.delete(_0x596d1c);
    cacheBytes -= _0x15703d.size;
  }
}

const STATIC_CT = /^(image\/|font\/|text\/css|(application|text)\/(x-)?javascript|application\/(x-)?font|application\/vnd\.ms-fontobject)/i;

function ttlOf(_0x4bbd5d) {
  const _0x145ed4 = /(?:^|,)\x20*s-maxage=(\d+)/i.exec(_0x4bbd5d) || /(?:^|,)\x20*max-age=(\d+)/i.exec(_0x4bbd5d);
  
  if (!_0x145ed4) return CACHE_DEFAULT_TTL;
  
  return Math.min(Number(_0x145ed4[1]) * 1000, CACHE_MAX_TTL);
}

function cookieOf(_0x4b1b87, _0x5880b1) {
  const _0x551e37 = new RegExp('(?:^|;\s*)' + _0x5880b1 + '=([^;]*)').exec(_0x4b1b87 || '');
  
  return _0x551e37 ? _0x551e37[1] : '';
}

const REQ_DROP = new Set(['host', 'connection', 'keep-alive', 'proxy-connection', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-length', 'expect', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port', 'x-real-ip', 'forwarded', 'via', 'true-client-ip', 'cdn-loop', 'x-request-start']);
const RES_DROP = new Set(['connection', 'keep-alive', 'proxy-authenticate', 'proxy-connection', 'te', 'trailer', 'transfer-encoding', 'upgrade']);
const dropReq = _0x48b67e => REQ_DROP.has(_0x48b67e) || _0x48b67e.startsWith('cf-') || _0x48b67e.startsWith('x-vercel') || _0x48b67e.startsWith('x-render') || _0x48b67e.startsWith('rndr');
const publicHost = _0x445970 => String(_0x445970.headers['x-forwarded-host'] || _0x445970.headers.host || '').split(',')[0]['trim']();

function buildHeaders(_0x4d6500, _0x450dfc) {
  const _0xb4a879 = {};
  
  for (const _0x8ca855 of Object.keys(_0x4d6500.headers)) {
    if (!dropReq(_0x8ca855)) {
      _0xb4a879[_0x8ca855] = _0x4d6500.headers[_0x8ca855];
    }
  }
  
  _0xb4a879['x-forwarded-host'] = publicHost(_0x4d6500);
  _0xb4a879['x-forwarded-proto'] = 'https';
  
  if (_0x450dfc > 0 || !/^(GET|HEAD)$/.test(_0x4d6500.method)) {
    _0xb4a879['content-length'] = String(_0x450dfc);
  }
  
  return _0xb4a879;
}

const httpsAgent = new https.Agent({
  'keepAlive': true,
  'maxSockets': 128,
  'maxFreeSockets': 32,
  'scheduling': 'lifo'
});

const httpAgent = new http.Agent({
  'keepAlive': true,
  'maxSockets': 128,
  'maxFreeSockets': 32,
  'scheduling': 'lifo'
});

function attempt(newWorkers, options) {
  return new Promise(resolve => {
    const isHttp = newWorkers.url.protocol === 'http:';
    let isTimer = false;
    let timer = null;
    const clearTimerRes = resOption => {
        if (!isTimer) {
          isTimer = true;
          clearTimeout(timer);
          resolve(resOption);
        }
    };
    const req = (isHttp ? http : https).request(
      {
        'hostname': newWorkers.url.hostname,
        'port': newWorkers.url.port || (isHttp ? 80 : 443),
        'path': options.path,
        'method': options.method,
        'headers': Object.assign({}, options.headers, {
          'host': newWorkers.url.host
        }),
        'agent': isHttp ? httpAgent : httpsAgent
      },
      res => {
        clearTimeout(timer);
        const statusCode = res.statusCode;
        const resContentLength = Number(res.headers['content-length']);
        
        if (PEEK_STATUS.has(statusCode) && Number.isFinite(resContentLength) && resContentLength <= PEEK_MAX) {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            clearTimerRes({
              'upRes': res,
              'body': buf,
              'kind': classify(statusCode, buf)
            });
          });
          res.on('error', () => clearTimerRes({
            'error': 'ECONNRESET'
          }));
          
          return;
        }
        
        clearTimerRes({
          'upRes': res
        });
      }
    );
    
    timer = setTimeout(() => {      
      req.destroy(Object.assign(new Error('header timeout'), {
        'code': 'EHDRTIMEOUT'
      }));
    } , HEADER_TIMEOUT);
    req.on('error', error => clearTimerRes({
      'error': error && error.code || 'ERROR'
    }));
    options.cancel = () => req.destroy();
    
    if (options.body && options.body.length) {
      req.end(options.body);
    } else req.end();
  });
}

function sendText(res, _0x4832ca, _0x29ed62, _0x30f989) {
  if (res.headersSent) return res.end();
    
  const buf = Buffer.from(_0x29ed62, 'utf8');
  res.writeHead(_0x4832ca, Object.assign({
    'content-type': 'text/plain; charset=utf-8',
    'content-length': String(buf.length),
    'cache-control': 'no-store'
  }, _0x30f989 || {}));
  res.end(buf);
}

function sendBusy(res) {
  if (res.headersSent) return res.end();  
  
  const _0x27f891 = `
  <!doctype html>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>混み合っています</title>
    <body style="font-family:system-ui,sans-serif;background:#0b0b14;color:#e5e7eb;display:grid;place-items:center;height:100vh;margin:0">
      <div style="text-align:center;padding:16px">
        <h2>ただいま混み合っています</h2>
        <p>しばらくしてからもう一度開いてください。</p>
      </div>
    </body>
    `;
  const buf = Buffer.from(_0x27f891, 'utf8'); 
  res.writeHead(503, {
    'content-type': 'text/html; charset=utf-8',
    'content-length': String(buf.length),
    'retry-after': String(soonestRetrySec(soonestRetrySec)),
    'cache-control': 'no-store'
  });
  res.end(buf);
}

function sendUpstream(_0x26eaab, res, _0x5810cd, _0x1c7edd) {
  const _0x124e4b = _0x5810cd.upRes;
  const _0x3a1143 = _0x124e4b.statusCode;
  const _0x3a5fbd = {};
  
  for (const _0x36bf2d of Object.keys(_0x124e4b.headers)) {
    if (!RES_DROP.has(_0x36bf2d)) {
      _0x3a5fbd[_0x36bf2d] = _0x124e4b.headers[_0x36bf2d];
    }
  }
  
  const _0x4851db = String(_0x3a5fbd['content-type'] || '');
  const _0x208ae3 = String(_0x3a5fbd['cache-control'] || '');

  if (!_0x208ae3 && _0x3a1143 === 200 && (STATIC_CT.test(_0x4851db) || /x-icon/i.test(_0x4851db))) {
    if (/[-_.][A-Za-z0-9_-]{8,}\.(?:js|css|woff2?|png|jpe?g|webp|avif|svg)(?:[?#]|$)/.test(_0x26eaab.url || '')) {
        _0x3a5fbd['cache-control'] = 'public, max-age=604800, immutable';
    } else {
        _0x3a5fbd['cache-control'] = 'public, max-age=3600';
    }
}
  
  if (_0x5810cd.body) {
    res.writeHead(_0x3a1143, _0x3a5fbd);
    res.end(_0x26eaab.method === 'HEAD' ? undefined : _0x5810cd.body);
    
    return;
  }
  
  let _0x167218 = null;
  
  if (_0x1c7edd && _0x3a1143 === 200 && !_0x3a5fbd['set-cookie'] && STATIC_CT.test(_0x4851db) && !/no-store|private/i.test(_0x208ae3)) {
    const _0x31ec2a = ttlOf(_0x3a5fbd['cache-control'] || '');
    const _0x57fbcc = Number(_0x3a5fbd['content-length']);
    
    if (_0x31ec2a > 0 && !(Number.isFinite(_0x57fbcc) && _0x57fbcc > CACHE_ITEM_MAX)) {
      _0x167218 = {
        'chunks': [],
        'size': 0,
        'ttl': _0x31ec2a,
        'ok': true
      };
    }
  }
  
  res.writeHead(_0x3a1143, _0x3a5fbd);
  
  if (_0x26eaab.method === 'HEAD' || _0x3a1143 === 204 || _0x3a1143 === 304) {
    _0x124e4b.resume();
    res.end();
    
    return;
  }
  
  _0x124e4b.pipe(res);
  _0x167218 && (_0x124e4b.on('data', chunk => {    
    if (!_0x167218.ok) return;
    
    _0x167218.size += chunk.length;
    
    if (_0x167218.size > CACHE_ITEM_MAX) {
      _0x167218.ok = false;
      _0x167218.chunks = null;
    } else _0x167218.chunks.push(chunk);
  }),
  _0x124e4b.on('end', () => {
    _0x167218.ok && !_0x124e4b.aborted && cacheSet(_0x1c7edd, {
      'status': _0x3a1143,
      'headers': _0x3a5fbd,
      'body': Buffer.concat(_0x167218.chunks),
      'at': Date.now(),
      'exp': Date.now() + _0x167218['ttl']
    })
  }));
  _0x124e4b.on('error', () => {
    try {
      res.destroy();
    } catch (error) {}
  });
  _0x124e4b.on('aborted', () => {
    try {
      res.destroy();
    } catch (error) {}
  });
}

function serveCached(_0x1cd095, _0x5ed84d, _0x2be3ad) {
  const _0x484cdf = Object.assign({}, _0x2be3ad.headers, {
    'x-proxy-cache': 'HIT',
    'age': String(Math.floor((Date.now() - _0x2be3ad.at) / 1000))
  });
  const _0x37e3fb = _0x1cd095.headers['if-none-match'];
  
  if (_0x37e3fb && _0x2be3ad.headers.etag && _0x37e3fb === _0x2be3ad.headers.etag) {
    const _0x43d05d = {
      'etag': _0x2be3ad.headers.etag,
      'x-proxy-cache': 'HIT'
    };
    
    if (_0x2be3ad.headers['cache-control']) {
      _0x43d05d['cache-control'] = _0x2be3ad.headers['cache-control'];
    }
    
    _0x5ed84d.writeHead(304, _0x43d05d);
    _0x5ed84d.end();
    
    return;
  }
  
  const _0x569e1b = _0x1cd095.headers['if-modified-since'];
  
  if (!_0x37e3fb && _0x569e1b && _0x2be3ad.headers['last-modified'] && _0x569e1b === _0x2be3ad.headers['last-modified']) {
    const _0x58d26e = {
      'last-modified': _0x2be3ad.headers['last-modified'],
      'x-proxy-cache': 'HIT'
    };
    
    if (_0x2be3ad.headers['cache-control']) {
      _0x58d26e['cache-control'] = _0x2be3ad.headers['cache-control'];
    }
    
    _0x5ed84d.writeHead(304, _0x58d26e);
    _0x5ed84d.end();
    
    return;
  }
  
  _0x484cdf['content-length'] = String(_0x2be3ad.body.length);
  _0x5ed84d.writeHead(_0x2be3ad.status, _0x484cdf);
  _0x5ed84d.end(_0x1cd095.method === 'HEAD' ? undefined : _0x2be3ad.body);
}

function readBody(req, MAX_BODY) {
  return new Promise((resolve, reject) => {    
    const reqData = [];
    let dataTotalLength = 0;
    let isOver = false;
    
    req.on('data', data => {        
      if (isOver) return;
      
      dataTotalLength += data.length;
      
      if (dataTotalLength > MAX_BODY) {
        isOver = true;
        reqData.length = 0;
      } else reqData.push(data);
    });
    req.on('end', () => isOver ? reject(Object.assign(new Error('too large'), {
      'code': 'E2BIG'
    })) : resolve(Buffer.concat(reqData)));
    req.on('error', reject);
    req.on('aborted', () => reject(new Error('aborted')));
  });
}

async function handle(req, res) {
  const url = req.url || '/';
   
  if (url === '/_proxy/health' || url === '/_render/health') return sendText(res, 200, 'ok');
  if (url === '/robots.txt') return sendText(res, 200, 'User-agent: *\nDisallow: /\n', {
    'cache-control': 'public,\x20max-age=86400'
  });
  if (/^\/apple-touch-icon(-precomposed|-\d+x\d+)*\.png(\?|$)/['test'](url)) {
    return (
      res.writeHead(204, {
        'cache-control': 'public, max-age=86400'
      }),
      res.end()
    );
  }
  
  if (url.startsWith('/_proxy/status')) {
    if (env.STATUS_TOKEN) {
      let url = '';
      
      try {
        url = new URL(url, 'http://x').searchParams.get('token') || '';
      } catch (error) {}
      if (url !== env.STATUS_TOKEN) return sendText(res, 403, 'forbidden');
    }
    
    await syncShared();
    
    const now = Date.now();
    const option = {
      'note': 'このインスタンスから見た状態です（Vercel はインスタンスが複数あります）',
      'time': new Date().toISOString(),
      'timeJST': jst(Date.now()),
      'sharedState': REDIS_URL ? 'redis' : 'none',
      'workers': workers.map(worker => ({
        'id': worker.id,
        'host': worker.url.host.replace(/^(.{4}).*(.{12})$/, '$1…$2'),
        'usedOnThisInstance': worker.used,
        'state': worker.blockedUntil > now ? 'blocked(' + worker.reason + ')' : 'ok',
        'blockedUntil': worker.blockedUntil > now ? new Date(worker.blockedUntil).toISOString() : null,
        'blockedUntilJST': worker.blockedUntil > now ? jst(worker.blockedUntil) : null,
        'consecutiveFails' : worker.fails
      })),
      'cache': {
        'items': cache.size,
        'mb': +(cacheBytes / 1048576).toFixed(1),
        'hits': cacheHits,
        'misses': cacheMiss
      }
    };
    const buf = Buffer.from(JSON.stringify(option, null, 2));
    
    return (
      res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': String(buf.length),
      'cache-control': 'no-store'
    }),
      res.end(buf)
    )
  }
  
  if (url[0] !== '/') return sendText(res, 400, 'bad request');
  if (url === '/favicon.ico' && String(env.FAVICON).toLowerCase() !== 'proxy') {
    return (
      res.writeHead(204),
      res.end()
    )
  }
  
  if (!workers.length) return sendText(res, 500, 'No worker configured');
  
  const isMethod = /^(GET|HEAD|OPTIONS)$/.test(req.method);
  let _0x56dcfa = null;
  
  if (CACHE_ON && req.method === 'GET' && !req.headers.range && !req.headers.authorization) {
    _0x56dcfa = publicHost(req) + '|' + cookieOf(req.headers.cookie, 'gw_site') + '|' + (req.headers['accept-encoding'] || '') + '|' + url;
    const _0x122e20 = cacheGet(_0x56dcfa);
    
    if (_0x122e20) {
      return (
        cacheHits++,
        serveCached(req, res, _0x122e20)
      )
    }
    
    cacheMiss++;
  }
  
  let _0x5cbec1 = Buffer.alloc(0);
  
  if (!isMethod || req.method === 'OPTIONS') {
   try {
      _0x5cbec1 = await readBody(req, MAX_BODY);
    } catch (error) {
      return sendText(res, error.code === 'E2BIG' ? 413 : 400, error.code === 'E2BIG' ? 'payload too large' : 'bad request');
    }
  }
  
  const options = {
    'method': req.method,
    'path': url,
    'headers': buildHeaders(req, _0x5cbec1.length),
    'body': _0x5cbec1,
    'cancel': null,
    'dead': false
  };
  
  res.on('close', () => {    
    if (!res.writableEnded) {
      options.dead = true;
      
      if (options.cancel) options.cancel();
    }
  });
  
  await syncShared();
  
  const set = new Set();
  let _0x761e44 = null;
  
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (options.dead) return;
    
    const newWorkers = pick(set);
    
    if (!newWorkers) break;
    
    set.add(newWorkers.id);
    newWorkers.used++;
    
    const _0x5af209 = await attempt(newWorkers, options);
    
    if (options.dead) {
      if (_0x5af209.upRes) {
        _0x5af209.upRes.destroy();
      }
      
      return;
    }
    
    if (_0x5af209.error) {
      markFail(newWorkers, _0x5af209.error);
      
      if (isMethod || SAFE_ERR.has(_0x5af209.error)) continue;
      
      return sendText(res, 502, 'Proxy Error');
    }
    if (_0x5af209.kind === 'quota' || _0x5af209.kind === 'rate') {
      await applyKind(newWorkers, _0x5af209.kind);
      
      continue;
    }
    
    if (_0x5af209.kind === 'workererr') {
      await applyKind(newWorkers, _0x5af209.kind);
      
      _0x761e44 = _0x5af209;
      
      if (isMethod) continue;
      
      return sendUpstream(req, res, _0x5af209, null);
    }
    
    return (
      markOk(newWorkers),
      sendUpstream(req, res, _0x5af209, _0x56dcfa)
    )
  }
  
  if (_0x761e44) return sendUpstream(req, res, _0x761e44, null);
  
  return sendBusy(res);
}

const requestListener = (req, res) => {  
  handle(req, res).catch(error => {
    console.error('[handle]', error && error.message);
    
    if (!res.headersSent) sendText(res, 502, 'Proxy Error');
    else res.destroy();
  });
};

module.exports = requestListener;
module.exports.config = {
  'api': {
    'bodyParser': false
  }
};
module.exports._internals = {
  'workers': workers,
  'cache': cache
};

if (require.main === module) {
  const PORT = num(env.PORT, 10000);
  const server = http.createServer(requestListener);
  
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log('[proxy] listening on :' + PORT + ' / workers=' + workers.length + ' / reset=UTC ' + RESET_OFFSET / 3600000 + ':00 (日本時間 ' + RESET_OFFSET / 3600000 + 9 % 24 + ':00)');
  });
  server.on('clientError', (req, res) => res.destroy());
  
  const stop = () => {    
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
  process.on('unhandledRejection', error => console.error('[unhandledRejection]', error && error.message));
  process.on('uncaughtException', error => console.error('[uncaughtException]', error && error.message));
  env.KEEP_ALIVE === '1' && env.RENDER_EXTERNAL_URL && setInterval(() => {    
    https.get(env.RENDER_EXTERNAL_URL.replace(/\/+$/,'') + '/_proxy/health', res => res.resume()).on('error', () => {});
  }, 10 * 60 * 1000).unref();
}
