// Official structure is independent of the amount of local teaching content.
// Numbers are pinned to these offerings, never inferred from the question bank.
const vision = [
  ['课程导论','Introduction',['视觉任务','表示与数据'],'representation'],
  ['图像分类与线性分类器','Image Classification with Linear Classifiers',['图像表示','kNN 与距离','数据划分','线性分类','Softmax 损失'],'representation knn validation linear softmax'],
  ['正则化与优化','Regularization and Optimization',['正则化','SGD','Momentum / Adam','学习率'],'optimization'],
  ['神经网络与反向传播','Neural Networks and Backpropagation',['多层感知机','计算图','链式法则'],'backprop'],
  ['卷积神经网络','Image Classification with CNNs',['局部感受野','卷积与池化','参数共享'],'convolution'],
  ['CNN 架构','CNN Architectures',['Batch Normalization','迁移学习','AlexNet / VGG / ResNet'],''],
  ['循环神经网络','Recurrent Neural Networks',['RNN / LSTM / GRU','语言模型','图像描述'],''],
  ['Attention 与 Transformer','Attention and Transformers',['自注意力','Transformer','ViT'],'attention softmax'],
  ['检测、分割与模型可视化','Object Detection, Image Segmentation, Visualizing and Understanding',['目标检测','图像分割','特征可视化','对抗样本'],''],
  ['视频理解','Video Understanding',['视频分类','3D CNN','双流网络','多模态视频'],''],
  ['大规模分布式训练','Large Scale Distributed Training',['分布式训练','并行策略'],'compute parallelism'],
  ['自监督学习','Self-supervised Learning',['Pretext tasks','对比学习','多感官监督'],''],
  ['生成模型 1','Generative Models 1',['VAE','GAN','自回归模型'],'ce-kl'],
  ['生成模型 2','Generative Models 2',['扩散模型'],''],
  ['3D 视觉','3D Vision',['3D 表示','形状重建','神经隐式表示'],''],
  ['视觉与语言','Vision and Language',['视觉语言表示','多模态模型'],''],
  ['机器人学习','Robot Learning',['深度强化学习','动力学模型','机器人操作'],''],
  ['以人为本的 AI','Human-Centered AI',['人与 AI'],'']
];
const noteSlugs = ['01-introduction','02-image-classification','03-regularization-optimization','04-neural-networks-backpropagation','05-convolutional-networks','06-cnn-architectures','07-recurrent-neural-networks','08-attention-transformers','09-detection-segmentation','10-video-understanding','11-distributed-training','12-self-supervised-learning','13-generative-models','14-generative-models-2','15-3d-vision','16-vision-language','17-robot-learning','18-human-centered-ai'];
const lm = [
  ['课程导论与分词','Overview, tokenization',['Tokenization','BPE'],'','lecture_01'],
  ['PyTorch 与资源核算','PyTorch, resource accounting',['张量','参数 / 激活','FLOPs'],'compute','lecture_02'],
  ['架构与超参数','Architectures, hyperparameters',['Transformer 架构','超参数'],'attention softmax','2025 Lecture 3 - architecture.pdf'],
  ['混合专家','Mixture of experts',['MoE','路由'],'','2025 Lecture 4 - MoEs.pdf'],
  ['GPU','GPUs',['GPU','带宽与算力'],'compute','2025 Lecture 5 - GPUs.pdf'],
  ['Kernels 与 Triton','Kernels, Triton',['GPU kernel','Triton'],'compute','lecture_06'],
  ['并行基础','Parallelism',['并行训练','通信'],'parallelism','2025 Lecture 7 - Parallelism basics.pdf'],
  ['并行实现','Parallelism',['分布式实现'],'parallelism','lecture_08'],
  ['Scaling laws 基础','Scaling laws',['规模与性能'],'','2025 Lecture 9 - Scaling laws basics.pdf'],
  ['推理','Inference',['Prefill / Decode','KV cache'],'serving','lecture_10'],
  ['Scaling laws 细节','Scaling laws',['计算预算','规模拟合'],'','2025 Lecture 11 - Scaling details.pdf'],
  ['评测','Evaluation',['模型评测','实验设计'],'validation','lecture_12'],
  ['数据 1','Data',['数据收集','清洗'],'','lecture_13'],
  ['数据 2','Data',['过滤','去重'],'','lecture_14'],
  ['对齐：SFT / RLHF','Alignment - SFT/RLHF',['监督微调','偏好对齐'],'ce-kl','2025 Lecture 15 - RLHF Alignment.pdf'],
  ['对齐：RL 1','Alignment - RL',['推理强化学习'],'verifier','2025 Lecture 16 - RLVR.pdf'],
  ['对齐：RL 2','Alignment - RL',['强化学习实现'],'verifier','lecture_17'],
  ['嘉宾：Junyang Lin','Guest Lecture by Junyang Lin',['嘉宾讲座'],'',''],
  ['嘉宾：Mike Lewis','Guest lecture by Mike Lewis',['嘉宾讲座'],'','']
];
const agents = [
  ['课程导论','Course Overview',['自我改进 Agent'],''],
  ['测试时计算扩展','Test-time Compute Scaling',['重复采样','计算预算'],'verifier'],
  ['可靠验证','Robust Verification',['Verifier','过程 / 结果验证'],'verifier'],
  ['工具与代码反馈','Learning from feedback with tools/code',['ReAct','执行反馈'],'verifier'],
  ['多步推理与规划','Multi-step Reasoning/Planning',['分解','搜索','规划'],'verifier'],
  ['训练时扩展与 RL','Train Time Scaling/Scaling RL',['STaR','推理 RL'],''],
  ['开放式自我进化','Open-Ended Evolution of Self-Improving Agents',['自动设计 Agent','AI Scientist'],''],
  ['搜索与 Deep Research','Self improvement with Search & Deep Research Agents',['搜索增强推理','研究 Agent'],'verifier'],
  ['嘉宾：Melvin Johnson','Guest Lecture Melvin Johnson',['Post-training → Agents'],''],
  ['期中展示 1','Mid term presentations',['研究项目展示'],''],
  ['期中展示 2','Mid term presentations',['研究项目展示'],''],
  ['期中展示 3','Mid term presentations',['研究项目展示'],''],
  ['软件工程 Agent 框架','Agentic Frameworks for Software Engineering',['CodeMonkeys','KernelBench'],''],
  ['Agent 记忆 · Junchen Jiang','Augmenting Agents with Memory',['MemGPT','CacheBlend'],'serving'],
  ['嘉宾：Denny Zhou','Guest Lecture Denny Zhou',['LLM Reasoning'],''],
  ['嘉宾：Thang Luong','Guest Lecture Thang Luong',['AlphaProof','AlphaGeometry'],''],
  ['Agent 评测与长任务','Agentic Evaluations & Long-Horizon Tasks',['长任务','能力评估'],'validation'],
  ['嘉宾：Misha Laskin','Guest Lecture Misha Laskin',['自主 Agent 系统'],''],
  ['嘉宾：Danny Driess','Guest Lecture Danny Driess',['机器人多模态 Agent'],''],
  ['未来研究方向','Future Research Areas',['开放问题'],'']
];
function units(rows, kind='lecture') {
  return rows.map(([title,originalTitle,topics,nodeList],i)=>({id:`${kind}${i+1}`,number:i+1,kind,title,originalTitle,topics,nodeIds:nodeList.split(' ').filter(Boolean),resources:[]}));
}
export const catalog = {
  CS231n:{version:'Spring 2025',source:'https://cs231n.stanford.edu/2025/schedule.html',label:'18 讲',units:units(vision)},
  CS336:{version:'Spring 2025',source:'https://cs336.stanford.edu/spring2025/',label:'19 讲',units:units(lm)},
  CS329A:{version:'Autumn 2025',source:'https://cs329a.stanford.edu/',label:'20 次课表安排',units:units(agents)},
  CS349D:{version:'Spring 2026',source:'https://web.stanford.edu/class/cs349d/',label:'4 个项目里程碑',notice:'官方逐讲 Schedule 尚未公布，下面是 Mini Serving Engine 项目里程碑，不是 Lecture 编号。',units:units([
    ['数据并行与张量并行','Data parallelism and tensor parallelism',['DP','TP','吞吐与模型规模'],'parallelism compute'],
    ['连续批处理与 PagedAttention','Continuous batching and PagedAttention',['动态批处理','KV 显存管理'],'serving'],
    ['上下文缓存与分块 Prefill','Context caching and chunked prefill',['缓存复用','延迟与吞吐'],'serving'],
    ['高级推理特性','Advanced feature',['推测解码','分层缓存','Prefill / Decode 分离'],'serving']
  ],'milestone')}
};
catalog.CS231n.units.forEach((u,i)=>{
  if (i===0) u.resources.push(...[1,2].map(part=>({title:`官方 slides · Part ${part}`,url:`https://cs231n.stanford.edu/slides/2025/lecture_1_part_${part}.pdf`,kind:'官方'})));
  else if (i<17) u.resources.push({title:'官方 slides',url:`https://cs231n.stanford.edu/slides/2025/lecture_${i+1}.pdf`,kind:'官方'});
  u.resources.push({title:'2025 · 官方视频合集',url:'https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16',kind:'官方公开视频'});
  if (noteSlugs[i]) u.resources.push({title:'逐讲复习笔记',url:`https://raimbekovm.github.io/cs231n-2025-notes/lectures/${noteSlugs[i]}.html`,kind:'学习者笔记',author:'raimbekovm',desc:'第三方梳理；以官方课表为准。部分拓展超出本讲。'});
});
catalog.CS336.units.forEach((u,i)=>{
  const file=lm[i][4];
  if (file) u.resources.push({title:file.endsWith('.pdf')?'官方 slides':'官方可执行讲义',kind:'官方',url:file.endsWith('.pdf')?`https://github.com/stanford-cs336/spring2025-lectures/blob/main/nonexecutable/${encodeURIComponent(file)}`:`https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/${file}.json`});
});
[10,11,12].forEach(n=>catalog.CS329A.units[n-1].kind='presentation');

