import * as THREE from './vendor/three/three.module.min.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';

export function mountLinear(root) {
  const slider=(id,title,value,min=-2,max=2)=>`<label class="lab-slider">${title}<output id="${id}Value"></output><input id="${id}" type="range" aria-label="${title}" min="${min}" max="${max}" step=".1" value="${value}"/></label>`;
  root.innerHTML=`<p class="lab-instruction">比较两个类别的分数差 m=a·x₁+b·x₂+c。蓝色表示 m>0，粉色表示 m<0。</p><div class="linear-view-tabs"><button id="linear2D" class="ghost active" aria-pressed="true">2D · 决策边界</button><button id="linear3D" class="ghost" aria-pressed="false">3D · 分数平面</button><button id="resetCamera" class="ghost small hidden">恢复视角</button></div><div class="linear-stage"><canvas id="linearCanvas" class="plot" aria-label="两个类别的二维线性决策边界" role="img"></canvas><div id="threeStage" class="hidden" aria-label="三维分数平面，可拖动旋转视角" role="img"></div></div><p class="caption" id="linearViewHelp">二维输入只是教学简化，蓝色区域预测类别 1，粉色区域预测类别 2。</p><div class="linear-sliders">${slider('weightA','权重差 a',1)}${slider('weightB','权重差 b',-.7)}${slider('biasC','偏置差 c',0)}${slider('sampleX','样本 x₁',.8)}${slider('sampleY','样本 x₂',.3)}</div><div class="lab-result" id="linearResult" aria-live="polite"></div>`;
  const $=s=>root.querySelector(s),canvas=$('#linearCanvas'),ctx=canvas.getContext('2d');
  let renderer,scene,camera,controls,surface,dot,line,observer,disposed=false,is3D=false;
  const values=()=>['weightA','weightB','biasC','sampleX','sampleY'].map(id=>Number($('#'+id).value));
  function draw2D() {
    const width=Math.max(260,canvas.clientWidth),height=300,dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const [a,b,c,x,y]=values(),size=Math.min(width-56,244),ox=width/2,oy=height/2,scale=size/4;
    ctx.clearRect(0,0,width,height);
    for(let i=0;i<size;i+=4)for(let j=0;j<size;j+=4){const xx=(i-size/2)/scale,yy=(size/2-j)/scale,m=a*xx+b*yy+c;ctx.fillStyle=m>0?'#8cb8ff2c':m<0?'#ff8f9d2c':'#ffffff12';ctx.fillRect(ox-size/2+i,oy-size/2+j,4,4);}
    ctx.strokeStyle='#ffffff20';ctx.lineWidth=1;
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(ox+i*scale,oy-size/2);ctx.lineTo(ox+i*scale,oy+size/2);ctx.moveTo(ox-size/2,oy+i*scale);ctx.lineTo(ox+size/2,oy+i*scale);ctx.stroke();}
    ctx.save();ctx.beginPath();ctx.rect(ox-size/2,oy-size/2,size,size);ctx.clip();
    if(Math.abs(b)>1e-8){ctx.strokeStyle='#77d7aa';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox-2*scale,oy-((-a*(-2)-c)/b)*scale);ctx.lineTo(ox+2*scale,oy-((-a*2-c)/b)*scale);ctx.stroke();}
    else if(Math.abs(a)>1e-8){ctx.strokeStyle='#77d7aa';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox-c/a*scale,oy-size/2);ctx.lineTo(ox-c/a*scale,oy+size/2);ctx.stroke();}
    ctx.restore();ctx.fillStyle='#ffcf54';ctx.beginPath();ctx.arc(ox+x*scale,oy-y*scale,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#99a4ba';ctx.font='13px system-ui';ctx.fillText('x₁',ox+size/2+7,oy+5);ctx.fillText('x₂',ox+5,18);ctx.fillText('−2',ox-size/2,oy+size/2+20);ctx.fillText('2',ox+size/2-5,oy+size/2+20);
  }
  function render3D(){if(renderer&&!disposed&&is3D)renderer.render(scene,camera);}
  function size3D(){if(!renderer)return;const box=$('#threeStage');renderer.setSize(Math.max(260,box.clientWidth),300,false);camera.aspect=Math.max(260,box.clientWidth)/300;camera.updateProjectionMatrix();render3D();}
  function init3D() {
    if(renderer)return true;
    try {
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
      $('#threeStage').append(renderer.domElement);renderer.domElement.setAttribute('aria-label','x₁、x₂ 输入与 m 分数差的三维坐标');
      scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,.1,60);camera.position.set(6,5,7);
      controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=5;controls.maxDistance=18;controls.target.set(0,0,0);controls.update();controls.addEventListener('change',render3D);
      const grid=new THREE.GridHelper(4,8,0x77d7aa,0x334055);scene.add(grid);
      const axes=new THREE.AxesHelper(3);scene.add(axes);
      const zero=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({color:0x77d7aa,transparent:true,opacity:.13,side:THREE.DoubleSide}));zero.rotation.x=-Math.PI/2;scene.add(zero);
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(18),3));
      surface=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0x8cb8ff,transparent:true,opacity:.5,side:THREE.DoubleSide}));scene.add(surface);
      dot=new THREE.Mesh(new THREE.SphereGeometry(.10,16,12),new THREE.MeshBasicMaterial({color:0xffcf54}));scene.add(dot);
      line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xffcf54}));scene.add(line);
      // Label sprites are drawn locally; no fonts, textures or image requests.
      for(const [text,pos] of [['x₁',[2.7,0,0]],['m',[0,3,0]],['x₂',[0,0,2.7]]]){
        const c=document.createElement('canvas');c.width=128;c.height=64;const cc=c.getContext('2d');cc.font='32px system-ui';cc.fillStyle='#ccd4e6';cc.fillText(text,20,43);
        const tex=new THREE.CanvasTexture(c),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex}));sprite.scale.set(.9,.45,1);sprite.position.set(...pos);scene.add(sprite);
      }
      size3D();return true;
    } catch {
      renderer?.dispose();renderer=undefined;$('#threeStage').innerHTML='';
      $('#linearViewHelp').textContent='当前设备无法使用 WebGL，二维决策边界仍可互动。';
      return false;
    }
  }
  function update() {
    if(disposed)return;
    const [a,b,c,x,y]=values(),m=a*x+b*y+c;
    ['weightA','weightB','biasC','sampleX','sampleY'].forEach((id,i)=>$('#'+id+'Value').value=values()[i].toFixed(1));
    const result=Math.abs(m)<1e-8?'两类分数相同':m>0?'类别 1':'类别 2';
    $('#linearResult').textContent=`m = ${a.toFixed(1)}×${x.toFixed(1)} + ${b.toFixed(1)}×${y.toFixed(1)} + ${c.toFixed(1)} = ${m.toFixed(3)} · ${result}${a===0&&b===0?' · 无空间边界':''}`;
    draw2D();
    if(renderer){
      const corners=[[-2,-2],[2,-2],[2,2],[-2,-2],[2,2],[-2,2]];
      const attr=surface.geometry.attributes.position;corners.forEach(([xx,yy],i)=>attr.setXYZ(i,xx,a*xx+b*yy+c,yy));attr.needsUpdate=true;surface.geometry.computeBoundingSphere();
      dot.position.set(x,m,y);const lp=line.geometry.attributes.position;lp.setXYZ(0,x,0,y);lp.setXYZ(1,x,m,y);lp.needsUpdate=true;line.geometry.computeBoundingSphere();render3D();
    }
  }
  function view(use3D){
    is3D=use3D;
    if(use3D&&!init3D())is3D=false;
    canvas.classList.toggle('hidden',is3D);$('#threeStage').classList.toggle('hidden',!is3D);$('#resetCamera').classList.toggle('hidden',!is3D);
    for(const id of ['linear2D','linear3D']){$('#'+id).classList.toggle('active',(id==='linear3D')===is3D);$('#'+id).setAttribute('aria-pressed',String((id==='linear3D')===is3D));}
    if(is3D){$('#linearViewHelp').textContent='拖动旋转，双指缩放。蓝色面是分数差 m，绿色水平面是 m=0；黄色点是当前样本。';size3D();}
    else if(use3D===false)$('#linearViewHelp').textContent='二维输入只是教学简化，蓝色区域预测类别 1，粉色区域预测类别 2。';
    update();
  }
  root.querySelectorAll('input').forEach(i=>i.addEventListener('input',update));
  $('#linear2D').addEventListener('click',()=>view(false));$('#linear3D').addEventListener('click',()=>view(true));
  $('#resetCamera').addEventListener('click',()=>{camera.position.set(6,5,7);controls.target.set(0,0,0);controls.update();render3D();});
  observer=new ResizeObserver(()=>{draw2D();size3D();});observer.observe(root);update();
  return()=>{disposed=true;observer.disconnect();controls?.dispose();scene?.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});renderer?.dispose();};
}
