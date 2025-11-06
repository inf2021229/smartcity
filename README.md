# Smart City Platform – app, site, thesis

Directory layout:
- `app/` the Mobile Application
- `site/` the Frontend and Backend
- `latex/` the LaTeX files of the Thesis pdf

## Commands

Install Node.js. For the mobile app, install the Ionic CLI. For Android builds, install Android Studio.

```bash
npm i -g @ionic/cli
```

### Mobile app

Open a terminal in the app folder:
```bash
cd app
npm install 
```
Run in locahost:
```bash
ionic serve
```
or Run to device:
```bash
npm run build
npx cap sync android
npx cap run android    #select the device when prompted
```

###  Website and Backend

Open a terminal in the site folder.
```bash
cd site/backend
npm install 
```
Run in locahost:
```bash
node server.js 
```
