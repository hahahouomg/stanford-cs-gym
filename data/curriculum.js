export const courses = [
  {
    id: 'CS231n',
    title: 'Deep Learning for Computer Vision',
    url: 'https://cs231n.stanford.edu/2025/schedule.html',
    version: 'Spring 2025 · 当前从 Lecture 2 开始',
    focus: '从分类、优化与反向传播，到现代视觉表示与视觉模型。',
    topics: ['linear classifiers', 'optimization', 'backprop', 'CNNs', 'vision transformers', 'detection / segmentation'],
    color: 'rgba(101, 145, 255, .9)'
  },
  {
    id: 'CS336',
    title: 'Language Modeling from Scratch',
    url: 'https://cs336.stanford.edu/spring2025/',
    version: 'Spring 2025 · 公开自学资料',
    focus: '从 tokenizer 和 Transformer 一路做到训练、系统、数据、评测与 post-training。',
    topics: ['tokenization', 'Transformer', 'attention / MoE', 'GPU & Triton', 'parallelism', 'scaling', 'data', 'SFT / RL'],
    color: 'rgba(255, 207, 84, .95)'
  },
  {
    id: 'CS329A',
    title: 'Self-Improving AI Agents',
    url: 'https://cs329a.stanford.edu/',
    version: 'Autumn 2025 · Self-Improving AI Agents',
    focus: '围绕自我改进、verifier、test-time compute、工具调用、规划与 agent evaluation。',
    topics: ['verifiers', 'test-time compute', 'search', 'tools / retrieval', 'planning', 'agent evaluation', 'robotics'],
    color: 'rgba(119, 215, 170, .95)'
  },
  {
    id: 'CS349D',
    title: 'AI Inference Infrastructure',
    url: 'https://web.stanford.edu/class/cs349d/',
    version: 'Spring 2026 · 公开页面的 schedule 尚为空',
    focus: '理解 LLM serving 的吞吐、延迟、显存与分布式权衡，并亲手构建 serving engine。',
    topics: ['TP / DP', 'continuous batching', 'PagedAttention', 'KV cache', 'chunked prefill', 'speculative decoding', 'disaggregation'],
    color: 'rgba(255, 143, 157, .95)'
  }
];

export const concepts = [
  {id:'probability', title:'Probability & Log', desc:'概率、log、maximum likelihood 是 CE / KL / LM loss 的地基。', courses:['CS231n','CS336','CS329A']},
  {id:'softmax', title:'Softmax', desc:'把相对分数变成分布；连接分类、attention、sampling 与 policy。', courses:['CS231n','CS336','CS329A']},
  {id:'ce-kl', title:'Cross Entropy & KL', desc:'训练分布、蒸馏、RL regularization、alignment 都会反复遇到。', courses:['CS231n','CS336','CS329A']},
  {id:'gradients', title:'Gradients & Backprop', desc:'不只会调用 autograd，要知道信号如何穿过计算图。', courses:['CS231n','CS336']},
  {id:'attention', title:'Attention', desc:'QKᵀ、scale、softmax、V；也是后续推理系统的核心工作负载。', courses:['CS336','CS349D']},
  {id:'compute', title:'FLOPs · Memory · Bandwidth', desc:'理解训练和推理为什么常常不是“GPU 算得不够快”。', courses:['CS336','CS349D']},
  {id:'parallelism', title:'Parallelism', desc:'DP / TP / PP 与通信开销，贯穿大模型训练和 serving。', courses:['CS336','CS349D']},
  {id:'inference', title:'KV Cache & Serving', desc:'prefill/decode、batching、PagedAttention、cache 与延迟/吞吐。', courses:['CS336','CS349D']},
  {id:'rl-agents', title:'RL · Search · Agents', desc:'reward、policy、verifier、search、test-time compute 与自我改进。', courses:['CS336','CS329A']}
];

