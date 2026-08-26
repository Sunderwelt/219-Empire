# Phaser prototype for 219-Empire

This prototype is intentionally minimal. To run locally:

1. Serve the `docs/` directory with a static server, e.g.:
   - `npx http-server docs`  (requires Node.js)
   - or `python -m http.server` inside the docs directory
2. Open http://localhost:8080 (or the port printed by the server) and play.

To deploy to GitHub Pages:
- This repository serves Pages from the `docs/` folder on the `main` branch. After this commit, the game will be available at https://sunderwelt.github.io/219-Empire/ once Pages finishes building (may take a minute).

Future work:
- Persist coins/buildings to localStorage
- Add more towns, shops, and raids
- Add mobile touch optimizations and responsive layout
