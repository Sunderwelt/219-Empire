# Phaser prototype for 219-Empire

This prototype is intentionally minimal. To run locally:

1. Serve the `game/` directory with a static server, e.g.:
   - `npx http-server game`  (requires Node.js)
   - or `python -m http.server` inside the game directory
2. Open http://localhost:8080 (or the port printed by the server) and play.

To deploy to GitHub Pages:
- The repo already hosts a Pages site. Add a route to `game/index.html` or configure Pages to serve the root. A simple approach is to add a link from the site to /game/index.html or set `gh-pages` to serve the `game/` folder.

Future work:
- Persist coins/buildings to localStorage
- Add more towns, shops, and raids
- Add mobile touch optimizations and responsive layout
