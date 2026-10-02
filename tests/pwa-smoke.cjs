// Run with Playwright + Chromium; uses a real worker under a GitHub Pages subpath.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,devices}=require('playwright');
const root=path.resolve(__dirname,'..'),base='/stanford-cs-gym/';
let failFile='',revision='v4';
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(!pathname.startsWith(base)){res.writeHead(404).end();return;}
  const file=path.resolve(root,'.'+pathname.slice(base.length-1));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(404).end();return;}
  const target=pathname===base?path.join(root,'index.html'):file;
  if(failFile&&target.endsWith(failFile)){res.writeHead(404).end();return;}
  if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
  let body=fs.readFileSync(target);
  if(revision!=='v4'&&['sw.js','app.js'].some(f=>target.endsWith(f)))body=Buffer.from(body.toString().replaceAll('v4',revision));
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'text/plain','Cache-Control':'no-store'}).end(body);
});
const set=async(page,id,value)=>page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},String(value));
const openNode=async(page,id)=>{await page.locator('[data-tab=library]').click();await page.locator('[data-browse=shared]').click();await page.locator(`[data-node="${id}"]`).click();};
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`,url=origin+base;
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']}: {})});
  try{
    const context=await browser.newContext({...devices['iPhone 13'],defaultBrowserType:undefined,serviceWorkers:'allow'});
    const errors=[],external=[];const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    context.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))external.push(r.url());});
    await page.goto(url);
    await page.waitForFunction(()=>document.querySelector('#offlineStatus').textContent==='离线可用 ✓');
    assert(await page.locator('#library').isVisible());assert(!(await page.locator('#review').isVisible()));
    assert.equal(await page.locator('#lectureList button').count(),18);
    assert.equal(await page.locator('#lectureSelect').inputValue(),'lecture2');
    assert.equal(await page.locator('.knowledge-card').count(),5);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert(await page.locator('.assignment-card a').filter({hasText:/Assignment 1/}).first().isVisible());
    await page.screenshot({path:'/tmp/stanford-hub-mobile.png',fullPage:true});
    await page.locator('#catalogSummary').click();await page.locator('[data-unit=lecture18]').click();
    assert.match(await page.locator('#unitContent').textContent(),/Human-Centered AI/);
    assert(await page.locator('.catalog-empty').isVisible());assert.equal(await page.locator('#lectureSelect').inputValue(),'lecture18');
    await page.locator('#librarySearch').fill('Lecture2');assert.equal(await page.locator('[data-jump]').count(),3);
    await page.locator('#librarySearch').fill('Transformer');
    assert(await page.locator('[data-jump="CS336:lecture3"]').isVisible());
    await page.locator('[data-jump="CS336:lecture3"]').click();
    assert.equal(await page.locator('#courseSelect').inputValue(),'CS336');assert.equal(await page.locator('#lectureList button').count(),19);
    for(const [course,count] of [['CS329A',20],['CS349D',4]]){
      await page.locator('#courseSelect').selectOption(course);assert.equal(await page.locator('#lectureList button').count(),count);
    }
    assert.match(await page.locator('#unitContent').textContent(),/不是 Lecture 编号/);
    await page.locator('#courseSelect').selectOption('CS231n');
    await page.locator('[data-node=knn]').click();
    assert.equal(await page.locator('#knnResult').getAttribute('data-prediction'),'dog');
    await page.locator('#knnK').selectOption('1');assert.equal(await page.locator('#knnResult').getAttribute('data-prediction'),'cat');
    await page.locator('#knnMetric').selectOption('l1');
    await set(page,'queryX',2);await set(page,'queryY',1.5);assert.equal(await page.locator('#knnResult').getAttribute('data-prediction'),'dog');
    await page.locator('#nodePractice').click();assert(await page.locator('#review').isVisible());
    assert.equal(await page.locator('#questionSelect option').count(),2);
    await page.locator('#topicSelect').selectOption('validation');await page.locator('#typeSelect').selectOption('formula');
    assert.equal(await page.locator('#questionSelect option').count(),0);assert(await page.locator('#revealBtn').isDisabled());
    await openNode(page,'linear');
    await set(page,'weightA',1);await set(page,'weightB',0);await set(page,'biasC',0);await set(page,'sampleX',1);
    assert.match(await page.locator('#linearResult').textContent(),/= 1.000 · 类别 1/);
    await page.locator('#linear3D').click();await page.locator('#threeStage canvas').waitFor({state:'visible'});
    await set(page,'biasC',-2);assert.match(await page.locator('#linearResult').textContent(),/= -1.000 · 类别 2/);
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/stanford-linear-mobile.png',fullPage:true});
    await set(page,'weightA',0);await set(page,'weightB',0);await set(page,'biasC',0);assert.match(await page.locator('#linearResult').textContent(),/两类分数相同/);
    await page.locator('#linear2D').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await openNode(page,'softmax');
    const original=await page.locator('#labResults').textContent();await set(page,'logitShift',10);assert.equal(await page.locator('#labResults').textContent(),original);
    for(const id of ['z0','z1','z2'])await set(page,id,0);assert.match(await page.locator('#labResults').textContent(),/loss = 1.099/);
    await page.locator('#nodeDerive').click();assert.equal(await page.locator('#derivationSelect').inputValue(),'classification-loss');
    await page.locator('[data-step="2"]').click();assert.match(await page.locator('#stepCounter').textContent(),/STEP 3/);
    await openNode(page,'attention');
    for(let i=0;i<3;i++)await set(page,'attentionScore'+i,0);assert.match(await page.locator('#attentionResult').textContent(),/= 1.000/);
    await openNode(page,'optimization');await set(page,'learningRate',1);await page.locator('#gradientStep').click();assert.match(await page.locator('#gradientResult').textContent(),/w = 0.000/);
    await set(page,'learningRate',2.2);await page.locator('#gradientStep').click();assert.match(await page.locator('#gradientResult').textContent(),/w = -3.600/);
    await openNode(page,'convolution');assert.match(await page.locator('#convResult').textContent(),/= 3/);await set(page,'windowPosition',2);assert.match(await page.locator('#convResult').textContent(),/= 0/);
    const cached=await page.evaluate(async()=>(await(await caches.open('stanford-cs-gym-v4')).keys()).map(r=>r.url));
    assert.equal(cached.filter(x=>x.endsWith('.woff2')).length,20);
    for(const file of ['three.core.min.js','three.module.min.js','OrbitControls.js','linear-lab.js','knowledge.js','catalog.js'])assert(cached.some(u=>u.endsWith(file)));
    await context.setOffline(true);
    const cold=await context.newPage();cold.on('pageerror',e=>errors.push(e.message));
    const cdp=await context.newCDPSession(cold);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
    // Three has only been loaded in the other page; this new document has no HTTP cache.
    await cold.goto(url+'?course=CS231n&lecture=lecture2&tab=library&node=linear');
    await cold.locator('#linear3D').click();await cold.locator('#threeStage canvas').waitFor({state:'visible'});
    await cold.waitForFunction(()=>document.querySelector('#offlineStatus').textContent.includes('离线模式'));
    assert(await cold.evaluate(async()=>{try{await fetch('./uncached-offline-probe');return false;}catch{return true;}}));
    await cold.locator('#nodePractice').click();await cold.locator('#questionSelect').selectOption('linear-scores');
    await cold.locator('#showKeyboard').click();assert(await cold.evaluate(()=>mathVirtualKeyboard.visible));
    await cold.locator('#answerField').evaluate(e=>e.insert(String.raw`\frac{x_i}{2}+\sum_j e^{z_j}`));
    assert.match(await cold.locator('#answerField').evaluate(e=>e.value),/frac/);await cold.evaluate(()=>mathVirtualKeyboard.hide());
    await cold.locator('#hintBtn').click();await cold.locator('#revealBtn').click();assert(await cold.locator('#answerBox math-field').first().evaluate(e=>!!e.shadowRoot));
    const fontResults=await cold.evaluate(async(urls)=>Promise.all(urls.map(async u=>{const r=await fetch(u);return r.ok&&(await r.arrayBuffer()).byteLength>0;})),cached.filter(x=>x.endsWith('.woff2')));assert(fontResults.every(Boolean));
    await cold.evaluate(()=>document.fonts.ready);assert(await cold.evaluate(()=>document.fonts.check('20px KaTeX_Main')));
    await openNode(cold,'softmax');for(const id of ['z0','z1','z2'])await set(cold,id,0);assert.match(await cold.locator('#labResults').textContent(),/loss = 1.099/);
    await cold.reload();await cold.locator('#labResults').waitFor();assert.match(await cold.locator('#nodeTitle').textContent(),/Softmax/);
    await cold.locator('[data-tab=resources]').click();assert.match(await cold.locator('#resources').textContent(),/自编题/);
    await context.setOffline(false);await cold.close();
    // Explicit activation swaps the entire release; broken installs cannot advertise readiness.
    revision='v5';await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});await page.locator('#updateApp').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>new Promise(resolve=>{const c=new MessageChannel();c.port1.onmessage=e=>resolve(e.data.version);navigator.serviceWorker.controller.postMessage({type:'GET_VERSION'},[c.port2]);})),'stanford-cs-gym-v4');
    await page.locator('#updateApp').click();await page.waitForFunction(()=>document.querySelector('#offlineStatus').textContent==='离线可用 ✓'&&!document.querySelector('#updateApp').offsetParent);
    assert.deepEqual(await page.evaluate(()=>caches.keys()),['stanford-cs-gym-v5']);await context.close();
    revision='v4';
    for(const missing of ['KaTeX_Size4-Regular.woff2','three.core.min.js']){
      failFile=missing;const failure=await browser.newContext();const f=await failure.newPage();await f.goto(url);
      await f.waitForFunction(()=>document.querySelector('#offlineStatus').textContent.includes('失败'));
      assert.equal(await f.evaluate(async()=>(await navigator.serviceWorker.getRegistration())?.active?.state||null),null);await failure.close();
    }
    failFile='';assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    const desktop=await browser.newContext({viewport:{width:1440,height:1000}}),wide=await desktop.newPage();await wide.goto(url);await wide.locator('.knowledge-card').first().waitFor();
    await wide.screenshot({path:'/tmp/stanford-hub-desktop.png',fullPage:true});
    await wide.locator('[data-node=linear]').click();await wide.locator('#linear3D').click();await wide.locator('#threeStage canvas').waitFor({state:'visible'});await wide.screenshot({path:'/tmp/stanford-linear-desktop.png',fullPage:true});const fallback=await desktop.newPage();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.startsWith('webgl')?null:original.call(this,kind,...args);};});await fallback.goto(url+'?node=linear&tab=library');await fallback.locator('#linear3D').click();assert.match(await fallback.locator('#linearViewHelp').textContent(),/二维决策边界仍可互动/);assert(await fallback.locator('#linearCanvas').isVisible());await set(fallback,'biasC',1);assert.match(await fallback.locator('#linearResult').textContent(),/1.590/);await desktop.close();
    console.log('PASS: full catalogs and transparent gaps; global search; knowledge-to-practice/derivation; kNN/linear/Softmax/Attention/gradient/convolution math; mobile/desktop; true cold offline 3D + MathLive + 20 fonts; explicit atomic update; missing-font/Three rejection; no external runtime requests.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