export const reviews = [
  {
    id:'semantic-gap', courses:['CS231n'], type:'concept', title:'像素接近，为什么不一定是同一种物体？',
    prompt:'同一只猫换了背景或挪了位置，像素差异可能很大。为什么直接比较像素的 kNN 容易出错？',
    answerText:'像素距离比较的是亮度与位置，不直接比较“猫”的语义。背景、光照或平移都能改变大量像素，所以距离小不一定同类，距离大也不一定异类。',
    hints:['想象把猫向右平移一个像素。','kNN 的判断依赖你给它的距离；原始像素距离并不自带物体语义。'],
    why:'先理解表示与距离的限制，再理解为什么需要学习视觉特征。'
  },
  {
    id:'knn-distance', courses:['CS231n'], type:'formula', title:'写出 L1 和 L2 距离',
    prompt:'两个图像展开为向量 x 和 y。分别写出 L1 距离和 L2 距离（不是 L2 距离平方）。',
    answer:'d_1(x,y)=\\sum_i|x_i-y_i|,\\quad d_2(x,y)=\\sqrt{\\sum_i(x_i-y_i)^2}',
    hints:['L1 把每个维度的绝对差加起来。','L2 先平方、求和，再开根号。'],
    why:'例如 x=(1,2), y=(4,6)：L1=7，L2=5；改变距离可能改变最近邻。'
  },
  {
    id:'knn-k', courses:['CS231n'], type:'concept', title:'kNN 的 k 应该怎么选？',
    prompt:'最近三个训练样本的类别依次是 猫、狗、狗。k=1 和 k=3 各会预测什么？为什么不能在测试集上挑 k？',
    answerText:'k=1 预测猫；这里采用等权多数投票，k=3 预测狗。k 改变对局部样本和噪声的敏感程度，用验证集选 k，再用未参与调参的测试集做最终评估。没有“k 越大越好”的保证。',
    hints:['看最近的 k 个样本，做多数投票。','反复根据测试结果调参，测试集就参与了模型选择。'],
    why:'把超参数选择与最终泛化评估分开，避免得到虚高的测试表现。'
  },
  {
    id:'train-val-test', courses:['CS231n'], type:'concept', title:'训练集、验证集、测试集各做什么？',
    prompt:'用一句话分别解释三者，并说明“反复看测试分数改模型”的问题。',
    answerText:'训练集用于拟合参数；验证集用于选择超参数和模型；测试集用于模型选择结束后的最终评估。反复根据测试分数修改模型会引入测试信息，削弱评估的独立性。',
    hints:['区分“学参数”“选方案”“最后验收”。'],
    why:'这套实验纪律也适用于 VLM、Agent 和你的自有数据集。'
  },
  {
    id:'linear-scores', courses:['CS231n'], type:'formula', title:'线性分类器的公式与维度',
    prompt:'把 CIFAR-10 图像展平成列向量 x∈R^3072，输出 10 个类别分数。写出 s，并标明 W 和 b 的维度。',
    answer:'s=Wx+b,\\quad W\\in\\mathbb{R}^{10\\times3072},\\quad b\\in\\mathbb{R}^{10}',
    hints:['32×32×3=3072；矩阵乘法的内维要相等。','每个类别对应 W 的一行。'],
    why:'W 的一行可以看成一个类别的模板；偏置调整它的基础分数。'
  },
  {
    id:'linear-example', courses:['CS231n'], type:'formula', title:'亲手算一次 Wx+b',
    prompt:'x=(2,1)ᵀ，W 的两行分别为 (1,−1) 和 (0,2)，b=(0,1)ᵀ。写出分数 s；按最大分数选类别，会选第几个？',
    answer:'s=\\begin{pmatrix}1\\\\3\\end{pmatrix},\\quad\\hat{y}=2',
    hints:['第一行：1×2−1×1+0。','第二行：0×2+2×1+1。'],
    why:'这里类别编号从 1 开始。线性分数可以为负，也不要求和为 1。'
  },
  {
    id:'linear-boundary', courses:['CS231n'], type:'concept', title:'线性分类器的边界为什么是一条直线？',
    prompt:'在二维输入中，两个类别的分数相等时形成分类边界。解释这条边界为什么是直线，以及它对 XOR 类数据的限制。',
    answerText:'两类分数相等给出 (w₁−w₂)·x+(b₁−b₂)=0，二维中是直线，高维中是超平面。原始特征上的单个线性边界不能分开 XOR 的交错类别，需要非线性特征或多层网络。',
    hints:['把 s₁=s₂ 写出来，再把两边移到一起。'],
    why:'这是从线性模型走向神经网络的具体原因。'
  },
  {
    id:'softmax-numeric', courses:['CS231n','CS336'], type:'formula', title:'分数全相等时，概率与损失是多少？',
    prompt:'三个类别的 logits 都为 0，正确类别为第 1 类。写出三个 softmax 概率和单样本 NLL（自然对数）。',
    answer:'p_1=p_2=p_3=\\frac{1}{3},\\quad L=\\log3\\approx1.099',
    hints:['exp(0)=1。','loss=−log(正确类别概率)。'],
    why:'这也是检查随机初始分类器 loss 尺度的一个基准。'
  },
  {
    id:'softmax-definition', courses:['CS231n','CS336'], type:'formula', title:'写出 Softmax',
    prompt:'对第 i 个 logit zᵢ，写出它对应的 softmax 概率 pᵢ。先不要看提示。',
    answer:'p_i=\\frac{e^{z_i}}{\\sum_j e^{z_j}}',
    hints:['分子必须始终为正，所以先想到 exp。','分母要把所有候选的 exp 加起来，让结果总和变成 1。'],
    why:'它真正保留的是 logit 之间的相对差异；给所有 logits 同时加一个常数，概率不会变。'
  },
  {
    id:'softmax-shift', courses:['CS231n','CS336'], type:'concept', title:'为什么 softmax 可以减去 max(logit)？',
    prompt:'不用背“为了数值稳定”。解释为什么 zᵢ 全部减去同一个常数 c 后，softmax 结果完全不变。',
    answerText:'因为分子和分母都会共同乘上 e^{-c}，这个公共因子会约掉。因此常选 c=max(z)，避免 exp(z) 溢出。',
    hints:['把 softmax(zᵢ-c) 展开。','利用 e^(a-b)=e^a/e^b。'],
    why:'这是“数学等价变形 → 工程数值稳定”的典型例子。'
  },
  {
    id:'nll', courses:['CS231n','CS336'], type:'formula', title:'从正确类别概率写 NLL',
    prompt:'如果正确类别的预测概率是 p_correct，单样本 negative log-likelihood 是什么？',
    answer:'-\\log p_{correct}',
    hints:['最大似然是最大化正确答案的概率。','训练通常写成最小化 loss，所以把 log-likelihood 前面加负号。'],
    why:'log 把样本概率的连乘变成求和，同时会重罚“非常自信地答错”。'
  },
  {
    id:'ce-definition', courses:['CS231n','CS336','CS329A'], type:'formula', title:'写出 Cross Entropy',
    prompt:'真实分布是 p，模型分布是 q。写出 H(p,q)。',
    answer:'H(p,q)=-\\sum_i p_i\\log q_i',
    hints:['它是“用 q 的编码方式描述来自 p 的事件”的平均代价。','权重来自真实分布 pᵢ，被 log 的是模型分布 qᵢ。'],
    why:'one-hot 分类时只有正确类别那一项留下，于是直接退化成 -log p_correct。'
  },
  {
    id:'kl-definition', courses:['CS336','CS329A'], type:'formula', title:'写出 KL divergence',
    prompt:'写出 D_KL(p || q) 的离散形式。注意方向。',
    answer:'D_{KL}(p\\|q)=\\sum_i p_i\\log\\frac{p_i}{q_i}',
    hints:['期望是对 p 取的。','里面比较的是 log(pᵢ/qᵢ)。'],
    why:'KL 不对称：D_KL(p||q) 和 D_KL(q||p) 一般不同。'
  },
  {
    id:'ce-kl-relation', courses:['CS231n','CS336','CS329A'], type:'formula', title:'CE、Entropy、KL 的关系',
    prompt:'写出 H(p,q)、H(p)、D_KL(p||q) 三者的关系。',
    answer:'H(p,q)=H(p)+D_{KL}(p\\|q)',
    hints:['把 KL 里的 log(pᵢ/qᵢ) 拆成 log pᵢ - log qᵢ。','其中 -Σpᵢlog pᵢ 就是 H(p)。'],
    why:'当 p 固定时，最小化 cross entropy 与最小化 D_KL(p||q) 的最优 q 相同。'
  },
  {
    id:'attention-scale', courses:['CS336'], type:'concept', title:'Attention 为什么除以 √dₖ？',
    prompt:'从随机变量方差的角度解释：Q·K 的维度 dₖ 变大时，为什么 softmax 会越来越“尖”？',
    answerText:'若每个分量近似独立、均值 0、方差 1，点积是 dₖ 个乘积项之和，方差大约随 dₖ 增长，标准差约为 √dₖ。除以 √dₖ 可把尺度拉回稳定范围，避免 softmax 过度饱和、梯度变差。',
    hints:['点积就是很多项相加。','独立随机变量求和时，方差会相加。'],
    why:'它把概率论直接连接到了 Transformer 的数值稳定性。'
  },
  {
    id:'arithmetic-intensity', courses:['CS336','CS349D'], type:'concept', title:'Arithmetic intensity 到底在问什么？',
    prompt:'不用公式，解释为什么同一块 GPU 上有些 kernel 是 compute-bound，有些却是 memory-bound。',
    answerText:'关键不是 GPU 峰值 FLOPs，而是每搬运 1 byte 数据能做多少计算。如果每次从显存搬很多数据却只做少量运算，瓶颈在带宽；若数据复用高、每 byte 做大量 FLOPs，才更可能受计算单元限制。',
    hints:['想象厨房：搬食材 vs 真正炒菜。','比较 FLOPs 与内存流量 bytes。'],
    why:'这是理解 FlashAttention、量化、batching、KV cache 优化价值的底层工具。'
  },
  {
    id:'prefill-decode', courses:['CS336','CS349D'], type:'concept', title:'Prefill 和 Decode 为什么是两种不同工作负载？',
    prompt:'同一个 LLM，为什么处理 prompt 与逐 token 生成会对 GPU 提出不同要求？',
    answerText:'Prefill 一次处理许多 prompt token，矩阵更大、并行度高，通常更容易吃满计算；decode 每步只新增少量 token，却要反复读取已有 KV cache，批量小的时候更容易受内存带宽和调度开销限制。',
    hints:['一个阶段一次处理很多 token，另一个阶段一次通常只推进 1 token。','想想 KV cache 在 decode 阶段要被怎样读取。'],
    why:'它解释了为何 serving 系统会研究 continuous batching、chunked prefill、prefill/decode disaggregation。'
  },
  {
    id:'paged-attention', courses:['CS349D'], type:'concept', title:'PagedAttention 在解决什么资源问题？',
    prompt:'不要先讲算法细节。先说普通 KV cache 管理为什么会浪费显存，分页思路又为什么有效。',
    answerText:'不同请求长度变化大，如果为每个序列预留连续大块 KV cache，容易产生预留浪费和碎片。分页把逻辑连续的 KV 映射到不必物理连续的小块，按需分配，提升显存利用率并更容易支持动态 batching。',
    hints:['类比操作系统虚拟内存。','区分“逻辑连续”和“物理连续”。'],
    why:'这是系统课里非常典型的“把 OS 思想搬到 LLM serving”案例。'
  },
  {
    id:'verifier-search', courses:['CS329A'], type:'concept', title:'为什么 verifier 能让 test-time compute 变有用？',
    prompt:'如果模型可以生成很多候选，但没有办法判断哪个更好，多算几倍真的有意义吗？解释 verifier 的角色。',
    answerText:'更多采样或搜索只会产生更多候选；需要一个能区分候选质量的信号才能把额外计算转成更高成功率。verifier / reward model / domain checker 提供选择、排序或剪枝信号，因此 test-time compute 才能形成“生成 → 评估 → 搜索/改进”的闭环。',
    hints:['“多想几个答案”和“知道哪个答案好”是两件事。','搜索必须有评价函数或终止判断。'],
    why:'这是 self-improving agent、reasoning search 与 RL 之间的共同骨架。'
  },
  {
    id:'conv-translation', courses:['CS231n'], type:'concept', title:'卷积为什么适合图像？',
    prompt:'从参数共享和局部结构解释，不要只说“因为 CNN 很强”。',
    answerText:'图像中的局部模式会在不同位置重复出现。卷积用同一组局部权重扫描整个空间，因此参数量远少于全连接层，并把“某种局部模式在不同位置出现”作为结构先验编码进去。',
    hints:['同一条边缘可能出现在图像任何位置。','如果每个位置都学一套完全独立权重会怎样？'],
    why:'理解 inductive bias 后，才更容易理解 CNN 与 ViT 在数据规模、泛化和计算模式上的差别。'
  }
];

