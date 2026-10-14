// L2–L4 guides adapted and independently expanded from AI Course Notes.
// Source: hqhq1025/ai-course-notes@717e2df65c3d2eee593c171156a30d4f8f6812b9.
// This file is CC BY-NC-SA 4.0. Credit/modifications: ../licenses/ai-course-notes.txt.
export const studyRoutes = {
  CS231n: {
    lecture2: {
      assignmentId:'a1',
      goal:'建立分类的完整链条：表示 → 邻居 → 验证 → 分数 → 概率与损失。',
      tasks:['解释像素距离的局限','预测 k 和距离如何改变投票','分清调参与最终验收','移动权重与偏置，看分类边界','把分数变成概率，解释正确类的损失'],
      assignmentTask:'Assignment 1 · 先做 Q1 knn.ipynb：距离、向量化、交叉验证。Q2 的训练更新结合 Lecture 3。',
      next:'lecture3'
    },
    lecture3: {
      assignmentId:'a1',
      goal:'分开三个问题：用什么目标、朝哪个方向走、每次走多远。',
      tasks:['比较拟合误差与权重惩罚','预测一次梯度更新，再试学习率','比较 SGD、Momentum、Adam 与 AdamW'],
      assignmentTask:'Assignment 1 · Q2 softmax.ipynb：数值稳定、向量化梯度、正则化、验证集调参。不要先看实现答案。',
      next:'lecture4'
    },
    lecture4: {
      assignmentId:'a1',
      goal:'理解非线性为什么必要，并能在计算图中把梯度传回每个输入。',
      tasks:['改输入看 ReLU 的开关与折点','先前向计算，再逐步反向传梯度'],
      assignmentTask:'Assignment 1 · Q3 两层网络，再接 Q5 全连接网络。先对小输入做数值梯度检查，再训练完整模型。',
      next:'lecture5'
    }
  }
};
export const foundationNodes = [
  {id:'regularization',title:'正则化 · 拟合与复杂度',subtitle:'误差更低的模型，一定更值得选吗？',area:'训练与优化',icon:'split',demo:'regularization',courses:['CS231n','CS336'],reviewIds:['regularization-choice','regularization-gradient'],summary:'只追求训练误差，模型可能把噪声也记下来。正则化把对参数的偏好写进训练目标，例如 L2 惩罚大的权重；它不是泛化保证，强度仍要用验证集选择。',steps:[['比较目标','数据损失衡量拟合，正则项衡量参数代价。总目标让二者一起参与优化。'],['明确约定','这里使用 λΣw²，导数是 2λw；若写成 λΣw²/2，导数才是 λw。']],formula:'L=L_{data}+\\lambda\\sum_i w_i^2',check:'如果 λ 太大，训练误差和泛化一定都会变好吗？',resources:[{title:'官方：神经网络与正则化',url:'https://cs231n.github.io/neural-networks-2/',author:'CS231n',kind:'官方笔记'}]},
  {id:'optimizers',title:'SGD · Momentum · Adam',subtitle:'当前梯度、历史方向和坐标尺度分别做什么？',area:'训练与优化',icon:'curve',courses:['CS231n','CS336'],reviewIds:['momentum-history','adamw-decoupling'],summary:'SGD 使用当前小批次梯度；Momentum 累积历史方向；Adam 同时跟踪梯度和梯度平方，并校正初始偏差。优化器改变更新规则，学习率仍需选择。',steps:[['方向记忆','梯度方向反复一致时，动量会保留这种趋势；来回振荡的分量可相互抵消。'],['坐标尺度','Adam 用二阶统计调整各坐标步幅。AdamW 把权重衰减从自适应梯度更新中解耦。']],check:'换成 Adam 后，还需要验证学习率和 weight decay 吗？',resources:[{title:'官方：学习过程与优化器',url:'https://cs231n.github.io/neural-networks-3/',author:'CS231n',kind:'官方笔记'}]},
  {id:'neural-networks',title:'神经网络 · 非线性开关',subtitle:'为什么只叠线性层还不够？',area:'模型结构',icon:'chain',demo:'activations',courses:['CS231n','CS336'],reviewIds:['linear-stack','relu-gradient'],summary:'两层线性变换仍可合并成一层。加入 ReLU 等非线性后，不同输入会激活不同路径，模型才可以形成有折点的映射。更大网络不自动意味着更好的测试表现。',steps:[['层与维度','第一层把 D 维输入映到 H 维隐藏表示，第二层再映到 C 个类别分数。'],['激活与梯度','ReLU 保留正输入，负输入置零。正区间局部导数为 1，负区间为 0；0 点不可导，实验采用常见的 0 约定。']],formula:'s=W_2\\max(0,W_1x+b_1)+b_2',check:'去掉两层之间的 ReLU，模型表达能力会怎样改变？',resources:[{title:'官方：神经网络基础',url:'https://cs231n.github.io/neural-networks-1/',author:'CS231n',kind:'官方笔记'}]}
];
// Local examples and hidden-answer self-checks; full notes stay explicit online links.
export const studyGuides = {
  representation:{
    example:{title:'同一只猫，两个向量',steps:[['观察','32×32×3 图片有 3072 个像素通道值。展平不丢像素，却不会自动产生“猫”的概念。'],['改变','只把猫向右平移一格，许多位置的数值就变了，标签仍然是猫。'],['结论','距离是否有用取决于表示。学习特征的目的是保留任务信息、减少无关变化。']]},
    pitfall:'展平和归一化是数据处理，不等于已经学到了语义特征。',
    checks:[['换背景后像素距离很大，能推出类别不同吗？','不能。背景会改变数值，类别由任务定义，不由像素距离直接定义。']]
  },
  knn:{
    example:{title:'手算距离，再看投票',steps:[['距离','x=(1,2)，y=(4,6)：L1=3+4=7；L2=√(9+16)=5。'],['投票','最近三个样本依次是猫、狗、狗：等权投票时 k=1 选猫，k=3 选狗。'],['选择','用验证集比较 k 和距离函数；保存测试集，最后才做验收。']]},
    pitfall:'平方 L2 与 L2 对固定查询的邻居排序相同，但数值不同；k 增大也不保证更准确。',
    checks:[['kNN 几乎不训练，为什么预测可能很慢？','每次查询仍需和训练样本比较距离；直接实现的代价约为 O(ND)。']]
  },
  validation:{
    example:{title:'把测试答案留到最后',steps:[['训练','用训练样本拟合权重。'],['验证','用验证结果在 k=1、3、5 或不同学习率之间选择。'],['测试','选定方案后评估。根据测试结果反复修改，测试集便不再是独立验收。']]},
    pitfall:'同一对象的近重复图像进入不同划分，也可能导致泄漏；随机拆分不总是足够。',
    checks:[['看了测试分数后换 k，这次测试还能算独立评估吗？','不能。测试信息已进入方案选择，需要新的未参与选择的评估数据。']]
  },
  linear:{
    example:{title:'看分数差，而不是孤立的一行权重',steps:[['分数','设两类分数 s₁=2x+y+1，s₂=x−y−1。'],['比较','分数差 m=s₁−s₂=x+2y+2；m>0 选类别 1，m<0 选类别 2。'],['边界','打平位置是 x+2y+2=0。实验的 3D 高度就是 m，和高度 0 平面的交线才是分类边界。']]},
    pitfall:'多类分类中，两类边界由权重与偏置之差决定，不是单独某一行 W 的零点超平面。',
    checks:[['把所有类别的分数同时加 10，会改变 argmax 吗？','不会，相对大小没变；只给一个类别加 10 才可能改变结果。']]
  },
  softmax:{
    example:{title:'三个类别都没有偏好时',steps:[['分数','z=(0,0,0)，三个指数值均为 1。'],['概率','总和为 3，每类概率是 1/3。正确类损失 −ln(1/3)=ln(3)≈1.099。'],['验证','所有分数同时加 10，概率不变。只提高正确类分数，其概率增大，损失下降。']]},
    pitfall:'多类互斥分类用 Softmax / CrossEntropyLoss；二分类或独立多标签常用 Sigmoid / BCE。它们不是可随意替换的接口。PyTorch CrossEntropyLoss 直接接收 logits，不要先 Softmax。',
    checks:[['z=(1000,1001,1002) 直接取 exp 有什么问题？','可能上溢。先减最大值，计算 exp(−2)、exp(−1)、exp(0)，概率不变。'],['概率最大，是否等于已经正确？','不等于。它是模型预测；要与真实标签比较，置信度也不保证校准。']]
  },
  regularization:{
    example:{title:'训练误差小，不代表总目标小',steps:[['候选','A：数据损失 0.8、权重平方和 1；B：数据损失 0.5、权重平方和 9。'],['无惩罚','λ=0 时，总目标就是数据损失，选 B。'],['加惩罚','λ=0.05 时，A=0.85，B=0.95，按总目标选 A。这不是测试准确率的比较。']]},
    pitfall:'训练目标偏好小权重，不等于已经测得泛化更好。λ 太大可能欠拟合；偏置是否参与惩罚也要明确。',
    checks:[['L=Ldata+λΣw²，正则项对 w 的梯度是多少？','2λw。若正则项包含 1/2 因子，才变成 λw。']]
  },
  optimization:{
    example:{title:'一维曲面上走一步',steps:[['位置','L(w)=w²/2，在 w=3 时，梯度为 3，损失为 4.5。'],['更新','η=0.2：w新=3−0.2×3=2.4，损失变为 2.88。'],['反例','η=2.2：w新=−3.6，损失变为 6.48。方向正确，步子仍可能太大。']]},
    pitfall:'梯度指向局部最陡上升；取负梯度也只有在步长适当时才保证局部下降。',
    checks:[['此实验在 η=2 时会收敛吗？','不会。w 每次变号，绝对值不变，损失不下降；本例收敛区间为 0<η<2。']]
  },
  optimizers:{
    example:{title:'更新规则分别记住什么',steps:[['SGD','只使用当前小批次梯度。学习率决定更新尺度。'],['Momentum','保存历史方向。例如 v←βv+(1−β)g，再用 −ηv 更新；不同教材的 v 定义可能差一个缩放因子。'],['Adam / AdamW','Adam 跟踪一阶和二阶统计并校正偏差。AdamW 的参数衰减单独施加；自适应优化器中，它一般不等价于把 L2 项加入损失。']]},
    pitfall:'优化器名字不能代替验证。比较还要控制学习率、预算、数据划分与 weight decay。',
    checks:[['连续梯度都朝同一方向时，动量记忆有什么用？','保留一致趋势；反复变号的分量可通过历史累积抵消部分振荡。']]
  },
  'neural-networks':{
    example:{title:'先试线性叠加，再打开 ReLU',steps:[['无激活','W₂(W₁x+b₁)+b₂=(W₂W₁)x+(W₂b₁+b₂)，仍是线性加偏置。'],['有激活','ReLU 在 0 处形成折点；不同输入经过的有效路径可能不同。'],['形状','D=3、H=4、C=2：W₁ 为 4×3，W₂ 为 2×4，一个输入最后得到 2 个类别分数。']]},
    pitfall:'多个线性层本身不能制造非线性；ReLU 的 0 点采用约定，而不是声称处处可导。',
    checks:[['去掉 ReLU，仅加深线性层，能解决原始输入的 XOR 吗？','不能。整个网络仍是仿射变换；需要非线性或非线性特征表示。']]
  },
  backprop:{
    example:{title:'f=(x+y)z 的前向与反向',steps:[['前向','x=2，y=−3，z=−4：q=x+y=−1，f=qz=4。'],['乘法节点','从 df/df=1 开始，传回 df/dq=z=−4，df/dz=q=−1。'],['加法节点','dq/dx=dq/dy=1，所以 df/dx=df/dy=−4。共享变量的多路径贡献要相加。']]},
    pitfall:'局部导数必须乘上游梯度；多路径汇合时求和，不能覆盖前一条路径的贡献。',
    checks:[['f=x×x，同一个 x 走两条边，梯度是多少？','两条路径各贡献 x，合计 2x；x=3 时是 6。'],['为什么先在小输入上做数值梯度检查？','有限差分计算昂贵，且要选合适步长和误差阈值；小输入便于定位解析梯度错误。']]
  }
};
