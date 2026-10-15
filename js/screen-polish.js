/* Goodbye Goth: targeted screen presentation polish for Testing4.
   This file changes screen presentation only. Existing gameplay handlers remain in place. */
(() => {
  'use strict';

  function applyScreenPolish() {
    // Keep the existing knockout recovery behaviour, changing only its visible label.
    const backToMapButton = document.getElementById('back-map');
    if (backToMapButton && backToMapButton.textContent.trim() !== 'KEEP EXPLORING') {
      backToMapButton.textContent = 'KEEP EXPLORING';
    }

    // The gate cutscene is created dynamically by level1.js, so style its generated
    // status element after it exists. Hide ordinary loading/format-fallback messages,
    // but retain a visible message if the video genuinely fails to load.
    const cutscene = document.getElementById('level1-cutscene2-overlay');
    if (cutscene) {
      cutscene.classList.add('gg-fullscreen-cutscene');
      const status = Array.from(cutscene.querySelectorAll('div')).find((element) => {
        const value = element.textContent.trim();
        return value === 'LOADING CUTSCENE...' ||
          value === 'Trying alternate video format...' ||
          value.startsWith('Cutscene could not be played.');
      });
      if (status) {
        status.classList.add('gg-cutscene-status');
        const message = status.textContent.trim();
        if (message === 'LOADING CUTSCENE...' || message === 'Trying alternate video format...') {
          status.style.display = 'none';
        } else {
          status.style.display = 'block';
        }
      }
    }
  }

  const observer = new MutationObserver(applyScreenPolish);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

  applyScreenPolish();
})();
