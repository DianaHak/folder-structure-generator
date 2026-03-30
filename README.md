# Folder Structure Generator

A simple static browser tool for creating and exporting ASCII folder trees for GitHub READMEs, docs, and project overviews.

## Features

- Add root folders and files
- Add nested folders and files
- Rename items by double-clicking
- Delete items
- Drag and drop to reorganize
- Import a local folder using the browser
- Copy ASCII output
- Download output as `.txt`
- Static app, easy to host on GitHub Pages

## Run locally

Just open `index.html` in your browser.

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md`.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `(root)`
5. Save.
6. GitHub will publish your site with a public Pages URL.

## Notes

Folder upload uses the browser's directory selection support (`webkitdirectory`), which works in modern Chromium-based browsers and several others, but behavior can vary a bit by browser.
