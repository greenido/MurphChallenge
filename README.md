# 💪 Murph Challenge Tracker

A beautiful, modern Progressive Web App (PWA) for tracking the Murph Challenge workout. Built with vanilla JavaScript and Tailwind CSS.

![Murph Challenge Tracker](https://img.shields.io/badge/Murph-Challenge_Tracker-065f46?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nd2hpdGUnPjxwYXRoIGQ9J00xMyAxMFYzTDQgMTRoN3Y3bDktMTFoLTd6Jy8+PC9zdmc+)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen?style=for-the-badge)

## 🎖️ What is the Murph Challenge?

The Murph Challenge is a workout performed on Memorial Day to honor **Lt. Michael P. Murphy**, a Navy SEAL who was killed in Afghanistan in 2005. It was his favorite workout, originally called "Body Armor."

### Standard Murph Structure:
1. **1-mile run**
2. **100 pull-ups**
3. **200 push-ups**
4. **300 squats**
5. **1-mile run**

*Optional: Wear a 20 lb vest (14 lb for women) for the "Rx" version.*

## ✨ Features

- **📱 Progressive Web App** - Install on your device for offline use
- **⏱️ Optional Timer** - Track your time with pause/resume functionality
- **🏃 Half Murph Mode** - 50% of all exercises for beginners
- **💾 Auto-Save Progress** - Never lose your workout data
- **🌙 Dark/Light Theme** - Easy on the eyes, day or night
- **📊 Real-time Progress** - Visual progress bars for each exercise
- **🔄 Undo Function** - Made a mistake? Easily undo your last action
- **🎉 Celebration** - Confetti animation when you complete your workout!
- **📤 Share Results** - Copy to clipboard or email your stats
- **📲 Mobile-First Design** - Optimized for smartphones

## 🖥️ Screenshots

| Start Screen | Workout Screen | Completion |
|:---:|:---:|:---:|
| Choose timer & workout mode | Track your progress | Celebrate your achievement! |

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **Tailwind CSS** (CDN) - Utility-first styling
- **Vanilla JavaScript** - No frameworks, pure performance
- **Service Worker** - Offline capability
- **Web App Manifest** - PWA installation support
- **LocalStorage** - Persistent data storage

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in your browser - no build process required!

### Option 2: Local Server
```bash
# Using Python 3
python -m http.server 8080

# Using Node.js (with npx)
npx serve

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## 📱 Installing as a PWA

1. Open the app in Chrome, Safari, or any PWA-compatible browser
2. Look for the "Install" or "Add to Home Screen" option
3. Follow the prompts to install
4. Enjoy native app-like experience!

## 🌐 Deploying to GitHub Pages

GitHub Pages is a free hosting service that allows you to deploy static websites directly from a GitHub repository. Here's how to deploy the Murph Challenge Tracker:

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **+** icon in the top right → **New repository**
3. Name your repository (e.g., `murph-challenge` or `MurphChallenge`)
4. Choose **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2: Push Your Code to GitHub

```bash
# Navigate to your project directory
cd /path/to/MurphChallenge

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Murph Challenge Tracker"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

> **Note:** Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (tab at the top)
3. Scroll down to **Pages** in the left sidebar (under "Code and automation")
4. Under **Source**, select **Deploy from a branch**
5. Under **Branch**, select `main` and `/ (root)`
6. Click **Save**

### Step 4: Access Your Deployed App

After a few minutes, your app will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

> **Tip:** Check the **Actions** tab in your repository to see the deployment progress.

### Step 5: Update the PWA Manifest (Important!)

After deploying, update the `start_url` in `manifest.json` to match your GitHub Pages URL:

```json
{
  "start_url": "/YOUR_REPO_NAME/",
  ...
}
```

Then commit and push the change:
```bash
git add manifest.json
git commit -m "Update manifest for GitHub Pages"
git push
```

### Troubleshooting GitHub Pages

| Issue | Solution |
|-------|----------|
| 404 Error | Wait a few minutes for deployment to complete, or check the Actions tab |
| CSS/JS not loading | Ensure all file paths are relative (no leading `/`) |
| PWA not installing | Update `manifest.json` start_url and icon paths |
| Changes not appearing | Hard refresh (Ctrl+Shift+R) or clear browser cache |

## 📁 Project Structure

```
MurphChallenge/
├── index.html          # Main HTML file with all screens
├── manifest.json       # PWA manifest configuration
├── sw.js              # Service Worker for offline support
├── README.md          # This file
└── js/
    ├── app.js         # Main application logic
    ├── confetti.js    # Celebration animation
    ├── storage.js     # LocalStorage management
    └── timer.js       # Timer functionality
```

## 🎯 How to Use

1. **Start Screen**
   - Toggle **Timer** on/off based on preference
   - Enable **Half Murph** for a shorter workout
   - Click **Start Murph** to begin

2. **During Workout**
   - Tap **checkmark** to complete mile runs
   - Use **+1, +5, +10** buttons to count reps
   - Use **Undo** if you made a counting mistake
   - **Pause/Resume** timer as needed
   - Progress auto-saves - feel free to close and resume later!

3. **Completion**
   - View your final time and stats
   - **Copy** or **Email** your results to share
   - Start a **New Workout** when ready

## 🔧 Customization

### Changing Colors
Edit the Tailwind config in `index.html`:
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        murph: {
          primary: '#065f46',   // Main green
          accent: '#10b981',    // Accent green
          dark: '#022c22',      // Dark green
          light: '#d1fae5',     // Light green
        }
      }
    }
  }
}
```

### Adding More Exercises
Modify the `getDefaultState()` function in `js/storage.js` to add or modify sections.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Lt. Michael P. Murphy** - In honor of his service and sacrifice
- The CrossFit community for keeping the Murph tradition alive
- All service members who have made the ultimate sacrifice

---

<p align="center">
  <strong>"In honor of Lt. Michael P. Murphy, who made the ultimate sacrifice."</strong>
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/greenido">greenido</a>
</p>
