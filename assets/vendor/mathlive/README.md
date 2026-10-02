# MathLive 0.111.0 (vendored)

Runtime script, font stylesheet and all 20 WOFF2 fonts copied unmodified from
`npm pack mathlive@0.111.0`. MathLive uses the MIT license in `LICENSE.txt`.
Source: https://github.com/arnog/mathlive

The app loads the font stylesheet locally and disables keyboard sounds. It uses
LaTeX input/output only, without requesting the optional Compute Engine. No CDN
is required for formula input, the virtual keyboard or formula rendering.

To upgrade: copy the pinned runtime, stylesheet, fonts and license together;
verify the complete font list in `sw.js`; bump its cache version and the matching
ready-version in `assets/app.js`; run the offline smoke test.
