// Explicit topic mappings, checked 2026-10-14 against the upstream reading site.
// Indices below are note numbers, not replacements for official class numbers.
const base='https://hqhq1025.github.io/ai-course-notes/';
export const noteSource={
  author:'AI Course Notes · hqhq1025',
  repository:'https://github.com/hqhq1025/ai-course-notes',
  commit:'717e2df65c3d2eee593c171156a30d4f8f6812b9',
  license:'CC BY-NC-SA 4.0',
  licenseUrl:'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  checked:'2026-10-14'
};
function note(course,number,title,version,anchor=''){
  const url=base+course+'/lecture'+String(number).padStart(2,'0')+'/'+(anchor?'#'+anchor:'');
  return {title,url,author:noteSource.author,kind:'中文笔记',version,desc:version+' · 第三方整理，课堂范围与作业以官方版本为准。'};
}
export const unitReadings={
  CS231n:Object.fromEntries(Array.from({length:18},(_,i)=>['lecture'+(i+1),[note('cs231n',i+1,'本讲中文讲义','2025')]])),
  CS336:Object.fromEntries(Array.from({length:17},(_,i)=>['lecture'+(i+1),[note('cs336',i+1,'本讲中文讲义','Spring 2025')]])),
  CS329A:Object.fromEntries([[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[8,7],[17,8],[20,9]].map(([unit,n])=>['lecture'+unit,[note('cs329a',n,'对应主题中文讲义 · 公开系列第 '+n+' 讲','公开 9 讲系列；按主题匹配')]]))
};
export const collectionReadings={
  CS336:[{title:'CS336 · Spring 2026 中文讲义（另一课程版本）',url:base+'cs336-2026/',author:noteSource.author,kind:'其他版本',desc:'18 份讲义；用于拓展与比较，不把编号套到当前 Spring 2025 课表。'}],
  CS329A:[{title:'CS329A · 公开 9 讲中文讲义目录',url:base+'cs329a/',author:noteSource.author,kind:'主题索引',desc:'9 份笔记不是 20 次课表的完整覆盖；展示、嘉宾课和未匹配主题继续保留官方入口。'}]
};
export const nodeReadings={
  representation:[note('cs231n',2,'语义鸿沟与分类挑战','2025','semantic-gap')],
  knn:[note('cs231n',2,'kNN：距离、投票与超参数','2025','k')],
  validation:[note('cs231n',2,'如何正确选择超参数','2025','_15')],
  linear:[note('cs231n',2,'线性分类器的三种视角','2025','_20')],
  softmax:[note('cs231n',2,'Softmax 与交叉熵的计算','2025','softmax')],
  'ce-kl':[note('cs231n',2,'交叉熵、最大似然与 KL','2025','_27')],
  regularization:[note('cs231n',3,'正则化：目标与参数偏好','2025','_6')],
  optimization:[note('cs231n',3,'优化直觉、数值与解析梯度','2025','_10')],
  optimizers:[note('cs231n',3,'SGD、Momentum、Adam 与 AdamW','2025','_15')],
  'neural-networks':[note('cs231n',4,'从线性模型到神经网络','2025','_5'),note('cs231n',4,'激活函数：ReLU 等非线性','2025','_11')],
  backprop:[note('cs231n',4,'计算图与反向传播','2025','_19')],
  attention:[note('cs336',3,'语言模型架构','Spring 2025')],
  compute:[note('cs336',2,'PyTorch 与资源核算','Spring 2025'),note('cs336',5,'GPU：算力与数据搬运','Spring 2025')],
  parallelism:[note('cs336',7,'并行基础','Spring 2025'),note('cs336',8,'分布式训练','Spring 2025')],
  serving:[note('cs336',10,'推理与 KV Cache','Spring 2025')],
  verifier:[note('cs329a',3,'稳健验证','公开 9 讲系列'),note('cs329a',7,'搜索与 Deep Research','公开 9 讲系列')]
};
