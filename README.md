# Stanford CS Gym

[打开学习平台](https://hahahouomg.github.io/stanford-cs-gym/)

跨课程的知识点复习平台。首页先选择课程、讲次或知识点，进入直觉讲解和
互动实验，再按需练题、推导或写公式。无需登录，不存储学习进度。
默认从 CS231n Lecture 2 开始。

## 课程与内容来源

| 课程版本 | 已收录的官方结构 | 作业入口 |
| --- | --- | --- |
| CS231n · Spring 2025 | 完整 18 讲 | 官方 Assignment 1–3 |
| CS336 · Spring 2025 | 完整 19 讲 | 官方 Assignment 1–5 仓库 |
| CS329A · Autumn 2025 | 20 次课表安排，含期中展示 | 官网 Homework / 研究项目说明；未公开题目下载 |
| CS349D · Spring 2026 | 官方 Schedule 尚为空，展示 4 个项目里程碑 | Mini Serving Engine 项目说明；未公开 starter |

讲次编号来自指定年份的官方课表，不根据题库生成。知识点与作业的关联是
本站整理的学习索引，不表示官方的作业发布时间。没有本站讲解的讲次仍可选择，
明确显示原始资料入口；收录目录不等于全部内容都已写成互动课。

当前有 **14 个知识点、7 个互动实验、20 道自编练习**。Lecture 2 包含图像表示、
kNN、数据划分、线性分类、Softmax 的讲解及 12 题。实验包括邻居投票、数据划分、
2D / Three.js 3D 线性分类、Softmax、梯度下降、卷积窗口和 Attention 加权读取。
共享知识点可关联多门课，不重复复制内容。

每个知识点提供本地原创短讲解、机制、回忆提示、可选公式、作者来源和官方作业。
外部资料是原文链接，不镜像整篇笔记，也不混入官方作业答案。已收录官方课程笔记、
raimbekovm 的逐讲复习笔记、Gabriel Goh 的 Distill 动量讲解、Christopher Olah 的
反向传播计算图、Jay Alammar 的 Illustrated Transformer，以及关联原论文。
第三方资料可能包含课程拓展，讲次仍以官方课表为准。

当前学习顺序建议：CS231n L2 → L3 优化 → L4 反向传播，再接 CS336 的模型实现；
CS329A / CS349D 按项目需要选读。先预测、调实验、解释原因，再做练习；隔天从
记忆重述一次，不依靠反复看答案。

## 文件职责与扩展

保持静态 HTML + 原生 JavaScript，没有框架、构建步骤或线上 npm 安装。

| 文件 | 职责 |
| --- | --- |
| `data/catalog.js` | 完整版本课表、讲次主题、资料、作业与知识点 ID 引用 |
| `data/knowledge.js` | 可复用知识点：讲解、实验 ID、题目 ID、推导 ID、来源 |
| `data/curriculum.js` | 课程标识、自编题库与分步推导 |
| `assets/hub.js` | 目录、全局搜索、知识点详情与资料展示 |
| `assets/labs.js` | 2D 互动实验注册与实现 |
| `assets/linear-lab.js` | 线性分类几何与按需渲染的 Three.js 场景 |
| `assets/app.js` | 工具导航、题库筛选、公式输入、推导、PWA 更新 |
| `sw.js` | 同源完整资源缓存与原子版本更新 |

### 添加讲次或课程

在 `catalog` 中追加 unit（或在上方的课程 rows 中添加一行）。**核对相应年份
的官方标题与编号**，然后填写主题、资料和已有知识点的 `nodeIds`。无需增加题目
也能显示讲次。CS349D 公布正式课表后，可用 `lecture` 单元替换当前 `milestone`
索引；不要把项目编号当讲次编号。

新课程还需在 `curriculum.js` 的 `courses` 加标识、在 `assignments` 添加资料。
同一个知识点的 ID 可以被不同课程 / 讲次引用。

```js
{
  id: 'lecture20', number: 20, kind: 'lecture',
  title: '已核对的中文标题', originalTitle: 'Official title',
  topics: ['主题'], nodeIds: ['attention'],
  resources: [{title: '官方讲义', url: 'https://…', kind: '官方'}]
}
```

### 添加知识点或外部材料

给 `knowledge` 添加对象，再把其 `id` 填入对应 unit 的 `nodeIds`：

```js
{
  id: 'unique-concept', title: '知识点', subtitle: '一个值得解释的问题',
  area: '模型结构', icon: 'chain', courses: ['CS336'],
  summary: '本地原创的简短直觉解释。',
  steps: [['机制', '解释机制与适用条件。']],
  formula: 'x', check: '改变一个条件，会怎样？',
  reviewIds: [], // 题库已有的 ID；没有题也能成为完整知识点入口
  resources: [{title:'资料标题',url:'https://…',author:'作者',kind:'作者讲解',desc:'适合何时阅读'}]
}
```

外部材料通常通过资源对象关联，不需要改 UI。新互动只需加 `demo` ID 并在
`mountDemo` 注册挂载函数，返回清理函数，停止定时器、观察器并释放 GPU 资源。
避免自动运行的背景动画；支持降低动态效果和无 WebGL 的设备。

### 添加练习或推导

题目追加到 `reviews`，把 ID 放入知识点的 `reviewIds`。题目仍标为自编练习，
与官方作业链接分开。公式题使用 `answer`（LaTeX），概念题使用 `answerText`：

```js
{
  id: 'unique-question', courses: ['CS336'], type: 'concept',
  title: '题目标题', prompt: '题干', answerText: '答案',
  hints: ['提示'], why: '理解这个问题的用途'
}
```

推导追加到 `derivations`，在知识点设置 `derivationId`。课程、讲次、知识点与
题目选择可通过当前 URL 分享。导航选择不保存个人进度，草稿只留在当前页面。

## 离线与手机安装

首次联网打开，等待 **离线可用 ✓**。随后本地目录、讲解、所有互动（含 3D）、
题目、公式键盘与 20 个字体均可离线使用，包括新开的页面和此前未打开的实验。
外部笔记、slides、视频、作业代码仍需网络。Safari 分享 → 添加到主屏幕。
iOS 可能回收网站缓存，若缓存被移除，重新联网准备。

MathLive **0.111.0** 与 Three.js **0.180.0** 均固定版本、同源加载，保留 MIT 许可证。
Three.js 按需加载并渲染，没有持续动画循环；关闭知识点会清理场景，无 WebGL 时
二维实验仍可使用。数学键盘声音关闭，未使用 Compute Engine 或运行时 CDN。

manifest 提供 192 / 512 PNG 和 SVG 图标；HTML 单独设置 180×180 不透明 PNG
`apple-touch-icon`。这比只依赖 SVG manifest icon 更适合 iPhone 安装入口。

缓存采用整版原子安装：任何脚本或字体缺失都不能激活新版本。更新等待用户点
**更新可用 · 刷新**，不会后台切换当前资产。刷新会清除当前草稿。
每次修改缓存文件，更新 `sw.js` 和 `app.js` 中的版本；新增本地运行时文件必须
加入 `CORE`。这是后续扩展时唯一需要同步处理的离线配置。

## 验证与发布

开发环境安装 Playwright 和 Chromium 后运行 `node tests/pwa-smoke.cjs`。
也可设置 `CHROMIUM_PATH` 使用现有浏览器。

测试在 `/stanford-cs-gym/` 子路径下验证完整目录、跨课程搜索、知识点跳转、题型空态、
互动数值、2D / 3D / WebGL 降级、手机与桌面布局；禁用 HTTP 缓存并实际阻断网络后，
从新页面验证 3D、MathLive、全部字体；检查显式更新和字体 / Three 缺失时拒绝安装。
测试验证运行时没有外部请求。移动端测试使用 Chromium 的 iPhone 尺寸；未声称在
实体 iPhone Safari 上测试安装。

GitHub Pages：Settings → Pages → Deploy from a branch → `main` → `/(root)`。
