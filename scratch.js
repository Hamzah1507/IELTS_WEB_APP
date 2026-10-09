const http = require('http');

function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.get(url, { headers }, (res) => {
      const ttfb = Date.now() - start;
      let bytes = 0;
      res.on('data', (chunk) => { bytes += chunk.length; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          ttfb,
          totalTime: Date.now() - start,
          totalBytes: bytes
        });
      });
    });
    req.on('error', reject);
    setTimeout(() => req.destroy(), 15000);
  });
}

async function main() {
  const baseUrl = 'http://localhost:3000/api/mock-test/audio?testId=TEST001&asset=listening.mp3';
  
  const results = [];

  console.log('Warming up cache and getting file size...');
  const warmup = await makeRequest(baseUrl, { Range: 'bytes=0-0' });
  const contentRange = warmup.headers['content-range']; // bytes 0-0/4990234
  const fileSize = parseInt(contentRange.split('/')[1]);
  console.log('File size:', fileSize);

  const tests = [
    { name: 'Full file (no range)', headers: {} },
    { name: 'Full file (range)', headers: { Range: `bytes=0-${fileSize - 1}` } },
    { name: 'Head (bytes=0-100)', headers: { Range: 'bytes=0-100' } },
    { name: 'Head (bytes=0-262143)', headers: { Range: 'bytes=0-262143' } }, // Exact head size
    { name: 'Cross head boundary (bytes=260000-265000)', headers: { Range: 'bytes=260000-265000' } },
    { name: 'Middle (bytes=1000000-1005000)', headers: { Range: 'bytes=1000000-1005000' } },
    { name: 'Tail (exact)', headers: { Range: `bytes=${fileSize - 262144}-${fileSize - 1}` } },
    { name: 'Tail (end)', headers: { Range: `bytes=${fileSize - 100}-${fileSize - 1}` } },
  ];

  for (const test of tests) {
    console.log(`\nTesting: ${test.name}`);
    try {
      const res = await makeRequest(baseUrl, test.headers);
      console.log(`Status: ${res.status}`);
      console.log(`TTFB: ${res.ttfb}ms`);
      console.log(`Total Bytes: ${res.totalBytes}`);
      if (res.headers['content-length']) {
        console.log(`Expected Bytes: ${res.headers['content-length']}`);
        if (res.totalBytes.toString() !== res.headers['content-length']) {
          console.error(`❌ MISMATCH! Expected ${res.headers['content-length']} but got ${res.totalBytes}`);
        } else {
          console.log(`✅ Byte count matches Content-Length`);
        }
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

main().catch(console.error);
