/* Interações da proposta: revelações, etapas, cronograma, índice e montagem do pacote. */
(function () {
  'use strict';

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;

  // ── Revelação ──
  document.querySelectorAll('[data-reveal-group]').forEach(function (grupo) {
    var i = 0;
    Array.prototype.forEach.call(grupo.children, function (filho) {
      if (filho.hasAttribute('data-reveal')) filho.style.setProperty('--i', i++);
    });
  });

  function revelar(seletor, opcoes) {
    var els = document.querySelectorAll(seletor);
    if (reduz || !temIO) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, opcoes);
    els.forEach(function (el) { io.observe(el); });
  }

  revelar('[data-reveal]', { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  // ── (Tasks 4–7 continuam aqui) ──
})();