export const derivations = [
  {
    id:'softmax-to-kl',
    title:'Softmax → NLL → CE → KL',
    why:'这一条链会在分类、语言模型、蒸馏、RL/alignment 里反复出现。真正掌握它，比单独背四个公式更值。',
    steps:[
      {title:'Step 1 · Softmax', prompt:'从 logit zᵢ 写出类别 i 的概率 pᵢ。', answer:'p_i=\\frac{e^{z_i}}{\\sum_j e^{z_j}}', hint:'分子 exp，分母把所有类别的 exp 加起来。'},
      {title:'Step 2 · Maximum likelihood → NLL', prompt:'一个样本的正确类别概率为 p_correct。把“最大化正确答案概率”写成常用最小化 loss。', answer:'L=-\\log p_{correct}', hint:'先取 log，再为了改成 minimize 而乘 -1。'},
      {title:'Step 3 · Cross entropy', prompt:'把真实分布 p 与模型分布 q 的 cross entropy 写出来。', answer:'H(p,q)=-\\sum_i p_i\\log q_i', hint:'平均权重来自真实分布 p，被惩罚的是模型给出的 q。'},
      {title:'Step 4 · one-hot 特例', prompt:'若真实标签是 one-hot，说明 CE 为什么退化为 NLL。写出最后结果。', answer:'H(p,q)=-\\log q_{correct}', hint:'除了正确类别外，其余 pᵢ 都是 0。'},
      {title:'Step 5 · KL 定义', prompt:'写出 D_KL(p||q)。', answer:'D_{KL}(p\\|q)=\\sum_i p_i\\log\\frac{p_i}{q_i}', hint:'对 p 求期望，里面是 log(p/q)。'},
      {title:'Step 6 · 拆开 KL', prompt:'把 log(pᵢ/qᵢ) 拆开，并认出 entropy 与 cross entropy，写出最终关系。', answer:'H(p,q)=H(p)+D_{KL}(p\\|q)', hint:'log(p/q)=log p-log q，然后对照 H(p)=-Σp log p。'}
    ]
  },
  {
    id:'attention-scale',
    title:'为什么 Attention 要除 √dₖ',
    why:'这是从概率论直达 Transformer 设计的一条短推导，能把“记公式”升级成“知道它为什么长这样”。',
    steps:[
      {title:'Step 1 · 点积', prompt:'写出 q·k 在 dₖ 维下的求和形式。', answer:'q\\cdot k=\\sum_{i=1}^{d_k}q_i k_i', hint:'就是对应元素相乘再相加。'},
      {title:'Step 2 · 方差增长', prompt:'若各项近似独立、均值 0、方差约 1，点积和的方差大致随什么增长？', answer:'\\mathrm{Var}(q\\cdot k)\\propto d_k', hint:'独立随机变量相加，方差也相加。'},
      {title:'Step 3 · 标准差', prompt:'如果方差 ∝ dₖ，那么标准差大致是多少量级？', answer:'\\mathrm{Std}(q\\cdot k)\\propto\\sqrt{d_k}', hint:'标准差是方差开根号。'},
      {title:'Step 4 · 缩放', prompt:'因此进入 softmax 前用什么缩放把典型幅度拉回 O(1)？', answer:'\\frac{q\\cdot k}{\\sqrt{d_k}}', hint:'除掉刚才随维度增长的标准差尺度。'}
    ]
  }
];
// Study sets reference shared questions; do not duplicate question content per course.
export const studySets = [
  { id:'lecture2', title:'Lecture 2 · 图像分类基础', courses:['CS231n'], reviewIds:['semantic-gap','knn-distance','knn-k','train-val-test','linear-scores','linear-example','linear-boundary','softmax-definition','softmax-shift','nll','ce-definition','softmax-numeric'] },
  { id:'losses', title:'Softmax · CE · KL', courses:['CS231n','CS336','CS329A'], reviewIds:['softmax-definition','softmax-shift','nll','ce-definition','kl-definition','ce-kl-relation','softmax-numeric'] },
  { id:'vision', title:'卷积直觉 · 后续内容', courses:['CS231n'], reviewIds:['conv-translation'] },
  { id:'attention', title:'Attention · 缩放', courses:['CS336'], reviewIds:['attention-scale'] },
  { id:'systems', title:'显存 · 带宽 · Serving', courses:['CS336','CS349D'], reviewIds:['arithmetic-intensity','prefill-decode','paged-attention'] },
  { id:'agents', title:'Verifier · Search', courses:['CS329A'], reviewIds:['verifier-search'] }
];

