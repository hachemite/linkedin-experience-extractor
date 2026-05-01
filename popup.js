let allProfiles = [];

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateStats(profiles) {
  const expCount = profiles.reduce((s, p) => s + (p.experiences?.length || 0), 0);
  const projCount = profiles.reduce((s, p) => s + (p.projects?.length || 0), 0);
  const companies = new Set();
  profiles.forEach((p) =>
    (p.experiences || []).forEach((e) => {
      if (e.company) companies.add(e.company);
    })
  );

  document.getElementById("s-all").textContent = profiles.length;
  document.getElementById("s-exp").textContent = expCount;
  document.getElementById("s-proj").textContent = projCount;
  document.getElementById("s-cos").textContent = companies.size;

  const last = profiles.reduce((l, p) => (!l || p.scrapedAt > l ? p.scrapedAt : l), null);
  document.getElementById("last-saved").textContent = last ? fmt(last) : "—";
}

function render(profiles, q) {
  const list = document.getElementById("list");

  let filtered = profiles.filter((p) => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return (
      (p.nameOnPage || "").toLowerCase().includes(ql) ||
      (p.headline || "").toLowerCase().includes(ql) ||
      (p.experiences || []).some(
        (e) =>
          (e.company || "").toLowerCase().includes(ql) ||
          (e.title || e.role || "").toLowerCase().includes(ql) ||
          (e.description || "").toLowerCase().includes(ql)
      ) ||
      (p.projects || []).some((pr) => (pr.title || "").toLowerCase().includes(ql))
    );
  });

  filtered.sort((a, b) => b.scrapedAt.localeCompare(a.scrapedAt));

  if (!filtered.length) {
    list.innerHTML = `<div class="empty">No results found for "${q}".</div>`;
    return;
  }

  // Generate exact layout from screenshot
  list.innerHTML = filtered
    .map((p) => {
      const exps = (p.experiences || [])
        .map(
          (e) => `
      <div class="exp-item">
        <span class="exp-role">${e.title || e.role || "Role not specified"}</span>
        <span class="exp-co">${e.company || "Unknown Company"}</span>
        ${e.date ? `<span class="exp-meta">${e.date}</span>` : ""}
        ${e.description ? `<div class="exp-desc">${e.description.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</div>` : ""}
      </div>
    `
        )
        .join("");

      const projs = (p.projects || [])
        .map(
          (pr) => `
      <div class="exp-item">
        <span class="exp-role">${pr.title || pr.role}</span>
        ${pr.date ? `<span class="exp-meta">${pr.date}</span>` : ""}
        ${pr.description ? `<div class="exp-desc">${pr.description.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</div>` : ""}
      </div>
    `
        )
        .join("");

      return `
    <div class="card">
      <div class="card-top">
        <div class="card-name"><a href="${p.url}" target="_blank">${p.nameOnPage}</a></div>
        <span class="badge">Captured</span>
      </div>
      ${p.headline ? `<div class="headline">${p.headline}</div>` : ""}
      
      ${exps.length > 0 ? `<div class="section-head">EXPERIENCE</div>${exps}` : ""}
      ${projs.length > 0 ? `<div class="section-head">PROJECTS</div>${projs}` : ""}
      ${exps.length === 0 && projs.length === 0 ? `<div class="empty" style="padding:10px;">No profile data captured</div>` : ""}
    </div>`;
    })
    .join("");
}

function load() {
  chrome.storage.local.get(["profiles"], ({ profiles = [] }) => {
    allProfiles = profiles;
    updateStats(profiles);
    render(profiles, document.getElementById("search").value);
  });
}

// Export CSV
document.getElementById("btn-csv").addEventListener("click", () => {
  if (allProfiles.length === 0) return;
  const rows = [
    ["Name", "URL", "Headline", "Role", "Company", "Date", "Description", "Scraped At"],
  ];
  for (const p of allProfiles) {
    if (!(p.experiences || []).length) {
      rows.push([p.nameOnPage, p.url, p.headline || "", "", "", "", "", p.scrapedAt]);
    } else {
      for (const e of p.experiences) {
        rows.push([
          p.nameOnPage,
          p.url,
          p.headline || "",
          e.role || e.title,
          e.company,
          e.date || "",
          (e.description || "").replace(/\n/g, " "),
          p.scrapedAt,
        ]);
      }
    }
  }
  const csv = rows
    .map((r) => r.map((c) => `"${(c || "").toString().replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  chrome.downloads.download({ url: URL.createObjectURL(blob), filename: "linkedin_export.csv" });
});

// JSON Export
document.getElementById("btn-json").addEventListener("click", () => {
  if (allProfiles.length === 0) return;
  const blob = new Blob([JSON.stringify(allProfiles, null, 2)], { type: "application/json" });
  chrome.downloads.download({ url: URL.createObjectURL(blob), filename: "linkedin_export.json" });
});

// Clear
document.getElementById("btn-clear").addEventListener("click", () => {
  if (allProfiles.length === 0) return;
  if (confirm("Delete all data? This cannot be undone.")) {
    chrome.storage.local.set({ profiles: [] }, load);
  }
});

document
  .getElementById("search")
  .addEventListener("input", (e) => render(allProfiles, e.target.value));

load();
setInterval(load, 2000);
