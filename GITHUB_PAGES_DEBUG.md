# GitHub Pages Deployment Debug

## Current Issue

The app is trying to load assets from:

```
https://stephenburks.github.io/stephenburks/spell-deck/static/js/main.19284eba.js
```

But it should be loading from:

```
https://stephenburks.github.io/spell-deck/static/js/main.19284eba.js
```

The extra `/stephenburks/` in the path suggests a configuration mismatch.

## Possible Causes & Solutions

### 1. Repository Name Mismatch

**Check your actual GitHub repository name:**

- Go to your GitHub repository
- Look at the URL: `https://github.com/stephenburks/[REPO-NAME]`
- The repository name might not be `spell-deck`

**If your repo name is different, update package.json:**

```json
"homepage": "https://stephenburks.github.io/[ACTUAL-REPO-NAME]"
```

### 2. GitHub Pages Source Configuration

**Check GitHub Pages settings:**

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Ensure:
    - Source: "Deploy from a branch"
    - Branch: `gh-pages` (not `main` or `master`)
    - Folder: `/ (root)`

### 3. Clean Deployment

**Try a complete clean deployment:**

```bash
# Delete the gh-pages branch locally and remotely
git branch -D gh-pages
git push origin --delete gh-pages

# Clean build and redeploy
rm -rf build
rm -rf node_modules/.cache
npm run build
npm run deploy
```

### 4. Alternative: Use Different Repository Name

**If the issue persists, try updating to match the expected path:**

```json
"homepage": "https://stephenburks.github.io/stephenburks/spell-deck"
```

### 5. Check Built Files

**Verify the build output:**

1. Run `npm run build`
2. Open `build/index.html`
3. Check the asset paths in the HTML - they should match your expected URL structure

## Quick Test Commands

**1. Check your current repository name:**

```bash
git remote -v
```

**2. Rebuild and redeploy:**

```bash
npm run build
npm run deploy
```

**3. Check deployment status:**

- Go to your repository → Actions tab
- Look for gh-pages deployment status

## Expected File Structure After Build

Your `build/index.html` should contain paths like:

```html
<script src="/spell-deck/static/js/main.19284eba.js"></script>
<link href="/spell-deck/static/css/main.ce7ecfcb.css" rel="stylesheet" />
```

NOT:

```html
<script src="/stephenburks/spell-deck/static/js/main.19284eba.js"></script>
```
