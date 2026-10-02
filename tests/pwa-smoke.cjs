// Run: node tests/pwa-smoke.cjs (requires Playwright + Chromium).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, devices } = require('playwright');
const root = path.resolve(__dirname, '..');
const base = '/stanford-cs-gym/';
let failFont = false;
let revision = 'v2';
const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server = http.createServer((req,res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!pathname.startsWith(base)) { res.writeHead(404).end(); return; }
  const file = path.resolve(root, '.' + pathname.slice(base.length-1));
  if (file !== root && !file.startsWith(root+path.sep)) { res.writeHead(404).end(); return; }
  let target = pathname === base ? path.join(root,'index.html') : file;
  if (failFont && target.endsWith('KaTeX_Size4-Regular.woff2')) { res.writeHead(404).end(); return; }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
  let body = fs.readFileSync(target);
  if (revision !== 'v2' && ['sw.js','app.js'].some(f=>target.endsWith(f))) body = Buffer.from(body.toString().replaceAll('v2', revision));
  res.writeHead(200, {'Content-Type':mime[path.extname(target)] || 'text/plain','Cache-Control':'no-store'}).end(body);
});

(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const url = origin + base;
  const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']} : {})});
  try {
    const context = await browser.newContext({...devices['iPhone 13'], defaultBrowserType:undefined, serviceWorkers:'allow'});
    const page = await context.newPage();
    const errors = [];
    const external = [];
    page.on('pageerror',e=>errors.push(e.message));
    context.on('request',r=>{ if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.push(r.url()); });
    await page.goto(url);
    await page.waitForFunction(()=>document.querySelector('#offlineStatus').textContent === '离线可用 ✓');
    assert.equal(await page.locator('#courseSelect').inputValue(), 'CS231n');
    assert.equal(await page.locator('#topicSelect').inputValue(), 'lecture2');
    assert.equal(await page.locator('#questionSelect option').count(),12);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const cached = await page.evaluate(async()=> (await (await caches.open('stanford-cs-gym-v2')).keys()).map(r=>r.url));
    assert.equal(cached.filter(x=>x.endsWith('.woff2')).length,20);
    assert(cached.some(x=>x.endsWith('mathlive.min.js')));
    await page.locator('#typeSelect').selectOption('formula');
    await page.locator('#questionSelect').selectOption('linear-example');
    await page.locator('#revealBtn').click();
    assert.equal(await page.locator('#answerBox math-field').evaluateAll(es=>es.map(e=>e.value.replace(/\s+/g,'')).join(',\\quad')),String.raw`s=\begin{pmatrix}1\\3\end{pmatrix},\quad\hat{y}=2`);
    await page.locator('#topicSelect').selectOption('ALL');
    await page.reload();
    assert.equal(await page.locator('#topicSelect').inputValue(),'ALL');
    await page.locator('[data-tab=experiment]').click();
    const original = await page.locator('#labResults').textContent();
    await page.locator('#logitShift').evaluate(e=>{ e.value='10'; e.dispatchEvent(new Event('input')); });
    assert.equal(await page.locator('#labResults').textContent(),original);
    for (const id of ['z0','z1','z2']) await page.locator('#'+id).evaluate(e=>{ e.value=0; e.dispatchEvent(new Event('input')); });
    assert.match(await page.locator('#labResults').textContent(),/loss = 1.099/);
    // A new document with HTTP cache disabled proves service-worker-backed cold reload.
    await context.setOffline(true);
    const cold = await context.newPage();
    cold.on('pageerror',e=>errors.push(e.message));
    const cdp = await context.newCDPSession(cold);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
    await cold.goto(url+'?course=CS231n&topic=lecture2&type=formula&question=linear-scores');
    await cold.waitForFunction(()=>customElements.get('math-field') && document.querySelector('#questionSelect').value === 'linear-scores');
    await cold.locator('#showKeyboard').click();
    assert.equal(await cold.evaluate(()=>mathVirtualKeyboard.visible),true);
    const key = cold.locator('[role=button]').filter({hasText:/^7$/}).first();
    if (await key.count()) { await key.click(); assert.match(await cold.locator('#answerField').evaluate(e=>e.value),/7/); }
    await cold.locator('#answerField').evaluate(e=>e.insert(String.raw`\frac{x_i}{2}+\sum_j e^{z_j}`));
    assert.match(await cold.locator('#answerField').evaluate(e=>e.value),/frac/);
    await cold.evaluate(()=>mathVirtualKeyboard.hide());
    await cold.locator('#hintBtn').click();
    await cold.locator('#revealBtn').click();
    assert(await cold.locator('#answerBox math-field').first().evaluate(e=>!!e.shadowRoot));
    const fontResults = await cold.evaluate(async(urls)=>Promise.all(urls.map(async u=>{const r=await fetch(u);return r.ok && (await r.arrayBuffer()).byteLength>0;})),cached.filter(x=>x.endsWith('.woff2')));
    assert(fontResults.every(Boolean));
    await cold.evaluate(()=>document.fonts.ready);
    assert(await cold.evaluate(()=>document.fonts.check('20px KaTeX_Main')));
    await cold.evaluate(()=>scrollTo(0,0));
    await cold.screenshot({path:process.env.SCREENSHOT_PATH || '/tmp/stanford-cs-gym-mobile.png',fullPage:true});
    await cold.locator('[data-tab=derivation]').click();
    await cold.locator('[data-step="2"]').click();
    assert.match(await cold.locator('#stepCounter').textContent(),/STEP 3/);
    await cold.locator('#deriveKeyboard').click();
    assert(await cold.evaluate(()=>mathVirtualKeyboard.visible));
    await cold.evaluate(()=>mathVirtualKeyboard.hide());
    await cold.locator('[data-tab=resources]').click();
    assert.match(await cold.locator('#studyGuide').textContent(),/Lecture 2/);
    for (const id of ['CS336','CS329A','CS349D']) {
      await cold.locator('#courseSelect').selectOption(id);
      assert.match(await cold.locator('#studyGuide').textContent(), id==='CS336' ? /语言模型/ : id==='CS329A' ? /Agent/ : /Serving/);
      await cold.locator('[data-tab=review]').click();
      assert((await cold.locator('#questionSelect option').count())>0);
      await cold.locator('[data-tab=resources]').click();
    }
    await context.setOffline(false);
    await cold.close();
    // Update must wait, then swap the entire release only after explicit refresh.
    revision='v3';
    await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
    await page.locator('#updateApp').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>new Promise(resolve=>{const c=new MessageChannel();c.port1.onmessage=e=>resolve(e.data.version);navigator.serviceWorker.controller.postMessage({type:'GET_VERSION'},[c.port2]);})), 'stanford-cs-gym-v2');
    await page.locator('#updateApp').click();
    await page.waitForFunction(()=>document.querySelector('#offlineStatus').textContent === '离线可用 ✓' && !document.querySelector('#updateApp').offsetParent);
    assert.deepEqual(await page.evaluate(()=>caches.keys()),['stanford-cs-gym-v3']);
    await context.close();
    revision='v2'; failFont=true;
    const failure = await browser.newContext();
    const f = await failure.newPage();
    await f.goto(url);
    await f.waitForFunction(()=>document.querySelector('#offlineStatus').textContent.includes('失败'));
    assert.notEqual(await f.locator('#offlineStatus').textContent(),'离线可用 ✓');
    assert.equal(await f.evaluate(async()=> (await navigator.serviceWorker.getRegistration())?.active?.state || null),null);
    await failure.close();
    assert.deepEqual(errors,[]);
    assert.deepEqual(external,[]);
    console.log('PASS: mobile layout, 12 Lecture 2 questions, formula keyboard, all 20 fonts, cold offline reload, resources, numeric lab, scoped atomic update, failed-precache rejection; no runtime CDN requests.');
  } finally { await browser.close(); server.close(); }
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
