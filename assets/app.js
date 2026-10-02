import { courses, reviews, derivations } from '../data/curriculum.js';
import { catalog, unitLabel } from '../data/catalog.js';
import { knowledge } from '../data/knowledge.js';
import { createHub } from './hub.js';
const lessonGroups=Object.fromEntries(Object.entries(catalog).map(([c,v])=>[c,v.units.map(u=>({...u,title:unitLabel(u)+' · '+u.title,topics:u.nodeIds.map(id=>knowledge.find(n=>n.id===id)).filter(Boolean)}))]));
let hub;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const params = new URL(location.href).searchParams;
let activeCourse = courses.some(c => c.id === params.get('course')) ? params.get('course') : 'CS231n';
const sharedSets = knowledge;
const legacyTopic = !params.has('mode') && !params.has('lecture') ? params.get('topic') : null;
let activeMode = params.get('mode') === 'shared' || ['losses','systems','agents'].includes(legacyTopic) ? 'shared' : 'course';
let activeLecture = lessonGroups[activeCourse].some(l=>l.id===params.get('lecture')) ? params.get('lecture') : activeCourse==='CS231n' ? legacyTopic==='vision'?'lecture5':'lecture2' : lessonGroups[activeCourse][0].id;
let activeTopic = currentTopics().some(t=>t.id===params.get('topic')) ? params.get('topic') : 'ALL';
let activeType = ['concept','formula'].includes(params.get('type')) ? params.get('type') : 'ALL';
let activeTab = 'library';
let currentReview = null;
let hintIndex = 0;
let activeDerivation = derivations[0];
let deriveStep = 0;

function escapeHtml(str='') {
  return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function readOnlyMath(latex) {
  return latex.split(/,\\quad/).map(part => `<math-field read-only>${escapeHtml(part)}</math-field>`).join('');
}

function updateURL() {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries({mode:activeMode, course:activeCourse, lecture:activeLecture, topic:activeTopic, type:activeType, tab:activeTab, question:currentReview?.id || ''})) {
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
  }
  history.replaceState(null, '', url);
}

function selectTab(tab) {
  if (!$(`[data-panel="${tab}"]`)) tab = 'library';
  activeTab = tab;
  hub?.setVisible(tab==='library');
  $$('[data-panel]').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== tab));
  $$('[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
    b.setAttribute('aria-pressed', String(b.dataset.tab === tab));
  });
  $('#courseControl').classList.toggle('hidden', activeTab==='review' && activeMode==='shared');
  globalThis.mathVirtualKeyboard?.hide();
  updateURL();
}

function currentUnit() {
  return lessonGroups[activeCourse].find(l=>l.id===activeLecture) || lessonGroups[activeCourse][0];
}

function currentTopics() {
  return activeMode==='shared' ? sharedSets : currentUnit().topics;
}

function renderFilters() {
  $('#courseSelect').innerHTML = courses.map(c => `<option value="${c.id}">${c.id}</option>`).join('');
  $('#courseSelect').value = activeCourse;
  $('#lectureSelect').innerHTML = lessonGroups[activeCourse].map(l=>`<option value="${l.id}">${escapeHtml(l.title)}</option>`).join('');
  $('#lectureSelect').value = activeLecture;
  $('#lectureControl').classList.toggle('hidden', activeMode==='shared');
  $('#review .review-controls').classList.toggle('shared',activeMode==='shared');
  $('#lectureLabel').textContent = activeCourse==='CS349D' ? '项目里程碑' : '课表讲次';
  $('#topicLabel').textContent = '知识点';
  const allTitle = activeMode==='shared' ? '全部跨课专题' : activeCourse==='CS231n' ? '本讲全部主题' : '本单元全部主题';
  $('#topicSelect').innerHTML = `<option value="ALL">${allTitle}</option>` + currentTopics().map(t=>`<option value="${t.id}">${escapeHtml(t.title)}</option>`).join('');
  $('#topicSelect').value = activeTopic;
  $('#typeSelect').value = activeType;
  $$('[data-mode]').forEach(b=>{ b.classList.toggle('active',b.dataset.mode===activeMode); b.setAttribute('aria-pressed',String(b.dataset.mode===activeMode)); });
  $('#courseControl').classList.toggle('hidden',activeTab==='review' && activeMode==='shared');
  const unit = currentUnit();
  $('#lessonContext').textContent = activeMode==='shared' ? '跨课程知识专题' : `${activeCourse} · ${unit.title}`;
  const items = pool();
  $('#poolCount').textContent = `${items.length} 道题`;
  $('#questionSelect').innerHTML = items.map(r => `<option value="${r.id}">${escapeHtml(r.title)}</option>`).join('');
  $('#questionSelect').disabled = !items.length;
}

