# Product manager portfolio

Static site for GitHub Pages: plain HTML and CSS, no build step, same setup as the LittleLeap page.

- `index.html`: all content
- `styles.css`: light and dark themes
- `og.png`: link preview image
- `.nojekyll`: serve files as they are

## Publish

Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.

## Custom domain (later)

Not set up yet. When the domain goes live, also change the `og:image` URL in `index.html` to the new domain. When ready: add a `CNAME` file containing `dellanna.pm`, set the domain under Settings → Pages, and point DNS (apex A/AAAA records to the GitHub Pages IPs, `www` CNAME to `mkda.github.io`).
