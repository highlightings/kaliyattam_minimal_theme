/**
 * @file
 * Theme JavaScript: theme toggle, mobile nav, collapsible comments, and share button.
 */
(function (Drupal, once) {
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

  function autoExpandComments() {
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
          var target = null;
          try {
            target = document.querySelector(window.location.hash);
          }
          catch (e) {
            target = null;
          }
          (target || commentsSection).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
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

      // Automatically expand comments if hash matches on initial load or subsequent in-page hashchange
      once('km-comments-hash-listener', 'body', context).forEach(function () {
        window.addEventListener('hashchange', autoExpandComments);
        autoExpandComments();
      });

      // 4. Share / Copy Link Button
      once('km-copy-link', '.btn-copy-link', context).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
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
      });

      // 6. Nearby Button Handler (Works on both List views and Map views)
      once('km-nearby-toggle', '[data-timeline-nearby]', context).forEach(function (btn) {
        var defaultHtml = btn.innerHTML;
        var isLocating = false;

        btn.addEventListener('click', function (e) {
          e.preventDefault();

          if (isLocating) return;

          var isActive = btn.classList.contains('is-active');

          if (isActive) {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-pressed', 'false');
            restoreListOrder();
            return;
          }

          if (!navigator.geolocation) {
            alert(Drupal.t ? Drupal.t('Geolocation is not supported by your browser.') : 'Geolocation is not supported by your browser.');
            return;
          }

          isLocating = true;
          btn.innerHTML = '<span aria-hidden="true">⏳</span> ' + (Drupal.t ? Drupal.t('Locating...') : 'Locating...');

          navigator.geolocation.getCurrentPosition(
            function (position) {
              isLocating = false;
              btn.innerHTML = defaultHtml;
              btn.classList.add('is-active');
              btn.setAttribute('aria-pressed', 'true');

              var userLat = position.coords.latitude;
              var userLon = position.coords.longitude;

              // Check if Leaflet map is present on page
              handleLeafletMap(userLat, userLon);

              // Handle list items / articles
              handleNearbyList(userLat, userLon);
            },
            function (err) {
              isLocating = false;
              btn.innerHTML = defaultHtml;
              var msg = Drupal.t ? Drupal.t('Unable to retrieve your location.') : 'Unable to retrieve your location.';
              if (err.code === 1) {
                msg = Drupal.t ? Drupal.t('Location permission denied.') : 'Location permission denied.';
              }
              alert(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        });
      });
    }
  };

  function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function handleLeafletMap(lat, lon) {
    if (!window.L) return false;
    var maps = [];
    if (window.Drupal && Drupal.Leaflet) {
      Object.keys(Drupal.Leaflet).forEach(function (id) {
        if (Drupal.Leaflet[id] && Drupal.Leaflet[id].lMap) {
          maps.push(Drupal.Leaflet[id].lMap);
        }
      });
    }
    if (maps.length === 0) return false;

    maps.forEach(function (lMap) {
      var pulseIcon = L.divIcon({
        className: 'km-user-location-marker',
        html: '<span class="user-loc-pulse"></span>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      if (lMap._kmUserMarker) {
        lMap._kmUserMarker.setLatLng([lat, lon]);
      } else {
        lMap._kmUserMarker = L.marker([lat, lon], { icon: pulseIcon }).addTo(lMap)
          .bindPopup('<b>' + (Drupal.t ? Drupal.t('You are here') : 'You are here') + '</b>');
      }
      lMap._kmUserMarker.openPopup();
      lMap.setView([lat, lon], 13);
    });
    return true;
  }

  function handleNearbyList(userLat, userLon) {
    var articles = Array.from(document.querySelectorAll('article[data-lat], .views-row:has(article[data-lat])'));
    if (articles.length === 0) return;

    var parent = articles[0].parentNode;
    if (!parent) return;

    if (!parent._kmInitialChildren) {
      parent._kmInitialChildren = Array.from(parent.children);
    }

    var itemsWithDist = [];
    Array.from(parent.children).forEach(function (child, idx) {
      var art = child.matches('article[data-lat]') ? child : child.querySelector('article[data-lat]');
      var lat = art ? parseFloat(art.getAttribute('data-lat')) : NaN;
      var lon = art ? parseFloat(art.getAttribute('data-lon')) : NaN;

      var dist = Infinity;
      if (!isNaN(lat) && !isNaN(lon)) {
        dist = haversineDistanceKm(userLat, userLon, lat, lon);
        var badgesRow = (art || child).querySelector('.node-header-badges');
        if (badgesRow) {
          var existingBadge = badgesRow.querySelector('.node-nearby-distance-badge');
          if (!existingBadge) {
            existingBadge = document.createElement('span');
            existingBadge.className = 'node-nearby-distance-badge';
            badgesRow.appendChild(existingBadge);
          }
          var distLabel = dist < 1 ? Math.round(dist * 1000) + ' m' : dist.toFixed(1) + ' km';
          existingBadge.innerHTML = '📍 ' + distLabel;
        }
      }
      itemsWithDist.push({ el: child, dist: dist, originalIndex: idx });
    });

    itemsWithDist.sort(function (a, b) {
      if (a.dist !== b.dist) return a.dist - b.dist;
      return a.originalIndex - b.originalIndex;
    });

    itemsWithDist.forEach(function (item) {
      parent.appendChild(item.el);
    });
  }

  function restoreListOrder() {
    var articles = document.querySelectorAll('article[data-lat], .views-row:has(article[data-lat])');
    if (articles.length === 0) return;
    var parent = articles[0].parentNode;
    if (parent && parent._kmInitialChildren) {
      parent._kmInitialChildren.forEach(function (el) {
        parent.appendChild(el);
      });
    }
    document.querySelectorAll('.node-nearby-distance-badge').forEach(function (badge) {
      badge.remove();
    });
  }

  // 7. Performant Lightweight Media Carousel Behavior
  Drupal.behaviors.kmCarousel = {
    attach: function (context) {
      once('km-carousel', '[data-km-carousel]', context).forEach(function (carousel) {
        var viewport = carousel.querySelector('.km-carousel__viewport');
        var prevBtn = carousel.querySelector('[data-carousel-prev]');
        var nextBtn = carousel.querySelector('[data-carousel-next]');
        var dots = carousel.querySelectorAll('.km-carousel__dot');
        var slides = carousel.querySelectorAll('.km-carousel__slide');

        if (!viewport || slides.length <= 1) {
          if (prevBtn) prevBtn.style.display = 'none';
          if (nextBtn) nextBtn.style.display = 'none';
          var dotsWrap = carousel.querySelector('[data-carousel-dots]');
          if (dotsWrap) dotsWrap.style.display = 'none';
          return;
        }

        function getBaseOffset() {
          return slides[0] ? slides[0].offsetLeft : 0;
        }

        function getTargetScroll(index) {
          if (!slides[index]) return 0;
          return slides[index].offsetLeft - getBaseOffset();
        }

        function getCurrentIndex() {
          var scrollLeft = viewport.scrollLeft;
          var baseOffset = getBaseOffset();
          var closestIndex = 0;
          var minDiff = Infinity;
          for (var i = 0; i < slides.length; i++) {
            var slidePos = slides[i].offsetLeft - baseOffset;
            var diff = Math.abs(slidePos - scrollLeft);
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = i;
            }
          }
          return closestIndex;
        }

        function scrollToIndex(targetIndex) {
          var clamped = Math.max(0, Math.min(targetIndex, slides.length - 1));
          viewport.scrollTo({
            left: getTargetScroll(clamped),
            behavior: 'smooth'
          });
        }

        var isTicking = false;
        function updateControls() {
          var scrollLeft = viewport.scrollLeft;
          var maxScroll = viewport.scrollWidth - viewport.clientWidth - 5;
          var activeIndex = getCurrentIndex();

          if (prevBtn) prevBtn.disabled = activeIndex <= 0 || scrollLeft <= 5;
          if (nextBtn) nextBtn.disabled = activeIndex >= slides.length - 1 || scrollLeft >= maxScroll;

          if (dots.length > 0) {
            dots.forEach(function (dot, idx) {
              var isActive = idx === activeIndex;
              dot.classList.toggle('is-active', isActive);
              dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
              dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
          }
          isTicking = false;
        }

        if (prevBtn) {
          prevBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var current = getCurrentIndex();
            scrollToIndex(current - 1);
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var current = getCurrentIndex();
            scrollToIndex(current + 1);
          });
        }

        dots.forEach(function (dot) {
          dot.addEventListener('click', function (e) {
            e.preventDefault();
            var idx = parseInt(dot.getAttribute('data-slide-index'), 10);
            if (!isNaN(idx)) {
              scrollToIndex(idx);
            }
          });
        });

        viewport.addEventListener('scroll', function () {
          if (!isTicking) {
            window.requestAnimationFrame(updateControls);
            isTicking = true;
          }
        }, { passive: true });

        // Recalculate controls when images finish loading or viewport resizes
        carousel.querySelectorAll('img').forEach(function (img) {
          if (!img.complete) {
            img.addEventListener('load', updateControls);
          }
        });

        if (window.ResizeObserver) {
          var ro = new ResizeObserver(function () {
            updateControls();
          });
          ro.observe(viewport);
        }

        updateControls();
      });
    }
  };

})(Drupal, once);