// Original learning guidance and short notes. External resources are links, not mirrored pages.
export const studyGuides = {
  CS231n: {
    title:'Lecture 2 · 从像素到分类', version:'入口按 Spring 2025 对齐；其他年份可按主题使用。',
    plan:'当前先走通 Lecture 2 → Lecture 3 优化 → Lecture 4 反向传播。然后接 CS336 的 Transformer 实现；CS329A 和 CS349D 按项目需要选读。',
    notes:[
      ['图像 → 向量','32×32×3 的图像可展平为 3072 维。像素距离衡量外观差异，无法直接衡量物体语义。'],
      ['kNN → 看邻居','存下训练数据；预测时找距离最近的 k 个样本并投票。k 和距离函数用验证集选。'],
      ['线性分类 → 算分数','s=Wx+b；W 每行给一个类别打分。分数是相对证据，不是概率。两类分数相等就是分类边界。'],
      ['Softmax → 概率 → 损失','exp 让分数为正，再归一化。正确类别概率越低，−log(p_correct) 越大。减去共同的 max(logit) 能改善数值稳定性。']
    ],
    practice:['看完一个概念后，合上笔记，用一句话解释它解决什么问题。','先手算一次 Wx+b，再用直觉实验改一个 logit，预测并解释概率和 loss 的变化。','本讲对应 Assignment 1 的 kNN；Softmax 可先做前向计算，梯度与训练留到优化/反向传播后。KL 是扩展内容，可以稍后再学。'],
    resources:[
      ['Lecture 2 视频 · Stanford Online 2025','https://www.youtube.com/watch?v=2fq9wYslV0A','跟课入口'],
      ['Lecture 2 官方课件 · 2025','https://cs231n.stanford.edu/slides/2025/lecture_2.pdf','对齐课程与图例'],
      ['官方笔记 · 图像分类与 kNN','https://cs231n.github.io/classification/','距离、验证集与 k 的选择'],
      ['官方笔记 · 线性分类','https://cs231n.github.io/linear-classify/','Wx+b、Softmax；含旧版 SVM 扩展'],
      ['Assignment 1 · 2025','https://cs231n.github.io/assignments2025/assignment1/','先从 knn.ipynb 开始'],
      ['Python / NumPy 官方教程','https://cs231n.github.io/python-numpy-tutorial/','数组、矩阵乘法、广播']
    ]
  },
  CS336: {
    title:'从基础桥接到语言模型', version:'公开自学入口 · Spring 2025',
    plan:'先把矩阵维度、Softmax/CE、反向传播补齐，再推进 tokenizer 与小型 Transformer。以独立实现和小实验作为主线。',
    notes:[['第一段','Tokenizer → Transformer → optimizer → 训练一个小模型。'],['第二段','用 profiler 测瓶颈，再学习 GPU kernel、并行与资源核算。']],
    practice:['每个模块先写输入/输出形状，再自己实现。','用 AI 解释报错或概念；先尝试实现，再看提示，保留自己推导的机会。'],
    resources:[['CS336 2025 · 课表、讲义与全部作业','https://cs336.stanford.edu/spring2025/','实现主线'],['Assignment 1 · 官方代码入口','https://github.com/stanford-cs336/assignment1-basics','tokenizer、模型与训练']]
  },
  CS329A: {
    title:'用可验证任务理解 Agent', version:'Self-Improving AI Agents · Autumn 2025',
    plan:'先选读 test-time compute 与 verifier，再接工具反馈、规划、记忆与评估。和 CS336 的训练基础并行连接，不必等待四课全部学完。',
    notes:[['最小闭环','生成候选 → 检查 → 选择/改进；候选变多并不保证结果变好。'],['检验方法','固定任务与预算，对比成功率、成本和失败类型。']],
    practice:['给一个可执行检查器的任务，比较单次生成和多候选选择。','改候选数或 verifier 质量，每次只改变一个条件。'],
    resources:[['CS329A 官方课表与论文清单','https://cs329a.stanford.edu/','按主题选读']]
  },
  CS349D: {
    title:'从模型执行到 Serving', version:'AI Inference Infrastructure · Spring 2026',
    plan:'等你能跑小 Transformer 后，围绕延迟、吞吐与显存做实验，再选读 serving 技术。官方页面的课表尚为空，先用已公开的项目里程碑。',
    notes:[['资源视角','区分计算、带宽和显存容量；先测量，再优化。'],['项目路线','DP/TP → continuous batching / PagedAttention → context caching / chunked prefill → 进阶特性。']],
    practice:['固定模型与硬件，改变 batch 或上下文长度，记录延迟和显存。','每加一个 serving 特性，检查结果正确性与成本变化。'],
    resources:[['CS349D 官方页面 · Mini Serving Engine','https://web.stanford.edu/class/cs349d/','公开项目路线']]
  }
};

