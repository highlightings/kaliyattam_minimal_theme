/**
 * @file
 * Theme JavaScript: theme toggle, mobile nav, collapsible comments, and share button.
 */
(function (Drupal, once) {
  'use strict';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  Drupal.behaviors.kaliyattamMinimal = {
    attach: function (context) {
      // 1. Dark / Light Mode Toggle
      once('km-theme-toggle', '[data-theme-toggle]', context).forEach(function (button) {
        var label = button.querySelector('.theme-toggle-label');
        function syncState(theme) {
          button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
          if (label) {
            label.textContent = theme === 'dark'
              ? (Drupal.t ? Drupal.t('Light') : 'Light')
              : (Drupal.t ? Drupal.t('Dark') : 'Dark');
          }
        }

        syncState(currentTheme());

        button.addEventListener('click', function (e) {
          e.preventDefault();
          var next = currentTheme() === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          syncState(next);
          try {
            window.localStorage.setItem('kaliyattam-theme', next);
            window.localStorage.setItem('kaliyattam_theme', next);
          }
          catch (err) {
            /* Storage blocked. */
          }
        });
      });

      // 2. Mobile Nav Toggle
      once('km-nav-toggle', '[data-nav-toggle]', context).forEach(function (button) {
        var header = button.closest('.site-header');
        function setOpen(open) {
          if (open) {
            header.setAttribute('data-nav-open', '');
          }
          else {
            header.removeAttribute('data-nav-open');
          }
          button.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        button.addEventListener('click', function () {
          setOpen(!header.hasAttribute('data-nav-open'));
        });
        header.addEventListener('keydown', function (event) {
          if (event.key === 'Escape') {
            setOpen(false);
            button.focus();
          }
        });
      });

      // 3. Collapsible Comments Toggle
      once('km-comments-toggle', '.comments-scroll-btn', context).forEach(function (btn) {
        var commentsSection = document.querySelector('.node-comments-section');
        if (!commentsSection) return;

        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var willOpen = !commentsSection.classList.contains('is-open');
          commentsSection.classList.toggle('is-open', willOpen);
          btn.classList.toggle('is-active', willOpen);
          btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

          if (willOpen) {
            setTimeout(function () {
              commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              var firstInput = commentsSection.querySelector('textarea, input[type="text"]:not([type="hidden"])');
              if (firstInput) {
                setTimeout(function () {
                  firstInput.focus();
                }, 350);
              }
            }, 60);
          }
        });
      });

      // Automatically expand comments if page loaded with #comments or #comment in hash
      if (window.location.hash && (window.location.hash === '#comments' || window.location.hash.indexOf('#comment') === 0)) {
        var commentsSection = document.querySelector('.node-comments-section');
        if (commentsSection) {
          commentsSection.classList.add('is-open');
          var btn = document.querySelector('.comments-scroll-btn');
          if (btn) {
            btn.classList.add('is-active');
            btn.setAttribute('aria-expanded', 'true');
          }
          setTimeout(function () {
            var target = document.querySelector(window.location.hash) || commentsSection;
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }

      // 4. Share / Copy Link Button
      once('km-copy-link', '.btn-copy-link', context).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var url = btn.getAttribute('data-url') || window.location.href;
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
            });
          }
        });
      });

      // 5. Timeline Search Drawer Toggle & Sort Switcher
      once('km-timeline-toolbar', '.timeline-toolbar', context).forEach(function (toolbar) {
        var form = toolbar.closest('form');
        var drawer = toolbar.querySelector('.timeline-toolbar__search-drawer');
        var toggleBtn = toolbar.querySelector('[data-timeline-toggle-search]');
        var sortBtns = toolbar.querySelectorAll('[data-timeline-sort]');

        if (toggleBtn && drawer) {
          toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var isOpen = drawer.classList.contains('is-open');
            drawer.classList.toggle('is-open', !isOpen);
            drawer.hidden = isOpen;
            toggleBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
            toggleBtn.classList.toggle('is-active', !isOpen);
            if (!isOpen) {
              var searchInput = drawer.querySelector('input[type="text"], input[type="search"]');
              if (searchInput) {
                setTimeout(function () { searchInput.focus(); }, 100);
              }
            }
          });
        }

        sortBtns.forEach(function (btn) {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            var sortVal = btn.getAttribute('data-timeline-sort');
            var sortSelect = form ? form.querySelector('select[name="sort_by"]') : null;
            if (sortSelect) {
              sortSelect.value = sortVal;
              var submitBtn = form.querySelector('[data-drupal-selector*="edit-submit"], input[type="submit"]');
              if (submitBtn) {
                submitBtn.click();
              } else {
                form.submit();
              }
            }
          });
        });
        // 6. Normalize main navigation active state on root/front page
        if (window.location.pathname === '/' || window.location.pathname === '') {
          var postsLink = document.querySelector('.site-nav a[href="/posts"].is-active');
          if (postsLink) {
            postsLink.classList.remove('is-active');
            postsLink.removeAttribute('aria-current');
          }
        }
      });
    }
  };
})(Drupal, once);
