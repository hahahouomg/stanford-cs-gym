import { courses, concepts, reviews, derivations, studySets, studyGuides } from '../data/curriculum.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const params = new URL(location.href).searchParams;
let activeCourse = courses.some(c => c.id === params.get('course')) ? params.get('course') : 'CS231n';
let activeTopic = params.get('topic') === 'ALL' ? 'ALL' : studySets.some(t => t.id === params.get('topic') && t.courses.includes(activeCourse)) ? params.get('topic') : activeCourse === 'CS231n' ? 'lecture2' : 'ALL';
let activeType = ['concept','formula'].includes(params.get('type')) ? params.get('type') : 'ALL';
let activeTab = 'review';
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

function renderCourses() {
  $('#courseGrid').innerHTML = courses.map(c => `
    <article class="course-card" style="--course-color:${c.color}">
      <div class="course-code">${c.id}</div>
      <h3>${c.title}</h3>
      <p class="caption">${escapeHtml(c.version)}</p>
      <p>${c.focus}</p>
      <div class="topic-list">${c.topics.map(t => `<span>${t}</span>`).join('')}</div>
      <a class="course-link" href="${c.url}" target="_blank" rel="noreferrer">Stanford official ↗</a>
    </article>
  `).join('');
}

function renderConcepts() {
  $('#conceptGrid').innerHTML = concepts.map(c => `
    <article class="concept-card">
      <h3>${c.title}</h3>
      <p class="caption">${escapeHtml(c.version)}</p>
      <p>${c.desc}</p>
      <div class="concept-tags">${c.courses.map(x => `<span>${x}</span>`).join('')}</div>
    </article>
  `).join('');
}

function updateURL() {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries({course:activeCourse, topic:activeTopic, type:activeType, tab:activeTab, question:currentReview?.id || ''})) {
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
  }
  history.replaceState(null, '', url);
}

function selectTab(tab) {
  if (!$(`[data-panel="${tab}"]`)) tab = 'review';
  activeTab = tab;
  $$('[data-panel]').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== tab));
  $$('[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
    b.setAttribute('aria-pressed', String(b.dataset.tab === tab));
  });
  globalThis.mathVirtualKeyboard?.hide();
  updateURL();
}

