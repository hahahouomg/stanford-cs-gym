export const courses = [
  {
    id: 'CS231n',
    title: 'Deep Learning for Computer Vision',
    url: 'https://cs231n.stanford.edu/',
    focus: '从分类、优化与反向传播，到现代视觉表示与视觉模型。',
    topics: ['linear classifiers', 'optimization', 'backprop', 'CNNs', 'vision transformers', 'detection / segmentation'],
    color: 'rgba(101, 145, 255, .9)'
  },
  {
    id: 'CS336',
    title: 'Language Modeling from Scratch',
    url: 'https://cs336.stanford.edu/',
    focus: '从 tokenizer 和 Transformer 一路做到训练、系统、数据、评测与 post-training。',
    topics: ['tokenization', 'Transformer', 'attention / MoE', 'GPU & Triton', 'parallelism', 'scaling', 'data', 'SFT / RL'],
    color: 'rgba(255, 207, 84, .95)'
  },
  {
    id: 'CS329A',
    title: 'Self-Improving AI Agents',
    url: 'https://bulletin.stanford.edu/courses/2263721',
    focus: '围绕自我改进、verifier、test-time compute、工具调用、规划与 agent evaluation。',
    topics: ['verifiers', 'test-time compute', 'search', 'tools / retrieval', 'planning', 'agent evaluation', 'robotics'],
    color: 'rgba(119, 215, 170, .95)'
  },
  {
    id: 'CS349D',
    title: 'AI Inference Infrastructure',
    url: 'https://web.stanford.edu/class/cs349d/',
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