/**
 * @file
 * Performant Lightweight Media Carousel Behavior (CSS Scroll-Snap).
 */
(function (Drupal, once) {
  'use strict';

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
            });
          }
          isTicking = false;
        }

        function onPrevClick(e) {
          e.preventDefault();
          scrollToIndex(getCurrentIndex() - 1);
        }

        function onNextClick(e) {
          e.preventDefault();
          scrollToIndex(getCurrentIndex() + 1);
        }

        if (prevBtn) {
          prevBtn.addEventListener('click', onPrevClick);
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', onNextClick);
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

        function onScroll() {
          if (!isTicking) {
            window.requestAnimationFrame(updateControls);
            isTicking = true;
          }
        }

        viewport.addEventListener('scroll', onScroll, { passive: true });

        // Recalculate controls when images load
        carousel.querySelectorAll('img').forEach(function (img) {
          if (!img.complete && !img._kmBound) {
            img._kmBound = true;
            img.addEventListener('load', updateControls);
          }
        });

        if (window.ResizeObserver && !carousel._kmResizeObserver) {
          var ro = new ResizeObserver(function () {
            updateControls();
          });
          ro.observe(viewport);
          carousel._kmResizeObserver = ro;
        }

        updateControls();
      });
    },

    detach: function (context, settings, trigger) {
      if (trigger === 'unload') {
        var carousels = context.querySelectorAll ? context.querySelectorAll('[data-km-carousel]') : [];
        carousels.forEach(function (carousel) {
          if (carousel._kmResizeObserver) {
            carousel._kmResizeObserver.disconnect();
            carousel._kmResizeObserver = null;
          }
        });
      }
    }
  };

})(Drupal, once);

