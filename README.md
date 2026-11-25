# Product manager portfolio

Static site for GitHub Pages: plain HTML and CSS, no build step, same setup as the LittleLeap page.

- `index.html`: all content
- `styles.css`: light and dark themes
- `og.png`: link preview image
- `notes/`: short articles
- `site.js`: optional motion (Motion for reveals and number tweens, Anime.js for diagram lines and chart bars); respects reduced-motion and the page works without it
- `vendor/`: self-hosted Motion 14.11.1 and Anime.js 4.5.0 (MIT), so no CDN is needed
- `.nojekyll`: serve files as they are

## Publish

Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.

## Custom domain

The site is served at https://www.dellanna.pm (GitHub redirects dellanna.pm to it). The `CNAME` file holds the domain, and the `og:image` URLs point to it. DNS: apex A/AAAA records to the GitHub Pages IPs, `www` CNAME to `mkda.github.io`. Under Settings → Pages, keep the custom domain set and tick Enforce HTTPS.

GitHub Pages rebuilds on every push to `main`. If a push does not show up within a few minutes, check the Actions tab for a "pages build and deployment" run.

## Search engines

Every page carries `<meta name="robots" content="noindex, nofollow">` for now. Remove it from each HTML file when the site should be indexed. Don't add a robots.txt block at the same time, or crawlers won't see the change.
