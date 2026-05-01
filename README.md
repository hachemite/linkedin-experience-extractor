#  LinkedIn Experience ExTRACTOR | Local-First Experience Extractor

Stop copy-pasting LinkedIn profiles manually. Extract nested experience, projects, and metadata into clean CSVs or json automatically—**100% privately, securely, and for free.**

![UI Screenshot](ui-screenshot.png) 


![Toast Screenshot](link-to-your-toast-screenshot.png)


## 📖 The Story (Why I built this)
I built this tool out of pure necessity. As a student, I was desperately looking for a strict two-month internship. I realized the only way to find opportunities was to analyze the career paths of alumni and build a database of companies and recruiters. 

But there was a huge problem: every scraping tool out there was either hidden behind an expensive paywall, sent my data to a sketchy third-party database, or used aggressive bot tactics that risked getting my LinkedIn account banned. 

I just needed something that worked while I naturally browsed. So, I built this. It started as a quick "vibe-coded" script to solve my internship hunt, but it evolved into a highly robust, privacy-first extraction tool.

## ✨ Why this is different (The "No-Ban" Guarantee)

The biggest selling point of this extension is what it **doesn't** have: a backend. 

* 🛡️ **100% Privacy (Serverless):** This extension runs entirely locally in your browser using `chrome.storage.local`. Your scraped leads and data are never sent to a random database or cloud server. You own your data.
* 🚫 **Zero Ban Risk:** Unlike API scrapers that trigger LinkedIn's bot detection, this tool extracts data straight from the DOM (what you actually see on your screen) while you browse normally. It behaves exactly like a human user, keeping you safe from ToS violations.
* 💸 **Completely Free:** No API keys, no subscriptions, no premium tiers. 

## ⚙️ How it Works (Under the Hood)
LinkedIn is a heavy Single Page Application (SPA) that uses heavily obfuscated CSS classes and aggressive **Lazy Loading** (sections don't exist in the code until you look at them). 

To solve this, the extension uses:
1. **Automated Smooth Scrolling:** When you land on a profile, the script seamlessly scrolls down and back up to force LinkedIn to render the "Experience" and "Project" React components.
2. **Deep DOM Extraction:** It bypasses the dummy tags LinkedIn uses for screen-readers and targets `span[aria-hidden="true"]` to grab the cleanest possible text.
3. **Parent-Climbing Logic:** It intelligently handles LinkedIn's nested "Promotions" layout, ensuring company names are mapped correctly even if a user has held 5 different roles at the same company.

## 🚀 How to Install (Developer Mode)

Since this is a free, open-source tool, you can install it directly into Chrome in 30 seconds:

1. **Download the code:** Click the green "Code" button at the top of this repository and select **Download ZIP**.
2. **Extract the ZIP file** to a folder on your computer.
3. Open Google Chrome and go to `chrome://extensions/` in your URL bar.
4. Turn on **Developer mode** (the toggle switch in the top right corner).
5. Click the **Load unpacked** button in the top left.
6. Select the folder where you extracted the extension files.
7. Pin the extension to your toolbar and start browsing!

## 🛠️ Usage

1. Go to any LinkedIn profile (e.g., `https://www.linkedin.com/in/some-profile/`).
2. **Wait 3-4 seconds.** You will see the page automatically scroll down to load the hidden data.
3. A green **"Data Captured!"** toast will appear in the bottom left corner of your screen.
4. Click the Extension Icon in your Chrome toolbar to view your saved profiles.
5. Click **Download CSV** or **JSON** to export your leads instantly.

## 🤝 Contributing
Whether you're a recruiter, a sales professional, or another student hunting for an internship, feel free to use this code, fork it, and submit Pull Requests! 

## 📄 License
This project is licensed under the MIT License - meaning you can use it, modify it, and distribute it for free.