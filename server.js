/*
const a0_0x59777e = (function() {
    let _0x422cd9 = true;
    
    return function(_0x53351b, _0x2657d3) {
      const _0x30d177 = _0x422cd9 ? function(){
        if (_0x2657d3) {
          const _0x242d3a = _0x2657d3.apply(_0x53351b, arguments);
          _0x2657d3 = null
          
          return _0x242d3a;
        }
      } : function() {};
  
      _0x422cd9 = false
      
      return _0x30d177;
    };
  }())
  
  const a0_0x1a0a37 = a0_0x59777e(this, function() {
    const _0x2f5c80 = {
      'ngNKk': 'last-modified',
      'hjVjc': 'HIT',
      'etrYW': 'cache-control',
      'ppORj': function(_0x42cb33, _0x12b037) { return _0x42cb33 !== _0x12b037; },
      'yXBfh': function(_0x153236, _0x38685f) { return _0x153236 !== _0x38685f; },
      'WBAzE': "WdMjv",
      'maULq': 'DFBBS',
      'iUpDJ': '(((.+)+)+)+$'
    };
    
    if (_0x2f5c80.ppORj(a0_0x1a0a37.bind().toString().indexOf('\x0a'), -1)) {
      if (_0x2f5c80.yXBfh(_0x2f5c80.WBAzE, _0x2f5c80.maULq)) return;
      else {
        const _0x31ce8c = {
          'last-modified': _0x42c38c.headers[_0x2f5c80.ngNKk],
          'x-proxy-cache': _0x2f5c80.hjVjc
        };
        
        if (_0x1e5967.headers[_0x2f5c80.etrYW]) {
          _0x31ce8c["cache-control"] = _0x18c179.headers[_0x2f5c80.etrYW];
        }
        
        _0x43adae.writeHead(304, _0x31ce8c);
        _0x25659f.end();
        
        return;
      }
    }
    
    return a0_0x1a0a37.toString().search(_0x2f5c80.iUpDJ).toString().constructor(a0_0x1a0a37).search('(((.+)+)+)+$');
  });
  
  a0_0x1a0a37();
*/
'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');
const env = process.env;
const num = (_0x47b474, _0x2cdef1) => {
  const _0x4e88f5 = {
    'eTJFR': function(_0x221abe, _0xaf5d14) { return _0x221abe !== _0xaf5d14; }
  };
  
  const _0x5cff89 = Number(_0x47b474);
  
  return _0x4e88f5.eTJFR(_0x47b474, undefined) && _0x4e88f5.eTJFR(_0x47b474, '') && Number.isFinite(_0x5cff89) ? _0x5cff89 : _0x2cdef1;
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

for (const s of rawList.split(/[\x20,]+/).map(_0x4eae20 => _0x4eae20.trim().replace(/\/+$/,'')).filter(Boolean)) {
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
  const _0x70e52c = {
    'qiFNO': function(_0x2ef505, _0x2bbe35) { return _0x2ef505 !== _0x2bbe35; },
    'pwSuj': function(_0xff39fe, _0x5908d7){ return _0xff39fe === _0x5908d7; },
    'LyaLH': 'quota',
    'ZcsQY': 'OvnCe',
    'ngiah': 'HLAxZ'
  };
  const _0x45b7dc = utcDay();
  
  if (_0x70e52c.qiFNO(_0x3ec273.day, _0x45b7dc)) {
    _0x3ec273.day = _0x45b7dc;
    _0x3ec273.used = 0;
    
    if (_0x70e52c.pwSuj(_0x3ec273.reason, _0x70e52c.LyaLH)) {
      _0x70e52c.pwSuj(_0x70e52c.ZcsQY, _0x70e52c.ngiah) ? _0x435b29.end() : (_0x3ec273.blockedUntil = 0, _0x3ec273.reason = '', _0x3ec273.fails = 0)
    }
  };
}

function block(_0x3c7f7c, _0x15f983, _0x59b646) {
  const _0x4ea2ca = {
    'qauvx': function(_0xb6fc03, _0x5e9b2e) { return _0xb6fc03 + _0x5e9b2e; },
    'OskGG': function(_0x5bfafb, _0x509694) { return _0x5bfafb + _0x509694; },
    'XosED': function(_0x2c6a50, _0x508fc2) { return _0x2c6a50 + _0x508fc2; },
    'Uqrgr': function(_0x430ba8, _0x4f9256) { return _0x430ba8 + _0x4f9256; },
    'PPnNd': function(_0x203a01, _0x599fb3) { return _0x203a01 + _0x599fb3; },
    'htozH': '[worker#',
    'YjECA': function(_0x790d02, _0x326dd0) { return _0x790d02(_0x326dd0)}
  };
  _0x3c7f7c.blockedUntil = _0x4ea2ca.qauvx(Date.now(), _0x15f983);
  _0x3c7f7c.reason = _0x59b646;
  
  console.log(_0x4ea2ca.qauvx(_0x4ea2ca.OskGG(_0x4ea2ca.XosED(_0x4ea2ca.OskGG(_0x4ea2ca.OskGG(_0x4ea2ca.Uqrgr(_0x4ea2ca.PPnNd(_0x4ea2ca.XosED(_0x4ea2ca.htozH,　_0x3c7f7c.id),　'] 停止'),　_0x59b646),　'\x20→\x20'), new Date(_0x3c7f7c.blockedUntil).toISOString()), '\x20('), _0x4ea2ca.YjECA(jst, _0x3c7f7c.blockedUntil)), ')'));
}

function markOk(_0x76f179) {
  _0x76f179.fails = 0;
}

function markFail(_0x246637, _0x1b6590) {
  const _0x5c0ee9 = {
    'iIdBz': function(_0x489178, _0x1ffa28) { return _0x489178 >= _0x1ffa28; },
    'NlpfQ': function(_0x278df3, _0xd4659b, _0x15c344, _0x494013) { return _0x278df3(_0xd4659b, _0x15c344, _0x494013); },
    'xwHRX': function(_0x5cae77, _0x5a9b91) { return _0x5cae77 - _0x5a9b91; }
  };
  
  _0x246637.fails++;
  
  if (_0x5c0ee9.iIdBz(_0x246637.fails, 2)) _0x5c0ee9.NlpfQ(block, _0x246637, Math.min(15000 * Math.pow(2, _0x5c0ee9.xwHRX(_0x246637.fails, 2)), 300000), _0x1b6590);
}

async function applyKind(_0x24bc09, _0xf3df15) {
  const _0x46e2d2 = {
    'uRQww': 'public, max-age=86400',
    'SOMHH': function(_0x767e4a, _0x13e1f0) { return _0x767e4a === _0x13e1f0; },
    'oGguo': 'quota',
    'TDjVf': function(_0x4c6313, _0x28b520, _0x2d450c, _0x4b7368) { return _0x4c6313(_0x28b520, _0x2d450c, _0x4b7368); },
    'nBllr': function(_0x5ceda6, _0xe7a9cd) { return _0x5ceda6 - _0xe7a9cd; },
    'nQXWp': function(_0x48e781) { return _0x48e781(); },
    'LvaaJ': function(_0x1efd42, _0x1854c2) { return _0x1efd42(_0x1854c2); },
    'tSqxR': 'rate',
    'PPQHk': function(_0x53ad72, _0xbbc9e3) { return _0x53ad72 !== _0xbbc9e3; },
    'xtJIH': 'wKPnQ',
    'lThWK': 'RDKKw',
    'lihsO': 'workererr',
    'LGksH': function(_0x1c5304, _0x31ccb2, _0x5836db) { return _0x1c5304(_0x31ccb2, _0x5836db); },
    'CGkEp': 'worker-error'
  };
  
  if (_0x46e2d2.SOMHH(_0xf3df15, _0x46e2d2.oGguo)) {
    _0x46e2d2.TDjVf(block, _0x24bc09, _0x46e2d2.nBllr(_0x46e2d2.nQXWp(nextUtcMidnight), Date.now()) + 30000, _0x46e2d2.oGguo);
    _0x24bc09.fails = 0;
    await _0x46e2d2.LvaaJ(shareBlock, _0x24bc09);
  } else {
    if (_0x46e2d2.SOMHH(_0xf3df15, _0x46e2d2.tSqxR)) {
      if (_0x46e2d2.PPQHk(_0x46e2d2.xtJIH, _0x46e2d2.lThWK)) {
        block(_0x24bc09, 60000, _0x46e2d2.tSqxR);
        await shareBlock(_0x24bc09);
      } else {
        return _0x3b3d19.writeHead(204, {
          'cache-control': _0x46e2d2.uRQww
        }),
          _0x32476e.end();
      }
    } else {
      if (_0x46e2d2.SOMHH(_0xf3df15, _0x46e2d2.lihsO)) {
        _0x46e2d2.LGksH(markFail, _0x24bc09, _0x46e2d2.CGkEp);
      }
    }
  }
}

function pick(_0x559529) {
  const _0x128bd8 = {
    'qgvBq': function(_0x492222, _0x49ab5a) { return _0x492222 !== _0x49ab5a; },
    'mltQO': 'VYTce',
    'rTuUG': 'rtyzG',
    'sYrnW': function(_0xa5de69, _0x3016f1) { return _0xa5de69(_0x3016f1); },
    'OwMmU': function(_0x5b2cba, _0x327aba){ return _0x5b2cba > _0x327aba; }
  };
  const _0x6d8fa5 = Date.now();
  const _0x11bdf5 = [];
  
  for (const _0x18b637 of workers) {
    
    if (_0x128bd8.qgvBq(_0x128bd8.mltQO, _0x128bd8.rTuUG)) {
      _0x128bd8.sYrnW(rollover, _0x18b637);
      
      if (_0x559529 && _0x559529.has(_0x18b637.id)) continue;
      if (_0x128bd8.OwMmU(_0x18b637.blockedUntil, _0x6d8fa5)) continue;
      
      _0x11bdf5.push(_0x18b637);
    
    } else _0x46bffc.push();
  }
  
  if (!_0x11bdf5.length) return null;
  
  return (
    _0x11bdf5.sort(() => Math.random() - 0.5),
    _0x11bdf5.sort((_0x56a768, _0x1f0e1c) => _0x56a768.used - _0x1f0e1c.used),
    _0x11bdf5[0]
  );
}

function soonestRetrySec() {
  const _0x9b094f = {
    'Kjchp': function(_0x4a87b0, _0x59e618) { return _0x4a87b0 - _0x59e618; },
    'xBiIz': function(_0xa9982, _0x1cc777) { return _0xa9982 / _0x1cc777; }
  };
  const _0x5179a4 = Date.now();
  let _0x2a4ea5 = Infinity;
  
  for (const _0x58005c of workers){
    if (_0x58005c.blockedUntil > _0x5179a4) {
      _0x2a4ea5 = Math.min(_0x2a4ea5, _0x9b094f.Kjchp(_0x58005c.blockedUntil, _0x5179a4));
    }
  
    return Number.isFinite(_0x2a4ea5) ? Math.max(1, Math.min(3600, Math.ceil(_0x9b094f.xBiIz(_0x2a4ea5, 1000)))) : 30;
  }
}

const QUOTA_RE =/error\x20*code:?\x20*1027|error\x20*1027|daily request limit|exceeded[^.]{0,40}(free|daily)[^.]{0,40}(limit|tier|quota)/i;
const RATE_RE = /error\x20*code:?\x20*1015|error\x20*1015|you are being rate limited/i;
const WERR_RE = /error\x20*code:?\x20*110[12]|error\x20*110[12]|worker threw exception|exceeded resource limits/i;

function classify(_0x4beeb3, _0x4295ef) {
  const _0x4394c3 = {
    'DxXAa': 'quota',
    'ffZVJ': 'rate',
    'qnvsv': 'workererr'
  };
  
  if (!PEEK_STATUS.has(_0x4beeb3)) return null;
  
  const _0x5d8a5a = _0x4295ef.toString('utf8', 0, 4096);
  
  if (QUOTA_RE.test(_0x5d8a5a)) return _0x4394c3.DxXAa;
  if (RATE_RE.test(_0x5d8a5a)) return _0x4394c3.ffZVJ;
  if (WERR_RE.test(_0x5d8a5a)) return _0x4394c3.qnvsv;
  
  return null;
}

const shareKey = _0x456ea4 => 'wproxy:block:' + _0x456ea4.url.host;

async function rest(_0x1354b4) {
  const _0x4111fd = {
    'rGiFr': 'shared',
    'bocAp': 'HIT',
    'mzCdX': function(_0x544b82, _0x581429) { return _0x544b82(_0x581429); },
    'foXIt': function(_0x3d300d, _0x17d735) { return _0x3d300d / _0x17d735; },
    'IOlzU': 'if-none-match',
    'VowvM': function(_0x4aec3c, _0x6501aa) { return _0x4aec3c === _0x6501aa; },
    'FJIfy': 'cache-control',
    'ySSXu': 'if-modified-since',
    'sgWmU': 'last-modified',
    'qZYrc': function(_0x2034f4, _0x201b28) { return _0x2034f4 === _0x201b28; },
    'BSGSy': 'content-length',
    'nDBgu': function(_0x46b3c0, _0x42f8d1) { return _0x46b3c0(_0x42f8d1); },
    'cnzqX': function(_0x2094f2, _0x4778d4) { return _0x2094f2 === _0x4778d4; },
    'tQNCm': 'nhRUp',
    'bwNgk': 'EXWWX',
    'heouY': function(_0x1fc36d, _0x3645d0, _0x5875a9) { return _0x1fc36d(_0x3645d0, _0x5875a9); },
    'cXken': function(_0x2e6aa6, _0x1f7a8c, _0x899ed5) { return _0x2e6aa6(_0x1f7a8c, _0x899ed5); },
    'APHHa': function(_0x37b77b, _0x2aca08) { return _0x37b77b + _0x2aca08; },
    'VwzFr': function(_0x5ad9c3, _0xc91cdf) { return _0x5ad9c3 + _0xc91cdf; },
    'ysyOq': 'Bearer',
    'rlIuU': 'guBCg',
    'nOPNq': 'VNLzq'
  };
  
  if (!REDIS_URL) return null;
  
  try {
    if (_0x4111fd['tQNCm'] === _0x4111fd.bwNgk) {
      _0x2d3dc0.blockedUntil = _0x25ce83;
      _0xe3a36d.reason = _0x4111fd.rGiFr;
    } else {
      const _0x4a4c3f = new AbortController();
      const _0x10eaea = _0x4111fd.heouY(setTimeout, () => _0x4a4c3f.abort(), 1500);
      const _0x131c34 = await _0x4111fd.cXken(fetch, _0x4111fd.APHHa(REDIS_URL, _0x1354b4), {
        'headers': {
          'Authorization': _0x4111fd.VwzFr(_0x4111fd.ysyOq, REDIS_TOKEN)
        },
        'signal': _0x4a4c3f.signal
      });
      
      return (
        _0x4111fd.mzCdX(clearTimeout, _0x10eaea),
        await _0x131c34.json()
      )
    }
  } catch (_0x29bbda) {
    if (_0x4111fd.qZYrc(_0x4111fd.rlIuU, _0x4111fd.nOPNq)) {
      const _0x3287a3 = _0x5205c8.assign({}, _0x1081ec.headers, {
        'x-proxy-cache': _0x4111fd.bocAp,
        'age': _0x4111fd.mzCdX(_0x4d1958, _0x18f3df.floor(_0x4111fd.foXIt(_0x13a80a.now() - _0xf98f55.at, 1000)))
      });
      const _0x1fc144 = _0x525775.headers[_0x4111fd.IOlzU];
      
      if (_0x1fc144 && _0x50f834.headers.etag && _0x4111fd.VowvM(_0x1fc144, _0xc0e3b0.headers.etag)) {
        const _0x3a8b78 = {
          'etag': _0x495bd9.headers.etag,
          'x-proxy-cache': _0x4111fd.bocAp
        };
        
        if (_0x561ef6.headers[_0x4111fd.FJIfy]) {
          _0x3a8b78[_0x4111fd.FJIfy] = _0x197283.headers[_0x4111fd.FJIfy];
        }
        
        _0x33af8b.writeHead(304, _0x3a8b78);
        _0x120931.end();
        
        return;
      }
      
      const _0x4607ca = _0x151ce8.headers[_0x4111fd.ySSXu];
      
      if (!_0x1fc144 && _0x4607ca && _0x2af99e.headers[_0x4111fd.sgWmU] && _0x4111fd.qZYrc(_0x4607ca, _0x4e1a58.headers['last-modified'])) {
        const _0x12cdd1 = {
          'last-modified': _0x4fa7e1.headers[_0x4111fd.sgWmU],
          'x-proxy-cache': 'HIT'
        };
        
        if (_0x5cd5b8.headers[_0x4111fd.FJIfy]) {
          _0x12cdd1[_0x4111fd.FJIfy] = _0x443518.headers[_0x4111fd.FJIfy];
        }
        
        _0x3af5da.writeHead(304, _0x12cdd1);
        _0x4e1232.end();
        
        return;
      }
      
      _0x3287a3[_0x4111fd.BSGSy] = _0x4111fd.nDBgu(_0x3c8c0d, _0x265800.body.length);
      _0x39fd83.writeHead(_0x19198b.status, _0x3287a3);
      _0x152b5e.end(_0x4111fd.cnzqX(_0x38e635.method, 'HEAD') ? _0xc38fcb : _0x44bbc7.body);
    } else return null;
  }
}

async function shareBlock(_0x2308cd) {
  const _0x2ae5e = {
    'hnsfv': function(_0x240b0c, _0x4e8fcc) { return _0x240b0c / _0x4e8fcc; },
    'DmJme': function(_0x3c89e2, _0x57428e) { return _0x3c89e2 - _0x57428e; },
    'YifRN': function(_0x34b297, _0x44aa11) { return _0x34b297(_0x44aa11); },
    'ZYSww': function(_0x57723b, _0x206ab7) { return _0x57723b + _0x206ab7; },
    'oWzIc': function(_0x43e077, _0x3e89e7) { return _0x43e077 + _0x3e89e7; },
    'TgnhJ': '/set/',
    'NciVR': function(_0x1c1438, _0x1c9e3a) { return _0x1c1438(_0x1c9e3a); },
    'zCSZZ': '/EX/'
  };
  
  if (!REDIS_URL) return;
  
  const _0x297605 = Math.max(1, Math.ceil(_0x2ae5e.hnsfv(_0x2ae5e.DmJme(_0x2308cd.blockedUntil, Date.now()), 1000)));
  
  await _0x2ae5e.YifRN(rest, _0x2ae5e.ZYSww(_0x2ae5e.ZYSww(_0x2ae5e.oWzIc(_0x2ae5e.oWzIc(_0x2ae5e.TgnhJ, _0x2ae5e.YifRN(encodeURIComponent, _0x2ae5e.NciVR(shareKey, _0x2308cd))) + '/', _0x2308cd.blockedUntil), _0x2ae5e.zCSZZ), _0x297605));
}

let lastSync = 0;

async function syncShared() {
  const _0x388a0c = {
    'nJfOl': function(_0x1ba825, _0x5a0f96) { return _0x1ba825 === _0x5a0f96; },
    'bBJgS': 'quota',
    'ApVTq': function(_0x59422c, _0x348bec) { return _0x59422c > _0x348bec; },
    'tXlXk': function(_0x309548, _0x5e484d) { return _0x309548 < _0x5e484d; },
    'xYBNs': function(_0x5e16b1, _0x1ad458) { return _0x5e16b1 !== _0x1ad458; },
    'YAfXC': 'EFszS',
    'bZkgK': 'WCKQE',
    'sEWIG': function(_0x2112a8, _0x221aa7) { return _0x2112a8 === _0x221aa7; },
    'wqOYx': 'shared',
    'xrKnS': function(_0x1bd3b7, _0x4be9d5) { return _0x1bd3b7 - _0x4be9d5; },
    'egJkm': function(_0x5e9990, _0x218a4b) { return _0x5e9990 + _0x218a4b; },
    'cjeQn': '/mget/'
  };
  
  if (!REDIS_URL || !workers.length || _0x388a0c.xrKnS(Date.now(), lastSync) < 8000) return;
  
  lastSync = Date.now();
  
  const _0xb41bec = await rest(_0x388a0c.egJkm(_0x388a0c.cjeQn, workers.map(_0x35f725 => encodeURIComponent(shareKey(_0x35f725))).join('/')));
  
  if (!_0xb41bec || !Array.isArray(_0xb41bec.result)) return;
  
  const _0x3aae34 = Date.now();
  
  workers.forEach((_0x32a7dc, _0x739b29) => {
    const _0x152522 = Number(_0xb41bec.result[_0x739b29]);
    
    if (Number.isFinite(_0x152522) && _0x388a0c.ApVTq(_0x152522, _0x3aae34)) {
      _0x388a0c.tXlXk(_0x32a7dc.blockedUntil, _0x152522) && (_0x388a0c.xYBNs(_0x388a0c.YAfXC, _0x388a0c.bZkgK) ? (_0x32a7dc.blockedUntil = _0x152522, _0x32a7dc.reason = 'shared') : (_0x3730fa.day = _0x3269f9, _0x3d6737.used = 0, BOCSrP.nJfOl(_0x353f5b.reason, BOCSrP.bBJgS) && (_0x3546b7.blockedUntil = 0, _0x2f138a.reason = '', _0x39d8c8.fails = 0)));
    } else {
      _0x388a0c.sEWIG(_0x32a7dc.reason, _0x388a0c.wqOYx) && (_0x32a7dc.blockedUntil = 0, _0x32a7dc.reason = '');
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
  const _0x189504 = {
    'XmPoD': function(_0x139bf5, _0x47f2d3) { return _0x139bf5 !== _0x47f2d3; },
    'KATtd': 'koBqI',
    'FVnne': 'VzbCT',
    'LLYYu': function(_0x2aaa5c, _0x59f2e0) {
      return _0x2aaa5c + _0x59f2e0;
    }
  };
  const _0x1a9a62 = cache.get(_0x1e6e00);
  
  if (_0x1a9a62) {
    if (_0x189504.XmPoD(_0x189504.KATtd, _0x189504.FVnne)) {
      cacheBytes -= _0x1a9a62.size;
      cache.delete(_0x1e6e00);
    } else try {
      _0x56aaf7.destroy();
    } catch (_0x3ee246) {}
  }
  _0x50c0ba.size = _0x189504.LLYYu(_0x50c0ba.body.length, 1024);
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
  const _0x1b9822 = {
    'GSSQF': function(_0x3fffa3, _0x34e29a) { return _0x3fffa3(_0x34e29a); }
  };
  const _0x145ed4 = /(?:^|,)\x20*s-maxage=(\d+)/i.exec(_0x4bbd5d) || /(?:^|,)\x20*max-age=(\d+)/i.exec(_0x4bbd5d);
  
  if (!_0x145ed4) return CACHE_DEFAULT_TTL;
  
  return Math.min(_0x1b9822.GSSQF(Number, _0x145ed4[1]) * 1000, CACHE_MAX_TTL);
}

function cookieOf(_0x4b1b87, _0x5880b1) {
  const _0x27c510 = {
    'nGRfr': function(_0x365ad5, _0x18bf7d) { return _0x365ad5 + _0x18bf7d; },
    'BIJSf': '(?:^|;\s*)',
    'QFnBs': function(_0x29c1dc, _0x454191) { return _0x29c1dc || _0x454191; }
  };
  const _0x551e37 = new RegExp(_0x27c510.nGRfr(_0x27c510.BIJSf, _0x5880b1) + '=([^;]*)').exec(_0x27c510.QFnBs(_0x4b1b87,''));
  
  return _0x551e37 ? _0x551e37[1] : '';
}

const REQ_DROP = new Set(['host', 'connection', 'keep-alive', 'proxy-connection', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-length', 'expect', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port', 'x-real-ip', 'forwarded', 'via', 'true-client-ip', 'cdn-loop', 'x-request-start']);
const RES_DROP = new Set(['connection', 'keep-alive', 'proxy-authenticate', 'proxy-connection', 'te', 'trailer', 'transfer-encoding', 'upgrade']);
const dropReq = _0x48b67e => REQ_DROP.has(_0x48b67e) || _0x48b67e.startsWith('cf-') || _0x48b67e.startsWith('x-vercel') || _0x48b67e.startsWith('x-render') || _0x48b67e.startsWith('rndr');
const publicHost = _0x445970 => String(_0x445970.headers['x-forwarded-host'] || _0x445970.headers.host || '').split(',')[0]['trim']();

function buildHeaders(_0x4d6500, _0x450dfc) {
  const _0x563af5 = {
    'sFtPy': function(_0x57fc6e, _0x43e60f) { return _0x57fc6e(_0x43e60f); },
    'ATJHm': 'x-forwarded-host',
    'jOnZa': function(_0x39b868, _0x14d54b) { return _0x39b868(_0x14d54b); },
    'uNNGd': 'x-forwarded-proto',
    'vXdJg': 'https',
    'WaSuO': function(_0x5682bb, _0x228589) { return _0x5682bb > _0x228589; },
    'irrpl': 'content-length',
    'DorPU': function(_0x404c64, _0x520426) { return _0x404c64(_0x520426); }
  };
  const _0xb4a879 = {};
  
  for (const _0x8ca855 of Object.keys(_0x4d6500.headers)) {
    if (!_0x563af5.sFtPy(dropReq, _0x8ca855)) {
      _0xb4a879[_0x8ca855] = _0x4d6500.headers[_0x8ca855];
    }
  }
  
  _0xb4a879[_0x563af5.ATJHm] = _0x563af5.jOnZa(publicHost, _0x4d6500);
  _0xb4a879[_0x563af5.uNNGd] = _0x563af5.vXdJg;
  
  if (_0x563af5.WaSuO(_0x450dfc, 0) || !/^(GET|HEAD)$/.test(_0x4d6500.method)) {
    _0xb4a879[_0x563af5.irrpl] = _0x563af5.DorPU(String, _0x450dfc);
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
  const _0xd48df5 = {
    'pyzNe': function(_0x5555f2, _0x33ea7d) { return _0x5555f2 > _0x33ea7d; },
    'gLJGC': function(_0xdd161e, _0x172505) { return _0xdd161e === _0x172505; },
    'TynuE': 'asDPb',
    'gHQJN': function(_0x12af7e, _0x55b0ef) { return _0x12af7e(_0x55b0ef); },
    'AtpdE': function(_0x3f90be, _0x4cc62b, _0x56df80) { return _0x3f90be(_0x4cc62b, _0x56df80); },
    'nwoDP': 'HIT',
    'pdZgW': 'cache-control',
    'DSAtj': 'wPIuK',
    'kLokE': 'bsWSf',
    'ZeVhP': 'WlKLT',
    'nUFIV': 'yRPoj',
    'isKZg': function(_0x32a35e, _0x115ca1) { return _0x32a35e(_0x115ca1); },
    'ADaLd': 'content-length',
    'RXwau': function(_0x107f09, _0x781a97) { return _0x107f09 <= _0x781a97; },
    'kawRy': 'yKOXk',
    'jQEdz': 'end',
    'JLUlK': 'error',
    'ZNorC': 'HKNog',
    'QgeEp': 'header timeout',
    'znUSn': 'EHDRTIMEOUT',
    'TDKPW': function(_0x288f02, _0x37a080) { return _0x288f02 + _0x37a080; },
    'zjptz': function(_0x22203e, _0x357815) { return _0x22203e + _0x357815; },
    'MBFcN': function(_0x2d5edd, _0x35fea6) { return _0x2d5edd + _0x35fea6; },
    'RjUGK': function(_0x147294, _0x3ffdf7) { return _0x147294 + _0x3ffdf7; },
    'tpiEO': function(_0x4f72d0, _0x379455) { return _0x4f72d0 / _0x379455; },
    'OqfyX': ':00)',
    'UpIJN': 'mMkal',
    'BHZeM': function(_0x931811, _0x25c64e) { return _0x931811 === _0x25c64e; },
    'kRnaU': 'http:'
  };
  
  return new Promise(_0x1b4755 => {
    const _0x4a60a1 = {
      'fAXzq': function(_0x38d6f7, _0x145da4, _0x559c3b) {        
        return _0xd48df5.AtpdE(_0x38d6f7, _0x145da4, _0x559c3b);
      },
      'pzPmY': _0xd48df5.nwoDP,
      'CigTr': _0xd48df5.pdZgW,
      'wwSbF': function(_0x3c8e93, _0x2e676d) {        
        return _0xd48df5.gLJGC(_0x3c8e93, _0x2e676d);
      },
      'wgofK': _0xd48df5.DSAtj,
      'JrlwO': _0xd48df5.kLokE,
      'PlInK': function(_0x30c8d3, _0x150c0c) { return _0xd48df5.gHQJN(_0x30c8d3, _0x150c0c); },
      'iovsk': function(_0x9bc621, _0x29f345) { return _0x9bc621(_0x29f345); },
      'LnTDz': function(_0x27d142, _0x4bbbe0, _0xf75b3c) { return _0xd48df5.AtpdE(_0x27d142, _0x4bbbe0, _0xf75b3c); },
      'wJFcA': function(_0x4c1ea3, _0x24413d) { return _0x4c1ea3 !== _0x24413d; },
      'Atxdh': _0xd48df5.ZeVhP,
      'rKHqD': _0xd48df5.nUFIV,
      'uovST': function(_0x2d1b81, _0xdfd656) {        
        return _0xd48df5.isKZg(_0x2d1b81, _0xdfd656);
      },
      'wNAkq': _0xd48df5.ADaLd,
      'YddqD': function(_0x429729, _0x1aa7b3) {        
        return _0xd48df5.RXwau(_0x429729, _0x1aa7b3);
      },
      'muQNk': _0xd48df5.kawRy,
      'fpntu': 'data',
      'QtVYF': _0xd48df5.jQEdz,
      'XJePe': _0xd48df5.JLUlK,
      'Jmnck': function(_0x14a5a9, _0x555d16) { return _0x14a5a9 !== _0x555d16; },
      'xblxm': _0xd48df5.ZNorC,
      'xvTZH': _0xd48df5.QgeEp,
      'gwEAO': _0xd48df5.znUSn,
      'qYHaE': function(_0x3d908d, _0x2b8995) {        
        return _0xd48df5.TDKPW(_0x3d908d, _0x2b8995);
      },
      'mqhDL': function(_0x1ffcec, _0x3c3052) {        
        return _0xd48df5.zjptz(_0x1ffcec, _0x3c3052);
      },
      'djrjK': function(_0x50df52, _0x7a27c1) { return _0xd48df5.MBFcN(_0x50df52, _0x7a27c1); },
      'jiTvX': function(_0x4843dd, _0x434c1e) {        
        return _0xd48df5.TDKPW(_0x4843dd, _0x434c1e);
      },
      'mAMQK': function(_0x8b6e80, _0x19a61f) {        
        return _0xd48df5.RjUGK(_0x8b6e80, _0x19a61f);
      },
      'XhhkM': function(_0xcbb378, _0x296968) { return _0xd48df5.TDKPW(_0xcbb378, _0x296968); },
      'NzHlA': function(_0x3f3220, _0x4d82df) { return _0xd48df5.MBFcN(_0x3f3220, _0x4d82df); },
      'ARGLB': '/ workers=',
      'ddelv': '\x20/\x20reset=UTC',
      'wnkwS': function(_0x549a1e, _0x4f56c1) {        
        return _0xd48df5.tpiEO(_0x549a1e, _0x4f56c1);
      },
      'kZqPS': _0xd48df5.OqfyX,
      'WSgWX': function(_0x314e5a, _0x55d64a) { return _0x314e5a !== _0x55d64a; },
      'iCEcx': _0xd48df5.UpIJN
    };
    const _0x349671 = _0xd48df5.BHZeM(_0x4b9a72.url.protocol, _0xd48df5.kRnaU);
    let _0x3d2a1d = false;
    let _0xb53ec0 = null;
    const _0x13ef3e = _0xfe12af => {
      const _0x115577 = {
        'VhtLw': function(_0x8a4aa3, _0x37aef8) {          
          return _0xd48df5.pyzNe(_0x8a4aa3, _0x37aef8);
        }
      };
      
      if ('mEDwg' !== 'mEDwg') {
        _0x303288.close(() => _0x397c11.exit(0));
        _0x4a60a1.fAXzq(_0x5eb2e8, () => _0x40749c.exit(0), 5000).unref();
      } else {
        if (!_0x3d2a1d) {
          if (_0xd48df5.gLJGC('YAPLd', _0xd48df5.TynuE)) {
            if (_0x406a58) return;
            
            _0x320746 += _0x596664.length;
            
            if(_0x115577.VhtLw(_0x29772c, _0x56f17c)) {
              _0x13bfcc = true;
              _0x36189d.length = 0;
            } else _0x5f33de.push(_0x3d12fc);
          } else {
            _0x3d2a1d = true;
            clearTimeout(_0xb53ec0);
            _0xd48df5.gHQJN(_0x1b4755, _0xfe12af);
          }
        }
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
        if (_0x4a60a1.wJFcA(_0x4a60a1.Atxdh, _0x4a60a1.rKHqD)) {
          _0x4a60a1.uovST(clearTimeout, _0xb53ec0);
          const _0x490f3c = _0x23f22f.statusCode;
          const _0x19af27 = _0x4a60a1.PlInK(Number, _0x23f22f.headers[_0x4a60a1.wNAkq]);
          
          if (PEEK_STATUS.has(_0x490f3c) && Number.isFinite(_0x19af27) && _0x4a60a1.YddqD(_0x19af27, PEEK_MAX)) {
            if (_0x4a60a1.muQNk !== 'yKOXk') {
              const _0xfbc07e = {
                'etag': _0x316795.headers.etag,
                'x-proxy-cache': _0x4a60a1.pzPmY
              };
              
              if (_0x3e11b6.headers[_0x4a60a1.CigTr]) {
                _0xfbc07e['cache-control'] = _0xc0d1c5.headers[_0x4a60a1.CigTr];
              }
              
              _0x5811bc.writeHead(304, _0xfbc07e);
              _0x464068.end();
              
              return;
            } else {
              const _0x6273eb = [];
              _0x23f22f.on(_0x4a60a1.fpntu, _0x118f2c => _0x6273eb.push(_0x118f2c));
              _0x23f22f.on(_0x4a60a1.QtVYF, () => {
                if (_0x4a60a1.wwSbF(_0x4a60a1.wgofK, _0x4a60a1.JrlwO)) {
                  _0x4db7b7.destroy();
                } else {
                  const _0x4cd5c0 = Buffer.concat(_0x6273eb);
                  _0x4a60a1.PlInK(_0x13ef3e, {
                    'upRes': _0x23f22f,
                    'body': _0x4cd5c0,
                    'kind': classify(_0x490f3c, _0x4cd5c0)
                  });
                }
              });
              _0x23f22f.on(_0x4a60a1.XJePe, () => _0x13ef3e({
                'error': 'ECONNRESET'
              }));
              
              return;
            }
          }
          
          _0x4a60a1.PlInK(_0x13ef3e, {
            'upRes': _0x23f22f
          });
        } else {
          const _0x5e3672 = _0x15b7a9.concat(_0x12b008);
          _0x4a60a1.iovsk(_0x2c0131, {
            'upRes': _0x3dca77,
            'body': _0x5e3672,
            'kind': _0x4a60a1.LnTDz(_0x1f8ebe, _0x3e60be, _0x5e3672)
          });
        }
      }
    );
    
    _0xb53ec0 = setTimeout(() => {
      const _0xe18691 = {
        'pEzWM': function(_0x327d02, _0x2b21b1) { return _0x327d02 !== _0x2b21b1; }
      };
      
      if (_0x4a60a1.Jmnck(_0x4a60a1.xblxm, _0x4a60a1.xblxm)) {
        if (kGPyDN.pEzWM(_0x4c00d5.bind().toString().indexOf('\x0a'), -1)) return;
        
        return _0x330461.toString().search('(((.+)+)+)+$').toString().constructor(_0xff56aa).search('(((.+)+)+)+$');
      } else {
        _0x584c5c.destroy(Object.assign(new Error(_0x4a60a1.xvTZH), {
          'code': _0x4a60a1.gwEAO
        }));
      }
    } , HEADER_TIMEOUT);
    _0x584c5c.on(_0xd48df5.JLUlK, _0x491320 => _0x13ef3e({
      'error': _0x491320 && _0x491320.code || 'ERROR'
    }));
    _0x1f4728.cancel = () => {      
      if (_0x4a60a1.WSgWX(_0x4a60a1.iCEcx, _0x4a60a1.iCEcx)) {
        _0x25b5fb.log(_0x4a60a1.qYHaE(_0x4a60a1.mqhDL(_0x4a60a1.djrjK(_0x4a60a1.jiTvX(_0x4a60a1.mAMQK(_0x4a60a1.XhhkM(_0x4a60a1.NzHlA('[proxy] listening on :' + _0x3d4911, _0x4a60a1.ARGLB), _0x5916b2.length), _0x4a60a1.ddelv), _0x4a60a1.wnkwS(_0x5e9983, 3600000)), ':00\x20(日本時間\x20'), (_0x443937 / 3600000 + 9) % 24), _0x4a60a1.kZqPS));
      } else try {
        if (_0x4a60a1.wwSbF('PIIOq', 'szgCx')) {
          _0x44e9b5.dead = true;
          
          if (_0x3a730f.cancel) {
            _0x482872.cancel();
          }
        
        } else _0x584c5c.destroy();
      } catch (_0x1817ac) {} };
    if (_0x1f4728.body && _0x1f4728.body.length) {
      _0x584c5c.end(_0x1f4728.body);
    }
    
    else _0x584c5c.end();
  });
}

function sendText(_0x123509, _0x4832ca, _0x29ed62, _0x30f989) {
  const _0x5923a8 = {
    'kclZl': function(_0x400c2c, _0x2aedc0) { return _0x400c2c === _0x2aedc0; },
    'QXuUq': 'rPtkP',
    'FGHSA': 'utf8',
    'fgOHy': 'text/plain; charset=utf-8',
    'vRreu': 'no-store'
  };
  
  if (_0x123509.headersSent) {
    if (_0x5923a8.kclZl(_0x5923a8.QXuUq, _0x5923a8.QXuUq)) {
      try {
        _0x123509.end();
      } catch (_0x4d4d19) {}
      
      return;
    } else {
      if (!_0x233ce4(_0x1eae89)) {
        _0x50444a[_0x57c61b] = _0x6586db.headers[_0x27c91c];
      }
    }
  }
  
  const _0x3af457 = Buffer.from(_0x29ed62, _0x5923a8.FGHSA);
  _0x123509.writeHead(_0x4832ca, Object.assign({
    'content-type': _0x5923a8.fgOHy,
    'content-length': String(_0x3af457.length),
    'cache-control': _0x5923a8.vRreu
  }, _0x30f989 || {}));
  _0x123509.end(_0x3af457);
}

function sendBusy(_0x3df449) {
  const _0x1283b7 = {
    'WvlbE': function(_0x4cbaf9, _0x6ab412) { return _0x4cbaf9 === _0x6ab412; },
    'fgVFD': 'E2BIG',
    'CfRYL': 'payload too large',
    'obJnF': 'bad\x20request',
    'IAEwE': 'HbIgx',
    'SgHab': function(_0x33386e, _0x3e80d6) {
      return _0x33386e + _0x3e80d6;
    },
    'anVeJ': '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>混み合っています</title>',
    'kESYh': '<body style="font-family:system-ui,sans-serif;background:#0b0b14;color:#e5e7eb;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center;padding:16px">',
    'HGcco': '<h2>ただいま混み合っています</h2><p>しばらくしてからもう一度開いてください。</p></div></body>',
    'fdDoG': 'utf8',
    'NcmbG': 'text/html; charset=utf-8',
    'vyRqt': function(_0x2df7ae, _0x1021ee) { return _0x2df7ae(_0x1021ee); },
    'fICRc': function(_0x277df8) {return _0x277df8(); }
  };
  
  if (_0x3df449.headersSent) {
    try {
      if (_0x1283b7.WvlbE(_0x1283b7.IAEwE, _0x1283b7.IAEwE)) {
        _0x3df449.end();
      } else return _0x520b16(_0x40820a, _0x1283b7.WvlbE(_0x4d4c8e.code, 'E2BIG') ? 413 : 400, _0x1283b7.WvlbE(_0x21f468.code, _0x1283b7.fgVFD) ? _0x1283b7.CfRYL : _0x1283b7.obJnF);
    } catch (_0x1982af) {} return;
  }
  
  const _0x27f891 = _0x1283b7.SgHab(_0x1283b7.SgHab(_0x1283b7.anVeJ, _0x1283b7.kESYh), _0x1283b7.HGcco);
  const _0x1aa3b9 = Buffer.from(_0x27f891, _0x1283b7.fdDoG); 
  _0x3df449.writeHead(503, {
    'content-type': _0x1283b7.NcmbG,
    'content-length': _0x1283b7.vyRqt(String, _0x1aa3b9.length),
    'retry-after': _0x1283b7.vyRqt(String, _0x1283b7.fICRc(soonestRetrySec)),
    'cache-control': 'no-store'
  });
  _0x3df449.end(_0x1aa3b9);
}

function sendUpstream(_0x26eaab, _0x3e74be, _0x5810cd, _0x1c7edd) {
  const _0xa56100 = {
    'gXDEJ': function(_0x167737, _0x19fc3a) { return _0x167737 > _0x19fc3a; },
    'EpnPr': 'http://x',
    'lCXtO': 'token',
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
    
    if (_0xa56100.gXDEJ(_0x167218.size, CACHE_ITEM_MAX)) {
      _0x167218.ok = false;
      _0x167218.chunks = null;
    } else _0x167218.chunks.push(_0x21ff56);
  }),
  _0x124e4b.on(_0xa56100.hnSIo, () => {
    _0xa56100.blJkV === _0xa56100.blJkV ? _0x167218.ok && !_0x124e4b.aborted && _0xa56100.ICnUo(cacheSet, _0x1c7edd, {
      'status': _0x3a1143,
      'headers': _0x3a5fbd,
      'body': Buffer.concat(_0x167218.chunks),
      'at': Date.now(),
      'exp': _0xa56100.shegU(Date.now(), _0x167218['ttl'])
    }) : _0x5497e5 = new _0x469de9(_0x91c4c2, _0xa56100.EpnPr).searchParams.get(_0xa56100.lCXtO) || '';
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
  const _0x29d046 = {
    'WUnia': 'HIT',
    'JpHdj': function(_0x2ab970, _0x5665c7) { return _0x2ab970(_0x5665c7); },
    'YXldw': function(_0x2449d6, _0x2a4ec7) { return _0x2449d6 / _0x2a4ec7; },
    'hzcuO': function(_0x1f3288, _0x3ce555) { return _0x1f3288 - _0x3ce555; },
    'rhgrE': 'if-none-match',
    'duVHm': function(_0x1ef442, _0x3794cb) { return _0x1ef442 === _0x3794cb; },
    'EkLJu': 'cache-control',
    'paTAI': 'if-modified-since',
    'xpYzr': 'last-modified',
    'BzFjr': 'FyVZx',
    'wbYTo': 'rCKqu',
    'PiDbf': 'HEAD'
  };
  const _0x484cdf = Object.assign({}, _0x2be3ad.headers, {
    'x-proxy-cache': _0x29d046.WUnia,
    'age': _0x29d046.JpHdj(String, Math.floor(_0x29d046.YXldw(_0x29d046.hzcuO(Date.now(), _0x2be3ad.at), 1000)))
  });
  const _0x37e3fb = _0x1cd095.headers[_0x29d046.rhgrE];
  
  if (_0x37e3fb && _0x2be3ad.headers.etag && _0x29d046.duVHm(_0x37e3fb, _0x2be3ad.headers.etag)) {
    const _0x43d05d = {
      'etag': _0x2be3ad.headers.etag,
      'x-proxy-cache': 'HIT'
    };
    
    if (_0x2be3ad.headers['cache-control']) {
      _0x43d05d[_0x29d046.EkLJu] = _0x2be3ad.headers[_0x29d046.EkLJu];
    }
    
    _0x5ed84d.writeHead(304, _0x43d05d);
    _0x5ed84d.end();
    
    return;
  }
  
  const _0x569e1b = _0x1cd095.headers[_0x29d046.paTAI];
  
  if (!_0x37e3fb && _0x569e1b && _0x2be3ad.headers['last-modified'] && _0x569e1b === _0x2be3ad.headers[_0x29d046.xpYzr]) {
    if (_0x29d046.duVHm(_0x29d046.BzFjr, _0x29d046.wbYTo)) {
      if (!_0x50ae14.ok) return;
      
      _0xf09f59.size += _0x317394.length;
      
      if(_0x2a5e9a.size > _0x3defaa) {
        _0x546e9d.ok = false;
        _0x12a96c.chunks = null;
      } else _0x36a1b6.chunks.push(_0x1105e4);
    } else {
      const _0x58d26e = {
        'last-modified': _0x2be3ad.headers[_0x29d046.xpYzr],
        'x-proxy-cache': _0x29d046.WUnia
      };
      
      if (_0x2be3ad.headers['cache-control']) {
        _0x58d26e[_0x29d046.EkLJu] = _0x2be3ad.headers['cache-control'];
      }
      
      _0x5ed84d.writeHead(304, _0x58d26e);
      _0x5ed84d.end();
      
      return;
    }
  }
  
  _0x484cdf['content-length'] = _0x29d046.JpHdj(String, _0x2be3ad.body.length);
  _0x5ed84d.writeHead(_0x2be3ad.status, _0x484cdf);
  _0x5ed84d.end(_0x29d046.duVHm(_0x1cd095.method, _0x29d046.PiDbf) ? undefined : _0x2be3ad.body);
}

function readBody(_0x1468fe, _0x2ec702) {
  const _0x50ce26 = {
    'nNRDU': 'data',
    'yGnnU': 'end',
    'HFdtC': 'error',
    'icvUM': 'aborted',
    'QDgia': function(_0x1e7b68, _0x538469) { return _0x1e7b68(_0x538469); },
    'RTnGK': function(_0x5b2b7f, _0x3f65fd) { return _0x5b2b7f === _0x3f65fd; },
    'RNdoN': function(_0x34c470, _0x18443d) { return _0x34c470 > _0x18443d; },
    'ojvbP': 'KTKyh'
  };
  
  return new Promise((_0x22aa4f, _0x32edfe) => {
    const _0xdc4752 = {
      'Hkqdq': function(_0x4436f3, _0x7f7450) { return _0x50ce26.QDgia(_0x4436f3, _0x7f7450); },
      'UxHqc': function(_0x6f2bec, _0x3e34da) { return _0x6f2bec(_0x3e34da); },
      'Pwikf': function(_0xff3848, _0x5e4661) {
        return _0x50ce26.RTnGK(_0xff3848, _0x5e4661);
      },
      'fGIgy': 'IwQSG',
      'dXlwe': function(_0x1f57c2, _0x26067b) { return _0x1f57c2 > _0x26067b; },
      'oHyvN': function(_0xe53358, _0x212a43) {        
        return _0x50ce26.RNdoN(_0xe53358, _0x212a43);
      }
    };
    
    if ('KTKyh' === _0x50ce26.ojvbP) {
      const _0x3d9c19 = [];
      let _0x187320 = 0;
      let _0x79b269 = false;
      
      _0x1468fe.on(_0x50ce26.nNRDU, _0x1f2459 => {        
        if (_0xdc4752.Pwikf(_0xdc4752.fGIgy, _0xdc4752.fGIgy)) {
          if (_0x79b269) return;
          
          _0x187320 += _0x1f2459.length;
          
          if (_0xdc4752.dXlwe(_0x187320,　_0x2ec702)) {
            _0x79b269 = true;
            _0x3d9c19.length = 0;
          } else _0x3d9c19.push(_0x1f2459);
        } else {
          _0xe4ac09 = true;
          MlQSEE.Hkqdq(_0x3d8199, _0x3f638b);
          MlQSEE.UxHqc(_0x51826d, _0x399435);
        }
      });
      _0x1468fe.on('end', () => _0x79b269 ? _0x32edfe(Object.assign(new Error('too large'), {
        'code': 'E2BIG'
      })) : _0x22aa4f(Buffer.concat(_0x3d9c19)));
      _0x1468fe.on('error', _0x32edfe);
      _0x1468fe.on(_0x50ce26.icvUM, () => _0x32edfe(new Error('aborted')));
    } else {
      const _0x31a77e = [];
      let _0x2b26df = 0;
      let _0x286a71 = false;
      
      _0x46a32d.on(_0x50ce26.nNRDU,
      _0x435f4f => {        
        if (_0x286a71) return;
        
        _0x2b26df += _0x435f4f.length;
        
        if (_0xdc4752.oHyvN(_0x2b26df, _0x4d500b)) {
          _0x286a71 = true;
          _0x31a77e.length = 0;
        } else _0x31a77e.push(_0x435f4f);
      });
      _0x44db43.on(_0x50ce26.yGnnU, () => _0x286a71 ? _0x413e05(_0x47f9a4.assign(new _0x324026('too large'), {
        'code': 'E2BIG'
      })) : _0x38c9a1(_0x3bfe1d.concat(_0x31a77e)));
      _0x2d99b7.on(_0x50ce26.HFdtC, _0x523504);
      _0x174ee9.on(_0x50ce26.icvUM, () => _0x49ed92(new _0x24edaa('aborted')));
    }
  });
}

async function handle(_0x3ceaeb, _0x26c461) {
  const _0xbdb751 = {
    'EIebK': function(_0x49870c, _0x39818d, _0x3ded8b) { return _0x49870c(_0x39818d, _0x3ded8b); },
    'pMrtm': function(_0x24cc88, _0x4bb45d) { return _0x24cc88 + _0x4bb45d; },
    'QCrUv': 'quota',
    'ZUyvb': 'rate',
    'KDwfU': 'workererr',
    'sXWOf': function(_0x193f4e, _0x28067f) { return _0x193f4e + _0x28067f; },
    'BuARm': function(_0x3dc911, _0x2af398) { return _0x3dc911 > _0x2af398; },
    'vrjjk': function(_0x17dfbc, _0x501c08) { return _0x17dfbc === _0x501c08; },
    'hPjpt': '/_proxy/health',
    'kkZNO': function(_0x45defb, _0x5a28f8, _0x15caa3, _0x39c705) { return _0x45defb(_0x5a28f8, _0x15caa3, _0x39c705); },
    'FVPEZ': function(_0x4bae0f, _0x102e82) { return _0x4bae0f === _0x102e82; },
    'gKqLz': '/robots.txt',
    'EVjmB': function(_0x1060fa, _0x1e22fa, _0x5204ca, _0x200fda, _0xbbdf2d) { return _0x1060fa(_0x1e22fa, _0x5204ca, _0x200fda, _0xbbdf2d); },
    'YTElt': 'User-agent:\x20*\x0aDisallow:\x20/\x0a',
    'FSTDi': function(_0x4d5a33, _0x1789e3) { return _0x4d5a33 === _0x1789e3; },
    'IZKls': 'DhGuZ',
    'jesqD': 'public,\x20max-age=86400',
    'ONJlW': 'http://x',
    'CGDkO': 'token',
    'SJJmb': function(_0x25ea8c, _0xd0175d) { return _0x25ea8c !== _0xd0175d; },
    'HKNoj': 'forbidden',
    'RcsNk': function(_0x53f8ef) { return _0x53f8ef(); },
    'iaUNm': function(_0xef905, _0x3692d7) { return _0xef905(_0x3692d7); },
    'mbLdi': 'none',
    'rzPwz': function(_0x43b963, _0x5de354) { return _0x43b963 / _0x5de354; },
    'igMym': 'application/json; charset=utf-8',
    'bXWUr': function(_0x4c9a39, _0x4ba3c6, _0x3808cf, _0x4b4e72) { return _0x4c9a39(_0x4ba3c6, _0x3808cf, _0x4b4e72); },
    'YfWGj': 'bad\x20request',
    'stMOZ': function(_0x3716f2, _0x51938b) { return _0x3716f2 === _0x51938b; },
    'lLrdr': '/favicon.ico',
    'HdjNo': 'proxy',
    'kuXdA': 'YNfpj',
    'wCFws': 'GET',
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
   
  if (_0xbdb751.vrjjk(_0x24411b, _0xbdb751.hPjpt) || _0x24411b === '/_render/health') return _0xbdb751.kkZNO(sendText, _0x26c461, 200, 'ok');
  if (_0xbdb751.FVPEZ(_0x24411b, _0xbdb751.gKqLz)) return _0xbdb751.EVjmB(sendText, _0x26c461, 200, _0xbdb751.YTElt, {
    'cache-control': 'public,\x20max-age=86400'
  });
  if (/^\/apple-touch-icon(-precomposed|-\d+x\d+)*\.png(\?|$)/['test'](_0x24411b)) {
    if (_0xbdb751.FSTDi(_0xbdb751.IZKls, 'DhGuZ')) return (
      _0x26c461.writeHead(204, {
        'cache-control': _0xbdb751.jesqD
      }),
      _0x26c461.end()
    );
    else lygiDv.EIebK(_0x18f476, _0x1c9e42, {
      'status': _0x4fa56f,
      'headers': _0x4975a0,
      'body': _0x9cc78.concat(_0x1793c2.chunks),
      'at': _0xc7f9ca.now(),
      'exp': lygiDv.pMrtm(_0x2d8e37.now(), _0x2172d5['ttl'])
    });
  }
  
  if (_0x24411b.startsWith('/_proxy/status')) {
    if (env.STATUS_TOKEN) {
      let _0x5399f3 = '';
      
      try {
        _0x5399f3 = new URL(_0x24411b, _0xbdb751.ONJlW).searchParams.get(_0xbdb751.CGDkO) || '';
      } catch (_0x48c478) {}
      if (_0xbdb751.SJJmb(_0x5399f3, env.STATUS_TOKEN)) return sendText(_0x26c461, 403, _0xbdb751.HKNoj);
    }
    
    await _0xbdb751.RcsNk(syncShared);
    
    const _0x2003fb = Date.now();
    const _0x2410f4 = {
      'note': 'このインスタンスから見た状態です（Vercel はインスタンスが複数あります）',
      'time': new Date().toISOString(),
      'timeJST': _0xbdb751.iaUNm(jst, Date.now()),
      'sharedState': REDIS_URL ? 'redis' : _0xbdb751.mbLdi,
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
        'mb': +_0xbdb751.rzPwz(cacheBytes, 1048576).toFixed(1),
        'hits': cacheHits,
        'misses': cacheMiss
      }
    };
    const _0x55772c = Buffer.from(JSON.stringify(_0x2410f4, null, 2));
    
    return (
      _0x26c461.writeHead(200, {
      'content-type': _0xbdb751.igMym,
      'content-length': _0xbdb751.iaUNm(String, _0x55772c.length),
      'cache-control': 'no-store'
    }),
      _0x26c461.end(_0x55772c)
    )
  }
  
  if (_0x24411b[0] !== '/') return _0xbdb751.bXWUr(sendText, _0x26c461, 400, _0xbdb751.YfWGj);
  if (_0xbdb751.stMOZ(_0x24411b, _0xbdb751.lLrdr) && _0xbdb751.SJJmb(_0xbdb751.iaUNm(String, env.FAVICON).toLowerCase(), _0xbdb751.HdjNo)) {
    if (_0xbdb751.FVPEZ(_0xbdb751.kuXdA, 'YNfpj')) {
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
  
  if (!workers.length) return _0xbdb751.kkZNO(sendText, _0x26c461, 500, 'No worker configured');
  
  const _0x41951a = /^(GET|HEAD|OPTIONS)$/.test(_0x3ceaeb.method);
  let _0x56dcfa = null;
  
  if (CACHE_ON && _0xbdb751.FSTDi(_0x3ceaeb.method, _0xbdb751.wCFws) && !_0x3ceaeb.headers.range && !_0x3ceaeb.headers.authorization) {
    _0x56dcfa = _0xbdb751.sXWOf(_0xbdb751.qLUlO(_0xbdb751.GwQMM(_0xbdb751.sXWOf(_0xbdb751.iaUNm(publicHost, _0x3ceaeb), '|'), _0xbdb751.EIebK(cookieOf, _0x3ceaeb.headers.cookie, _0xbdb751.DUKcb)), '|') + (_0x3ceaeb.headers[_0xbdb751.iSmCB] || ''), '|') + _0x24411b;
    const _0x122e20 = cacheGet(_0x56dcfa);
    
    if (_0x122e20) {
      return (
        cacheHits++,
        _0xbdb751.kkZNO(serveCached, _0x3ceaeb, _0x26c461, _0x122e20)
      )
    }
    
    cacheMiss++;
  }
  
  let _0x5cbec1 = Buffer.alloc(0);
  
  if (!_0x41951a || _0x3ceaeb.method === _0xbdb751.zQijO) {
    if (_0xbdb751.SJJmb(_0xbdb751.kEgjT, _0xbdb751.eAYDW)) try {
      _0x5cbec1 = await _0xbdb751.hGeIp(readBody, _0x3ceaeb, MAX_BODY);
    } catch (_0x25b493) {
      if (_0xbdb751.SDqmY !== _0xbdb751.SDqmY) {
        if (!_0x2bf0ac.writableEnded) {
          _0x269dd3.dead = true;
          
          if (_0x404c67.cancel) _0x28c4d4.cancel();
        }
      } else return _0xbdb751.kkZNO(sendText, _0x26c461, _0x25b493.code === _0xbdb751.wgDtN ? 413 : 400, _0x25b493.code === _0xbdb751.wgDtN ? _0xbdb751.XyfZH : _0xbdb751.YfWGj);
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
  
  await _0xbdb751.RcsNk(syncShared);
  
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
          
          if (_0x2b5ba7.test(_0x348efd)) return lygiDv.QCrUv;
          if (_0x3d949d.test(_0x348efd)) return lygiDv.ZUyvb;
          if (_0x12f3a7.test(_0x348efd)) return lygiDv.KDwfU;
          
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
      if (_0x5af209.kind === _0xbdb751.QCrUv || _0xbdb751.PnhWc(_0x5af209.kind, 'rate')) {
        await _0xbdb751.EIebK(applyKind, _0x39fcba, _0x5af209.kind);
        
        continue;
      }
      
      if (_0xbdb751.vrjjk(_0x5af209.kind, _0xbdb751.KDwfU)) {
        if (_0xbdb751.nCiIE('EmGIX', _0xbdb751.NWrnO)) {
          await _0xbdb751.BvNtV(applyKind, _0x39fcba, _0x5af209.kind);
          
          _0x761e44 = _0x5af209;
          
          if (_0x41951a) continue;
          
          return _0xbdb751.axyKm(sendUpstream, _0x3ceaeb, _0x26c461, _0x5af209, null);
        } else {
          const _0x1e56e3 = _0x5df31f.get(_0x122e77);
          
          _0x1e56e3 && (_0x5e5c78 -= _0x1e56e3.size, _0xf921e3.delete(_0xc69fcf));
          _0x334853.size = lygiDv.sXWOf(_0x12fa25.body.length, 1024);
          _0x33b945.set(_0x3e6de7, _0x7c0b9b);
          _0x31590b += _0x470435.size;
          
          while (lygiDv.BuARm(_0x1be4b9, _0x3fa102) && _0x57af07.size) {
            const [_0x52c8a3, _0x186b42] = _0x49d659.entries().next().value;
            _0x42641f.delete(_0x52c8a3);
            _0x992ba2 -= _0x186b42.size;
          }
        }
      }
      
      return (
        markOk(_0x39fcba),
        _0xbdb751.EVjmB(sendUpstream, _0x3ceaeb, _0x26c461, _0x5af209, _0x56dcfa)
      )
    }
  }
  
  if (_0x761e44) return _0xbdb751.EVjmB(sendUpstream, _0x3ceaeb, _0x26c461, _0x761e44, null);
  
  return _0xbdb751.WEEcA(sendBusy, _0x26c461);
}

const requestListener = (_0x2c62ec, _0x597c3c) => {
  const _0x51c460 = {
    'WrhhG': function(_0x145bc3, _0x32953e, _0x44f53e, _0x1a410e) { return _0x145bc3(_0x32953e, _0x44f53e, _0x1a410e); },
    'bgZac': 'Proxy Error',
    'muewO': 'SBDWW',
    'AlOYe': 'jBriU'
  };
  
  handle(_0x2c62ec, _0x597c3c).catch(_0x12af1a => {
    console.error('[handle]', _0x12af1a && _0x12af1a.message);
    
    if (!_0x597c3c.headersSent) _0x51c460.WrhhG(sendText, _0x597c3c, 502, _0x51c460.bgZac);
    else try {
      if (_0x51c460.muewO !== _0x51c460.AlOYe) _0x597c3c.destroy();
      else return (
        _0x529421.delete(_0x2092e5),
        _0x3ea322 -= _0x49bf43.size,
        null
      )
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
    const _0x28f6db = {
      'ECHFT': function(_0x548bbd, _0x3510cb) { return _0x548bbd + _0x3510cb; },
      'GMimx': function(_0x5ec607, _0x23cf27) { return _0x5ec607 + _0x23cf27; },
      'NopfU' :function(_0x1d7f92, _0x46cd2a) { return _0x1d7f92 + _0x46cd2a; },
      'BUQzD': '[proxy] listening on :',
      'cMKKt': '\x20/\x20workers=',
      'dlutY': '\x20/\x20reset=UTC\x20',
      'cQShq': ':00\x20(日本時間\x20',
      'ZeiHl': function(_0x51c852, _0x143bf3) { return _0x51c852 % _0x143bf3;},
      'xCwLo': function(_0x52a4c5, _0x3f8811) { return _0x52a4c5 / _0x3f8811; }
    };
    
    console.log(_0x28f6db.ECHFT(_0x28f6db.GMimx(_0x28f6db.GMimx(_0x28f6db.ECHFT(_0x28f6db.ECHFT(_0x28f6db.NopfU(_0x28f6db.NopfU(_0x28f6db.BUQzD, PORT), _0x28f6db.cMKKt), workers.length) + _0x28f6db.dlutY, RESET_OFFSET / 3600000), _0x28f6db.cQShq), _0x28f6db.ZeiHl(_0x28f6db.NopfU(_0x28f6db.xCwLo(RESET_OFFSET, 3600000), 9), 24)), ':00)'));
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
    const _0x4b3116 = {
      'efMpR': '/_proxy/health',
      'LpyCN': 'error'
    };
    
    https.get(env.RENDER_EXTERNAL_URL.replace(/\/+$/,'') + _0x4b3116.efMpR, _0x2791b1 => _0x2791b1.resume()).on(_0x4b3116.LpyCN, () => {});
  }, 10 * 60 * 1000).unref();
}
