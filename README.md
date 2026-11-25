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
