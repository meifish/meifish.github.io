# AI Alchemy blog

A plain static blog. GitHub Pages builds it automatically (it uses Jekyll behind
the scenes).

## What's where

| Path | What it is |
|---|---|
| `index.html` | Homepage. Lists every post from `_data/posts.yml`. |
| `_data/posts.yml` | **The post list.** One entry per post, newest first. |
| `posts/<folder>/` | Each post, exactly as it was built (its `index.html`, `img/`, `live/`…). |
| `feed.xml` | RSS feed, generated from the same post list. |
| `subscribe/index.html` | Subscribe page (email form + RSS). |
| `_config.yml` | Site title, description and web address. |
| `assets/site.css` | Styles for homepage and subscribe page. |

## Adding a new post (2 steps)

1. Drop the post's folder into `posts/`, e.g. `posts/some-skill-demo/`
   (it must contain an `index.html`).
2. Add an entry at the **top** of `_data/posts.yml`:

   ```yaml
   - title: "Your fun headline"
     folder: some-skill-demo
     date: 2026-10-05
     skill: some-skill
     summary: "One or two sentences for the homepage card and the email."
     cover: img/some-screenshot.png
   ```

Commit and push. The homepage, RSS feed and email subscribers all pick it up.

Nice-to-have: at the top of the post's `<head>` include
`<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1">`,
and a link back home such as `<a href="../../">← AI Alchemy</a>`.

## Turning on GitHub Pages

1. On GitHub, create a new **public** repository named **`meifish.github.io`**.
   (Any other name works too, but then set `baseurl: "/that-name"` in `_config.yml`
   and the site lives at `meifish.github.io/that-name/`.)
2. Upload everything in this folder to the repo root (drag and drop on the repo page
   works: "Add file" → "Upload files"), then commit.
3. Repo **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main**, folder **/ (root)** → Save.
4. Wait a minute or two, then open https://meifish.github.io.

## Email subscriptions with follow.it (free)

1. Go to https://follow.it and choose the option to add follow.it to your own site.
2. Enter your feed address: `https://meifish.github.io/feed.xml`
   (the site must be live first, so do the Pages steps above before this).
3. Customize the sign-up form if you like, then copy the **HTML** form code it gives you.
4. Open `subscribe/index.html`, paste the code where it says
   `FOLLOW.IT FORM GOES HERE`, and delete the placeholder `<div>` underneath.
5. Commit. follow.it checks the feed and emails subscribers when a new post appears.
