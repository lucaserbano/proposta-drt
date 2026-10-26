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

  revelar('.etapa', { threshold: 0, rootMargin: '0px 0px -40% 0px' });

  // ── Rolagem: linha das etapas (e progresso, Task 6) ──
  var etapas = document.querySelector('.etapas');
  var linha = document.querySelector('.etapas-linha span');
  var agendado = false;

  function limitar(v) { return Math.min(1, Math.max(0, v)); }

  function aoRolar() {
    agendado = false;
    var vh = window.innerHeight;
    if (linha && !reduz) {
      var r = etapas.getBoundingClientRect();
      linha.style.transform = 'scaleY(' + limitar((vh * 0.6 - r.top) / r.height).toFixed(3) + ')';
    }
    // (Task 6: progresso da barra)
  }

  window.addEventListener('scroll', function () {
    if (!agendado) { agendado = true; window.requestAnimationFrame(aoRolar); }
  }, { passive: true });
  window.addEventListener('resize', aoRolar);
  aoRolar();

  // ── (Tasks 5–7 continuam aqui) ──
})();
