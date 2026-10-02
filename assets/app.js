import { courses, concepts, reviews, derivations } from '../data/curriculum.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let activeCourse = 'ALL';
let currentReview = null;
let hintIndex = 0;
let activeDerivation = derivations[0];
let deriveStep = 0;

function escapeHtml(str='') {
  return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function readOnlyMath(latex) {
  return `<math-field read-only>${escapeHtml(latex)}</math-field>`;
}

function renderCourses() {
  $('#courseGrid').innerHTML = courses.map(c => `
    <article class="course-card" style="--course-color:${c.color}">
      <div class="course-code">${c.id}</div>
      <h3>${c.title}</h3>
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
      <p>${c.desc}</p>
      <div class="concept-tags">${c.courses.map(x => `<span>${x}</span>`).join('')}</div>
    </article>
  `).join('');
}

function renderFilters() {
  const items = [{id:'ALL', title:'全部'}, ...courses.map(c => ({id:c.id,title:c.id}))];
  $('#courseFilters').innerHTML = items.map(x => `<button class="ghost filter-btn ${x.id === activeCourse ? 'active':''}" data-course="${x.id}">${x.title}</button>`).join('');
  $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    activeCourse = btn.dataset.course;
    renderFilters();
    pickReview();
  }));
}

function pool() {
  return activeCourse === 'ALL' ? reviews : reviews.filter(r => r.courses.includes(activeCourse));
}

function pickReview() {
  const items = pool();
  if (!items.length) return;
  let next = items[Math.floor(Math.random() * items.length)];
  if (items.length > 1 && currentReview?.id === next.id) {
    next = items[(items.indexOf(next)+1) % items.length];
  }
  currentReview = next;
  hintIndex = 0;
  $('#reviewCourse').textContent = next.courses.join(' · ');
  $('#reviewType').textContent = next.type === 'formula' ? 'Formula / Derive' : 'Explain / Concept';
  $('#reviewTitle').textContent = next.title;
  $('#reviewPrompt').textContent = next.prompt;
  $('#hintBox').classList.add('hidden');
  $('#answerBox').classList.add('hidden');
  $('#hintBox').innerHTML = '';
  $('#answerBox').innerHTML = '';
  $('#answerField').value = '';
  $('#textAnswer').value = '';
  const isFormula = next.type === 'formula';
  $('#mathInputWrap').classList.toggle('hidden', !isFormula);
  $('#textAnswer').classList.toggle('hidden', isFormula);
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
  $('#derivationLadder').innerHTML = activeDerivation.steps.map((s,i) => `<div class="ladder-step ${i===deriveStep?'active':''}">${i+1}. ${s.title.replace(/^Step \d+ · /,'')}</div>`).join('');
  $('#deriveNext').textContent = deriveStep === activeDerivation.steps.length-1 ? '从头再来 ↻' : '下一步 →';
}

function initMathLive() {
  const fields = ['answerField','deriveField','scratchField'].map(id => document.getElementById(id));
  fields.forEach(mf => {
    if (!mf) return;
    mf.mathVirtualKeyboardPolicy = 'manual';
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
  $('#startReview').addEventListener('click', () => { pickReview(); $('#review').scrollIntoView({behavior:'smooth'}); });
  $('#shuffleTop').addEventListener('click', () => { pickReview(); $('#review').scrollIntoView({behavior:'smooth'}); });
  $('#nextBtn').addEventListener('click', pickReview);
  $('#hintBtn').addEventListener('click', showHint);
  $('#revealBtn').addEventListener('click', revealAnswer);
  $('#showKeyboard').addEventListener('click', () => keyboardFor('answerField'));
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
  $('#scratchKeyboard').addEventListener('click', () => keyboardFor('scratchField'));
  $('#clearScratch').addEventListener('click', () => $('#scratchField').value = '');
  $('#copyLatex').addEventListener('click', async () => {
    const value = $('#scratchField').value || '';
    await navigator.clipboard.writeText(value);
    const btn = $('#copyLatex');
    const old = btn.textContent;
    btn.textContent = '已复制 ✓';
    setTimeout(() => btn.textContent = old, 1200);
  });
  $$('[data-scroll]').forEach(btn => btn.addEventListener('click', () => document.getElementById(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));
}

renderCourses();
renderConcepts();
renderFilters();
renderDerivationOptions();
renderDerivation();
pickReview();
setupEvents();
customElements.whenDefined('math-field').then(initMathLive);