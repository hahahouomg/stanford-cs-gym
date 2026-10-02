import { catalog, assignments, unitLabel } from '../data/catalog.js';
import { knowledge, nodeById } from '../data/knowledge.js';
import { mountDemo } from './labs.js';

export const escapeHtml = (str='')=>String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const math=latex=>latex.split(/,\\quad/).map(p=>`<math-field read-only>${escapeHtml(p)}</math-field>`).join('');
const links=rs=>rs.map(r=>`<a class="source-link" href="${escapeHtml(r.url)}" target="_blank" rel="noreferrer"><span class="source-kind">${escapeHtml(r.kind || '官方作业')}${r.author?` · ${escapeHtml(r.author)}`:''}</span><strong>${escapeHtml(r.title)} ↗</strong>${r.desc?`<span>${escapeHtml(r.desc)}</span>`:''}</a>`).join('');
const art={
  neighbors:'<path d="M26 27L69 42L100 23M69 42L108 64M69 42L35 75" stroke="#77d7aa" stroke-dasharray="4 4"/><g fill="#8cb8ff"><circle cx="26" cy="27" r="6"/><circle cx="100" cy="23" r="6"/><circle cx="35" cy="75" r="6"/></g><circle cx="108" cy="64" r="6" fill="#ff8f9d"/><circle cx="69" cy="42" r="7" fill="#ffcf54"/>',
  plane:'<path d="M12 63L75 80L128 40L65 23Z" fill="#8cb8ff" fill-opacity=".12" stroke="#8cb8ff"/><path d="M32 76L52 40L94 18L74 54Z" fill="#77d7aa" fill-opacity=".3" stroke="#77d7aa"/><circle cx="46" cy="64" r="5" fill="#ff8f9d"/><circle cx="95" cy="47" r="5" fill="#8cb8ff"/>',
  bars:'<path d="M20 80V45H39V80M60 80V19H79V80M100 80V62H119V80" fill="#8cb8ff"/><path d="M60 80V19H79V80" fill="#77d7aa"/>',
  pixels:'<g fill="#8cb8ff" fill-opacity=".3"><path d="M20 15H42V37H20ZM46 15H68V37H46ZM72 15H94V37H72ZM20 41H42V63H20ZM46 41H68V63H46ZM72 41H94V63H72ZM20 67H42V89H20ZM46 67H68V89H46ZM72 67H94V89H72Z"/></g><path d="M44 39H96V91H44Z" fill="#77d7aa" fill-opacity=".2" stroke="#77d7aa"/>',
  split:'<rect x="15" y="25" width="60" height="48" rx="6" fill="#8cb8ff" fill-opacity=".4"/><rect x="80" y="25" width="24" height="48" rx="6" fill="#ffcf54" fill-opacity=".6"/><rect x="109" y="25" width="24" height="48" rx="6" fill="#77d7aa" fill-opacity=".6"/>',
  curve:'<path d="M15 20Q70 135 125 20" fill="none" stroke="#8cb8ff" stroke-width="3"/><path d="M30 45L115 35L48 67L89 70L64 76" stroke="#ffcf54" fill="none"/><circle cx="64" cy="76" r="5" fill="#ffcf54"/>',
  chain:'<path d="M25 50H70L112 23M70 50L112 77" stroke="#8cb8ff" stroke-width="2"/><circle cx="25" cy="50" r="10" fill="#8cb8ff"/><circle cx="70" cy="50" r="10" fill="#ffcf54"/><circle cx="112" cy="23" r="10" fill="#77d7aa"/><circle cx="112" cy="77" r="10" fill="#77d7aa"/>'
};
function card(n) {
  return `<button class="knowledge-card" data-node="${n.id}"><svg viewBox="0 0 145 100" aria-hidden="true">${art[n.icon] || art.chain}</svg><span class="card-type">${n.demo?'互动实验':'知识讲解'}</span><strong>${escapeHtml(n.title)}</strong><span class="card-subtitle">${escapeHtml(n.subtitle)}</span><span class="card-courses">${n.courses.join(' · ')}</span></button>`;
}
function assignmentCards(items) {
  return items.map(a=>`<article class="assignment-card"><a href="${a.url}" target="_blank" rel="noreferrer">${escapeHtml(a.title)} ↗</a>${a.tasks.length?`<ul>${a.tasks.map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</ul>`:''}${a.start?`<p class="assignment-start">${escapeHtml(a.start)}</p>`:''}</article>`).join('');
}

export function createHub({getState,onUnit,onPractice,onDerivation}) {
  const root=document.querySelector('#unitContent');
  const query=document.querySelector('#librarySearch');
  const drawer=document.querySelector('#catalogDrawer');
  let cleanup=()=>{};
  let serial=0;
  let currentNode=null;
  let scope=new URL(location.href).searchParams.get('browse')==='shared'?'shared':'course';
  let visible=true;

  function updateRoute(id='') {
    const u=new URL(location.href);
    if(id) u.searchParams.set('node',id); else u.searchParams.delete('node');
    u.searchParams.set('browse',scope);
    history.replaceState(null,'',u);
  }
  function stop() { serial++;cleanup();cleanup=()=>{}; }
  function wireCards() {
    root.querySelectorAll('[data-node]').forEach(b=>b.addEventListener('click',()=>openNode(b.dataset.node,true)));
  }
  function render() {
    stop(); currentNode=null;updateRoute();
    const {course,lecture}=getState();
    const c=catalog[course];
    const unit=c.units.find(u=>u.id===lecture) || c.units[0];
    document.querySelectorAll('[data-browse]').forEach(b=>{
      b.classList.toggle('active',b.dataset.browse===scope);
      b.setAttribute('aria-pressed',String(b.dataset.browse===scope));
    });
    drawer.classList.toggle('hidden',scope==='shared' || !!query.value.trim());
    document.querySelector('#catalogSummary').textContent=`${course} · 全部${c.label}`;
    document.querySelector('#lectureList').innerHTML=c.units.map(u=>`<button data-unit="${u.id}" class="lecture-item ${u.id===unit.id?'active':''}" aria-pressed="${u.id===unit.id}"><span>${u.kind==='milestone'?'M':''}${String(u.number).padStart(2,'0')}</span><strong>${escapeHtml(u.title)}</strong>${u.nodeIds.some(id=>nodeById.get(id)?.demo)?'<i aria-label="有互动实验"></i>':''}</button>`).join('');
    document.querySelectorAll('[data-unit]').forEach(b=>b.addEventListener('click',()=>{
      query.value='';onUnit(course,b.dataset.unit);
      if(matchMedia('(max-width: 900px)').matches) drawer.open=false;
      render();root.scrollIntoView({block:'start'});
    }));
    if(query.value.trim()) return renderSearch();
    if(scope==='shared') {
      root.innerHTML=`<div class="unit-heading"><div><span class="eyebrow">跨课程复习</span><h2>同一个概念，不同的用途</h2></div><span class="caption">${knowledge.length} 个知识点</span></div><div class="knowledge-grid">${knowledge.map(card).join('')}</div>`;
      wireCards();return;
    }
    const nodes=unit.nodeIds.map(id=>nodeById.get(id)).filter(Boolean);
    const related=assignments[course].filter(a=>a.units.includes(unit.number));
    root.innerHTML=`<div class="unit-heading"><div><span class="eyebrow">${course} · ${c.version} · ${unitLabel(unit)}</span><h2>${escapeHtml(unit.title)}</h2><p class="caption original-title">${escapeHtml(unit.originalTitle)}</p></div><a class="subtle-link" href="${c.source}" target="_blank" rel="noreferrer">官方课表 ↗</a></div>
      ${c.notice?`<p class="catalog-notice">${escapeHtml(c.notice)}</p>`:''}
      <div class="topic-chips">${unit.topics.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>
      ${nodes.length?`<div class="knowledge-grid">${nodes.map(card).join('')}</div><p class="caption">本站讲解按知识点逐步补充，课程目录始终保留所有讲次。</p>`:`<div class="catalog-empty"><strong>先从这讲的原始资料开始</strong><p>本站还没有本讲的知识讲解；官方资料与作业入口已经收录。</p></div>`}
      ${related.length?`<div class="hub-section-heading"><h3>关联作业</h3><span class="caption">官方原题 · 学习关联由本站整理</span></div><div class="assignment-grid">${assignmentCards(related)}</div>`:''}
      <details class="reference-details unit-sources" open><summary>本讲资料 <small class="caption">原文需要网络</small></summary><div class="source-grid">${links([{title:'完整官方课表与阅读',url:c.source,kind:'官方'},...unit.resources])}</div></details>
      <details class="reference-details"><summary>${course} · 全部作业与项目</summary><div class="assignment-grid">${assignmentCards(assignments[course])}</div></details>`;
    wireCards();
  }
  function renderSearch() {
    const s=query.value.trim().toLocaleLowerCase().replace(/\s+/g,'');
    const nodes=knowledge.filter(n=>[n.title,n.subtitle,n.summary,n.area,...n.courses].join(' ').toLocaleLowerCase().replace(/\s+/g,'').includes(s));
    const lectureNumber=/^lecture(\d+)$/.exec(s)?.[1];
    const us=Object.entries(catalog).flatMap(([c,data])=>data.units.map(u=>({course:c,unit:u}))).filter(({course,unit:u})=>lectureNumber?u.kind==='lecture'&&u.number===Number(lectureNumber):[course,unitLabel(u),u.title,u.originalTitle,...u.topics].join(' ').toLocaleLowerCase().replace(/\s+/g,'').includes(s));
    root.innerHTML=`<div class="unit-heading"><h2>搜索结果</h2><span class="caption">所有课程 · ${nodes.length} 个知识点 / ${us.length} 个讲次</span></div>${nodes.length?`<div class="knowledge-grid">${nodes.map(card).join('')}</div>`:''}${us.length?`<h3>课程目录中的相关讲次</h3><div class="search-units">${us.map(({course,unit:u})=>`<button class="ghost" data-jump="${course}:${u.id}"><span>${course} · ${unitLabel(u)}</span><strong>${escapeHtml(u.title)}</strong></button>`).join('')}</div>`:''}${!nodes.length&&!us.length?'<p class="catalog-empty">没有找到，试试“Attention”“卷积”或课程名。</p>':''}`;
    wireCards();
    root.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{const [c,u]=b.dataset.jump.split(':');scope='course';query.value='';onUnit(c,u);render();}));
  }
  async function openNode(id,scroll=false) {
    const n=nodeById.get(id);if(!n) return render();
    stop();const ticket=serial;currentNode=id;updateRoute(id);
    const {course,lecture}=getState();
    const matching=Object.entries(assignments).flatMap(([c,items])=>items.filter(a=>a.nodeIds.includes(id)).map(a=>({...a,title:`${c} · ${a.title}`})));
    const contexts=Object.entries(catalog).flatMap(([c,v])=>v.units.filter(u=>u.nodeIds.includes(id)).map(u=>({c,u})));
    root.innerHTML=`<button class="ghost small back-library" id="backLibrary">← ${scope==='shared'?'知识点列表':'本讲知识点'}</button><div class="node-heading"><span class="eyebrow">${escapeHtml(n.area)} · 本站整理</span><h2 tabindex="-1" id="nodeTitle">${escapeHtml(n.title)}</h2><p>${escapeHtml(n.subtitle)}</p></div>
      ${n.demo?'<section class="interactive-lab" aria-label="互动实验"><div id="demoHost"></div></section>':''}
      <p class="node-summary">${escapeHtml(n.summary)}</p>
      <div class="explanation-grid">${n.steps.map(([t,d])=>`<article><h3>${escapeHtml(t)}</h3><p>${escapeHtml(d)}</p></article>`).join('')}</div>
      ${n.formula?`<details class="inline-details"><summary>公式与符号</summary><div class="node-formula">${math(n.formula)}</div></details>`:''}
      <div class="recall-prompt"><strong>试着解释</strong><p>${escapeHtml(n.check)}</p><div class="review-actions">${n.reviewIds.length?`<button class="primary" id="nodePractice">练习 ${n.reviewIds.length} 题 →</button>`:''}${n.derivationId?'<button class="ghost" id="nodeDerive">分步推导 →</button>':''}</div></div>
      <div class="hub-section-heading"><h3>继续阅读</h3><span class="caption">来源可查 · 原文需要网络</span></div><div class="source-grid">${links(n.resources)}</div>
      ${matching.length?`<details class="reference-details"><summary>相关官方作业与项目</summary><div class="assignment-grid">${assignmentCards(matching)}</div></details>`:''}
      <details class="reference-details"><summary>在哪些课中复习它？</summary><div class="context-links">${contexts.map(({c,u})=>`<button class="ghost small" data-context="${c}:${u.id}">${c} · ${unitLabel(u)} · ${escapeHtml(u.title)}</button>`).join('')}</div></details>`;
    root.querySelector('#backLibrary').addEventListener('click',()=>{render();if(scroll) root.scrollIntoView({block:'start'});});
    root.querySelector('#nodePractice')?.addEventListener('click',()=>onPractice(n,course,lecture));
    root.querySelector('#nodeDerive')?.addEventListener('click',()=>onDerivation(n.derivationId));
    root.querySelectorAll('[data-context]').forEach(b=>b.addEventListener('click',()=>{const [c,u]=b.dataset.context.split(':');scope='course';query.value='';onUnit(c,u);render();}));
    if(scroll) { root.scrollIntoView({block:'start'});root.querySelector('#nodeTitle').focus({preventScroll:true}); }
    if(n.demo && visible) {
      try {
        const dispose=await mountDemo(n.demo,root.querySelector('#demoHost'));
        if(serial!==ticket || !visible) dispose?.(); else cleanup=dispose || (()=>{});
      } catch(error) {
        if(serial===ticket) root.querySelector('#demoHost').textContent='互动实验未能加载，请联网刷新更新；下方讲解仍可阅读。';
        console.error(error);
      }
    }
  }
  document.querySelectorAll('[data-browse]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.browse;query.value='';render();}));
  query.addEventListener('input',render);
  document.querySelector('#clearSearch').addEventListener('click',()=>{query.value='';render();query.focus();});
  drawer.open=matchMedia('(min-width: 901px)').matches;
  return {
    render,
    openNode,
    setVisible(value) {if(value===visible)return;visible=value;if(!value) stop();else if(currentNode) openNode(currentNode);},
    initial() {const id=new URL(location.href).searchParams.get('node');render();if(id) openNode(id);}
  };
}
