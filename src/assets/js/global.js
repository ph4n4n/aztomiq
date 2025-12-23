document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  // Update button icon based on current theme
  const updateIcon = (theme) => {
    const iconName = theme === 'dark' ? 'sun' : 'moon';
    toggleBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
    if (window.lucide) lucide.createIcons();
  };

  updateIcon(htmlEl.getAttribute('data-theme'));

  toggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
  });

  console.log('AZtomiq Global JS Loaded');

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(req => console.log('SW Registered!', req.scope))
        .catch(err => console.error('SW Registration Failed', err));
    });
  }
  // --- Global Navigation & Mega Menu Logic ---
  const navItems = document.querySelectorAll('.nav-item');

  // 1. Logo/Menu Toggle
  navItems.forEach(item => {
    const toggle = item.querySelector('.dropdown-toggle');
    const menu = item.querySelector('.dropdown-menu');

    if (toggle && menu) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close other open menus first
        document.querySelectorAll('.dropdown-menu.show').forEach(m => {
          if (m !== menu) m.classList.remove('show');
        });

        menu.classList.toggle('show');
        toggle.setAttribute('aria-expanded', menu.classList.contains('show'));
      });
    }
  });

  // 2. Mega Menu Category Toggles (Expand/Collapse)
  document.querySelectorAll('.mega-header').forEach(header => {
    header.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent closing the menu itself
      e.preventDefault();
      const expanded = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', !expanded);
    });
  });

  // 3. Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
        const toggle = menu.parentElement.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // --- Search Modal Logic ---
  const searchBtn = document.getElementById('search-btn');
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const closeSearch = document.getElementById('close-search');
  const searchOverlay = document.querySelector('.search-overlay');

  let toolsData = [];
  let i18nData = {};
  try {
    const toolsScript = document.getElementById('tools-data');
    if (toolsScript) toolsData = JSON.parse(toolsScript.textContent);

    const i18nScript = document.getElementById('i18n-data');
    if (i18nScript) i18nData = JSON.parse(i18nScript.textContent);
  } catch (e) { console.error('Error loading search/i18n data', e); }

  const openSearch = () => {
    searchModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 50);
    renderResults('');
  };

  const hideSearch = () => {
    searchModal.classList.remove('show');
    document.body.style.overflow = '';
    searchInput.value = '';
  };

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  const searchBtnMobile = document.getElementById('search-btn-mobile');
  if (searchBtnMobile) searchBtnMobile.addEventListener('click', openSearch);

  const headerSearchBox = document.getElementById('header-search-box');
  if (headerSearchBox) {
    headerSearchBox.addEventListener('click', openSearch);

    // Smart visibility for Homepage Hero Search
    const heroSearch = document.querySelector('.search-box-hero');
    if (heroSearch) {
      // Check initial state
      headerSearchBox.classList.add('search-hidden');

      window.addEventListener('scroll', () => {
        const rect = heroSearch.getBoundingClientRect();
        // If hero search bottom is above viewport (scrolled past)
        if (rect.bottom < 0) {
          headerSearchBox.classList.remove('search-hidden');
        } else {
          headerSearchBox.classList.add('search-hidden');
        }
      }, { passive: true });
    }
  }

  if (closeSearch) closeSearch.addEventListener('click', hideSearch);
  if (searchOverlay) searchOverlay.addEventListener('click', hideSearch);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') hideSearch();
  });

  // Search Logic
  searchInput.addEventListener('input', (e) => {
    renderResults(e.target.value.trim());
  });

  function renderResults(query) {
    if (!searchResults) return;

    const q = query.toLowerCase();
    const filtered = toolsData.filter(tool => {
      if (!q) return true;
      return tool.title.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q);
    }).slice(0, 10);

    if (filtered.length === 0) {
      const emptyMsg = i18nData.search_no_results || 'No results for';
      searchResults.innerHTML = `<div class="search-no-results">${emptyMsg} "${query}"</div>`;
      return;
    }

    searchResults.innerHTML = filtered.map((tool, index) => `
      <a href="${tool.link}" class="search-result-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
        <div class="result-icon"><i data-lucide="${tool.icon}"></i></div>
        <div class="result-info">
          <span class="result-title">${tool.title}</span>
          <span class="result-desc">${tool.desc}</span>
        </div>
        <span class="result-cat">${tool.category}</span>
      </a>
    `).join('');

    if (window.lucide) lucide.createIcons();

    // Handle Keyboard Navigation within results
    setupResultNavigation();
  }

  function setupResultNavigation() {
    let selectedIndex = 0;
    const items = searchResults.querySelectorAll('.search-result-item');

    searchInput.onkeydown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[selectedIndex].classList.remove('selected');
        selectedIndex = (selectedIndex + 1) % items.length;
        items[selectedIndex].classList.add('selected');
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[selectedIndex].classList.remove('selected');
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        items[selectedIndex].classList.add('selected');
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = searchResults.querySelector('.search-result-item.selected');
        if (selected) selected.click();
      }
    };
  }

  // --- Changelog Modal Logic ---
  const changelogBtn = document.getElementById('open-changelog');
  const changelogModal = document.getElementById('changelog-modal');
  const closeChangelog = document.getElementById('close-changelog');
  const changelogOverlay = document.getElementById('close-changelog-overlay');

  if (changelogBtn && changelogModal) {
    changelogBtn.addEventListener('click', () => {
      changelogModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });

    const hideChangelog = () => {
      changelogModal.classList.remove('show');
      document.body.style.overflow = '';
    };

    if (closeChangelog) closeChangelog.addEventListener('click', hideChangelog);
    if (changelogOverlay) changelogOverlay.addEventListener('click', hideChangelog);
  }

  // --- End Search & Changelog Logic ---

  // Track clicks on tool items (both in Mega Menu and Homepage Grid)
  document.querySelectorAll('.tool-item, .mega-link, .search-result-item').forEach(link => {
    link.addEventListener('click', (e) => {
      const url = link.getAttribute('href');
      trackUsage(url);

      // Close any open mega-menu if this was a menu click
      if (link.classList.contains('mega-link')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
          const toggle = menu.parentElement.querySelector('.dropdown-toggle');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
      }
    });
  });

  function trackUsage(toolUrl) {
    if (!toolUrl) return;
    try {
      const parts = toolUrl.split('/').filter(Boolean);
      const id = parts[parts.length - 1];
      const now = Date.now();

      // 1. Recently Used
      let recent = JSON.parse(localStorage.getItem('aztomiq_recent') || '{}');
      recent[id] = now;
      localStorage.setItem('aztomiq_recent', JSON.stringify(recent));

      // 2. Most Used (Personal)
      let usage = JSON.parse(localStorage.getItem('aztomiq_usage') || '{}');
      usage[id] = (usage[id] || 0) + 1;
      localStorage.setItem('aztomiq_usage', JSON.stringify(usage));

    } catch (e) { console.error('Tracking error', e); }
  }
  // --- Favorite Tools Logic (Star System) ---
  const FAVORITES_KEY = 'aztomiq_favorites';
  let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');

  function updateStars() {
    document.querySelectorAll('.star-btn').forEach(btn => {
      const id = btn.getAttribute('data-tool-id');
      const isActive = favorites.includes(id);
      btn.classList.toggle('active', isActive);
      const icon = btn.querySelector('i');
      if (icon && window.lucide) {
        // We just toggle the class, CSS handles the fill/color
      }
    });
  }

  function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    if (index === -1) {
      favorites.push(id);
    } else {
      favorites.splice(index, 1);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateStars();
    renderFavorites();
  }

  function renderFavorites() {
    const favoritesSection = document.getElementById('favorites-section');
    const favoritesGrid = document.getElementById('favorites-grid');
    if (!favoritesGrid) return;

    if (favorites.length === 0) {
      favoritesSection.style.display = 'none';
      return;
    }

    favoritesSection.style.display = 'block';

    // Find tool objects from toolsData
    const favoriteTools = favorites.map(id => toolsData.find(t => t.id === id)).filter(Boolean);

    favoritesGrid.innerHTML = favoriteTools.map(tool => {
      let modeClass = '';
      if (tool.mode === 'standard') modeClass = 'mode-standard-only';
      else if (tool.mode === 'advanced') modeClass = 'mode-advanced-only';

      return `
          <div class="tool-card-wrapper ${modeClass}">
            <div class="tool-card">
              <button class="star-btn active" data-tool-id="${tool.id}" aria-label="Remove from favorites" title="Remove from favorites">
                <i data-lucide="star" style="width: 14px; height: 14px; fill: currentColor;"></i>
              </button>
              
              <div class="tool-badge-row">
                 ${tool.highlight ? `<span class="tool-badge hot"><i data-lucide="sparkles" style="width: 12px; height: 12px;"></i> HOT</span>` : ''}
                 ${tool.status === 'not-ready' ? `<span class="tool-badge beta">BETA</span>` : ''}
              </div>

              <a href="${tool.link}" class="tool-link">
                <div class="tool-icon-wrap">
                  <i data-lucide="${tool.icon}" style="width: 32px; height: 32px;"></i>
                </div>
                <h3>${tool.title}</h3>
                <p>${tool.desc}</p>
              </a>
            </div>
          </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // Re-attach listeners to new buttons in favorites grid
    favoritesGrid.querySelectorAll('.star-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(btn.getAttribute('data-tool-id'));
      };
    });
  }

  // Global delegate for stars
  document.addEventListener('click', (e) => {
    const starBtn = e.target.closest('.star-btn');
    if (starBtn && !starBtn.closest('#favorites-grid')) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(starBtn.getAttribute('data-tool-id'));
    }
  });

  // Initial render
  updateStars();
  renderFavorites();

  // Final Lucide init (for any dynamically added or static icons missed)
  if (window.lucide) lucide.createIcons();

  // --- End Favorite Tools Logic ---
});

