/**
 * @file
 * Core Theme JavaScript: theme toggle, mobile nav, copy link, and active nav.
 */
(function (Drupal, drupalSettings, once) {
  'use strict';

  function currentTheme() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark' || attr === 'light') {
      return attr;
    }
    try {
      var stored = window.localStorage.getItem('kaliyattam-theme');
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
    catch (e) {
      /* Storage blocked. */
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  Drupal.behaviors.kaliyattamMinimal = {
    attach: function (context) {
      // 1. Dark / Light Mode Toggle
      once('km-theme-toggle', '[data-theme-toggle]', context).forEach(function (button) {
        function syncState(theme) {
          button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }

        syncState(currentTheme());

        button.addEventListener('click', function (e) {
          e.preventDefault();
          var next = currentTheme() === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          syncState(next);
          try {
            window.localStorage.setItem('kaliyattam-theme', next);
          }
          catch (err) {
            /* Storage blocked. */
          }
        });
      });

      // 2. Mobile Nav Toggle
      once('km-nav-toggle', '[data-nav-toggle]', context).forEach(function (button) {
        var header = button.closest('.site-header');
        if (!header) return;

        function setOpen(open) {
          if (open) {
            header.setAttribute('data-nav-open', '');
          }
          else {
            header.removeAttribute('data-nav-open');
          }
          button.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        function toggleClick() {
          setOpen(!header.hasAttribute('data-nav-open'));
        }

        function keyHandler(event) {
          if (event.key === 'Escape') {
            setOpen(false);
            button.focus();
          }
        }

        button.addEventListener('click', toggleClick);
        header.addEventListener('keydown', keyHandler);
      });

      // 3. Share / Copy Link Button
      once('km-copy-link', '.btn-copy-link', context).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var rawUrl = btn.getAttribute('data-url') || window.location.href;
          var url = window.location.href;
          try {
            url = new URL(rawUrl, window.location.origin).href;
          } catch (err) {
            url = window.location.href;
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
              var label = btn.querySelector('.share-label');
              var originalText = label ? label.textContent : '';
              if (label) {
                label.textContent = Drupal.t ? Drupal.t('Copied!') : 'Copied!';
              }
              setTimeout(function () {
                if (label) {
                  label.textContent = originalText;
                }
              }, 2000);
            }).catch(function () {
              /* Clipboard permission denied or unavailable */
            });
          }
        });
      });
    }
  };

  // 4. Main Nav Active State using drupalSettings.path (language-neutral)
  Drupal.behaviors.kmActiveNav = {
    attach: function (context) {
      once('km-active-nav', 'body', context).forEach(function () {
        var currentPath = (drupalSettings && drupalSettings.path && drupalSettings.path.currentPath) || '';
        var isFront = (drupalSettings && drupalSettings.path && drupalSettings.path.isFront) || false;

        function setActive(selector) {
          var link = document.querySelector('.site-nav a[data-drupal-link-system-path="' + selector + '"]');
          if (link && !link.classList.contains('is-active')) {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');
          }
        }

        if (isFront) {
          setActive('<front>');
        }
        else if (currentPath === 'events' || currentPath.indexOf('events/') === 0) {
          setActive('events');
        }
        else if (currentPath === 'theyyam' || currentPath.indexOf('theyyam/') === 0) {
          setActive('theyyam');
        }
        else if (currentPath === 'temples' || currentPath.indexOf('temples/') === 0 || currentPath.indexOf('locations') === 0) {
          setActive('temples');
        }
        else if (currentPath === 'posts' || currentPath.indexOf('posts/') === 0) {
          setActive('posts');
        }
      });
    }
  };

})(Drupal, drupalSettings, once);
