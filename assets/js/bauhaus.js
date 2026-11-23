// Bauhaus refresh: scroll reveals. CSS does the animating; this only flags
// elements and toggles .is-visible. Skipped entirely for reduced motion.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var selector = [
    '.section-title',
    '.featured-posts > .row > div',
    '.listrecent > div',
    '.article-post > h2',
    '.article-post > h3',
    '.article-post > figure',
    '.article-post > blockquote',
    '.article-post > .highlighter-rouge',
    '.article-post > p > img:only-child',
    '.after-post-tags',
    '.PageNavigation'
  ].join(',');

  var els = document.querySelectorAll(selector);
  if (!els.length) return;
  document.documentElement.classList.add('bh-reveal-on');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  Array.prototype.forEach.call(els, function (el, i) {
    el.classList.add('bh-reveal');
    // Stagger siblings in grids a touch.
    var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--bh-delay', (Math.min(idx, 5) * 70) + 'ms');
    io.observe(el);
  });
})();