function pool() {
  const topics = activeTopic==='ALL' ? currentTopics() : currentTopics().filter(t=>t.id===activeTopic);
  const ids = new Set(topics.flatMap(t=>t.reviewIds));
  return reviews.filter(r => ids.has(r.id) && (activeType==='ALL' || r.type===activeType));
}

function pickReview(id) {
  const items = pool();
  let next = items.find(r => r.id === id) || items[Math.floor(Math.random() * items.length)];
  if (!id && items.length > 1 && currentReview?.id === next.id) next = items[(items.indexOf(next)+1) % items.length];
  currentReview = next || null;
  hintIndex = 0;
  $('#reviewCourse').textContent = next?.courses.join(' · ') || activeCourse;
  $('#reviewType').textContent = next?.type === 'formula' ? '公式题' : '概念题';
  $('#reviewTitle').textContent = next?.title || '当前范围暂无练习';
  $('#reviewPrompt').textContent = next?.prompt || '可以回知识库阅读本讲资料，或选择已有知识点练习。';
  $('#questionSelect').value = next?.id || '';
  for (const id of ['hintBox','answerBox']) { $('#'+id).classList.add('hidden'); $('#'+id).innerHTML = ''; }
  $('#answerField').value = '';
  $('#textAnswer').value = '';
  const isFormula = next?.type === 'formula';
  $('#mathInputWrap').classList.toggle('hidden', !next || !isFormula);
  $('#textAnswer').classList.toggle('hidden', !next || isFormula);
  for (const id of ['hintBtn','revealBtn','nextBtn']) $('#'+id).disabled = !next;
  updateURL();
}

function showHint() {
  if (!currentReview) return;
  const hints = currentReview.hints || [];
  if (!hints.length) return;
  const h = hints[Math.min(hintIndex, hints.length - 1)];
  hintIndex++;
  $('#hintBox').classList.remove('hidden');
  $('#hintBox').innerHTML = `<strong>Hint ${Math.min(hintIndex,hints.length)}/${hints.length}</strong><br>${escapeHtml(h)}`;
}

function revealAnswer() {
  if (!currentReview) return;
  $('#answerBox').classList.remove('hidden');
  const answer = currentReview.type === 'formula'
    ? `${readOnlyMath(currentReview.answer)}`
    : `<div>${escapeHtml(currentReview.answerText || '')}</div>`;
  $('#answerBox').innerHTML = `<strong>答案</strong>${answer}<div style="margin-top:10px;color:#a9d8bf"><strong>为什么值得记：</strong> ${escapeHtml(currentReview.why || '')}</div>`;
}

function renderDerivationOptions() {
  $('#derivationSelect').innerHTML = derivations.map(d => `<option value="${d.id}">${d.title}</option>`).join('');
  $('#derivationSelect').value = activeDerivation.id;
  $('#derivationSelect').addEventListener('change', e => {
    activeDerivation = derivations.find(d => d.id === e.target.value) || derivations[0];
    deriveStep = 0;
    renderDerivation();
  });
}

