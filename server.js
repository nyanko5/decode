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
const jst = _0x56a41e => new Date(_0x56a41e + 9 * 3600000).toISOString().replace('T','\x20').slice(0, 16) + JST;
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
  } catch (a0_0x5a7e06) {
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
  } catch (_0x29bbda) {
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
    const _0x584c5c = (_0x349671 ? http : https).request(
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
      _0x23f22f => {
        clearTimeout(_0xb53ec0);
        const _0x490f3c = _0x23f22f.statusCode;
        const _0x19af27 = Number(_0x23f22f.headers['content-length']);
        
        if (PEEK_STATUS.has(_0x490f3c) && Number.isFinite(_0x19af27) && _0x19af27 <= PEEK_MAX) {
          const _0x6273eb = [];
          _0x23f22f.on('data', _0x118f2c => _0x6273eb.push(_0x118f2c));
          _0x23f22f.on('end', () => {
            if ('wPIuK' === 'bsWSf') {
              _0x4db7b7.destroy();
            } else {
              const _0x4cd5c0 = Buffer.concat(_0x6273eb);
              _0x13ef3e({
                'upRes': _0x23f22f,
                'body': _0x4cd5c0,
                'kind': classify(_0x490f3c, _0x4cd5c0)
              });
            }
          });
          _0x23f22f.on('error', () => _0x13ef3e({
            'error': 'ECONNRESET'
          }));
          
          return;
        }
        
        _0x13ef3e({
          'upRes': _0x23f22f
        });
      }
    );
    
    _0xb53ec0 = setTimeout(() => {      
      _0x584c5c.destroy(Object.assign(new Error('header timeout'), {
        'code': 'EHDRTIMEOUT'
      }));
    } , HEADER_TIMEOUT);
    _0x584c5c.on('error', _0x491320 => _0x13ef3e({
      'error': _0x491320 && _0x491320.code || 'ERROR'
    }));
    _0x1f4728.cancel = () => {      
      try {
        _0x584c5c.destroy();
      } catch (_0x1817ac) {} };
    if (_0x1f4728.body && _0x1f4728.body.length) {
      _0x584c5c.end(_0x1f4728.body);
    }
    
    else _0x584c5c.end();
  });
}

function sendText(_0x123509, _0x4832ca, _0x29ed62, _0x30f989) {
  if (_0x123509.headersSent) {
    try {
      _0x123509.end();
    } catch (_0x4d4d19) {}
    
    return;
  }
  
  const _0x3af457 = Buffer.from(_0x29ed62, 'utf8');
  _0x123509.writeHead(_0x4832ca, Object.assign({
    'content-type': 'text/plain; charset=utf-8',
    'content-length': String(_0x3af457.length),
    'cache-control': 'no-store'
  }, _0x30f989 || {}));
  _0x123509.end(_0x3af457);
}

function sendBusy(_0x3df449) {
  if (_0x3df449.headersSent) {
    try {
      _0x3df449.end();
    } catch (_0x1982af) {} return;
  }
  
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
  const _0x1aa3b9 = Buffer.from(_0x27f891, 'utf8'); 
  _0x3df449.writeHead(503, {
    'content-type': 'text/html; charset=utf-8',
    'content-length': String(_0x1aa3b9.length),
    'retry-after': String(soonestRetrySec(soonestRetrySec)),
    'cache-control': 'no-store'
  });
  _0x3df449.end(_0x1aa3b9);
}

