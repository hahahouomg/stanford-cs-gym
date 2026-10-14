// Original local illustrations; no external assets or continuous animation.
const range=(id,label,min,max,value,step=.1)=>'<label class="lab-slider">'+label+'<output id="'+id+'Value"></output><input id="'+id+'" aria-label="'+label+'" type="range" min="'+min+'" max="'+max+'" value="'+value+'" step="'+step+'"></label>';
export function mountFoundation(id,root){return {regularization,activations,backprop}[id](root);}
function regularization(root){
  root.innerHTML='<p class="lab-instruction">先预测：增加 λ 后，训练误差更低的 B 还会被选中吗？这里比较固定候选，不模拟训练。</p><div class="candidate-grid"><article><h3>A · 较小权重</h3><p>数据损失 0.8 · Σw²=1</p><div class="candidate-track"><div id="regABar"></div></div><output id="regA"></output></article><article><h3>B · 较大权重</h3><p>数据损失 0.5 · Σw²=9</p><div class="candidate-track"><div id="regBBar"></div></div><output id="regB"></output></article></div>'+range('regularizationLambda','正则强度 λ',0,.2,.05,.01)+'<div class="lab-result" id="regularizationResult" aria-live="polite"></div><p class="caption">总目标 = 数据损失 + λΣw²。此实验没有测量验证准确率。</p>';
  function update(){
    const l=Number(root.querySelector('input').value),a=.8+l,b=.5+9*l;
    root.querySelector('#regularizationLambdaValue').value=l.toFixed(2);
    for(const [id,v] of [['A',a],['B',b]]){root.querySelector('#reg'+id).value='总目标 '+v.toFixed(2);root.querySelector('#reg'+id+'Bar').style.width=v/2.3*100+'%';}
    root.querySelector('#regularizationResult').textContent='按总目标选择 '+(Math.abs(a-b)<1e-9?'A / B 打平':a<b?'A':'B')+'；泛化仍需验证集比较。';
  }
  root.querySelector('input').addEventListener('input',update);update();
}
function activations(root){
  root.innerHTML='<p class="lab-instruction">把输入从负数拖到正数。看 ReLU 何时关掉路径，局部梯度何时变成 1。</p><svg id="activationPlot" class="plot" viewBox="0 0 500 280" role="img" aria-label="线性函数与 ReLU 的输入输出和当前输入位置"></svg>'+range('activationInput','输入 x',-3,3,1,.25)+'<div id="activationResult" class="lab-result" aria-live="polite"></div><p class="caption">蓝色：线性 y=x；黄色：ReLU y=max(0,x)。0 点不可导，此处采用梯度 0 的约定。</p>';
  function update(){
    const x=Number(root.querySelector('input').value),y=Math.max(0,x),px=250+x*65,py=140-y*35;
    root.querySelector('#activationInputValue').value=x.toFixed(2);
    root.querySelector('#activationPlot').innerHTML='<path d="M35 140H465M250 20V255" stroke="#ffffff30"/><path d="M55 245L445 35" stroke="#8cb8ff" stroke-width="2" fill="none"/><path d="M55 140H250L445 35" stroke="#ffcf54" stroke-width="3" fill="none"/><path d="M'+px+' 140V'+py+'" stroke="#77d7aa" stroke-dasharray="4 4"/><circle cx="'+px+'" cy="'+py+'" r="7" fill="#77d7aa"/><text x="450" y="161" fill="#9daac0" font-size="14">x</text><text x="262" y="25" fill="#9daac0" font-size="14">输出</text>';
    root.querySelector('#activationResult').textContent='x='+x.toFixed(2)+' → ReLU(x)='+y.toFixed(2)+' · 局部梯度='+(x>0?1:0)+(x===0?'（约定）':'');
  }
  root.querySelector('input').addEventListener('input',update);update();
}
function backprop(root){
  let step=0;
  root.innerHTML='<p class="lab-instruction">f=(x+y)z。先看前向数值，再点下一步，把梯度沿边传回去。</p><div id="backpropGraph" class="backprop-graph" role="img" aria-label="x 和 y 相加得到 q，q 与 z 相乘得到 f"></div>'+range('backpropX','输入 x',-4,4,2,1)+range('backpropY','输入 y',-4,4,-3,1)+range('backpropZ','输入 z',-4,4,-4,1)+'<div class="review-actions"><button class="primary small" id="backpropStep">下一步：反向到乘法节点</button><button class="ghost small" id="backpropReset">从前向重新看</button></div><div id="backpropResult" class="lab-result" aria-live="polite"></div>';
  function update(){
    const x=Number(root.querySelector('#backpropX').value),y=Number(root.querySelector('#backpropY').value),z=Number(root.querySelector('#backpropZ').value),q=x+y,f=q*z;
    for(const [id,v] of [['X',x],['Y',y],['Z',z]])root.querySelector('#backprop'+id+'Value').value=v;
    const parts=[['输入','x='+x+'，y='+y,step>=2?'df/dx='+z+'；df/dy='+z:'等待反向梯度'],['相加','q=x+y='+q,step>=1?'df/dq=z='+z:'保存 q，供反向使用'],['相乘','f=q×z='+f,step>=1?'df/dz=q='+q:'从 df/df=1 开始']];
    root.querySelector('#backpropGraph').innerHTML=parts.map(([title,value,gradient],i)=>'<article class="'+(step>=2||step===1&&i>0?'gradient-active':'')+'"><span>'+title+'</span><strong>'+value+'</strong><small>'+gradient+'</small></article>').join('<span class="graph-arrow" aria-hidden="true">→</span>');
    const button=root.querySelector('#backpropStep');button.disabled=step===2;button.textContent=['下一步：反向到乘法节点','下一步：反向到加法节点','反向完成'][step];
    root.querySelector('#backpropResult').textContent=['前向：q='+q+'，f='+f+'。先预测三个输入的梯度。','乘法节点：上游梯度 1 × 另一输入。df/dq='+z+'，df/dz='+q+'。','加法节点：局部导数都是 1。最终 df/dx='+z+'，df/dy='+z+'，df/dz='+q+'。'][step];
  }
  root.querySelector('#backpropStep').addEventListener('click',()=>{step=Math.min(2,step+1);update();});
  root.querySelector('#backpropReset').addEventListener('click',()=>{step=0;update();});
  root.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{step=0;update();}));update();
}