function renderDerivation() {
  const step = activeDerivation.steps[deriveStep];
  $('#stepCounter').textContent = `STEP ${deriveStep+1} / ${activeDerivation.steps.length}`;
  $('#stepTitle').textContent = step.title;
  $('#stepPrompt').textContent = step.prompt;
  $('#deriveField').value = '';
  $('#deriveHintBox').classList.add('hidden');
  $('#deriveAnswerBox').classList.add('hidden');
  $('#derivationWhy').textContent = activeDerivation.why;
  $('#derivationLadder').innerHTML = activeDerivation.steps.map((s,i) => `<button class="ladder-step ${i===deriveStep?'active':''}" data-step="${i}" aria-pressed="${i===deriveStep}">${i+1}. ${escapeHtml(s.title.replace(/^Step \d+ · /,''))}</button>`).join('');
  $$('[data-step]').forEach(b => b.addEventListener('click', () => { deriveStep = Number(b.dataset.step); renderDerivation(); }));
  $('#deriveNext').textContent = deriveStep === activeDerivation.steps.length-1 ? '从头再来 ↻' : '下一步 →';
}

function initMathLive() {
  const fields = ['answerField','deriveField','scratchField'].map(id => document.getElementById(id));
  fields.forEach(mf => {
    if (!mf) return;
    mf.mathVirtualKeyboardPolicy = 'manual';
    mf.smartFence = true;
    mf.insertAdjacentHTML('afterend', `<details class="math-input-help" id="${mf.id}Help"><summary>怎么输入公式？</summary><p>点输入框右侧的键盘图标可打开数学键盘。电脑上也可以这样按：</p><dl><dt><kbd>_</kbd> / <kbd>^</kbd></dt><dd>进入下标 / 上标，例如 x_i、e^x。</dd><dt><kbd>→</kbd></dt><dd>退出一层下标或上标；有两层就按两次。</dd><dt><kbd>\\frac</kbd> + <kbd>Enter</kbd></dt><dd>建立分数，先填分子，再用 ↓ 移到分母。</dd><dt><kbd>\\sum</kbd> + <kbd>Enter</kbd></dt><dd>插入求和符号 Σ；随后可用 _ 加下标。</dd></dl><p>完整 LaTeX 可直接粘贴，例如 <code>\\frac{a}{b}</code>。不需要加 $ 或 $$。</p></details>`);
    mf.setAttribute('aria-describedby', `${mf.id}Help`);
    mf.addEventListener('focusin', () => {
      if (globalThis.mathVirtualKeyboard) globalThis.mathVirtualKeyboard.layouts = ['numeric','symbols','alphabetic','greek'];
    });
  });
}

function setupEvents() {
  $('.brand').addEventListener('click',e=>{e.preventDefault();selectTab('library');hub.render();scrollTo({top:0});});
  $('#courseSelect').addEventListener('change', e => {
    activeCourse = e.target.value;
    activeMode = 'course';
    activeLecture = activeCourse==='CS231n'?'lecture2':lessonGroups[activeCourse][0].id;
    activeTopic = 'ALL';
    activeType = 'ALL';
    renderFilters(); pickReview(pool()[0]?.id); hub.render();
  });
  $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>{
    activeMode = b.dataset.mode;
    activeTopic = 'ALL'; activeType = 'ALL';
    renderFilters(); pickReview(pool()[0]?.id);
  }));
  $('#lectureSelect').addEventListener('change',e=>{
    activeLecture = e.target.value; activeTopic = 'ALL'; activeType = 'ALL';
    renderFilters(); pickReview(pool()[0]?.id); hub.render();
  });
  $('#topicSelect').addEventListener('change', e => { activeTopic = e.target.value; renderFilters(); pickReview(pool()[0]?.id); });
  $('#typeSelect').addEventListener('change', e => { activeType = e.target.value; renderFilters(); pickReview(pool()[0]?.id); });
  $('#questionSelect').addEventListener('change', e => pickReview(e.target.value));
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.tab)));
  $('#nextBtn').addEventListener('click', () => pickReview());
  $('#hintBtn').addEventListener('click', showHint);
  $('#revealBtn').addEventListener('click', revealAnswer);
  $('#clearAnswer').addEventListener('click', () => $('#answerField').value = '');
  $('#deriveHint').addEventListener('click', () => {
    const step = activeDerivation.steps[deriveStep];
    $('#deriveHintBox').classList.remove('hidden');
    $('#deriveHintBox').innerHTML = `<strong>Hint</strong><br>${escapeHtml(step.hint)}`;
  });
  $('#deriveReveal').addEventListener('click', () => {
    const step = activeDerivation.steps[deriveStep];
    $('#deriveAnswerBox').classList.remove('hidden');
    $('#deriveAnswerBox').innerHTML = `<strong>这一步</strong>${readOnlyMath(step.answer)}`;
  });
  $('#deriveNext').addEventListener('click', () => {
    deriveStep = (deriveStep + 1) % activeDerivation.steps.length;
    renderDerivation();
  });
  $('#clearScratch').addEventListener('click', () => $('#scratchField').value = '');
  $('#copyLatex').addEventListener('click', async () => {
    const value = $('#scratchField').value || '';
    try { await navigator.clipboard.writeText(value); }
    catch { $('#copyLatex').textContent = '复制失败，请选中公式手动复制'; return; }
    const btn = $('#copyLatex');
    const old = btn.textContent;
    btn.textContent = '已复制 ✓';
    setTimeout(() => btn.textContent = old, 1200);
  });
  $$('[data-scroll]').forEach(btn => btn.addEventListener('click', () => document.getElementById(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));
}

