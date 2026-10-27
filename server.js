import { main, returnArrayStrings } from "./main.js";

const a0_0x47efcc = main;

const a0_0x59777e = (function() {
  let _0x422cd9 = true;
  
  return function(_0x53351b, _0x2657d3) {
    const _0x30d177 = _0x422cd9 ? function(){
      const _0x2298d5 = main;
      if(_0x2657d3) {
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
  const _0x12148b = main;
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

'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');
const env = process.env;
const num = (_0x47b474, _0x2cdef1) => {
  const _0x27a8fe = a0_0x47efcc;
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
  const _0x2d3695 = a0_0x47efcc;
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
  const _0x374b09 = a0_0x47efcc;
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
  const _0x107f08 = a0_0x47efcc;
  _0x76f179.fails = 0;
}

function markFail(_0x246637, _0x1b6590) {
  const _0x4fc346 = a0_0x47efcc;
  const _0x5c0ee9 = {
    'iIdBz': function(_0x489178, _0x1ffa28) { return _0x489178 >= _0x1ffa28; },
    'NlpfQ': function(_0x278df3, _0xd4659b, _0x15c344, _0x494013) { return _0x278df3(_0xd4659b, _0x15c344, _0x494013); },
    'xwHRX': function(_0x5cae77, _0x5a9b91) { return _0x5cae77 - _0x5a9b91; }
  };
  
  _0x246637.fails++;
  
  if (_0x5c0ee9.iIdBz(_0x246637.fails, 2)) _0x5c0ee9.NlpfQ(block, _0x246637, Math.min(15000 * Math.pow(2, _0x5c0ee9.xwHRX(_0x246637.fails, 2)), 300000), _0x1b6590);
}

async function applyKind(_0x24bc09, _0xf3df15) {
  const _0x44e176 = a0_0x47efcc;
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
  const _0x1fd04c = a0_0x47efcc;
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
    _0x11bdf5.sort(() => Math[_0x1fd04c(691)]() - 0.5),
    _0x11bdf5.sort((_0x56a768, _0x1f0e1c) => _0x56a768.used - _0x1f0e1c.used),
    _0x11bdf5[0]
  );
}

function soonestRetrySec() {
  const _0x13856d = a0_0x47efcc;
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
  const _0x401c32 = a0_0x47efcc;
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
  const _0x154951 = a0_0x47efcc;
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
  const _0x4468d3 = a0_0x47efcc;
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
  const _0x1599f7 = a0_0x47efcc;
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
    const _0x45a8a1 = _0x1599f7;
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
  const _0x246e65 = a0_0x47efcc;
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
  const _0x37a0ac = a0_0x47efcc;
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
  const _0x4709b0 = a0_0x47efcc;
  const _0x1b9822 = {
    'GSSQF': function(_0x3fffa3, _0x34e29a) { return _0x3fffa3(_0x34e29a); }
  };
  const _0x145ed4 = /(?:^|,)\x20*s-maxage=(\d+)/i.exec(_0x4bbd5d) || /(?:^|,)\x20*max-age=(\d+)/i.exec(_0x4bbd5d);
  
  if (!_0x145ed4) return CACHE_DEFAULT_TTL;
  
  return Math.min(_0x1b9822.GSSQF(Number, _0x145ed4[1]) * 1000, CACHE_MAX_TTL);
}

function cookieOf(_0x4b1b87, _0x5880b1) {
  const _0x1b783b = a0_0x47efcc;
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
  const _0x22b66a = a0_0x47efcc;
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
  const _0x523323 = a0_0x47efcc;
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
    const _0x464b75 = _0x523323;
    const _0x4a60a1 = {
      'fAXzq': function(_0x38d6f7, _0x145da4, _0x559c3b) {
        const _0x20ce31 = main;
        
        return _0xd48df5.AtpdE(_0x38d6f7, _0x145da4, _0x559c3b);
      },
      'pzPmY': _0xd48df5.nwoDP,
      'CigTr': _0xd48df5.pdZgW,
      'wwSbF': function(_0x3c8e93, _0x2e676d) {
        const _0x578346 = _0x464b75;
        
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
        const _0x162f4d = _0x464b75;
        
        return _0xd48df5.isKZg(_0x2d1b81, _0xdfd656);
      },
      'wNAkq': _0xd48df5.ADaLd,
      'YddqD': function(_0x429729, _0x1aa7b3) {
        const _0x301fe7 = _0x464b75;
        
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
        const _0x22ad86 = _0x464b75;
        
        return _0xd48df5.TDKPW(_0x3d908d, _0x2b8995);
      },
      'mqhDL': function(_0x1ffcec, _0x3c3052) {
        const _0x598abc = _0x464b75;
        
        return _0xd48df5.zjptz(_0x1ffcec, _0x3c3052);
      },
      'djrjK': function(_0x50df52, _0x7a27c1) { return _0xd48df5.MBFcN(_0x50df52, _0x7a27c1); },
      'jiTvX': function(_0x4843dd, _0x434c1e) {
        const _0x1812fd = _0x464b75;
        
        return _0xd48df5.TDKPW(_0x4843dd, _0x434c1e);
      },
      'mAMQK': function(_0x8b6e80, _0x19a61f) {
        const _0x45841f = _0x464b75;
        
        return _0xd48df5.RjUGK(_0x8b6e80, _0x19a61f);
      },
      'XhhkM': function(_0xcbb378, _0x296968) { return _0xd48df5.TDKPW(_0xcbb378, _0x296968); },
      'NzHlA': function(_0x3f3220, _0x4d82df) { return _0xd48df5.MBFcN(_0x3f3220, _0x4d82df); },
      'ARGLB': '/ workers=',
      'ddelv': '\x20/\x20reset=UTC',
      'wnkwS': function(_0x549a1e, _0x4f56c1) {
        const _0x5e1065 = _0x464b75;
        
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
      const _0x4595ba = _0x464b75;
      const _0x115577 = {
        'VhtLw': function(_0x8a4aa3, _0x37aef8) {
          const _0x22a3bf = main;
          
          return _0xd48df5.pyzNe(_0x8a4aa3, _0x37aef8);
        }
      };

      // ここ
      
      if ('mEDwg' !== 'mEDwg') {
        _0x303288[_0x4595ba(588)](() => _0x397c11[_0x4595ba(754)](0));
        _0x4a60a1[_0x4595ba(462)](_0x5eb2e8, () => _0x40749c[_0x4595ba(754)](0), 5000)[_0x4595ba(646)]();
      } else {
        if (!_0x3d2a1d) {
          if (_0xd48df5.gLJGC('YAPLd', _0xd48df5['TynuE'])) {
            if (_0x406a58) return;
            
            _0x320746 += _0x596664.length;
            
            if(_0x115577[_0x4595ba(666)](_0x29772c, _0x56f17c)) {
              _0x13bfcc = true;
              _0x36189d.length = 0;
            } else _0x5f33de[_0x4595ba(585)](_0x3d12fc);
          } else {
            _0x3d2a1d = true;
            clearTimeout(_0xb53ec0);
            _0xd48df5[_0x4595ba(381)](_0x1b4755, _0xfe12af);
          }
        }
      }
    };
    const _0x584c5c = (_0x349671 ? http : https)['request'](
      {
        'hostname': _0x4b9a72.url[_0x464b75(301)],
        'port': _0x4b9a72.url.port || (_0x349671 ? 80 : 443),
        'path': _0x1f4728[_0x464b75(544)],
        'method': _0x1f4728.method,
        'headers': Object.assign({}, _0x1f4728.headers, {
          'host': _0x4b9a72.url.host
        }),
        'agent': _0x349671 ? httpAgent : httpsAgent
      },
      _0x23f22f => {
        const _0x3e2b1e = _0x464b75;
        if (_0x4a60a1[_0x3e2b1e(575)](_0x4a60a1[_0x3e2b1e(351)], _0x4a60a1[_0x3e2b1e(480)])) {
          _0x4a60a1[_0x3e2b1e(609)](clearTimeout, _0xb53ec0);
          const _0x490f3c = _0x23f22f['statusCode'];
          const _0x19af27 = _0x4a60a1[_0x3e2b1e(383)](Number, _0x23f22f['headers'][_0x4a60a1[_0x3e2b1e(600)]]);
          
          if (PEEK_STATUS['has'](_0x490f3c) && Number['isFinite'](_0x19af27) && _0x4a60a1[_0x3e2b1e(620)](_0x19af27, PEEK_MAX)) {
            if (_0x4a60a1[_0x3e2b1e(357)] !== 'yKOXk') {
              const _0xfbc07e = {
                'etag': _0x316795['headers'][_0x3e2b1e(343)],
                'x-proxy-cache': _0x4a60a1[_0x3e2b1e(317)]
              };
              
              if (_0x3e11b6.headers[_0x4a60a1[_0x3e2b1e(539)]]) {
                _0xfbc07e['cache-control'] = _0xc0d1c5['headers'][_0x4a60a1[_0x3e2b1e(539)]];
              }
              
              _0x5811bc[_0x3e2b1e(729)](304, _0xfbc07e);
              _0x464068.end();
              
              return;
            } else {
              const _0x6273eb = [];
              _0x23f22f['on'](_0x4a60a1[_0x3e2b1e(291)], _0x118f2c => _0x6273eb[_0x3e2b1e(585)](_0x118f2c));
              _0x23f22f['on'](_0x4a60a1[_0x3e2b1e(447)], () => {
                const _0xe8e19b = _0x3e2b1e;
                if (_0x4a60a1[_0xe8e19b(330)](_0x4a60a1[_0xe8e19b(475)], _0x4a60a1[_0xe8e19b(320)])) {
                  _0x4db7b7.destroy();
                } else {
                  const _0x4cd5c0 = Buffer[_0xe8e19b(449)](_0x6273eb);
                  _0x4a60a1['PlInK'](_0x13ef3e, {
                    'upRes': _0x23f22f,
                    'body': _0x4cd5c0,
                    'kind': classify(_0x490f3c, _0x4cd5c0)
                  });
                }
              });
              _0x23f22f['on'](_0x4a60a1[_0x3e2b1e(753)], () => _0x13ef3e({
                'error': _0x3e2b1e(477)
              }));
              
              return;
            }
          }
          
          _0x4a60a1['PlInK'](_0x13ef3e, {
            'upRes': _0x23f22f
          });
        } else {
          const _0x5e3672 = _0x15b7a9[_0x3e2b1e(449)](_0x12b008);
          _0x4a60a1[_0x3e2b1e(591)](_0x2c0131, {
            'upRes': _0x3dca77,
            'body': _0x5e3672,
            'kind': _0x4a60a1[_0x3e2b1e(495)](_0x1f8ebe, _0x3e60be, _0x5e3672)
          });
        }
      }
    );
    
    _0xb53ec0 = setTimeout(() => {
      const _0x17e85a = _0x464b75;
      const _0xe18691 = {
        'pEzWM': function(_0x327d02, _0x2b21b1) { return _0x327d02 !== _0x2b21b1; }
      };
      
      if (_0x4a60a1[_0x17e85a(736)](_0x4a60a1[_0x17e85a(751)], _0x4a60a1[_0x17e85a(751)])) {
        if (kGPyDN[_0x17e85a(570)](_0x4c00d5[_0x17e85a(336)]()[_0x17e85a(493)]()[_0x17e85a(288)]('\x0a'), -1)) return;
        
        return _0x330461['toString']()['search'](_0x17e85a(500))[_0x17e85a(493)]()['constructor'](_0xff56aa)[_0x17e85a(660)]('(((.+)+)+)+$');
      } else {
        _0x584c5c.destroy(Object['assign'](new Error(_0x4a60a1['xvTZH']), {
          'code':_0x4a60a1['gwEAO']
        }));
      }
    } , HEADER_TIMEOUT);
    _0x584c5c['on'](_0xd48df5[_0x464b75(653)], _0x491320 => _0x13ef3e({
      'error': _0x491320 && _0x491320['code'] || 'ERROR'
    }));
    _0x1f4728[_0x464b75(778)] = () => {
      const _0xf3195d = _0x464b75;
      
      if (_0x4a60a1[_0xf3195d(675)](_0x4a60a1[_0xf3195d(370)], _0x4a60a1[_0xf3195d(370)])) {
        _0x25b5fb[_0xf3195d(420)](_0x4a60a1[_0xf3195d(781)](_0x4a60a1[_0xf3195d(681)](_0x4a60a1[_0xf3195d(527)](_0x4a60a1[_0xf3195d(613)](_0x4a60a1['mAMQK'](_0x4a60a1[_0xf3195d(488)](_0x4a60a1['NzHlA'](_0xf3195d(324) + _0x3d4911, _0x4a60a1[_0xf3195d(417)]), _0x5916b2.length), _0x4a60a1[_0xf3195d(773)]), _0x4a60a1[_0xf3195d(412)](_0x5e9983, 3600000)), ':00\x20(日本時間\x20'), (_0x443937 / 3600000 + 9) % 24), _0x4a60a1[_0xf3195d(578)]));
      } else try {
        if (_0x4a60a1[_0xf3195d(330)](_0xf3195d(581), _0xf3195d(785))) {
          _0x44e9b5['dead'] = true;
          
          if(_0x3a730f[_0xf3195d(778)]) _0x482872[_0xf3195d(778)]();
        
        } else _0x584c5c['destroy']();
      } catch (_0x1817ac) {} };
    if (_0x1f4728.body && _0x1f4728.body.length) _0x584c5c.end(_0x1f4728.body);
    
    else _0x584c5c['end']();
  });
}

function sendText(_0x123509, _0x4832ca, _0x29ed62, _0x30f989) {
  const _0x440097 = a0_0x47efcc;
  const _0x5923a8 = {
    'kclZl': function(_0x400c2c, _0x2aedc0) { return _0x400c2c === _0x2aedc0; },
    'QXuUq': _0x440097(349),
    'FGHSA': _0x440097(461),
    'fgOHy': _0x440097(651),
    'vRreu': 'no-store'
  };
  
  if (_0x123509['headersSent']) {
    if (_0x5923a8[_0x440097(322)](_0x5923a8[_0x440097(589)], _0x5923a8[_0x440097(589)])) {
      try {
        _0x123509.end();
      } catch (_0x4d4d19) {}
      
      return;
    } else {
      if (!_0x233ce4(_0x1eae89)) _0x50444a[_0x57c61b] = _0x6586db.headers[_0x27c91c];
    }
  }
  
  const _0x3af457 = Buffer[_0x440097(295)](_0x29ed62, _0x5923a8['FGHSA']);
  _0x123509['writeHead'](_0x4832ca, Object[_0x440097(536)]({
    'content-type': _0x5923a8[_0x440097(617)],
    'content-length': String(_0x3af457.length),
    'cache-control': _0x5923a8[_0x440097(625)]
  }, _0x30f989 || {}));
  _0x123509.end(_0x3af457);
}

function sendBusy(_0x3df449) {
  const _0x479776 = a0_0x47efcc;
  const _0x1283b7 = {
    'WvlbE': function(_0x4cbaf9, _0x6ab412) { return _0x4cbaf9 === _0x6ab412; },
    'fgVFD': _0x479776(639),
    'CfRYL': _0x479776(777),
    'obJnF': 'bad\x20request',
    'IAEwE': 'HbIgx',
    'SgHab': function(_0x33386e, _0x3e80d6) {
      return _0x33386e + _0x3e80d6;
    },
    'anVeJ': _0x479776(315),
    'kESYh': _0x479776(463),
    'HGcco': _0x479776(664),
    'fdDoG': _0x479776(461),
    'NcmbG': _0x479776(673),
    'vyRqt': function(_0x2df7ae, _0x1021ee) { return _0x2df7ae(_0x1021ee); },
    'fICRc': function(_0x277df8) {return _0x277df8(); }
  };
  
  if (_0x3df449[_0x479776(748)]) {
    try {
      if (_0x1283b7[_0x479776(756)](_0x1283b7[_0x479776(672)], _0x1283b7[_0x479776(672)])) _0x3df449.end();
      else return _0x520b16(_0x40820a, _0x1283b7[_0x479776(756)](_0x4d4c8e[_0x479776(346)], _0x479776(639)) ? 413 : 400, _0x1283b7[_0x479776(756)](_0x21f468[_0x479776(346)], _0x1283b7[_0x479776(679)]) ? _0x1283b7['CfRYL'] : _0x1283b7[_0x479776(540)]);
    } catch (_0x1982af) {} return;
  }
  
  const _0x27f891 = _0x1283b7['SgHab'](_0x1283b7[_0x479776(456)](_0x1283b7[_0x479776(360)], _0x1283b7[_0x479776(454)]), _0x1283b7['HGcco']);
  const _0x1aa3b9 = Buffer[_0x479776(295)](_0x27f891, _0x1283b7[_0x479776(506)]); 
  _0x3df449['writeHead'](503, {
    'content-type': _0x1283b7['NcmbG'],
    'content-length': _0x1283b7[_0x479776(479)](String, _0x1aa3b9.length),
    'retry-after': _0x1283b7['vyRqt'](String, _0x1283b7[_0x479776(340)](soonestRetrySec)),
    'cache-control': _0x479776(459)
  });
  _0x3df449.end(_0x1aa3b9);
}

function sendUpstream(_0x26eaab, _0x3e74be, _0x5810cd, _0x1c7edd) {
  const _0x2fbb26 = a0_0x47efcc;
  const _0xa56100 = {
    'gXDEJ': function(_0x167737, _0x19fc3a) { return _0x167737 > _0x19fc3a; },
    'EpnPr': _0x2fbb26(623),
    'lCXtO': 'token',
    'blJkV': _0x2fbb26(789),
    'ICnUo': function(_0x2f0230, _0x1fc220, _0x2d5e79) { return _0x2f0230(_0x1fc220, _0x2d5e79);},
    'shegU': function(_0x586a0e, _0x10b723) { return _0x586a0e + _0x10b723; },
    'YhCzC': _0x2fbb26(296),
    'Gguye': function(_0x477cad, _0x159e7a) { return _0x477cad(_0x159e7a); },
    'LVAkh': 'cache-control',
    'HlNev': _0x2fbb26(478),
    'PWmUN': _0x2fbb26(768),
    'MGUXg': function(_0x213ba2, _0x4c3b12) { return _0x213ba2 === _0x4c3b12; },
    'HxzzD': 'HEAD',
    'gVCno': function(_0x45cefb, _0x4aea90) { return _0x45cefb === _0x4aea90; },
    'DQPGg': function(_0x512822, _0x1010a3) { return _0x512822(_0x1010a3); },
    'GfqVn': function(_0x18d58f, _0x3c0a7c) { return _0x18d58f > _0x3c0a7c; },
    'IsnGh': function(_0x36ad5c, _0xf1a160) { return _0x36ad5c === _0xf1a160; },
    'raNsu': _0x2fbb26(421),
    'hnSIo': 'end',
    'KkDxK': 'aborted'
  };
  const _0x124e4b = _0x5810cd[_0x2fbb26(776)];
  const _0x3a1143 = _0x124e4b[_0x2fbb26(555)];
  const _0x3a5fbd = {};
  
  for (const _0x36bf2d of Object[_0x2fbb26(577)](_0x124e4b.headers)) {
    if (!RES_DROP['has'](_0x36bf2d)) _0x3a5fbd[_0x36bf2d] = _0x124e4b.headers[_0x36bf2d];
  }
  
  const _0x4851db = String(_0x3a5fbd[_0xa56100[_0x2fbb26(331)]] || '');
  const _0x208ae3 = _0xa56100[_0x2fbb26(737)](String, _0x3a5fbd[_0xa56100[_0x2fbb26(702)]] || '');
  
  !_0x208ae3 && _0x3a1143 === 200 && (STATIC_CT['test'](_0x4851db) || /x-icon/i.test(_0x4851db)) && (_0x3a5fbd[_0xa56100[_0x2fbb26(702)]]=/[-_.][A-Za-z0-9_-]{8,}\.(?:js|css|woff2?|png|jpe?g|webp|avif|svg)(?:[?#]|$)/.test(_0x26eaab['url'] || '') ? _0xa56100[_0x2fbb26(356)] : _0xa56100[_0x2fbb26(680)]);
  
  if (_0x5810cd.body) {
    _0x3e74be['writeHead'](_0x3a1143, _0x3a5fbd);
    _0x3e74be['end'](_0xa56100[_0x2fbb26(739)](_0x26eaab.method, _0xa56100[_0x2fbb26(476)]) ? undefined : _0x5810cd.body);
    
    return;
  }
  
  let _0x167218 = null;
  
  if (_0x1c7edd && _0xa56100[_0x2fbb26(502)](_0x3a1143, 200) && !_0x3a5fbd['set-cookie'] && STATIC_CT.test(_0x4851db) && !/no-store|private/i.test(_0x208ae3)) {
    const _0x31ec2a = _0xa56100['DQPGg'](ttlOf, _0x3a5fbd[_0xa56100['LVAkh']] || '');
    const _0x57fbcc = _0xa56100[_0x2fbb26(468)](Number, _0x3a5fbd['content-length']);
    
    if (_0xa56100[_0x2fbb26(720)](_0x31ec2a, 0) && !(Number[_0x2fbb26(763)](_0x57fbcc) && _0xa56100['GfqVn'](_0x57fbcc,CACHE_ITEM_MAX))) {
      _0x167218 = {
        'chunks': [],
        'size': 0,
        'ttl': _0x31ec2a,
        'ok': true
      };
    }
  }
  
  _0x3e74be[_0x2fbb26(729)](_0x3a1143, _0x3a5fbd);
  
  if (_0x26eaab['method'] === _0x2fbb26(440) || _0xa56100[_0x2fbb26(329)](_0x3a1143, 204) || _0xa56100[_0x2fbb26(502)](_0x3a1143, 304)) {
    _0x124e4b['resume']();
    _0x3e74be.end();
    
    return;
  }
  
  _0x124e4b[_0x2fbb26(622)](_0x3e74be);
  _0x167218 && (_0x124e4b['on'](_0xa56100[_0x2fbb26(313)], _0x21ff56 => {
    const _0x530e73 = _0x2fbb26;
    
    if (!_0x167218['ok']) return;
    
    _0x167218.size += _0x21ff56.length;
    
    if (_0xa56100[_0x530e73(508)](_0x167218.size, CACHE_ITEM_MAX)) {
      _0x167218['ok'] = false;
      _0x167218['chunks'] = null;
    } else _0x167218[_0x530e73(434)][_0x530e73(585)](_0x21ff56);
  }),
  _0x124e4b['on'](_0xa56100[_0x2fbb26(371)], () => {
    const _0x5981d2 = _0x2fbb26;
    _0xa56100[_0x5981d2(606)] === _0xa56100[_0x5981d2(606)] ? _0x167218['ok'] && !_0x124e4b[_0x5981d2(586)] && _0xa56100['ICnUo'](cacheSet, _0x1c7edd, {'status': _0x3a1143, 'headers': _0x3a5fbd, 'body': Buffer[_0x5981d2(449)](_0x167218[_0x5981d2(434)]), 'at': Date[_0x5981d2(731)](), 'exp': _0xa56100[_0x5981d2(292)](Date[_0x5981d2(731)](), _0x167218['ttl'])}) : _0x5497e5 = new _0x469de9(_0x91c4c2, _0xa56100[_0x5981d2(551)])[_0x5981d2(445)]['get'](_0xa56100[_0x5981d2(387)]) || '';
  }));
  _0x124e4b['on']('error', () => {
    try {
      _0x3e74be['destroy']();
    } catch (_0x1cf05b) {}
  });_0x124e4b['on'](_0xa56100['KkDxK'], () => {
    const _0x5668fb = _0x2fbb26;
    try {
      _0x3e74be.destroy();
    } catch (_0x272708) {}
  });
}

function serveCached(_0x1cd095, _0x5ed84d, _0x2be3ad) {
  const _0x7faf8f = a0_0x47efcc;
  const _0x29d046 = {
    'WUnia': 'HIT',
    'JpHdj': function(_0x2ab970, _0x5665c7) { return _0x2ab970(_0x5665c7); },
    'YXldw': function(_0x2449d6, _0x2a4ec7) { return _0x2449d6 / _0x2a4ec7; },
    'hzcuO': function(_0x1f3288, _0x3ce555) { return _0x1f3288 - _0x3ce555; },
    'rhgrE': _0x7faf8f(758),
    'duVHm': function(_0x1ef442, _0x3794cb) { return _0x1ef442 === _0x3794cb; },
    'EkLJu': 'cache-control',
    'paTAI': _0x7faf8f(655),
    'xpYzr': _0x7faf8f(793),
    'BzFjr': 'FyVZx',
    'wbYTo': _0x7faf8f(643),
    'PiDbf': _0x7faf8f(440)
  };
  const _0x484cdf = Object[_0x7faf8f(536)]({}, _0x2be3ad.headers, {
    'x-proxy-cache': _0x29d046[_0x7faf8f(368)],
    'age': _0x29d046['JpHdj'](String, Math[_0x7faf8f(574)](_0x29d046[_0x7faf8f(593)](_0x29d046[_0x7faf8f(741)](Date[_0x7faf8f(731)](), _0x2be3ad['at']), 1000)))
  });
  const _0x37e3fb = _0x1cd095['headers'][_0x29d046['rhgrE']];
  
  if (_0x37e3fb && _0x2be3ad.headers['etag'] && _0x29d046[_0x7faf8f(715)](_0x37e3fb, _0x2be3ad.headers[_0x7faf8f(343)])) {
    const _0x43d05d = {
      'etag': _0x2be3ad['headers'][_0x7faf8f(343)],
      'x-proxy-cache': _0x7faf8f(760)
    };
    
    if (_0x2be3ad.headers['cache-control']) {
      _0x43d05d[_0x29d046[_0x7faf8f(312)]] = _0x2be3ad.headers[_0x29d046[_0x7faf8f(312)]];
    }
    
    _0x5ed84d[_0x7faf8f(729)](304, _0x43d05d);
    _0x5ed84d.end();
    
    return;
  }
  
  const _0x569e1b = _0x1cd095.headers[_0x29d046[_0x7faf8f(641)]];
  
  if (!_0x37e3fb && _0x569e1b && _0x2be3ad.headers[_0x7faf8f(793)] && _0x569e1b === _0x2be3ad.headers[_0x29d046['xpYzr']]) {
    if (_0x29d046[_0x7faf8f(715)](_0x29d046[_0x7faf8f(379)], _0x29d046[_0x7faf8f(722)])) {
      if (!_0x50ae14['ok']) return;
      
      _0xf09f59.size += _0x317394.length;
      
      if(_0x2a5e9a.size > _0x3defaa) {
        _0x546e9d['ok'] = false;
        _0x12a96c[_0x7faf8f(434)] = null;
      } else _0x36a1b6[_0x7faf8f(434)][_0x7faf8f(585)](_0x1105e4);
    } else {
      const _0x58d26e = {
        'last-modified': _0x2be3ad.headers[_0x29d046[_0x7faf8f(489)]],
        'x-proxy-cache': _0x29d046[_0x7faf8f(368)]
      };
      
      if (_0x2be3ad.headers['cache-control']) {
        _0x58d26e[_0x29d046[_0x7faf8f(312)]] = _0x2be3ad.headers['cache-control'];
      }
      
      _0x5ed84d[_0x7faf8f(729)](304, _0x58d26e);
      _0x5ed84d.end();
      
      return;
    }
  }
  
  _0x484cdf['content-length'] = _0x29d046[_0x7faf8f(369)](String, _0x2be3ad['body']['length']);
  _0x5ed84d[_0x7faf8f(729)](_0x2be3ad[_0x7faf8f(531)], _0x484cdf);
  _0x5ed84d['end'](_0x29d046[_0x7faf8f(715)](_0x1cd095['method'], _0x29d046[_0x7faf8f(784)]) ? undefined : _0x2be3ad.body);
}

function readBody(_0x1468fe, _0x2ec702) {
  const _0x363b72 = a0_0x47efcc;
  const _0x50ce26 = {
    'nNRDU': 'data',
    'yGnnU': 'end',
    'HFdtC': 'error',
    'icvUM': _0x363b72(586),
    'QDgia': function(_0x1e7b68, _0x538469) { return _0x1e7b68(_0x538469); },
    'RTnGK': function(_0x5b2b7f, _0x3f65fd) { return _0x5b2b7f === _0x3f65fd; },
    'RNdoN': function(_0x34c470, _0x18443d) { return _0x34c470 > _0x18443d; },
    'ojvbP': _0x363b72(396)
  };
  
  return new Promise((_0x22aa4f, _0x32edfe) => {
    const _0x261645 = _0x363b72;
    const _0xdc4752 = {
      'Hkqdq': function(_0x4436f3, _0x7f7450) { return _0x50ce26['QDgia'](_0x4436f3, _0x7f7450); },
      'UxHqc': function(_0x6f2bec, _0x3e34da) { return _0x6f2bec(_0x3e34da); },
      'Pwikf': function(_0xff3848, _0x5e4661) {
        const _0x326cde = main;
        
        return _0x50ce26[_0x326cde(549)](_0xff3848, _0x5e4661);
      },
      'fGIgy': _0x261645(510),
      'dXlwe': function(_0x1f57c2, _0x26067b) { return _0x1f57c2 > _0x26067b; },
      'oHyvN': function(_0xe53358, _0x212a43) {
        const _0x4c386d = _0x261645;
        
        return _0x50ce26[_0x4c386d(573)](_0xe53358, _0x212a43);
      }
    };
    
    if (_0x261645(396) === _0x50ce26['ojvbP']) {
      const _0x3d9c19 = [];
      let _0x187320 = 0;
      let _0x79b269 = false;
      
      _0x1468fe['on'](_0x50ce26[_0x261645(311)], _0x1f2459 => {
        const _0x4178f2 = _0x261645;
        
        if (_0xdc4752[_0x4178f2(341)](_0xdc4752['fGIgy'], _0xdc4752[_0x4178f2(521)])) {
          if (_0x79b269) return;
          
          _0x187320 += _0x1f2459.length;
          
          if (_0xdc4752[_0x4178f2(391)](_0x187320,　_0x2ec702)) {
            _0x79b269 = true;
            _0x3d9c19.length = 0;
          } else _0x3d9c19[_0x4178f2(585)](_0x1f2459);
        } else {
          _0xe4ac09 = true;
          MlQSEE[_0x4178f2(598)](_0x3d8199, _0x3f638b);
          MlQSEE[_0x4178f2(436)](_0x51826d, _0x399435);
        }
      });
      _0x1468fe['on']('end' () => _0x79b269 ? _0x32edfe(Object['assign'](new Error(_0x261645(631)), {
        'code': _0x261645(639)
      })) : _0x22aa4f(Buffer[_0x261645(449)](_0x3d9c19)));
      _0x1468fe['on']('error', _0x32edfe);
      _0x1468fe['on'](_0x50ce26['icvUM'], () => _0x32edfe(new Error('aborted')));
    } else {
      const _0x31a77e = [];
      let _0x2b26df = 0;
      let _0x286a71 = false;
      
      _0x46a32d['on'](_0x50ce26[_0x261645(311)],
      _0x435f4f => {
        const _0x483ca5 = _0x261645;
        
        if (_0x286a71) return;
        
        _0x2b26df += _0x435f4f.length;
        
        if (_0xdc4752['oHyvN'](_0x2b26df, _0x4d500b)) {
          _0x286a71 = true;
          _0x31a77e.length = 0;
        } else _0x31a77e[_0x483ca5(585)](_0x435f4f);
      });
      _0x44db43['on'](_0x50ce26['yGnnU'], () => _0x286a71 ? _0x413e05(_0x47f9a4[_0x261645(536)](new _0x324026(_0x261645(631)), {
        'code': 'E2BIG'
      })) : _0x38c9a1(_0x3bfe1d['concat'](_0x31a77e)));
      _0x2d99b7['on'](_0x50ce26[_0x261645(515)], _0x523504);
      _0x174ee9['on'](_0x50ce26['icvUM'], () => _0x49ed92(new _0x24edaa('aborted')));
    }
  });
}

async function handle(_0x3ceaeb, _0x26c461) {
  const _0x3d92e5 = a0_0x47efcc;
  const _0xbdb751 = {
    'EIebK': function(_0x49870c, _0x39818d, _0x3ded8b) { return _0x49870c(_0x39818d, _0x3ded8b); },
    'pMrtm': function(_0x24cc88, _0x4bb45d) { return _0x24cc88 + _0x4bb45d; },
    'QCrUv': 'quota',
    'ZUyvb': 'rate',
    'KDwfU': 'workererr',
    'sXWOf': function(_0x193f4e, _0x28067f) { return _0x193f4e + _0x28067f; },
    'BuARm': function(_0x3dc911, _0x2af398) { return _0x3dc911 > _0x2af398; },
    'vrjjk': function(_0x17dfbc, _0x501c08) { return _0x17dfbc === _0x501c08; },
    'hPjpt': _0x3d92e5(483),
    'kkZNO': function(_0x45defb, _0x5a28f8, _0x15caa3, _0x39c705) { return _0x45defb(_0x5a28f8, _0x15caa3, _0x39c705); },
    'FVPEZ': function(_0x4bae0f, _0x102e82) { return _0x4bae0f === _0x102e82; },
    'gKqLz': _0x3d92e5(603),
    'EVjmB': function(_0x1060fa, _0x1e22fa, _0x5204ca, _0x200fda, _0xbbdf2d) { return _0x1060fa(_0x1e22fa, _0x5204ca, _0x200fda, _0xbbdf2d); },
    'YTElt': 'User-agent:\x20*\x0aDisallow:\x20/\x0a',
    'FSTDi': function(_0x4d5a33, _0x1789e3) { return _0x4d5a33 === _0x1789e3; },
    'IZKls': _0x3d92e5(775),
    'jesqD': 'public,\x20max-age=86400',
    'ONJlW': _0x3d92e5(623),
    'CGDkO': _0x3d92e5(316),
    'SJJmb': function(_0x25ea8c, _0xd0175d) { return _0x25ea8c !== _0xd0175d; },
    'HKNoj': _0x3d92e5(605),
    'RcsNk': function(_0x53f8ef) { return _0x53f8ef(); },
    'iaUNm': function(_0xef905, _0x3692d7) { return _0xef905(_0x3692d7); },
    'mbLdi': 'none',
    'rzPwz': function(_0x43b963, _0x5de354) { return _0x43b963 / _0x5de354; },
    'igMym': _0x3d92e5(711),
    'bXWUr': function(_0x4c9a39, _0x4ba3c6, _0x3808cf, _0x4b4e72) { return _0x4c9a39(_0x4ba3c6, _0x3808cf, _0x4b4e72); },
    'YfWGj': 'bad\x20request',
    'stMOZ': function(_0x3716f2, _0x51938b) { return _0x3716f2 === _0x51938b; },
    'lLrdr': _0x3d92e5(611),
    'HdjNo': _0x3d92e5(786),
    'kuXdA': _0x3d92e5(560),
    'wCFws': _0x3d92e5(704),
    'qLUlO': function(_0x168cfe, _0xedb970) { return _0x168cfe + _0xedb970; },
    'GwQMM': function(_0x4377c1, _0x5a99e4) { return _0x4377c1 + _0x5a99e4; },
    'DUKcb': _0x3d92e5(556),
    'iSmCB': 'accept-encoding',
    'zQijO': _0x3d92e5(749),
    'kEgjT': 'sijJo',
    'eAYDW': _0x3d92e5(612),
    'hGeIp': function(_0x5388a0, _0x5b5df2, _0x20e820) { return _0x5388a0(_0x5b5df2, _0x20e820); },
    'SDqmY': 'yrrrt',
    'wgDtN': _0x3d92e5(639),
    'XyfZH': _0x3d92e5(777),
    'nCiIE': function(_0x4c60a7, _0x23531b) { return _0x4c60a7 !== _0x23531b; },
    'zsOvW': _0x3d92e5(300),
    'AObef': function(_0x52bedf, _0x5a8115) { return _0x52bedf(_0x5a8115); },
    'WZkLW': function(_0x52fb88, _0x5a9173) { return _0x52fb88 !== _0x5a9173; },
    'CDXUc': 'cTXaL',
    'yRFDj': _0x3d92e5(427),
    'qsGHN': function(_0x35521b, _0x305489, _0x401d9f) { return _0x35521b(_0x305489, _0x401d9f); },
    'PUPuV': function(_0x55fda2, _0x3c348b, _0x105101, _0x41de7a) { return _0x55fda2(_0x3c348b, _0x105101, _0x41de7a); },
    'gBkLX': _0x3d92e5(429),
    'PnhWc': function(_0x3ab13c, _0x257620) { return _0x3ab13c === _0x257620; },
    'NWrnO': _0x3d92e5(509),
    'BvNtV': function(_0x2f2a4c, _0x1a3847, _0x3fcc3a) { return _0x2f2a4c(_0x1a3847, _0x3fcc3a); },
    'axyKm': function(_0x46782a, _0x52d16e, _0x196b14, _0x42899f, _0x424752) { return _0x46782a(_0x52d16e, _0x196b14, _0x42899f, _0x424752); },
    'WEEcA': function(_0x4833a0, _0x3ab17c) { return _0x4833a0(_0x3ab17c); }
  };
  const _0x24411b = _0x3ceaeb.url || '/';
   
  if (_0xbdb751[_0x3d92e5(380)](_0x24411b, _0xbdb751[_0x3d92e5(671)]) || _0x24411b === _0x3d92e5(373)) return _0xbdb751['kkZNO'](sendText, _0x26c461, 200, 'ok');
  if (_0xbdb751[_0x3d92e5(319)](_0x24411b, _0xbdb751[_0x3d92e5(587)])) return _0xbdb751['EVjmB'](sendText, _0x26c461, 200, _0xbdb751[_0x3d92e5(619)], {
    'cache-control': 'public,\x20max-age=86400'
  });
  if (/^\/apple-touch-icon(-precomposed|-\d+x\d+)*\.png(\?|$)/['test'](_0x24411b)) {
    if (_0xbdb751[_0x3d92e5(400)](_0xbdb751[_0x3d92e5(634)], 'DhGuZ')) return (
      _0x26c461[_0x3d92e5(729)](204, {'cache-control': _0xbdb751[_0x3d92e5(701)]}),
      _0x26c461.end()
    );
    else lygiDv[_0x3d92e5(524)](_0x18f476, _0x1c9e42, {
      'status': _0x4fa56f,
      'headers': _0x4975a0,
      'body': _0x9cc78[_0x3d92e5(449)](_0x1793c2['chunks']),
      'at': _0xc7f9ca[_0x3d92e5(731)](),
      'exp': lygiDv[_0x3d92e5(632)](_0x2d8e37[_0x3d92e5(731)](), _0x2172d5['ttl'])
    });
  }
  
  if (_0x24411b.startsWith(_0x3d92e5(378))) {
    if (env[_0x3d92e5(325)]) {
      let _0x5399f3 = '';
      
      try {
        _0x5399f3 = new URL(_0x24411b, _0xbdb751['ONJlW'])[_0x3d92e5(445)].get(_0xbdb751[_0x3d92e5(792)]) || '';
      } catch (_0x48c478) {}
      if (_0xbdb751['SJJmb'](_0x5399f3, env['STATUS_TOKEN'])) return sendText(_0x26c461, 403, _0xbdb751[_0x3d92e5(404)]);
    }
    
    await _0xbdb751['RcsNk'](syncShared);
    
    const _0x2003fb = Date[_0x3d92e5(731)]();
    const _0x2410f4 = {
      'note': _0x3d92e5(410),
      'time': new Date()[_0x3d92e5(411)](),
      'timeJST': _0xbdb751[_0x3d92e5(511)](jst, Date['now']()),
      'sharedState': REDIS_URL ? _0x3d92e5(743) : _0xbdb751[_0x3d92e5(661)],
      'workers': workers[_0x3d92e5(693)](_0x23e62a => ({
        'id': _0x23e62a.id,
        'host': _0x23e62a.url.host[_0x3d92e5(366)](/^(.{4}).*(.{12})$/, _0x3d92e5(584)),
        'usedOnThisInstance': _0x23e62a['used'],
        'state': _0x23e62a.blockedUntil > _0x2003fb ? _0x3d92e5(563) + _0x23e62a.reason + ')' : 'ok',
        'blockedUntil': _0x23e62a.blockedUntil > _0x2003fb ? new Date(_0x23e62a.blockedUntil)['toISOString']() : null,
        'blockedUntilJST': _0x23e62a['blockedUntil'] > _0x2003fb ? jst(_0x23e62a.blockedUntil) : null,
        'consecutiveFails' : _0x23e62a.fails
      })),
      'cache': {
        'items': cache.size,
        'mb': +_0xbdb751['rzPwz'](cacheBytes, 1048576)[_0x3d92e5(439)](1),
        'hits': cacheHits,
        'misses': cacheMiss
      }
    };
    const _0x55772c = Buffer[_0x3d92e5(295)](JSON[_0x3d92e5(654)](_0x2410f4, null, 2));
    
    return (
      _0x26c461['writeHead'](200, {
      'content-type': _0xbdb751[_0x3d92e5(727)],
      'content-length': _0xbdb751[_0x3d92e5(511)](String, _0x55772c.length),
      'cache-control': _0x3d92e5(459)
    }),
      _0x26c461.end(_0x55772c)
    )
  }
  
  if (_0x24411b[0] !== '/') return _0xbdb751[_0x3d92e5(615)](sendText, _0x26c461, 400, _0xbdb751['YfWGj']);
  if (_0xbdb751['stMOZ'](_0x24411b, _0xbdb751[_0x3d92e5(633)]) && _0xbdb751[_0x3d92e5(432)](_0xbdb751[_0x3d92e5(511)](String, env[_0x3d92e5(535)])['toLowerCase'](), _0xbdb751[_0x3d92e5(790)])) {
    if (_0xbdb751[_0x3d92e5(319)](_0xbdb751[_0x3d92e5(530)], 'YNfpj')) {
      return (
        _0x26c461[_0x3d92e5(729)](204),
        _0x26c461['end']()
      )
    } else {
      try {
        _0x2851cf.end();
      } catch (_0x5221ca) {}
      
      return;
    }
  }
  
  if (!workers.length) return _0xbdb751[_0x3d92e5(414)](sendText, _0x26c461, 500, _0x3d92e5(765));
  
  const _0x41951a = /^(GET|HEAD|OPTIONS)$/['test'](_0x3ceaeb.method);
  let _0x56dcfa = null;
  
  if (CACHE_ON && _0xbdb751[_0x3d92e5(400)](_0x3ceaeb.method, _0xbdb751['wCFws']) && !_0x3ceaeb.headers['range'] && !_0x3ceaeb['headers']['authorization']) {
    _0x56dcfa = _0xbdb751[_0x3d92e5(438)](_0xbdb751['qLUlO'](_0xbdb751[_0x3d92e5(728)](_0xbdb751[_0x3d92e5(438)](_0xbdb751[_0x3d92e5(511)](publicHost, _0x3ceaeb), '|'), _0xbdb751[_0x3d92e5(524)](cookieOf, _0x3ceaeb.headers[_0x3d92e5(507)], _0xbdb751[_0x3d92e5(504)])), '|') + (_0x3ceaeb.headers[_0xbdb751['iSmCB']] || ''), '|') + _0x24411b;
    const _0x122e20 = cacheGet(_0x56dcfa);
    
    if (_0x122e20) {
      return (
        cacheHits++,
        _0xbdb751['kkZNO'](serveCached, _0x3ceaeb, _0x26c461, _0x122e20)
      )
    }
    
    cacheMiss++;
  }
  
  let _0x5cbec1 = Buffer[_0x3d92e5(293)](0);
  
  if (!_0x41951a || _0x3ceaeb.method === _0xbdb751[_0x3d92e5(430)]) {
    if (_0xbdb751['SJJmb'](_0xbdb751[_0x3d92e5(342)], _0xbdb751[_0x3d92e5(649)])) try {
      _0x5cbec1 = await _0xbdb751[_0x3d92e5(553)](readBody, _0x3ceaeb, MAX_BODY);
    } catch (_0x25b493) {
      if (_0xbdb751['SDqmY'] !== _0xbdb751[_0x3d92e5(635)]) {
        if (!_0x2bf0ac[_0x3d92e5(725)]) {
          _0x269dd3[_0x3d92e5(636)] = true;
          
          if (_0x404c67[_0x3d92e5(778)]) _0x28c4d4['cancel']();
        }
      } else return _0xbdb751[_0x3d92e5(414)](sendText, _0x26c461, _0x25b493['code'] === _0xbdb751['wgDtN'] ? 413 : 400, _0x25b493[_0x3d92e5(346)] === _0xbdb751['wgDtN'] ? _0xbdb751['XyfZH'] : _0xbdb751[_0x3d92e5(401)]);
    } else {
      if (_0x5e844c[_0x3d92e5(776)]) _0xd23ff5[_0x3d92e5(776)].destroy();
      
      return;
    }
  }
  
  const _0x1195a8 = {
    'method': _0x3ceaeb.method,
    'path': _0x24411b,
    'headers': _0xbdb751[_0x3d92e5(553)](buildHeaders, _0x3ceaeb, _0x5cbec1.length),
    'body': _0x5cbec1,
    'cancel': null,
    'dead': false
  };
  
  _0x26c461['on'](_0x3d92e5(588), () => {
    const _0x250a4f = _0x3d92e5;
    
    if (!_0x26c461['writableEnded']) {
      _0x1195a8[_0x250a4f(636)] = true;
      
      if (_0x1195a8[_0x250a4f(778)]) _0x1195a8['cancel']();
    }
  });
  
  await _0xbdb751['RcsNk'](syncShared);
  
  const _0x16678a = new Set();
  let _0x761e44 = null;
  
  for (let _0x5dec01 = 0; _0x5dec01 < MAX_ATTEMPTS; _0x5dec01++) {
    if (_0xbdb751[_0x3d92e5(308)](_0x3d92e5(300), _0xbdb751[_0x3d92e5(348)])) _0x5da628.destroy();
    else {
      if (_0x1195a8[_0x3d92e5(636)]) return;
      
      const _0x39fcba = _0xbdb751[_0x3d92e5(314)](pick, _0x16678a);
      
      if (!_0x39fcba) break;
      
      _0x16678a[_0x3d92e5(413)](_0x39fcba['id']);
      _0x39fcba.used++;
      
      const _0x5af209 = await attempt(_0x39fcba, _0x1195a8);
      
      if (_0x1195a8[_0x3d92e5(636)]) {
        if (_0xbdb751[_0x3d92e5(419)](_0x3d92e5(359), _0xbdb751[_0x3d92e5(492)])) {
          if (!_0x44fc8e[_0x3d92e5(382)](_0x3538ac)) return null;
          
          const _0x348efd = _0x3ae1e7[_0x3d92e5(493)](_0x3d92e5(461), 0, 4096);
          
          if (_0x2b5ba7.test(_0x348efd)) return lygiDv['QCrUv'];
          if (_0x3d949d.test(_0x348efd)) return lygiDv[_0x3d92e5(550)];
          if (_0x12f3a7.test(_0x348efd)) return lygiDv['KDwfU'];
          
          return null;
        } else {
          if (_0x5af209[_0x3d92e5(776)]) _0x5af209[_0x3d92e5(776)].destroy();
          
          return;
        }
      }
      
      if (_0x5af209.error) {
        if (_0x3d92e5(519) !== _0xbdb751[_0x3d92e5(470)]) {
          _0xbdb751['qsGHN'](markFail, _0x39fcba, _0x5af209.error);
          
          if (_0x41951a || SAFE_ERR[_0x3d92e5(382)](_0x5af209.error)) continue;
          
          return _0xbdb751[_0x3d92e5(347)](sendText, _0x26c461, 502, _0xbdb751[_0x3d92e5(590)]);
        } else return (
          _0x414054['writeHead'](204),
          _0x25b84f['end']()
        )
      } if (_0x5af209[_0x3d92e5(594)] === _0xbdb751[_0x3d92e5(774)] || _0xbdb751[_0x3d92e5(538)](_0x5af209[_0x3d92e5(594)], _0x3d92e5(559))) {
        await _0xbdb751['EIebK'](applyKind, _0x39fcba, _0x5af209[_0x3d92e5(594)]);
        
        continue;
      }
      
      if (_0xbdb751[_0x3d92e5(380)](_0x5af209[_0x3d92e5(594)], _0xbdb751['KDwfU'])) {
        if (_0xbdb751[_0x3d92e5(308)](_0x3d92e5(474), _0xbdb751[_0x3d92e5(472)])) {
          await _0xbdb751[_0x3d92e5(787)](applyKind, _0x39fcba, _0x5af209['kind']);
          
          _0x761e44 = _0x5af209;
          
          if (_0x41951a) continue;
          
          return _0xbdb751[_0x3d92e5(688)](sendUpstream, _0x3ceaeb, _0x26c461, _0x5af209, null);
        } else {
          const _0x1e56e3 = _0x5df31f['get'](_0x122e77);
          
          _0x1e56e3 && (_0x5e5c78 -= _0x1e56e3.size, _0xf921e3['delete'](_0xc69fcf));
          _0x334853.size = lygiDv[_0x3d92e5(438)](_0x12fa25.body.length, 1024);
          _0x33b945['set'](_0x3e6de7, _0x7c0b9b);
          _0x31590b += _0x470435.size;
          
          while (lygiDv[_0x3d92e5(516)](_0x1be4b9, _0x3fa102) && _0x57af07.size) {
            const [_0x52c8a3, _0x186b42] = _0x49d659.entries().next()['value'];
            _0x42641f.delete(_0x52c8a3);
            _0x992ba2 -= _0x186b42['size'];
          }
        }
      }
      
      return (
        markOk(_0x39fcba),
        _0xbdb751['EVjmB'](sendUpstream, _0x3ceaeb, _0x26c461, _0x5af209, _0x56dcfa)
      )
    }
  }
  
  if (_0x761e44) return _0xbdb751[_0x3d92e5(543)](sendUpstream, _0x3ceaeb, _0x26c461, _0x761e44, null);
  
  return _0xbdb751[_0x3d92e5(726)](sendBusy, _0x26c461);
}

const requestListener = (_0x2c62ec, _0x597c3c) => {
  const _0x458a28 = a0_0x47efcc;
  const _0x51c460 = {
    'WrhhG': function(_0x145bc3, _0x32953e, _0x44f53e, _0x1a410e) { return _0x145bc3(_0x32953e, _0x44f53e, _0x1a410e); },
    'bgZac': _0x458a28(429),
    'muewO': _0x458a28(389),
    'AlOYe': _0x458a28(721)
  };
  
  handle (_0x2c62ec, _0x597c3c)[_0x458a28(385)](_0x12af1a => {
    const _0x472444 = _0x458a28;
    console['error'](_0x472444(718), _0x12af1a && _0x12af1a[_0x472444(719)]);
    
    if (!_0x597c3c['headersSent']) _0x51c460[_0x472444(534)](sendText, _0x597c3c, 502, _0x51c460['bgZac']);
    else try {
      if (_0x51c460[_0x472444(771)] !== _0x51c460[_0x472444(494)]) _0x597c3c.destroy();
      else return (
        _0x529421['delete'](_0x2092e5),
        _0x3ea322 -= _0x49bf43.size,
        null
      )
    } catch (_0x38f7d2) {}
  });
};

module[a0_0x47efcc(505)] = requestListener;
module[a0_0x47efcc(505)][a0_0x47efcc(386)] = {
  'api': {
    'bodyParser': false
  }
};
module[a0_0x47efcc(505)][a0_0x47efcc(537)] = {
  'workers': workers,
  'cache': cache
};

if (require[a0_0x47efcc(302)] === module) {
  const PORT = num(env['PORT'], 10000);
  const server = http[a0_0x47efcc(697)](requestListener);
  
  server['keepAliveTimeout'] = 65000;
  server[a0_0x47efcc(442)] = 66000;
  server[a0_0x47efcc(596)](PORT, a0_0x47efcc(648), () => {
    const _0x3d0044 = a0_0x47efcc;
    const _0x28f6db = {
      'ECHFT': function(_0x548bbd, _0x3510cb) { return _0x548bbd + _0x3510cb; },
      'GMimx': function(_0x5ec607, _0x23cf27) { return _0x5ec607 + _0x23cf27; },
      'NopfU' :function(_0x1d7f92, _0x46cd2a) { return _0x1d7f92 + _0x46cd2a; },
      'BUQzD': _0x3d0044(324),
      'cMKKt': '\x20/\x20workers=',
      'dlutY': '\x20/\x20reset=UTC\x20',
      'cQShq': ':00\x20(日本時間\x20',
      'ZeiHl': function(_0x51c852, _0x143bf3) { return _0x51c852 % _0x143bf3;},
      'xCwLo': function(_0x52a4c5, _0x3f8811) { return _0x52a4c5 / _0x3f8811; }
    };
    
    console[_0x3d0044(420)](_0x28f6db[_0x3d0044(306)](_0x28f6db[_0x3d0044(621)](_0x28f6db['GMimx'](_0x28f6db[_0x3d0044(306)](_0x28f6db[_0x3d0044(306)](_0x28f6db[_0x3d0044(569)](_0x28f6db[_0x3d0044(569)](_0x28f6db[_0x3d0044(491)], PORT), _0x28f6db[_0x3d0044(333)]), workers.length) + _0x28f6db['dlutY'], RESET_OFFSET / 3600000), _0x28f6db['cQShq']), _0x28f6db['ZeiHl'](_0x28f6db[_0x3d0044(569)](_0x28f6db[_0x3d0044(542)](RESET_OFFSET, 3600000), 9), 24)), ':00)'));
  });
  server['on'](a0_0x47efcc(471),(_0x3af7ba, _0x11de11) => {
    try {
      _0x11de11['destroy']();
    } catch (_0xf7d33a) {}});
  
  const stop = () => {
    const _0x495f47 = a0_0x47efcc;
    
    server['close'](() => process[_0x495f47(754)](0));
    setTimeout(() => process[_0x495f47(754)](0), 5000)[_0x495f47(646)]();
  };
  
  process['on']('SIGTERM', stop);
  process['on'](a0_0x47efcc(450), stop);
  process['on'](a0_0x47efcc(376), _0xa2a9ec => console.error(a0_0x47efcc(453), _0xa2a9ec && _0xa2a9ec['message']));
  process['on'](a0_0x47efcc(397), _0x258272 => console.error(a0_0x47efcc(628), _0x258272 && _0x258272['message']));
  env[a0_0x47efcc(705)] === '1' && env[a0_0x47efcc(637)] && setInterval(() => {
    const _0x2c9b20 = a0_0x47efcc;
    const _0x4b3116 = {
      'efMpR': _0x2c9b20(483),
      'LpyCN': 'error'
    };
    
    https.get(env[_0x2c9b20(637)]['replace'](/\/+$/,'') + _0x4b3116[_0x2c9b20(548)], _0x2791b1 => _0x2791b1[_0x2c9b20(403)]())['on'](_0x4b3116[_0x2c9b20(297)], () => {});
  }, 10 * 60 * 1000)[a0_0x47efcc(646)]();
}
