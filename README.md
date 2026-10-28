# Gateway Construction website

Static site: plain HTML, CSS and JavaScript with no framework or bundler. Open `index.html` in a browser, or upload the folder to any web host.

## Editing

- **Pages** are generated. Edit the sources in `_src/pages/`, or the shared parts in `_src/partials/` (nav, footer, logo and icon sprite). Then run `python _src/build.py` to rewrite the root `*.html` files. Don't edit the root HTML directly.
- **Projects** (the cards, gallery lightbox, filters, map pins and sector chart) all come from `assets/js/data.js`. To add a project, put its photos in `assets/img/projects/` and add an entry.
- **Styles** live in `assets/css/style.css`. The design tokens (colours, radii, easing, fonts) are at the top.

## Tools (`_src/tools/`)

- `optimise_images.py <raw_dir> <downloads_dir> <assets/img>` converts photos to WebP at 1600w and 800w (`-sm`).
- `render3d.py <out_dir> [beam arch blocks pipe cone]` ray-marches the 3D construction objects (`obj-*.webp`). Poses and materials are in the `OBJECTS` table.

- `hero_images.py <raw_dir> <downloads_dir> <assets/img/hero>` exports hero-grade photos (full resolution, light sharpening, q88).
- `build_map.py <adm0.geojson> <adm1.geojson> assets/js/zim-geo.js` bakes Zimbabwe's border and provinces (geoBoundaries / ZIMSTAT) into SVG paths for the map.

## Design rules

- Colours are white, black and the logo green `#066739`. Every other green in `style.css` is a direct tint or shade of it. There is no lime.
- Every hover effect has a touch twin (`.is-inview`), which turns on while an element crosses the middle of the screen.
- On mobile, tiles stay two up, prose goes one up, and steps become lists. Copy is written to fit those layouts, so check line counts at 390px after any copy change.

## Deployment

Hosted on Render as a static site from `main` (https://gateway-construction.onrender.com). Every push to `main` redeploys automatically.

## Notes

- The contact form opens the visitor's email app, addressed to qs@gatewayconstruction.co.zw. To receive submissions without that step, point the form at a service such as Formspree or Netlify Forms.
- The logo is redrawn as an SVG (`gw-mark` in `_src/partials/sprite.html`), because the supplied PNG is only 83×72px.
