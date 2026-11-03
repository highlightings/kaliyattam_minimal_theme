/**
 * @file
 * Timeline toolbar, search drawer, sort switcher, and near-me geolocation.
 */
(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.kmTimelineToolbar = {
    attach: function (context) {
      once('km-timeline-toolbar', '.timeline-toolbar', context).forEach(function (toolbar) {
        var form = toolbar.closest('form');
        var drawer = toolbar.querySelector('.timeline-toolbar__search-drawer');
        var toggleBtn = toolbar.querySelector('[data-timeline-toggle-search]');
        var sortBtns = toolbar.querySelectorAll('[data-timeline-sort]');

        // Sync view switcher buttons to current URL pathname
        var currentPath = window.location.pathname.replace(/\/+$/, '');
        var viewBtns = toolbar.querySelectorAll('.events-view-btn');
        if (viewBtns.length) {
          viewBtns.forEach(function (btn) {
            var href = (btn.getAttribute('href') || '').split('?')[0].replace(/\/+$/, '');
            if (href === currentPath) {
              btn.classList.add('is-active');
            } else if (href) {
              btn.classList.remove('is-active');
            }
          });
        }

        // Search Drawer Toggle
        if (toggleBtn && drawer) {
          toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var isOpen = drawer.classList.contains('is-open');
            drawer.classList.toggle('is-open', !isOpen);
            drawer.hidden = isOpen;
            toggleBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
            toggleBtn.classList.toggle('is-active', !isOpen);
            if (!isOpen) {
              var searchInput = drawer.querySelector('input[name="search"], input[type="text"], input[type="search"]');
              if (searchInput) {
                setTimeout(function () { searchInput.focus(); }, 100);
              }
            }
          });
        }

        // Reset proximity button
        var clearBtn = toolbar.querySelector('[data-events-clear-near]');
        if (clearBtn) {
          clearBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var originInput = document.querySelector('#edit-proximity-source-configuration-origin-address, input[name*="origin_address"]');
            if (originInput) {
              originInput.value = '';
            }
            if (form) {
              var submitBtn = form.querySelector('[data-drupal-selector*="edit-submit"], input[type="submit"]');
              if (submitBtn) {
                submitBtn.click();
              } else {
                form.submit();
              }
            } else {
              window.location.href = window.location.pathname;
            }
          });
        }

        // Near Me Geolocation Button
        var nearbyBtn = toolbar.querySelector('[data-timeline-nearby], [data-events-near-me]');
        if (nearbyBtn) {
          nearbyBtn.addEventListener('click', function (e) {
            e.preventDefault();

            if (!navigator.geolocation) {
              fallbackToOriginInput(Drupal.t('Geolocation is not supported by your browser. Please enter your city or town below.'));
              return;
            }

            var labelEl = nearbyBtn.querySelector('.events-pill__label') || nearbyBtn;
            var originalText = labelEl.textContent;
            labelEl.textContent = '⏳ ' + (Drupal.t ? Drupal.t('Locating...') : 'Locating...');

            // Privacy-preserving coordinate rounding to 2 decimals (~1.1 km)
            // with enableHighAccuracy: false per security & performance guidelines.
            navigator.geolocation.getCurrentPosition(
              function (position) {
                var lat = position.coords.latitude.toFixed(2);
                var lon = position.coords.longitude.toFixed(2);
                var coordsStr = lat + ', ' + lon;

                var originInput = document.querySelector('#edit-proximity-source-configuration-origin-address, input[name*="origin_address"]');
                var distInput = document.querySelector('#edit-proximity-value, input[name*="proximity[value]"]');

                if (originInput) {
                  originInput.value = coordsStr;
                }
                if (distInput && (!distInput.value || distInput.value.trim() === '')) {
                  distInput.value = '50';
                }

                if (form) {
                  var submitBtn = form.querySelector('[data-drupal-selector*="edit-submit"], input[type="submit"]');
                  if (submitBtn) {
                    submitBtn.click();
                  } else {
                    form.submit();
                  }
                } else {
                  var baseUrl = window.location.pathname;
                  window.location.href = baseUrl + '?proximity[value]=50&proximity[source_configuration][origin_address]=' + encodeURIComponent(coordsStr);
                }
              },
              function (err) {
                labelEl.textContent = originalText;
                var msg = Drupal.t ? Drupal.t('Location access was denied. Please enter your city or town below.') : 'Location access was denied. Please enter your city or town below.';
                if (err.code !== 1) {
                  msg = Drupal.t ? Drupal.t('Unable to determine location. Please enter your city or town below.') : 'Unable to determine location. Please enter your city or town below.';
                }
                fallbackToOriginInput(msg);
              },
              { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 }
            );
          });
        }

        function fallbackToOriginInput(message) {
          if (drawer) {
            drawer.classList.add('is-open');
            drawer.hidden = false;
            var notice = drawer.querySelector('.km-geo-fallback-notice');
            if (!notice) {
              notice = document.createElement('div');
              notice.className = 'km-geo-fallback-notice';
              drawer.prepend(notice);
            }
            notice.textContent = message;
            var proxInput = drawer.querySelector('#edit-proximity-source-configuration-origin-address, input[name*="origin_address"], input[type="text"]');
            if (proxInput) {
              setTimeout(function () { proxInput.focus(); }, 150);
            }
          }
        }

        // Segmented Sort Buttons (Latest / Popular)
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
      });
    }
  };

})(Drupal, once);

