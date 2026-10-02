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
- `data/curriculum.js` — course map, reusable knowledge nodes, review questions, derivation chains, study sets and original study guides. Sets reference shared question IDs.
- `assets/vendor/mathlive/` — unmodified pinned runtime, stylesheet, fonts, MIT license.
- `sw.js` — complete, same-origin precache with a versioned cache-first release.
- `tests/pwa-smoke.cjs` — mobile / cold offline / update / install-failure browser checks.
- No account, no database, no learning-progress state.

This means future study sessions should usually update **curriculum data**, not rewrite the app.

## Current V1

- Default: CS231n Lecture 2 (12 questions), with course / topic / type filters and direct question selection.
- Compact tabs: practice, intuition experiment, derivation, notes/resources, scratchpad.
- Shareable URL selection; no stored study progress.
- Local Lecture 2 notes, a Softmax / NLL slider experiment, and verified official resource links.
- Formula questions using pinned, vendored MathLive 0.111.0 and all 20 local WOFF2 fonts, including a virtual math keyboard. Keyboard sounds are disabled.
- Concept questions that force explanation before reveal.
- Progressive hints.
- Derivation Lab:
  - Softmax → NLL → Cross Entropy → one-hot CE → KL → CE = H + KL
  - Why scaled dot-product attention divides by √dₖ
- Formula Scratchpad for free-form derivation. Each editable math field has a keyboard button.
- Course map + cross-course knowledge map, collapsed in notes/resources.
- Opaque PNG icons: Apple touch icon (180px) and manifest icons (192px / 512px).

## Offline use and updates

First open the page online and wait for **离线可用 ✓**. The app then works offline,
including previously unused font glyphs, keyboard input, local notes and the lab.
External videos, original notes and assignment links still need a connection.
iOS can evict website storage; reopen online if the cache has been removed.

The worker precaches the entire release, including every font. A failed fetch
rejects installation. It serves cached HTML and assets together, leaves unrelated
caches untouched, and announces a waiting update through the app's refresh button.
Refreshing clears the current in-memory answer / scratchpad. When changing cached
files, bump both the version in `sw.js` and the expected ready-version in `app.js`.

## Validation

No build step or production npm install is needed. For the optional browser test,
install Playwright in your development environment and install Chromium, then run:

```bash
node tests/pwa-smoke.cjs
```

`CHROMIUM_PATH` can point to an existing browser executable. The test serves the
repository under `/stanford-cs-gym/`, matching GitHub Pages. It verifies an offline
cold reload with HTTP cache disabled, all 20 font responses, formula keyboard and
rendering, Lecture 2 selection, resource switching, the numeric experiment, an
explicit atomic update, and failed-precache rejection. Mobile layout is tested in
Chromium with iPhone dimensions; this is not a physical Safari/Add-to-Home-Screen test.

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
