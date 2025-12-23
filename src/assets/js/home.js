document.addEventListener("DOMContentLoaded", () => {
  // Main Homepage Logic (View Toggle & Sorting)
  const toolGrids = document.querySelectorAll(".tools-grid");
  const viewToggleBtns = document.querySelectorAll("[data-view]");
  const sortSelect = document.getElementById("sort-select");

  // Only proceed if we are on the homepage (elements exist)
  if (toolGrids.length === 0) return;


  // --- 3. View Toggle Logic ---
  const savedView = localStorage.getItem("aztomiq_view_mode") || "grid";
  const savedSort = localStorage.getItem("aztomiq_sort_mode") || "default";

  applyView(savedView);
  if (sortSelect) {
    sortSelect.value = savedSort;
    applySort(savedSort);
  }

  viewToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      applyView(view);
      localStorage.setItem("aztomiq_view_mode", view);
    });
  });

  function applyView(viewMode) {
    toolGrids.forEach((grid) => {
      if (viewMode === "list") grid.classList.add("list-view");
      else grid.classList.remove("list-view");
    });
    viewToggleBtns.forEach((btn) => {
      if (btn.dataset.view === viewMode) {
        btn.classList.add("active");
        btn.style.backgroundColor = "var(--primary-color)";
        btn.style.color = "white";
      } else {
        btn.classList.remove("active");
        btn.style.backgroundColor = "transparent";
        btn.style.color = "var(--text-color)";
      }
    });
  }

  // --- 4. Sort Logic ---
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const sortMode = e.target.value;
      applySort(sortMode);
      localStorage.setItem("aztomiq_sort_mode", sortMode);
    });
  }

  function applySort(sortMode) {
    const recent = JSON.parse(localStorage.getItem('aztomiq_recent') || '{}');
    const usage = JSON.parse(localStorage.getItem('aztomiq_usage') || '{}');
    // Mock global popularity if provided in DOM later, for now defaults to 0
    // We can assume static popularity is not yet available in DOM dataset.

    toolGrids.forEach((grid) => {
      const items = Array.from(grid.children);

      // Save original index
      if (!grid.dataset.indexed) {
        items.forEach((item, index) => item.dataset.originalIndex = index);
        grid.dataset.indexed = "true";
      }

      items.sort((a, b) => {
        // Extract ID for usage lookup
        // Href is safe bet if we can parse it, or we rely on text content for AZ
        // Better: let's try to infer ID from href
        const getID = (el) => {
          const href = el.getAttribute('href');
          if (!href) return '';
          const parts = href.split('/').filter(Boolean);
          return parts[parts.length - 1];
        };

        const idA = getID(a);
        const idB = getID(b);

        if (sortMode === "az") {
          const titleA = a.querySelector("h3")?.innerText.trim() || "";
          const titleB = b.querySelector("h3")?.innerText.trim() || "";
          return titleA.localeCompare(titleB);
        } else if (sortMode === "za") {
          const titleA = a.querySelector("h3")?.innerText.trim() || "";
          const titleB = b.querySelector("h3")?.innerText.trim() || "";
          return titleB.localeCompare(titleA);
        } else if (sortMode === "recent") {
          // Descending timestamp
          const timeA = recent[idA] || 0;
          const timeB = recent[idB] || 0;
          return timeB - timeA;
        } else if (sortMode === "popular") {
          // Descending count
          const countA = usage[idA] || 0;
          const countB = usage[idB] || 0;
          return countB - countA;
        } else {
          // Default
          return parseInt(a.dataset.originalIndex) - parseInt(b.dataset.originalIndex);
        }
      });
      items.forEach((item) => grid.appendChild(item));
    });
  }

  // --- 5. Hero Search Logic (Bridge to Global Search) ---
  const homeSearch = document.getElementById("home-search");
  if (homeSearch) {
    homeSearch.addEventListener("focus", () => {
      homeSearch.blur();
      document.getElementById("header-search-box")?.click() ||
        document.getElementById("search-btn")?.click() ||
        document.getElementById("search-btn-mobile")?.click();
    });
  }

  // --- 6. Category Filter Logic ---
  const catFilter = document.getElementById("category-filter");
  if (catFilter) {
    catFilter.addEventListener("change", (e) => {
      const cat = e.target.value;
      const sections = document.querySelectorAll(".category-section");
      sections.forEach(sec => {
        if (cat === "all" || sec.id === cat + "-tools") {
          sec.style.display = "block";
        } else {
          sec.style.display = "none";
        }
      });
    });
  }
});
