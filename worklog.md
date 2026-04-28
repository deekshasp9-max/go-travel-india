---
Task ID: 1
Agent: Main Agent
Task: Fix Local Rides page client-side crash

Work Log:
- Investigated all relevant files: rides-page.tsx, ride-map.tsx, layout.tsx, globals.css
- Identified root cause: RideMap was imported directly without `next/dynamic({ ssr: false })`, causing SSR crash
- Also found: CDN-based leaflet loading via script tag was unreliable in sandbox environment
- Also found: CSS integrity hash on CDN link could prevent CSS loading

Stage Summary:
- Rewrote ride-map.tsx: Uses `import('leaflet')` from npm package (dynamic import in useEffect), proper loading/error states, all browser APIs inside useEffect
- Fixed rides-page.tsx: Wrapped RideMap import in `next/dynamic({ ssr: false })` with loading fallback
- Fixed layout.tsx: Removed integrity hash from leaflet CSS CDN link
- Reverted globals.css: Removed potentially broken `@import "leaflet/dist/leaflet.css"`
- Lint passes with no errors, dev server compiles and serves successfully (GET / 200)
