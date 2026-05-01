// LinkedIn Profile Tracker v3.1.1 - The "No Undefined" Edition
// Optimized for nested promotions and single-role layouts

const getCleanText = (el) => {
  if (!el) return "";
  // Target the span that contains the actual text humans see
  const target = el.querySelector('span[aria-hidden="true"]') || el;
  return target.innerText.replace(/…\s*more|voir\s*plus/gi, "").trim();
};

function scrapeSection(title) {
  const header = Array.from(document.querySelectorAll("h2")).find((h) =>
    h.innerText.toLowerCase().includes(title.toLowerCase())
  );
  const section = header ? header.closest("section") : null;
  if (!section) return [];

  const results = [];
  const items = section.querySelectorAll(
    'li.artdeco-list__item, [componentkey^="entity-collection-item"]'
  );

  items.forEach((item) => {
    // 1. Role/Title Extraction
    const titleEl = item.querySelector(
      '.d5431a5b._3308f1bd, div[class*="_3308f1bd"], .mr1.t-bold span'
    );
    const roleTitle = getCleanText(titleEl);

    // 2. Metadata Extraction (Company, Date, Location)
    const metaLines = Array.from(item.querySelectorAll(".d5431a5b._1ab16eed, .t-14.t-normal span"))
      .map((el) => el.innerText.trim())
      .filter((t) => t.length > 0 && !/more|voir/i.test(t));

    // 3. Description Extraction
    const descEl = item.querySelector(
      '[data-testid="expandable-text-box"], .inline-show-more-text'
    );
    const description = getCleanText(descEl);

    if (!roleTitle) return;

    let company = "Not specified";
    let date = "";

    // --- THE FIX FOR UNDEFINED ---

    // Scenario A: Standard Role (Meta line 0 is usually the company)
    if (metaLines.length > 0) {
      // Check if the first line is actually the company or just a date
      if (!/\d{4}/.test(metaLines[0])) {
        company = metaLines[0].split("·")[0].trim();
      }
      date = metaLines.find((l) => /\d{4}/.test(l)) || "";
    }

    // Scenario B: Nested Promotions (The company name is the "Parent" header)
    // If 'company' is still unknown or matches the role, we look up the tree
    if (company === "Not specified" || company === roleTitle) {
      const parentContainer = item.closest("li")?.parentElement?.closest("li");
      if (parentContainer) {
        const parentHeader = parentContainer.querySelector('span[aria-hidden="true"]');
        if (parentHeader) company = parentHeader.innerText.trim();
      }
    }

    results.push({
      title: roleTitle,
      company: company,
      date: date,
      description: description,
    });
  });
  return results;
}

async function runTracker() {
  if (!window.location.href.includes("/in/")) return;

  console.log("Scrolling to render components...");
  for (let i = 0; i <= 3200; i += 800) {
    window.scrollTo({ top: i, behavior: "smooth" });
    await new Promise((r) => setTimeout(r, 1000));
  }

  const name = getCleanText(document.querySelector("h1")) || document.title.split("|")[0].trim();
  const headline = getCleanText(document.querySelector(".text-body-medium.break-words"));

  const entry = {
    url: window.location.href.split("?")[0],
    scrapedAt: new Date().toISOString(),
    nameOnPage: name,
    headline: headline,
    experiences: scrapeSection("Experience"),
    projects: scrapeSection("Project"),
  };

  chrome.storage.local.get(["profiles"], (res) => {
    let profiles = res.profiles || [];
    const idx = profiles.findIndex((p) => p.url === entry.url);
    if (idx >= 0) profiles[idx] = entry;
    else profiles.push(entry);

    // Add this inside content.js at the end of runTracker() right after chrome.storage.local.set
    chrome.storage.local.set({ profiles }, () => {
      // Remove old toast if it exists
      document.getElementById("lpt-big-toast")?.remove();

      const toast = document.createElement("div");
      toast.id = "lpt-big-toast";

      // Styling it to look like a native, highly confident LinkedIn success popup
      toast.style.cssText = `
        position: fixed; 
        bottom: 24px; 
        left: 24px; 
        z-index: 2147483647; 
        background: #ffffff; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08); 
        padding: 16px 20px; 
        display: flex; 
        align-items: center; 
        gap: 16px; 
        font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        border-left: 6px solid #057642; 
        color: rgba(0,0,0,0.9);
        min-width: 300px;
        animation: slideIn 0.3s ease-out forwards;
    `;

      // Large Green Checkmark SVG + Bold Text
      toast.innerHTML = `
        <div style="background:#e6f3ed; border-radius:50%; padding:6px; display:flex; align-items:center; justify-content:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#057642"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        <div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Data Captured!</div>
            <div style="font-size: 14px; color: rgba(0,0,0,0.6);">Saved <strong>${entry.nameOnPage}</strong><br>${entry.experiences.length} Experiences & ${entry.projects.length} Projects</div>
        </div>
    `;

      // Keyframe animation injected
      const style = document.createElement("style");
      style.innerHTML = `@keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
      document.head.appendChild(style);

      document.body.appendChild(toast);

      // Auto-remove after 4 seconds
      setTimeout(() => {
        toast.style.transition = "opacity 0.4s ease";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
      }, 4000);
    });
  });
}

runTracker();
