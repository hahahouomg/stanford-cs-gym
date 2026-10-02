# 🐒 Stanford CS Gym

A public, no-login review gym for long-term Stanford CS self-study.

The design principle is **derive > reread**: open the page, draw a random question, write the formula / explain the concept, use hints only when stuck, then reveal.

## Courses currently mapped

- **CS231n** — Deep Learning for Computer Vision
- **CS336** — Language Modeling from Scratch
- **CS329A** — Self-Improving AI Agents
- **CS349D** — AI Inference Infrastructure

The app is deliberately **not** organized as four isolated note folders. Shared concepts such as Softmax, CE/KL, gradients, attention, memory/bandwidth, parallelism, serving, RL/search/agents are reusable knowledge nodes referenced by multiple courses.

## Architecture

```text
stanford-cs-gym/
├── index.html
├── assets/
│   ├── app.js
│   └── styles.css
├── data/
│   └── curriculum.js
├── .nojekyll
└── README.md
```

### Separation of concerns

- `index.html` — stable UI shell.
- `assets/app.js` — review/derivation interaction logic.
- `assets/styles.css` — responsive visual layer.
- `data/curriculum.js` — course map, reusable knowledge nodes, review questions, derivation chains.
- No account, no database, no learning-progress state.

This means future study sessions should usually update **curriculum data**, not rewrite the app.

## Current V1

- Random review mode with course filters.
- Formula questions using MathLive, including a virtual math keyboard.
- Concept questions that force explanation before reveal.
- Progressive hints.
- Derivation Lab:
  - Softmax → NLL → Cross Entropy → one-hot CE → KL → CE = H + KL
  - Why scaled dot-product attention divides by √dₖ
- Formula Scratchpad for free-form derivation.
- Course map + cross-course knowledge map.

## Adding a review item

Append an item to `reviews` in `data/curriculum.js`:

```js
{
  id: 'unique-id',
  courses: ['CS336'],
  type: 'concept', // or 'formula'
  title: 'Question title',
  prompt: 'Question prompt',
  answerText: 'Answer for concept questions',
  // answer: 'LaTeX answer for formula questions',
  hints: ['Hint 1', 'Hint 2'],
  why: 'Why this matters'
}
```

## Long-term curriculum direction

### CS231n
Optimization, backprop, convolution geometry, normalization, residual networks, detection/segmentation, transformers, self-supervised learning, generative vision, 3D vision, vision-language and world modeling.

### CS336
Tokenization, Transformer internals, attention/MoE, optimizers, GPU/Triton, FLOPs & memory accounting, distributed training, scaling laws, data, inference and post-training/RL.

### CS329A
Verifiers, search, test-time compute, tool use/retrieval, multi-step planning, agent evaluation, self-improvement loops, coding/research/robotics agents.

### CS349D
Tensor/data parallelism, continuous batching, PagedAttention, context/KV caching, chunked prefill, speculative decoding, hierarchical caching and prefill/decode disaggregation.

## GitHub Pages

For this static site:

1. Repository → **Settings → Pages**
2. Source → **Deploy from a branch**
3. Branch → `main`
4. Folder → `/(root)`
5. Save

Then the site is normally available at:

`https://hahahouomg.github.io/stanford-cs-gym/`

---

Maintained as the external practice layer for the Stanford CS learning project: **chat for teaching; this site for retrieval and derivation practice.**