await customElements.whenDefined('math-field');
// The local font stylesheet also suppresses MathLive's default CDN font loader.
MathfieldElement.fontsDirectory = new URL('./vendor/mathlive/fonts/', import.meta.url).href;
MathfieldElement.soundsDirectory = null;
MathfieldElement.keypressSound = null;
MathfieldElement.plonkSound = null;
renderFilters();
renderDerivationOptions();
renderDerivation();
pickReview(pool().some(r => r.id === params.get('question')) ? params.get('question') : pool()[0]?.id);
setupEvents();
initMathLive();
hub=createHub({
  getState:()=>({course:activeCourse,lecture:activeLecture}),
  onUnit:(course,lecture)=>{
    activeCourse=course;activeLecture=lecture;activeMode='course';activeTopic='ALL';activeType='ALL';
    renderFilters();pickReview(pool()[0]?.id);
  },
  onPractice:(n)=>{
    activeMode=currentUnit().topics.some(t=>t.id===n.id)?'course':'shared';activeTopic=n.id;activeType='ALL';
    renderFilters();pickReview(n.reviewIds[0]);selectTab('review');
  },
  onDerivation:id=>{
    activeDerivation=derivations.find(d=>d.id===id)||derivations[0];deriveStep=0;
    $('#derivationSelect').value=activeDerivation.id;renderDerivation();selectTab('derivation');
  }
});
hub.initial();
const initialTab=params.get('tab');
if(initialTab==='experiment') hub.openNode('softmax');
selectTab(['review','derivation','resources','scratchpad'].includes(initialTab)?initialTab:'library');
initOffline();
function initOffline() {
  let ready = false;
  let refreshing = false;
  const status = $('#offlineStatus');
  function display() {
    status.textContent = ready ? navigator.onLine ? '离线可用 ✓' : '离线模式 ✓' : navigator.onLine ? '离线准备中…' : '离线尚未就绪';
  }
  window.addEventListener('online', display);
  window.addEventListener('offline', display);
  if (!('serviceWorker' in navigator)) { status.textContent = '当前浏览器不支持离线'; return; }
  function checkReady() {
    const controller = navigator.serviceWorker.controller;
    if (!controller) return;
    const channel = new MessageChannel();
    channel.port1.onmessage = e => { ready = e.data?.version === 'stanford-cs-gym-v5'; display(); channel.port1.close(); };
    controller.postMessage({type:'GET_VERSION'}, [channel.port2]);
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) location.reload(); else checkReady();
  });
  navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).then(reg => {
    function offerUpdate() {
      if (!reg.waiting || !navigator.serviceWorker.controller) return;
      $('#updateApp').classList.remove('hidden');
    }
    offerUpdate();
    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      installing?.addEventListener('statechange', () => {
        offerUpdate();
        if (installing.state === 'redundant' && !ready) status.textContent = '离线准备失败，请联网刷新';
      });
    });
    $('#updateApp').addEventListener('click', () => {
      if (!reg.waiting) return;
      refreshing = true;
      reg.waiting.postMessage({type:'SKIP_WAITING'});
    });
    navigator.serviceWorker.ready.then(checkReady);
  }).catch(() => { status.textContent = '离线准备失败，请联网刷新'; });
}
