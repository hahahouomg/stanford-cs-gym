# Three.js 0.180.0

Pinned from the official `three` npm package (MIT; see LICENSE.txt).

Only the WebGL ESM modules and OrbitControls are shipped. The OrbitControls import
was changed from the bare `three` specifier to `./three.module.min.js` so GitHub
Pages needs no bundler or CDN. Both minified modules are unchanged.

All three runtime files are atomically precached by sw.js. The linear lab renders
on demand, disposes GPU resources when closed, and retains an interactive 2D view
when WebGL is unavailable. No network textures or fonts are used.