// Official lecture numbers are used only where the existing questions are mapped.
// Other courses keep an explicitly unnumbered unit until lecture mapping is added.
const sharedTopics = studySets.filter(s => ['losses','attention','systems','agents'].includes(s.id));
export const lessonGroups = {
  CS231n: [
    {id:'lecture2', title:'Lecture 2 · 图像分类', topics:[
      {id:'representation', title:'像素与语义', reviewIds:['semantic-gap']},
      {id:'knn', title:'kNN 与距离', reviewIds:['knn-distance','knn-k']},
      {id:'validation', title:'训练 / 验证 / 测试', reviewIds:['train-val-test']},
      {id:'linear', title:'线性分类器', reviewIds:['linear-scores','linear-example','linear-boundary']},
      {id:'softmax', title:'Softmax 与分类损失', reviewIds:['softmax-definition','softmax-shift','nll','ce-definition','softmax-numeric']}
    ]},
    {id:'lecture5', title:'Lecture 5 · 卷积（后续）', later:true, topics:[
      {id:'convolution', title:'局部结构与参数共享', reviewIds:['conv-translation']}
    ], guide:{
      title:'Lecture 5 · 卷积（后续内容）', version:'Spring 2025 · 当前仅备 1 道基础题',
      plan:'这是后续单元。当前可先完成 Lecture 2–4；这里保留卷积的基础直觉与官方阅读入口。',
      notes:[['局部模式','边缘等局部模式可以出现在不同位置。'],['参数共享','同一个滤波器在图像不同位置使用同一组权重。']],
      practice:['解释：为什么同一条边缘不必在每个位置分别学习一套权重？'],
      resources:[['官方笔记 · 卷积网络','https://cs231n.github.io/convolutional-networks/','局部连接、共享参数与卷积层'],['CS231n 2025 · 官方课表','https://cs231n.stanford.edu/2025/schedule.html','Lecture 5 课程入口']]
    }}
  ],
  ...Object.fromEntries(['CS336','CS329A','CS349D'].map(course => [course, [
    {id:'foundation', title:'基础专题（暂未按讲次编排）', topics:sharedTopics.filter(s=>s.courses.includes(course))}
  ]]))
};

// This short chain stops at the current lecture's loss, leaving KL to the extension.
derivations.unshift({
  id:'classification-loss', title:'基础 · 分数 → Softmax → 分类损失',
  why:'先把本讲的分类链走通：模型给分数，Softmax 给概率，loss 衡量正确类别的概率。',
  steps:[derivations[0].steps[0],derivations[0].steps[1],derivations[0].steps[3]].map((step,i)=>({...step,title:step.title.replace(/^Step \d+/,`Step ${i+1}`)}))
});
derivations.find(d=>d.id==='softmax-to-kl').title = '拓展 · Softmax → CE → KL';
