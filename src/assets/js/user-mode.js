(function () {
  const MODE_KEY = 'aztomiq_user_mode';
  const modes = { STANDARD: 'standard', ADVANCED: 'advanced' };

  // Get saved mode or default to standard
  let currentMode = localStorage.getItem(MODE_KEY) || modes.STANDARD;

  // Apply mode to document
  function applyMode(mode) {
    document.documentElement.setAttribute('data-user-mode', mode);
    localStorage.setItem(MODE_KEY, mode);

    // Update toggle button if exists
    const toggleBtn = document.getElementById('mode-toggle');
    if (toggleBtn) {
      const isAdvanced = mode === modes.ADVANCED;
      toggleBtn.classList.toggle('is-advanced', isAdvanced);
      toggleBtn.setAttribute('aria-label', isAdvanced ? 'Switch to Standard Mode' : 'Switch to Advanced Mode');
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('aztomiq-mode-change', { detail: { mode } }));
  }

  // Initial apply
  applyMode(currentMode);

  // Expose to window
  window.AZtomiqMode = {
    get: () => currentMode,
    set: (mode) => {
      currentMode = mode;
      applyMode(mode);
    },
    toggle: () => {
      const newMode = currentMode === modes.STANDARD ? modes.ADVANCED : modes.STANDARD;
      window.AZtomiqMode.set(newMode);
    },
    MODES: modes
  };

  // Wait for DOM to attach listener
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('mode-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.AZtomiqMode.toggle();
      });
      // Re-apply to ensure UI is in sync
      applyMode(currentMode);
    }
  });
})();