// The node/unit associations are this site's study index, not an official assignment schedule.
export const assignments = {
  CS231n:[
    {id:'a1',title:'Assignment 1 · 分类基础',url:'https://cs231n.github.io/assignments2025/assignment1/',units:[2,3,4],nodeIds:['representation','knn','validation','linear','softmax','optimization','backprop'],tasks:['Q1 · knn.ipynb：距离、向量化、验证选 k','Q2 · softmax.ipynb：Softmax 分类器','Q3 · 两层网络；Q4 · 图像特征；Q5 · 全连接网络'],start:'你现在先做 Q1 的距离与验证部分；Q2 的训练实现可结合 Lecture 3。'},
    {id:'a2',title:'Assignment 2 · CNN 与 RNN',url:'https://cs231n.github.io/assignments2025/assignment2/',units:[4,5,6,7],nodeIds:['backprop','convolution'],tasks:['Batch / Layer Normalization、Dropout','CNN、PyTorch CIFAR-10','Vanilla RNN 图像描述']},
    {id:'a3',title:'Assignment 3 · Transformer 与生成模型',url:'https://cs231n.github.io/assignments2025/assignment3/',units:[8,12,13,14,16],nodeIds:['attention','softmax','ce-kl'],tasks:['Transformer 图像描述','自监督学习','DDPM、CLIP 与 DINO']}
  ],
  CS336:[
    ['basics','基础：分词 / Transformer / 优化器',[1,2,3],['attention','softmax','compute']],
    ['systems','系统：Profiling / FlashAttention / 分布式',[5,6,7,8],['compute','parallelism','attention']],
    ['scaling','Scaling laws',[9,11],[]],
    ['data','数据清洗 / 过滤 / 去重',[13,14],[]],
    ['alignment','对齐与推理 RL',[15,16,17],['ce-kl','verifier']]
  ].map(([slug,title,us,nodeIds],i)=>({id:`a${i+1}`,title:`Assignment ${i+1} · ${title}`,url:`https://github.com/stanford-cs336/assignment${i+1}-${slug}`,units:us,nodeIds,tasks:[]})),
  CS329A:[{id:'homework',title:'3 次 Homework + 研究项目',url:'https://cs329a.stanford.edu/#homework-assignments',units:[],nodeIds:['verifier'],tasks:['官网列出了作业安排；未提供公开题目下载。','官方论文阅读与研究项目入口见课表。']}],
  CS349D:[{id:'engine',title:'Mini Serving Engine',url:'https://web.stanford.edu/class/cs349d/#coursework',units:[1,2,3,4],nodeIds:['parallelism','compute','serving'],tasks:['逐个加入并行、批处理、缓存和高级特性。','官网目前提供项目说明，未公开 starter notebook。']}]
};

export function unitLabel(unit) {
  return unit.kind==='milestone'?`里程碑 ${unit.number}`:unit.kind==='presentation'?`课表 ${unit.number} · 展示`:`Lecture ${unit.number}`;
}
