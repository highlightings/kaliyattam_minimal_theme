/**
 * @file
 * Two tiny behaviours: manual light/dark toggle and the mobile nav button.
 */
(function (Drupal, once) {
  'use strict';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  Drupal.behaviors.kaliyattamMinimal = {
    attach: function (context) {
      once('km-theme-toggle', '[data-theme-toggle]', context).forEach(function (button) {
        button.setAttribute('aria-pressed', currentTheme() === 'dark' ? 'true' : 'false');
        button.addEventListener('click', function () {
          var next = currentTheme() === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          button.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
          try {
            window.localStorage.setItem('kaliyattam-theme', next);
          }
          catch (e) {
            /* Storage blocked: the choice lasts for this page only. */
          }
        });
      });

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
    }
  };
})(Drupal, once);
