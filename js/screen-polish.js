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

    // The gate cutscene is created dynamically by level1.js. Show one complete
    // loading-bat illustration while the video is unavailable, then fade it away
    // as soon as playback actually begins. The play fallback and genuine error
    // message from the original cutscene remain intact.
    const cutscene = document.getElementById('level1-cutscene2-overlay');
    if (cutscene) {
      cutscene.classList.add('gg-fullscreen-cutscene');
      const frame = cutscene.firstElementChild;
      const video = cutscene.querySelector('#level1-cutscene2');
      let loadingArt = frame?.querySelector('.gg-cutscene-loading-art');

      if (frame && video && !loadingArt) {
        loadingArt = document.createElement('img');
        loadingArt.className = 'gg-cutscene-loading-art';
        loadingArt.src = 'assets/story/loading-bat.webp?v=1';
        loadingArt.alt = '';
        loadingArt.setAttribute('aria-hidden', 'true');
        frame.appendChild(loadingArt);

        video.addEventListener('playing', () => {
          loadingArt.classList.add('gg-loading-art-hidden');
        });

        // Covers the unlikely case where the browser starts the video before the
        // observer notices that the cutscene overlay was added to the page.
        if (!video.paused && !video.ended && video.readyState >= 3) {
          loadingArt.classList.add('gg-loading-art-hidden');
        }
      }

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
          loadingArt?.classList.add('gg-loading-art-hidden');
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
