/**
 * @file
 * Collapsible comments section behavior and hashchange listener.
 */
(function (Drupal, once) {
  'use strict';

  function autoExpandComments() {
    var hash = window.location.hash;
    if (hash && (hash === '#comments' || hash.indexOf('#comment') === 0)) {
      var commentsSection = document.querySelector('.node-comments-section');
      if (commentsSection) {
        commentsSection.classList.add('is-open');
        var btn = document.querySelector('.comments-scroll-btn');
        if (btn) {
          btn.classList.add('is-active');
          btn.setAttribute('aria-expanded', 'true');
        }
        setTimeout(function () {
          var target = null;
          if (/^#[a-zA-Z0-9_-]+$/.test(hash)) {
            target = document.getElementById(hash.slice(1));
          }
          (target || commentsSection).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }

  Drupal.behaviors.kmComments = {
    attach: function (context) {
      // Toggle comments visibility on button click
      once('km-comments-toggle', '.comments-scroll-btn', context).forEach(function (btn) {
        var parentNode = btn.closest('article, .node, .site-main') || document;
        var commentsSection = parentNode.querySelector('.node-comments-section');
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

      // Hash listener for initial deep links (#comments, #comment-123)
      once('km-comments-hash', 'body', context).forEach(function () {
        window.addEventListener('hashchange', autoExpandComments);
        autoExpandComments();
      });
    },

    detach: function (context, settings, trigger) {
      if (trigger === 'unload') {
        window.removeEventListener('hashchange', autoExpandComments);
      }
    }
  };

})(Drupal, once);

