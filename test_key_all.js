const crypto = require('crypto');
const { generateKeyPairSync } = crypto;
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });

// Case 1: JSON
let jsonKey = JSON.stringify({ private_key: privateKey });
// Case 2: Base64
let base64Key = Buffer.from(privateKey).toString('base64');
// Case 3: Spaces
let spaceKey = privateKey.replace(/\n/g, ' ');

function formatPrivateKey(key) {
  if (!key) return key;
  let formatted = key.trim();
  
  if (formatted.startsWith('{') && formatted.endsWith('}')) {
    try {
      const parsed = JSON.parse(formatted);
      if (parsed.private_key) {
        formatted = parsed.private_key;
      }
    } catch (e) {}
  }
  
  formatted = formatted.replace(/^["']|["']$/g, '');
  formatted = formatted.replace(/\\n/g, '\n');
  
  if (!formatted.includes('-----BEGIN') && /^[A-Za-z0-9+/=]+$/.test(formatted.replace(/\s/g, ''))) {
    try {
      const decoded = Buffer.from(formatted.replace(/\s/g, ''), 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) {
        formatted = decoded;
      }
    } catch(e) {}
  }

  if (!formatted.includes('\n')) {
    const b = formatted.match(/-----BEGIN [A-Z ]+-----/);
    const e = formatted.match(/-----END [A-Z ]+-----/);
    if (b && e) {
      const bStr = b[0];
      const eStr = e[0];
      let body = formatted.substring(formatted.indexOf(bStr) + bStr.length, formatted.indexOf(eStr));
      body = body.replace(/\s+/g, '\n');
      formatted = `${bStr}\n${body.trim()}\n${eStr}\n`;
    }
  }
  return formatted;
}

try { crypto.createPrivateKey(formatPrivateKey(jsonKey)); console.log('JSON OK'); } catch(e) { console.error('JSON FAIL'); }
try { crypto.createPrivateKey(formatPrivateKey(base64Key)); console.log('Base64 OK'); } catch(e) { console.error('Base64 FAIL'); }
try { crypto.createPrivateKey(formatPrivateKey(spaceKey)); console.log('Space OK'); } catch(e) { console.error('Space FAIL'); }
