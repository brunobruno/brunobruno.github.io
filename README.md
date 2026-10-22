# Bruno Galati — Art, Code & Intelligence

A scroll-driven portfolio with three views, switchable from the pill at the top of the page:

- **Design** (`/`): a walk through art history (Lascaux, Brunelleschi, De Stijl, Op Art, Suprematism, Futurism, Pop, Rothko) and a reflection on craft and AI.
- **Tech** (`/?view=tech`): a flight through space — the evolution of tools, an interactive Earth with live World Bank data and the largest company per country, capital, technology, a live population clock and a procedural, clickable Moon.
- **Experimental** (`/?view=experimental`): a playground — a kaleidoscopic 3D vortex that ends in the word FUTURE, a globe of live frontend job openings, and a meshing gear train driven by scroll.

Built with React 19, Vite and Framer Motion (+ three.js, react-globe.gl and React Three Fiber, lazy-loaded for the Tech view). Deployed to https://brunobruno.github.io via GitHub Actions on every push to `main`.

Full technical documentation for humans and AI assistants: [`DOCUMENTATION.md`](./DOCUMENTATION.md).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

Copy and timeline content live in `src/data/content.js`.
