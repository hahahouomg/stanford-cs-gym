// Every lab mounts locally and returns a disposer. No animation runs behind another tab.
const el=(root,s)=>root.querySelector(s);
const range=(id,label,min,max,value,step=0.1)=>`<label class="lab-slider">${label}<output id="${id}Value"></output><input id="${id}" aria-label="${label}" type="range" min="${min}" max="${max}" value="${value}" step="${step}" /></label>`;
export function softmax(z) {
  const max=Math.max(...z),exp=z.map(v=>Math.exp(v-max)),sum=exp.reduce((a,b)=>a+b,0);
  return exp.map(v=>v/sum);
}
export async function mountDemo(id,root) {
  if(id==='linear') return (await import('./linear-lab.js')).mountLinear(root);
  return ({knn:mountKnn,softmax:mountSoftmax,split:mountSplit,gradient:mountGradient,convolution:mountConvolution,attention:mountAttention}[id] || (()=>{}))(root);
}

function mountKnn(root) {
  const points=[[.12,.13,0],[.3,0,1],[0,.42,1],[-1.4,1,0],[-1.8,.4,0],[-.9,1.5,0],[1.4,-1,1],[1.9,-.8,1],[1.2,-1.8,1],[-2,-1.5,0],[2,1.6,1]];
  let query=[0,0],count=99,timer;
  root.innerHTML=`<p class="lab-instruction">拖动黄色查询点，或用下面的坐标滑杆。改变 k，观察邻居与投票。</p><div class="lab-two-col"><div><svg id="knnPlot" class="plot knn-plot" viewBox="0 0 380 300" role="img" aria-label="kNN 查询点与训练样本"></svg><div class="plot-legend"><span>● 猫</span><span>▲ 狗</span><span>◆ 查询点</span></div></div><div class="lab-controls"><label>邻居数 k<select id="knnK" aria-label="邻居数 k"><option>1</option><option selected>3</option><option>5</option><option>7</option></select></label><label>距离<select id="knnMetric" aria-label="距离度量"><option value="l2">L2 · 欧氏距离</option><option value="l1">L1 · 曼哈顿距离</option></select></label>${range('queryX','查询点 x',-2.5,2.5,0)}${range('queryY','查询点 y',-2.5,2.5,0)}<button class="ghost small" id="knnAnimate">播放邻居投票</button><div class="lab-result" id="knnResult" aria-live="polite"></div></div></div><p class="caption">合成的二维样本，采用等权投票。猫与狗只是类别标签，不是图像特征。</p>`;
  const px=x=>190+x*50,py=y=>150-y*50;
  function update() {
    query=['queryX','queryY'].map(id=>Number(el(root,'#'+id).value));
    query.forEach((v,i)=>el(root,`#query${i?'Y':'X'}Value`).value=v.toFixed(1));
    const k=Number(el(root,'#knnK').value),l1=el(root,'#knnMetric').value==='l1';
    const nearest=points.map((p,i)=>({p,i,d:l1?Math.abs(p[0]-query[0])+Math.abs(p[1]-query[1]):Math.hypot(p[0]-query[0],p[1]-query[1])})).sort((a,b)=>a.d-b.d||a.i-b.i).slice(0,k);
    const shown=nearest.slice(0,count),ids=new Set(shown.map(p=>p.i));
    const r=nearest[k-1].d*50,qx=px(query[0]),qy=py(query[1]);
    const ring=l1?`<path d="M${qx-r} ${qy}L${qx} ${qy-r}L${qx+r} ${qy}L${qx} ${qy+r}Z"/>`:`<circle cx="${qx}" cy="${qy}" r="${r}"/>`;
    el(root,'#knnPlot').innerHTML=`<defs><pattern id="knnGrid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#ffffff12"/></pattern></defs><rect width="380" height="300" fill="url(#knnGrid)"/><path d="M0 150H380M190 0V300" stroke="#ffffff25"/><g fill="#ffcf5408" stroke="#ffcf5440">${ring}</g>${shown.map(({p})=>`<path d="M${qx} ${qy}L${px(p[0])} ${py(p[1])}" stroke="#ffcf54" stroke-dasharray="4 4"/>`).join('')}${points.map((p,i)=>p[2]===0?`<circle cx="${px(p[0])}" cy="${py(p[1])}" r="${ids.has(i)?7:5}" fill="#8cb8ff" stroke="${ids.has(i)?'#fff':'none'}"/>`:`<path d="M${px(p[0])} ${py(p[1])-7}l-7 12h14Z" fill="#ff8f9d" stroke="${ids.has(i)?'#fff':'none'}"/>`).join('')}<path d="M${qx} ${qy-10}l10 10-10 10-10-10Z" fill="#ffcf54" stroke="#070b14" stroke-width="2"/><text x="12" y="20" fill="#99a4ba" font-size="12">y</text><text x="360" y="168" fill="#99a4ba" font-size="12">x</text>`;
    const cats=shown.filter(n=>n.p[2]===0).length,dogs=shown.length-cats;
    el(root,'#knnResult').textContent=`已查看 ${shown.length}/${k} 个邻居 · 猫 ${cats} 票 / 狗 ${dogs} 票${shown.length===k?` · 预测：${cats>dogs?'猫':'狗'}`:''}`;
    el(root,'#knnResult').dataset.prediction=shown.length===k?(cats>dogs?'cat':'dog'):'';
  }
  const reset=()=>{clearInterval(timer);count=99;update();};
  for(const id of ['queryX','queryY','knnK','knnMetric']) el(root,'#'+id).addEventListener('input',reset);
  el(root,'#knnAnimate').addEventListener('click',()=>{
    clearInterval(timer);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){count=99;update();return;}
    count=0;update();timer=setInterval(()=>{count++;update();if(count>=Number(el(root,'#knnK').value))clearInterval(timer);},450);
  });
  let dragging=false;
  const svg=el(root,'#knnPlot');
  const move=e=>{
    const box=svg.getBoundingClientRect();
    const x=((e.clientX-box.left)/box.width*380-190)/50,y=(150-(e.clientY-box.top)/box.height*300)/50;
    el(root,'#queryX').value=Math.max(-2.5,Math.min(2.5,x));el(root,'#queryY').value=Math.max(-2.5,Math.min(2.5,y));reset();
  };
  svg.addEventListener('pointerdown',e=>{dragging=true;svg.setPointerCapture(e.pointerId);move(e);});
  svg.addEventListener('pointermove',e=>{if(dragging)move(e);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(type,()=>dragging=false);
  update();return()=>clearInterval(timer);
}

function mountSoftmax(root) {
  const labels=['猫','狗','车'];
  root.innerHTML=`<p class="lab-instruction">假设正确类别是猫。先预测，再调分数：正确类别的概率和损失怎样变化？</p><div class="lab-two-col"><div>${labels.map((l,i)=>range('z'+i,l+'的分数',-5,5,[2,1,0][i],.5)).join('')}</div><div id="probabilityBars" role="img" aria-label="类别概率"></div></div>${range('logitShift','所有分数共同加',-10,10,0,1)}<div id="labResults" class="lab-result" aria-live="polite"></div><button class="ghost small" id="resetExperiment">重置</button>`;
  function update() {
    const shift=Number(el(root,'#logitShift').value),z=labels.map((_,i)=>Number(el(root,'#z'+i).value));
    z.forEach((v,i)=>el(root,'#z'+i+'Value').value=(v+shift).toFixed(1));el(root,'#logitShiftValue').value=shift;
    const p=softmax(z.map(v=>v+shift));
    el(root,'#probabilityBars').innerHTML=p.map((v,i)=>`<div class="prob-row"><span>${labels[i]}${i===0?' ✓':''}</span><div class="prob-track"><div style="width:${v*100}%"></div></div><output>${(v*100).toFixed(1)}%</output></div>`).join('');
    el(root,'#probabilityBars').setAttribute('aria-label',labels.map((l,i)=>`${l} ${(p[i]*100).toFixed(1)}%`).join('，'));
    el(root,'#labResults').textContent=`正确类别：猫 · p = ${p[0].toFixed(3)} · loss = ${(-Math.log(p[0])).toFixed(3)}（自然对数）`;
  }
  root.querySelectorAll('input').forEach(i=>i.addEventListener('input',update));
  el(root,'#resetExperiment').addEventListener('click',()=>{[2,1,0].forEach((v,i)=>el(root,'#z'+i).value=v);el(root,'#logitShift').value=0;update();});
  update();
}

function mountSplit(root) {
  const phases=[['训练集','拟合参数 W、b','训练集参与参数学习。'],['验证集','比较 k、学习率和模型版本','方案比较结束后，确定最终训练与评估流程。'],['测试集','最终检查泛化','测试结果用来报告表现；不要把它反复喂回模型选择。']];
  root.innerHTML=`<p class="lab-instruction">点选一份数据，看它在实验流程中负责什么。</p><div class="split-flow">${phases.map(([t],i)=>`<button data-phase="${i}"><span>${i+1}</span><strong>${t}</strong></button>`).join('')}</div><div id="splitResult" class="lab-result" aria-live="polite"></div>`;
  function update(i){root.querySelectorAll('[data-phase]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.phase)===i);b.setAttribute('aria-pressed',String(Number(b.dataset.phase)===i));});el(root,'#splitResult').textContent=phases[i].slice(1).join('。');}
  root.querySelectorAll('[data-phase]').forEach(b=>b.addEventListener('click',()=>update(Number(b.dataset.phase))));update(0);
}

function mountGradient(root) {
  let ws=[3],timer;
  root.innerHTML=`<p class="lab-instruction">L(w)=w²/2。从 w=3 出发，用同一个学习率逐步更新。</p><svg id="gradientPlot" class="plot" viewBox="0 0 500 280" role="img" aria-label="梯度下降轨迹"></svg>${range('learningRate','学习率 η',0,2.5,.2,.1)}<div class="review-actions"><button class="ghost small" id="gradientStep">更新一步</button><button class="ghost small" id="gradientPlay">播放 / 暂停</button><button class="ghost small" id="gradientReset">重置</button></div><div class="lab-result" id="gradientResult" aria-live="polite"></div>`;
  function update() {
    const limit=Math.max(4,...ws.map(Math.abs)),px=w=>250+w/limit*215,py=w=>245-(w/limit)**2*205;
    const curve=Array.from({length:81},(_,i)=>{const w=-limit+i*limit/40;return `${i?'L':'M'}${px(w)} ${py(w)}`;}).join('');
    el(root,'#gradientPlot').innerHTML=`<path d="M35 245H465M250 25V250" stroke="#ffffff25"/><path d="${curve}" stroke="#8cb8ff" stroke-width="2" fill="none"/><path d="${ws.map((w,i)=>`${i?'L':'M'}${px(w)} ${py(w)}`).join('')}" stroke="#ffcf54" fill="none" stroke-dasharray="4 3"/>${ws.map((w,i)=>`<circle cx="${px(w)}" cy="${py(w)}" r="${i===ws.length-1?7:3}" fill="${i===ws.length-1?'#ffcf54':'#8cb8ff'}"/>`).join('')}<text x="15" y="20" fill="#99a4ba" font-size="13">L(w)</text><text x="467" y="264" fill="#99a4ba" font-size="13">w</text><text x="250" y="266" text-anchor="middle" fill="#99a4ba" font-size="13">0</text>`;
    const rate=Number(el(root,'#learningRate').value),w=ws.at(-1);
    el(root,'#learningRateValue').value=rate.toFixed(1);
    el(root,'#gradientResult').textContent=`第 ${ws.length-1} 步 · w = ${w.toFixed(3)} · L = ${(w*w/2).toFixed(3)}${limit>4?' · 图形已自动缩放':''}`;
    el(root,'#gradientStep').disabled=ws.length>=19;
  }
  function step(){if(ws.length>=19){clearInterval(timer);timer=null;return;}ws.push(ws.at(-1)*(1-Number(el(root,'#learningRate').value)));update();}
  function reset(){clearInterval(timer);timer=null;ws=[3];update();}
  el(root,'#gradientStep').addEventListener('click',step);
  el(root,'#gradientPlay').addEventListener('click',()=>{if(timer){clearInterval(timer);timer=null;}else if(matchMedia('(prefers-reduced-motion: reduce)').matches)step();else timer=setInterval(step,400);});
  el(root,'#gradientReset').addEventListener('click',reset);el(root,'#learningRate').addEventListener('input',reset);update();return()=>clearInterval(timer);
}

function mountConvolution(root) {
  const image=[0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1],kernel=[-1,0,1,-1,0,1,-1,0,1];
  root.innerHTML=`<p class="lab-instruction">一个 3×3 垂直边缘核扫过 5×5 图像。拖动窗口，观察逐项相乘求和。</p><div class="convolution-flow"><div><span class="caption">输入 5×5</span><div id="imageGrid" class="matrix-grid image-matrix"></div></div><span>×</span><div><span class="caption">共享核 3×3</span><div class="matrix-grid kernel-matrix">${kernel.map(v=>`<span>${v}</span>`).join('')}</div></div><span>→</span><div><span class="caption">输出 3×3</span><div id="convOutput" class="matrix-grid kernel-matrix"></div></div></div>${range('windowPosition','窗口位置',0,8,0,1)}<div id="convResult" class="lab-result" aria-live="polite"></div><p class="caption">stride=1，padding=0，bias=0；输出尺寸 (5−3)+1=3。</p>`;
  function compute(r,c){return kernel.reduce((s,k,i)=>s+k*image[(r+Math.floor(i/3))*5+c+i%3],0);}
  function update(){
    const pos=Number(el(root,'#windowPosition').value),r=Math.floor(pos/3),c=pos%3;
    el(root,'#windowPositionValue').value=`(${r}, ${c})`;
    el(root,'#imageGrid').innerHTML=image.map((v,i)=>`<span class="${Math.floor(i/5)>=r&&Math.floor(i/5)<r+3&&i%5>=c&&i%5<c+3?'selected':''}" style="--cell:${v?'.22':'.02'}">${v}</span>`).join('');
    el(root,'#convOutput').innerHTML=Array.from({length:9},(_,i)=>`<span class="${i===pos?'selected':''}">${compute(Math.floor(i/3),i%3)}</span>`).join('');
    el(root,'#convResult').textContent=`窗口 (${r}, ${c}) · Σ 输入 × 核 = ${compute(r,c)}`;
  }
  el(root,'#windowPosition').addEventListener('input',update);update();
}

function mountAttention(root) {
  const values=[-2,1,4];
  root.innerHTML=`<p class="lab-instruction">一个 Query 读取三个 Value。调整已经缩放后的匹配分数，看输出向谁靠近。</p><div class="lab-two-col"><div>${values.map((v,i)=>range('attentionScore'+i,`Key ${i+1} 的分数（Value=${v}）`,-5,5,[0,1,2][i],.5)).join('')}</div><div><div id="attentionWeights"></div><div id="attentionResult" class="lab-result" aria-live="polite"></div></div></div><p class="caption">输出 = Σ 权重 × Value；这里 Value 是一维数值，实际通常为向量。</p>`;
  function update(){
    const z=values.map((_,i)=>Number(el(root,'#attentionScore'+i).value)),p=softmax(z);
    z.forEach((v,i)=>el(root,'#attentionScore'+i+'Value').value=v.toFixed(1));
    el(root,'#attentionWeights').innerHTML=p.map((v,i)=>`<div class="prob-row"><span>V${i+1}</span><div class="prob-track"><div style="width:${v*100}%"></div></div><output>${(v*100).toFixed(1)}%</output></div>`).join('');
    el(root,'#attentionResult').textContent=`加权输出 = ${p.reduce((s,v,i)=>s+v*values[i],0).toFixed(3)}`;
  }
  root.querySelectorAll('input').forEach(i=>i.addEventListener('input',update));update();
}