function sendUpstream(_0x26eaab, _0x3e74be, _0x5810cd, _0x1c7edd) {
  const _0xa56100 = {
    'blJkV': 'EJNXc',
    'ICnUo': function(_0x2f0230, _0x1fc220, _0x2d5e79) { return _0x2f0230(_0x1fc220, _0x2d5e79);},
    'shegU': function(_0x586a0e, _0x10b723) { return _0x586a0e + _0x10b723; },
    'YhCzC': 'content-type',
    'Gguye': function(_0x477cad, _0x159e7a) { return _0x477cad(_0x159e7a); },
    'LVAkh': 'cache-control',
    'HlNev': 'public, max-age=604800, immutable',
    'PWmUN': 'public, max-age=3600',
    'MGUXg': function(_0x213ba2, _0x4c3b12) { return _0x213ba2 === _0x4c3b12; },
    'HxzzD': 'HEAD',
    'gVCno': function(_0x45cefb, _0x4aea90) { return _0x45cefb === _0x4aea90; },
    'DQPGg': function(_0x512822, _0x1010a3) { return _0x512822(_0x1010a3); },
    'GfqVn': function(_0x18d58f, _0x3c0a7c) { return _0x18d58f > _0x3c0a7c; },
    'IsnGh': function(_0x36ad5c, _0xf1a160) { return _0x36ad5c === _0xf1a160; },
    'raNsu': 'data',
    'hnSIo': 'end',
    'KkDxK': 'aborted'
  };
  const _0x124e4b = _0x5810cd.upRes;
  const _0x3a1143 = _0x124e4b.statusCode;
  const _0x3a5fbd = {};
  
  for (const _0x36bf2d of Object.keys(_0x124e4b.headers)) {
    if (!RES_DROP.has(_0x36bf2d)) {
      _0x3a5fbd[_0x36bf2d] = _0x124e4b.headers[_0x36bf2d];
    }
  }
  
  const _0x4851db = String(_0x3a5fbd[_0xa56100.YhCzC] || '');
  const _0x208ae3 = _0xa56100.Gguye(String, _0x3a5fbd[_0xa56100.LVAkh] || '');

  if (!_0x208ae3 && _0x3a1143 === 200 && (STATIC_CT.test(_0x4851db) || /x-icon/i.test(_0x4851db))) {
    if (/[-_.][A-Za-z0-9_-]{8,}\.(?:js|css|woff2?|png|jpe?g|webp|avif|svg)(?:[?#]|$)/.test(_0x26eaab.url || '')) {
        _0x3a5fbd[_0xa56100.LVAkh] = _0xa56100.HlNev;
    } else {
        _0x3a5fbd[_0xa56100.LVAkh] = _0xa56100.PWmUN;
    }
}
  
  if (_0x5810cd.body) {
    _0x3e74be.writeHead(_0x3a1143, _0x3a5fbd);
    _0x3e74be.end(_0xa56100.MGUXg(_0x26eaab.method, _0xa56100.HxzzD) ? undefined : _0x5810cd.body);
    
    return;
  }
  
  let _0x167218 = null;
  
  if (_0x1c7edd && _0xa56100.gVCno(_0x3a1143, 200) && !_0x3a5fbd['set-cookie'] && STATIC_CT.test(_0x4851db) && !/no-store|private/i.test(_0x208ae3)) {
    const _0x31ec2a = _0xa56100.DQPGg(ttlOf, _0x3a5fbd[_0xa56100.LVAkh] || '');
    const _0x57fbcc = _0xa56100.DQPGg(Number, _0x3a5fbd['content-length']);
    
    if (_0xa56100.GfqVn(_0x31ec2a, 0) && !(Number.isFinite(_0x57fbcc) && _0xa56100.GfqVn(_0x57fbcc,CACHE_ITEM_MAX))) {
      _0x167218 = {
        'chunks': [],
        'size': 0,
        'ttl': _0x31ec2a,
        'ok': true
      };
    }
  }
  
  _0x3e74be.writeHead(_0x3a1143, _0x3a5fbd);
  
  if (_0x26eaab.method === 'HEAD' || _0xa56100.IsnGh(_0x3a1143, 204) || _0xa56100.gVCno(_0x3a1143, 304)) {
    _0x124e4b.resume();
    _0x3e74be.end();
    
    return;
  }
  
  _0x124e4b.pipe(_0x3e74be);
  _0x167218 && (_0x124e4b.on(_0xa56100.raNsu, _0x21ff56 => {    
    if (!_0x167218.ok) return;
    
    _0x167218.size += _0x21ff56.length;
    
    if (_0x167218.size > CACHE_ITEM_MAX) {
      _0x167218.ok = false;
      _0x167218.chunks = null;
    } else _0x167218.chunks.push(_0x21ff56);
  }),
  _0x124e4b.on(_0xa56100.hnSIo, () => {
    _0x167218.ok && !_0x124e4b.aborted && _0xa56100.ICnUo(cacheSet, _0x1c7edd, {
      'status': _0x3a1143,
      'headers': _0x3a5fbd,
      'body': Buffer.concat(_0x167218.chunks),
      'at': Date.now(),
      'exp': _0xa56100.shegU(Date.now(), _0x167218['ttl'])
    })
  }));
  _0x124e4b.on('error', () => {
    try {
      _0x3e74be.destroy();
    } catch (_0x1cf05b) {}
  });
  _0x124e4b.on(_0xa56100.KkDxK, () => {
    try {
      _0x3e74be.destroy();
    } catch (_0x272708) {}
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

async function handle(_0x3ceaeb, _0x26c461) {
  const _0xbdb751 = {
    'qLUlO': function(_0x168cfe, _0xedb970) { return _0x168cfe + _0xedb970; },
    'GwQMM': function(_0x4377c1, _0x5a99e4) { return _0x4377c1 + _0x5a99e4; },
    'DUKcb': 'gw_site',
    'iSmCB': 'accept-encoding',
    'zQijO': 'OPTIONS',
    'kEgjT': 'sijJo',
    'eAYDW': 'jMooI',
    'hGeIp': function(_0x5388a0, _0x5b5df2, _0x20e820) { return _0x5388a0(_0x5b5df2, _0x20e820); },
    'SDqmY': 'yrrrt',
    'wgDtN': 'E2BIG',
    'XyfZH': 'payload too large',
    'nCiIE': function(_0x4c60a7, _0x23531b) { return _0x4c60a7 !== _0x23531b; },
    'zsOvW': 'cyCfP',
    'AObef': function(_0x52bedf, _0x5a8115) { return _0x52bedf(_0x5a8115); },
    'WZkLW': function(_0x52fb88, _0x5a9173) { return _0x52fb88 !== _0x5a9173; },
    'CDXUc': 'cTXaL',
    'yRFDj': 'CoNAH',
    'qsGHN': function(_0x35521b, _0x305489, _0x401d9f) { return _0x35521b(_0x305489, _0x401d9f); },
    'PUPuV': function(_0x55fda2, _0x3c348b, _0x105101, _0x41de7a) { return _0x55fda2(_0x3c348b, _0x105101, _0x41de7a); },
    'gBkLX': 'Proxy Error',
    'PnhWc': function(_0x3ab13c, _0x257620) { return _0x3ab13c === _0x257620; },
    'NWrnO': 'jiELs',
    'BvNtV': function(_0x2f2a4c, _0x1a3847, _0x3fcc3a) { return _0x2f2a4c(_0x1a3847, _0x3fcc3a); },
    'axyKm': function(_0x46782a, _0x52d16e, _0x196b14, _0x42899f, _0x424752) { return _0x46782a(_0x52d16e, _0x196b14, _0x42899f, _0x424752); },
    'WEEcA': function(_0x4833a0, _0x3ab17c) { return _0x4833a0(_0x3ab17c); }
  };
  const _0x24411b = _0x3ceaeb.url || '/';
   
  if (_0x24411b === '/_proxy/health' || _0x24411b === '/_render/health') return sendText(_0x26c461, 200, 'ok');
  if (_0x24411b === '/robots.txt') return sendText(_0x26c461, 200, 'User-agent: *\nDisallow: /\n', {
    'cache-control': 'public,\x20max-age=86400'
  });
  if (/^\/apple-touch-icon(-precomposed|-\d+x\d+)*\.png(\?|$)/['test'](_0x24411b)) {
    return (
      _0x26c461.writeHead(204, {
        'cache-control': 'public, max-age=86400'
      }),
      _0x26c461.end()
    );
  }
  
  if (_0x24411b.startsWith('/_proxy/status')) {
    if (env.STATUS_TOKEN) {
      let _0x5399f3 = '';
      
      try {
        _0x5399f3 = new URL(_0x24411b, 'http://x').searchParams.get('token') || '';
      } catch (_0x48c478) {}
      if (_0x5399f3 !== env.STATUS_TOKEN) return sendText(_0x26c461, 403, 'forbidden');
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
      _0x26c461.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': String(_0x55772c.length),
      'cache-control': 'no-store'
    }),
      _0x26c461.end(_0x55772c)
    )
  }
  
  if (_0x24411b[0] !== '/') return sendText(_0x26c461, 400, 'bad request');
  if (_0x24411b === '/favicon.ico' && String(env.FAVICON).toLowerCase() !== 'proxy') {
    if ('YNfpj' === 'YNfpj') {
      return (
        _0x26c461.writeHead(204),
        _0x26c461.end()
      )
    } else {
      try {
        _0x2851cf.end();
      } catch (_0x5221ca) {}
      
      return;
    }
  }
  
  if (!workers.length) return sendText(_0x26c461, 500, 'No worker configured');
  
  const _0x41951a = /^(GET|HEAD|OPTIONS)$/.test(_0x3ceaeb.method);
  let _0x56dcfa = null;
  
  if (CACHE_ON && _0x3ceaeb.method === 'GET' && !_0x3ceaeb.headers.range && !_0x3ceaeb.headers.authorization) {
    _0x56dcfa = _0xbdb751.qLUlO(_0xbdb751.GwQMM(publicHost(_0x3ceaeb) + '|', cookieOf(_0x3ceaeb.headers.cookie, _0xbdb751.DUKcb)), '|') + (_0x3ceaeb.headers[_0xbdb751.iSmCB] || '') + '|' + _0x24411b;
    const _0x122e20 = cacheGet(_0x56dcfa);
    
    if (_0x122e20) {
      return (
        cacheHits++,
        serveCached(_0x3ceaeb, _0x26c461, _0x122e20)
      )
    }
    
    cacheMiss++;
  }
  
  let _0x5cbec1 = Buffer.alloc(0);
  
  if (!_0x41951a || _0x3ceaeb.method === _0xbdb751.zQijO) {
    if (_0xbdb751.kEgjT !== _0xbdb751.eAYDW) try {
      _0x5cbec1 = await _0xbdb751.hGeIp(readBody, _0x3ceaeb, MAX_BODY);
    } catch (_0x25b493) {
      if (_0xbdb751.SDqmY !== _0xbdb751.SDqmY) {
        if (!_0x2bf0ac.writableEnded) {
          _0x269dd3.dead = true;
          
          if (_0x404c67.cancel) _0x28c4d4.cancel();
        }
      } else return sendText(_0x26c461, _0x25b493.code === _0xbdb751.wgDtN ? 413 : 400, _0x25b493.code === _0xbdb751.wgDtN ? _0xbdb751.XyfZH : 'bad request');
    } else {
      if (_0x5e844c.upRes) {
        _0xd23ff5.upRes.destroy();
      }
      
      return;
    }
  }
  
  const _0x1195a8 = {
    'method': _0x3ceaeb.method,
    'path': _0x24411b,
    'headers': _0xbdb751.hGeIp(buildHeaders, _0x3ceaeb, _0x5cbec1.length),
    'body': _0x5cbec1,
    'cancel': null,
    'dead': false
  };
  
  _0x26c461.on('close', () => {    
    if (!_0x26c461.writableEnded) {
      _0x1195a8.dead = true;
      
      if (_0x1195a8.cancel) _0x1195a8.cancel();
    }
  });
  
  await syncShared();
  
  const _0x16678a = new Set();
  let _0x761e44 = null;
  
  for (let _0x5dec01 = 0; _0x5dec01 < MAX_ATTEMPTS; _0x5dec01++) {
    if (_0xbdb751.nCiIE('cyCfP', _0xbdb751.zsOvW)) _0x5da628.destroy();
    else {
      if (_0x1195a8.dead) return;
      
      const _0x39fcba = _0xbdb751.AObef(pick, _0x16678a);
      
      if (!_0x39fcba) break;
      
      _0x16678a.add(_0x39fcba.id);
      _0x39fcba.used++;
      
      const _0x5af209 = await attempt(_0x39fcba, _0x1195a8);
      
      if (_0x1195a8.dead) {
        if (_0xbdb751.WZkLW('cTXaL', _0xbdb751.CDXUc)) {
          if (!_0x44fc8e.has(_0x3538ac)) return null;
          
          const _0x348efd = _0x3ae1e7.toString('utf8', 0, 4096);
          
          if (_0x2b5ba7.test(_0x348efd)) return 'quota';
          if (_0x3d949d.test(_0x348efd)) return 'rate';
          if (_0x12f3a7.test(_0x348efd)) return 'workererr';
          
          return null;
        } else {
          if (_0x5af209.upRes) {
            _0x5af209.upRes.destroy();
          }
          
          return;
        }
      }
      
      if (_0x5af209.error) {
        if ('sdkXJ' !== _0xbdb751.yRFDj) {
          _0xbdb751.qsGHN(markFail, _0x39fcba, _0x5af209.error);
          
          if (_0x41951a || SAFE_ERR.has(_0x5af209.error)) continue;
          
          return _0xbdb751.PUPuV(sendText, _0x26c461, 502, _0xbdb751.gBkLX);
        } else return (
          _0x414054.writeHead(204),
          _0x25b84f.end()
        )
      }
      if (_0x5af209.kind === 'quota' || _0xbdb751.PnhWc(_0x5af209.kind, 'rate')) {
        await applyKind(_0x39fcba, _0x5af209.kind);
        
        continue;
      }
      
      if (_0x5af209.kind === 'workererr') {
        if (_0xbdb751.nCiIE('EmGIX', _0xbdb751.NWrnO)) {
          await _0xbdb751.BvNtV(applyKind, _0x39fcba, _0x5af209.kind);
          
          _0x761e44 = _0x5af209;
          
          if (_0x41951a) continue;
          
          return _0xbdb751.axyKm(sendUpstream, _0x3ceaeb, _0x26c461, _0x5af209, null);
        } else {
          const _0x1e56e3 = _0x5df31f.get(_0x122e77);
          
          _0x1e56e3 && (_0x5e5c78 -= _0x1e56e3.size, _0xf921e3.delete(_0xc69fcf));
          _0x334853.size = _0x12fa25.body.length + 1024;
          _0x33b945.set(_0x3e6de7, _0x7c0b9b);
          _0x31590b += _0x470435.size;
          
          while (_0x1be4b9 > _0x3fa102 && _0x57af07.size) {
            const [_0x52c8a3, _0x186b42] = _0x49d659.entries().next().value;
            _0x42641f.delete(_0x52c8a3);
            _0x992ba2 -= _0x186b42.size;
          }
        }
      }
      
      return (
        markOk(_0x39fcba),
        sendUpstream(_0x3ceaeb, _0x26c461, _0x5af209, _0x56dcfa)
      )
    }
  }
  
  if (_0x761e44) return sendUpstream(_0x3ceaeb, _0x26c461, _0x761e44, null);
  
  return _0xbdb751.WEEcA(sendBusy, _0x26c461);
}

const requestListener = (_0x2c62ec, _0x597c3c) => {  
  handle(_0x2c62ec, _0x597c3c).catch(_0x12af1a => {
    console.error('[handle]', _0x12af1a && _0x12af1a.message);
    
    if (!_0x597c3c.headersSent) sendText(_0x597c3c, 502, 'Proxy Error');
    else try {
      _0x597c3c.destroy();
    } catch (_0x38f7d2) {}
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
  server.on('clientError', (_0x3af7ba, _0x11de11) => {
    try {
      _0x11de11.destroy();
    } catch (_0xf7d33a) {}});
  
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