function renderFilters() {
  $('#courseSelect').innerHTML = courses.map(c => `<option value="${c.id}">${c.id}</option>`).join('');
  $('#courseSelect').value = activeCourse;
  $('#topicSelect').innerHTML = `<option value="ALL">本课程全部题目</option>` + studySets.filter(t => t.courses.includes(activeCourse)).map(t => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join('');
  $('#topicSelect').value = activeTopic;
  $('#typeSelect').value = activeType;
  const items = pool();
  $('#poolCount').textContent = `${items.length} 道题`;
  $('#questionSelect').innerHTML = items.map(r => `<option value="${r.id}">${escapeHtml(r.title)}</option>`).join('');
  $('#questionSelect').disabled = !items.length;
}

function pool() {
  const set = studySets.find(t => t.id === activeTopic);
  return reviews.filter(r => r.courses.includes(activeCourse) && (!set || set.reviewIds.includes(r.id)) && (activeType === 'ALL' || r.type === activeType));
}

function pickReview(id) {
  const items = pool();
  let next = items.find(r => r.id === id) || items[Math.floor(Math.random() * items.length)];
  if (!id && items.length > 1 && currentReview?.id === next.id) next = items[(items.indexOf(next)+1) % items.length];
  currentReview = next || null;
  hintIndex = 0;
  $('#reviewCourse').textContent = activeCourse;
  $('#reviewType').textContent = next?.type === 'formula' ? '公式题' : '概念题';
  $('#reviewTitle').textContent = next?.title || '这个范围暂时没有此题型';
  $('#reviewPrompt').textContent = next?.prompt || '试试选择“全部题型”或其他范围。';
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

function renderStudyGuide() {
  const g = studyGuides[activeCourse];
  $('#studyGuide').innerHTML = `<div class="section-head"><div><div class="eyebrow">${activeCourse}</div><h2>${escapeHtml(g.title)}</h2><p class="caption">${escapeHtml(g.version)}</p></div></div>
    <p class="study-plan">${escapeHtml(g.plan)}</p>
    <div class="concept-grid">${g.notes.map(([title,desc]) => `<article class="concept-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p></article>`).join('')}</div>
    <h3>本次怎么练</h3><ol class="practice-loop">${g.practice.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ol>
    <h3>资料入口 <small class="caption">原文需要网络</small></h3><div class="resource-list">${g.resources.map(([title,url,desc]) => `<a href="${url}" target="_blank" rel="noreferrer"><strong>${escapeHtml(title)} ↗</strong><span>${escapeHtml(desc)}</span></a>`).join('')}</div>`;
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
    mf.addEventListener('focusin', () => {
      if (globalThis.mathVirtualKeyboard) globalThis.mathVirtualKeyboard.layouts = ['numeric','symbols','alphabetic','greek'];
    });
  });
}

function keyboardFor(id) {
  const mf = document.getElementById(id);
  mf?.focus();
  if (globalThis.mathVirtualKeyboard) globalThis.mathVirtualKeyboard.show();
}

function setupEvents() {
  $('#courseSelect').addEventListener('change', e => {
    activeCourse = e.target.value;
    activeTopic = activeCourse === 'CS231n' ? 'lecture2' : 'ALL';
    activeType = 'ALL';
    renderFilters(); renderStudyGuide(); pickReview(pool()[0]?.id);
  });
  $('#topicSelect').addEventListener('change', e => { activeTopic = e.target.value; renderFilters(); pickReview(pool()[0]?.id); });
  $('#typeSelect').addEventListener('change', e => { activeType = e.target.value; renderFilters(); pickReview(pool()[0]?.id); });
  $('#questionSelect').addEventListener('change', e => pickReview(e.target.value));
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.tab)));
  $('#nextBtn').addEventListener('click', () => pickReview());
  $('#hintBtn').addEventListener('click', showHint);
  $('#revealBtn').addEventListener('click', revealAnswer);
  $('#showKeyboard').addEventListener('click', () => keyboardFor('answerField'));
  $('#clearAnswer').addEventListener('click', () => $('#answerField').value = '');
  $('#deriveKeyboard').addEventListener('click', () => keyboardFor('deriveField'));
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
  $('#scratchKeyboard').addEventListener('click', () => keyboardFor('scratchField'));
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
renderCourses();
renderConcepts();
renderFilters();
renderStudyGuide();
renderDerivationOptions();
renderDerivation();
pickReview(pool().some(r => r.id === params.get('question')) ? params.get('question') : pool()[0]?.id);
setupEvents();
initMathLive();
initExperiment();
selectTab(['review','experiment','derivation','resources','scratchpad'].includes(params.get('tab')) ? params.get('tab') : 'review');
initOffline();
function initExperiment() {
  const labels = ['猫','狗','车'];
  $('#logitControls').innerHTML = labels.map((label,i) => `<label class="logit-control">${label}的分数 <output id="zValue${i}"></output><input type="range" id="z${i}" aria-label="${label}的分数" min="-5" max="5" step="0.5" value="${[2,1,0][i]}" /></label>`).join('');
  function update() {
    const z = labels.map((_,i) => Number($('#z'+i).value));
    const shift = Number($('#logitShift').value);
    $('#shiftValue').value = shift;
    z.forEach((v,i) => $('#zValue'+i).value = (v+shift).toFixed(1));
    const logits = z.map(v => v+shift);
    const max = Math.max(...logits);
    const e = logits.map(v => Math.exp(v-max));
    const total = e.reduce((a,b) => a+b, 0);
    const probs = e.map(v => v/total);
    $('#probabilityBars').innerHTML = probs.map((v,i) => `<div class="prob-row"><span>${labels[i]}${i===0?' ✓':''}</span><div class="prob-track"><div style="width:${v*100}%"></div></div><output>${(v*100).toFixed(1)}%</output></div>`).join('');
    $('#probabilityBars').setAttribute('aria-label', labels.map((v,i) => `${v} ${(probs[i]*100).toFixed(1)}%`).join('，'));
    $('#labResults').textContent = `正确类别：猫 · p = ${probs[0].toFixed(3)} · loss = ${(-Math.log(probs[0])).toFixed(3)}（自然对数）`;
  }
  for (const id of ['z0','z1','z2','logitShift']) $('#'+id).addEventListener('input', update);
  $('#resetExperiment').addEventListener('click', () => { [2,1,0].forEach((v,i) => $('#z'+i).value = v); $('#logitShift').value = 0; update(); });
  update();
}

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
    channel.port1.onmessage = e => { ready = e.data?.version === 'stanford-cs-gym-v2'; display(); channel.port1.close(); };
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
