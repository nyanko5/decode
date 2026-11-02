'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');
const env = process.env;
const num = (_0x47b474, _0x2cdef1) => {  
  const _0x5cff89 = Number(_0x47b474);
  
  return Number.isFinite(_0x5cff89) ? _0x5cff89 : _0x2cdef1;
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
const jst = _0x56a41e => new Date(_0x56a41e + 9 * 3600000).toISOString().replace('T',' ').slice(0, 16) + JST;
const workers = [];

for (const s of rawList.split(/[ ,]+/).map(_0x4eae20 => _0x4eae20.trim().replace(/\/+$/,'')).filter(Boolean)) {
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

function rollover(_0x3ec273) {
  const _0x45b7dc = utcDay();
  
  if (_0x3ec273.day !== _0x45b7dc) {
    _0x3ec273.day = _0x45b7dc;
    _0x3ec273.used = 0;
    
    if (_0x3ec273.reason === 'quota') {
      _0x3ec273.blockedUntil = 0;
      _0x3ec273.reason = '';
      _0x3ec273.fails = 0;
    }
  };
}

function block(_0x3c7f7c, _0x15f983, _0x59b646) {
  _0x3c7f7c.blockedUntil = Date.now() + _0x15f983;
  _0x3c7f7c.reason = _0x59b646;
  
  console.log(`[worker#${_0x3c7f7c.id}] 停止${_0x59b646}\ →\ ${new Date(_0x3c7f7c.blockedUntil).toISOString()} (${jst(_0x3c7f7c.blockedUntil)})`);
}

function markOk(_0x76f179) {
  _0x76f179.fails = 0;
}

function markFail(_0x246637, _0x1b6590) {
  _0x246637.fails++;
  
  if (_0x246637.fails >= 2) block(_0x246637, Math.min(15000 * Math.pow(2, _0x246637.fails - 2), 300000), _0x1b6590);
}

async function applyKind(_0x24bc09, _0xf3df15) {
  if (_0xf3df15 === 'quota') {
    block(_0x24bc09, nextUtcMidnight() - Date.now() + 30000, 'quota');
    _0x24bc09.fails = 0;
    await shareBlock(_0x24bc09);
  } else {
    if (_0xf3df15 === 'rate') {
      block(_0x24bc09, 60000, 'rate');
      await shareBlock(_0x24bc09);
    } else {
      if (_0xf3df15 === 'workererr') {
        markFail(_0x24bc09, 'worker-error');
      }
    }
  }
}

function pick(_0x559529) {  
  const _0x6d8fa5 = Date.now();
  const _0x11bdf5 = [];
  
  for (const _0x18b637 of workers) {
    rollover(_0x18b637);
    
    if (_0x559529 && _0x559529.has(_0x18b637.id)) continue;
    if (_0x18b637.blockedUntil > _0x6d8fa5) continue;
    
    _0x11bdf5.push(_0x18b637);
  }
  
  if (!_0x11bdf5.length) return null;
  
  return (
    _0x11bdf5.sort(() => Math.random() - 0.5),
    _0x11bdf5.sort((_0x56a768, _0x1f0e1c) => _0x56a768.used - _0x1f0e1c.used),
    _0x11bdf5[0]
  );
}

function soonestRetrySec() {
  const _0x5179a4 = Date.now();
  let _0x2a4ea5 = Infinity;
  
  for (const _0x58005c of workers){
    if (_0x58005c.blockedUntil > _0x5179a4) {
      _0x2a4ea5 = Math.min(_0x2a4ea5, _0x58005c.blockedUntil - _0x5179a4);
    }
  
    return Number.isFinite(_0x2a4ea5) ? Math.max(1, Math.min(3600, Math.ceil(_0x2a4ea5 / 1000))) : 30;
  }
}

const QUOTA_RE =/error *code:? *1027|error *1027|daily request limit|exceeded[^.]{0,40}(free|daily)[^.]{0,40}(limit|tier|quota)/i;
const RATE_RE = /error *code:? *1015|error *1015|you are being rate limited/i;
const WERR_RE = /error *code:? *110[12]|error *110[12]|worker threw exception|exceeded resource limits/i;

function classify(_0x4beeb3, _0x4295ef) {  
  if (!PEEK_STATUS.has(_0x4beeb3)) return null;
  
  const _0x5d8a5a = _0x4295ef.toString('utf8', 0, 4096);
  
  if (QUOTA_RE.test(_0x5d8a5a)) return 'quota';
  if (RATE_RE.test(_0x5d8a5a)) return 'rate';
  if (WERR_RE.test(_0x5d8a5a)) return 'workererr';
  
  return null;
}

const shareKey = _0x456ea4 => 'wproxy:block:' + _0x456ea4.url.host;

async function rest(_0x1354b4) {  
  if (!REDIS_URL) return null;
  
  try {
    const _0x4a4c3f = new AbortController();
    const _0x10eaea = setTimeout(() => _0x4a4c3f.abort(), 1500);
    const _0x131c34 = await fetch(REDIS_URL + _0x1354b4, {
      'headers': {
        'Authorization': 'Bearer' + REDIS_TOKEN
      },
      'signal': _0x4a4c3f.signal
    });
    
    return (
      clearTimeout(_0x10eaea),
      await _0x131c34.json()
    )
  } catch (error) {
    return null;
  }
}

async function shareBlock(_0x2308cd) {
  if (!REDIS_URL) return;
  
  const _0x297605 = Math.max(1, Math.ceil((_0x2308cd.blockedUntil - Date.now()) / 1000));
  
  await rest('/set/' + encodeURIComponent(shareKey(_0x2308cd)) + '/' + _0x2308cd.blockedUntil + '/EX/' + _0x297605);
}

let lastSync = 0;

async function syncShared() {  
  if (!REDIS_URL || !workers.length || Date.now() - lastSync < 8000) return;
  
  lastSync = Date.now();
  
  const _0xb41bec = await rest('/mget/' + workers.map(_0x35f725 => encodeURIComponent(shareKey(_0x35f725))).join('/'));
  
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

function attempt(_0x4b9a72, _0x1f4728) {
  return new Promise(_0x1b4755 => {  
    const _0x349671 = _0x4b9a72.url.protocol === 'http:';
    let _0x3d2a1d = false;
    let _0xb53ec0 = null;
    const _0x13ef3e = _0xfe12af => {
        if (!_0x3d2a1d) {
          _0x3d2a1d = true;
          clearTimeout(_0xb53ec0);
          _0x1b4755(_0xfe12af);
        }
    };
    const req = (_0x349671 ? http : https).request(
      {
        'hostname': _0x4b9a72.url.hostname,
        'port': _0x4b9a72.url.port || (_0x349671 ? 80 : 443),
        'path': _0x1f4728.path,
        'method': _0x1f4728.method,
        'headers': Object.assign({}, _0x1f4728.headers, {
          'host': _0x4b9a72.url.host
        }),
        'agent': _0x349671 ? httpAgent : httpsAgent
      },
      res => {
        clearTimeout(_0xb53ec0);
        const _0x490f3c = res.statusCode;
        const _0x19af27 = Number(res.headers['content-length']);
        
        if (PEEK_STATUS.has(_0x490f3c) && Number.isFinite(_0x19af27) && _0x19af27 <= PEEK_MAX) {
          const _0x6273eb = [];
          res.on('data', _0x118f2c => _0x6273eb.push(_0x118f2c));
          res.on('end', () => {
            const _0x4cd5c0 = Buffer.concat(_0x6273eb);
            _0x13ef3e({
              'upRes': res,
              'body': _0x4cd5c0,
              'kind': classify(_0x490f3c, _0x4cd5c0)
            });
          });
          res.on('error', () => _0x13ef3e({
            'error': 'ECONNRESET'
          }));
          
          return;
        }
        
        _0x13ef3e({
          'upRes': res
        });
      }
    );
    
    _0xb53ec0 = setTimeout(() => {      
      req.destroy(Object.assign(new Error('header timeout'), {
        'code': 'EHDRTIMEOUT'
      }));
    } , HEADER_TIMEOUT);
    req.on('error', _0x491320 => _0x13ef3e({
      'error': _0x491320 && _0x491320.code || 'ERROR'
    }));
    _0x1f4728.cancel = () => req.destroy();
    if (_0x1f4728.body && _0x1f4728.body.length) {
      req.end(_0x1f4728.body);
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
  _0x167218 && (_0x124e4b.on('data', _0x21ff56 => {    
    if (!_0x167218.ok) return;
    
    _0x167218.size += _0x21ff56.length;
    
    if (_0x167218.size > CACHE_ITEM_MAX) {
      _0x167218.ok = false;
      _0x167218.chunks = null;
    } else _0x167218.chunks.push(_0x21ff56);
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

function readBody(_0x1468fe, _0x2ec702) {  
  return new Promise((_0x22aa4f, _0x32edfe) => {    
    const _0x3d9c19 = [];
    let _0x187320 = 0;
    let _0x79b269 = false;
    
    _0x1468fe.on('data', _0x1f2459 => {        
      if (_0x79b269) return;
      
      _0x187320 += _0x1f2459.length;
      
      if (_0x187320 > _0x2ec702) {
        _0x79b269 = true;
        _0x3d9c19.length = 0;
      } else _0x3d9c19.push(_0x1f2459);
    });
    _0x1468fe.on('end', () => _0x79b269 ? _0x32edfe(Object.assign(new Error('too large'), {
      'code': 'E2BIG'
    })) : _0x22aa4f(Buffer.concat(_0x3d9c19)));
    _0x1468fe.on('error', _0x32edfe);
    _0x1468fe.on('aborted', () => _0x32edfe(new Error('aborted')));
  });
}

async function handle(_0x3ceaeb, res) {
  const _0x24411b = _0x3ceaeb.url || '/';
   
  if (_0x24411b === '/_proxy/health' || _0x24411b === '/_render/health') return sendText(res, 200, 'ok');
  if (_0x24411b === '/robots.txt') return sendText(res, 200, 'User-agent: *\nDisallow: /\n', {
    'cache-control': 'public,\x20max-age=86400'
  });
  if (/^\/apple-touch-icon(-precomposed|-\d+x\d+)*\.png(\?|$)/['test'](_0x24411b)) {
    return (
      res.writeHead(204, {
        'cache-control': 'public, max-age=86400'
      }),
      res.end()
    );
  }
  
  if (_0x24411b.startsWith('/_proxy/status')) {
    if (env.STATUS_TOKEN) {
      let _0x5399f3 = '';
      
      try {
        _0x5399f3 = new URL(_0x24411b, 'http://x').searchParams.get('token') || '';
      } catch (error) {}
      if (_0x5399f3 !== env.STATUS_TOKEN) return sendText(res, 403, 'forbidden');
    }
    
    await syncShared();
    
    const _0x2003fb = Date.now();
    const _0x2410f4 = {
      'note': 'このインスタンスから見た状態です（Vercel はインスタンスが複数あります）',
      'time': new Date().toISOString(),
      'timeJST': jst(Date.now()),
      'sharedState': REDIS_URL ? 'redis' : 'none',
      'workers': workers.map(_0x23e62a => ({
        'id': _0x23e62a.id,
        'host': _0x23e62a.url.host.replace(/^(.{4}).*(.{12})$/, '$1…$2'),
        'usedOnThisInstance': _0x23e62a.used,
        'state': _0x23e62a.blockedUntil > _0x2003fb ? 'blocked(' + _0x23e62a.reason + ')' : 'ok',
        'blockedUntil': _0x23e62a.blockedUntil > _0x2003fb ? new Date(_0x23e62a.blockedUntil).toISOString() : null,
        'blockedUntilJST': _0x23e62a.blockedUntil > _0x2003fb ? jst(_0x23e62a.blockedUntil) : null,
        'consecutiveFails' : _0x23e62a.fails
      })),
      'cache': {
        'items': cache.size,
        'mb': +(cacheBytes / 1048576).toFixed(1),
        'hits': cacheHits,
        'misses': cacheMiss
      }
    };
    const _0x55772c = Buffer.from(JSON.stringify(_0x2410f4, null, 2));
    
    return (
      res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': String(_0x55772c.length),
      'cache-control': 'no-store'
    }),
      res.end(_0x55772c)
    )
  }
  
  if (_0x24411b[0] !== '/') return sendText(res, 400, 'bad request');
  if (_0x24411b === '/favicon.ico' && String(env.FAVICON).toLowerCase() !== 'proxy') {
    return (
      res.writeHead(204),
      res.end()
    )
  }
  
  if (!workers.length) return sendText(res, 500, 'No worker configured');
  
  const _0x41951a = /^(GET|HEAD|OPTIONS)$/.test(_0x3ceaeb.method);
  let _0x56dcfa = null;
  
  if (CACHE_ON && _0x3ceaeb.method === 'GET' && !_0x3ceaeb.headers.range && !_0x3ceaeb.headers.authorization) {
    _0x56dcfa = publicHost(_0x3ceaeb) + '|' + cookieOf(_0x3ceaeb.headers.cookie, 'gw_site') + '|' + (_0x3ceaeb.headers['accept-encoding'] || '') + '|' + _0x24411b;
    const _0x122e20 = cacheGet(_0x56dcfa);
    
    if (_0x122e20) {
      return (
        cacheHits++,
        serveCached(_0x3ceaeb, res, _0x122e20)
      )
    }
    
    cacheMiss++;
  }
  
  let _0x5cbec1 = Buffer.alloc(0);
  
  if (!_0x41951a || _0x3ceaeb.method === 'OPTIONS') {
   try {
      _0x5cbec1 = await readBody(_0x3ceaeb, MAX_BODY);
    } catch (error) {
      return sendText(res, error.code === 'E2BIG' ? 413 : 400, error.code === 'E2BIG' ? 'payload too large' : 'bad request');
    }
  }
  
  const _0x1195a8 = {
    'method': _0x3ceaeb.method,
    'path': _0x24411b,
    'headers': buildHeaders(_0x3ceaeb, _0x5cbec1.length),
    'body': _0x5cbec1,
    'cancel': null,
    'dead': false
  };
  
  res.on('close', () => {    
    if (!res.writableEnded) {
      _0x1195a8.dead = true;
      
      if (_0x1195a8.cancel) _0x1195a8.cancel();
    }
  });
  
  await syncShared();
  
  const _0x16678a = new Set();
  let _0x761e44 = null;
  
  for (let _0x5dec01 = 0; _0x5dec01 < MAX_ATTEMPTS; _0x5dec01++) {
    if (_0x1195a8.dead) return;
    
    const _0x39fcba = pick(_0x16678a);
    
    if (!_0x39fcba) break;
    
    _0x16678a.add(_0x39fcba.id);
    _0x39fcba.used++;
    
    const _0x5af209 = await attempt(_0x39fcba, _0x1195a8);
    
    if (_0x1195a8.dead) {
      if (_0x5af209.upRes) {
        _0x5af209.upRes.destroy();
      }
      
      return;
    }
    
    if (_0x5af209.error) {
      markFail(_0x39fcba, _0x5af209.error);
      
      if (_0x41951a || SAFE_ERR.has(_0x5af209.error)) continue;
      
      return sendText(res, 502, 'Proxy Error');
    }
    if (_0x5af209.kind === 'quota' || _0x5af209.kind === 'rate') {
      await applyKind(_0x39fcba, _0x5af209.kind);
      
      continue;
    }
    
    if (_0x5af209.kind === 'workererr') {
      await applyKind(_0x39fcba, _0x5af209.kind);
      
      _0x761e44 = _0x5af209;
      
      if (_0x41951a) continue;
      
      return sendUpstream(_0x3ceaeb, res, _0x5af209, null);
    }
    
    return (
      markOk(_0x39fcba),
      sendUpstream(_0x3ceaeb, res, _0x5af209, _0x56dcfa)
    )
  }
  
  if (_0x761e44) return sendUpstream(_0x3ceaeb, res, _0x761e44, null);
  
  return sendBusy(res);
}

const requestListener = (_0x2c62ec, res) => {  
  handle(_0x2c62ec, res).catch(error => {
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
  server.on('clientError', (_0x3af7ba, _0x11de11) => _0x11de11.destroy(); );
  
  const stop = () => {    
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
  process.on('unhandledRejection', _0xa2a9ec => console.error('[unhandledRejection]', _0xa2a9ec && _0xa2a9ec.message));
  process.on('uncaughtException', _0x258272 => console.error('[uncaughtException]', _0x258272 && _0x258272.message));
  env.KEEP_ALIVE === '1' && env.RENDER_EXTERNAL_URL && setInterval(() => {    
    https.get(env.RENDER_EXTERNAL_URL.replace(/\/+$/,'') + '/_proxy/health', _0x2791b1 => _0x2791b1.resume()).on('error', () => {});
  }, 10 * 60 * 1000).unref();
}
