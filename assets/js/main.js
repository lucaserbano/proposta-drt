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
  var progresso = document.querySelector('.brand-progress');
  var agendado = false;

  function limitar(v) { return Math.min(1, Math.max(0, v)); }

  function aoRolar() {
    agendado = false;
    var vh = window.innerHeight;
    if (linha && !reduz) {
      var r = etapas.getBoundingClientRect();
      linha.style.transform = 'scaleY(' + limitar((vh * 0.6 - r.top) / r.height).toFixed(3) + ')';
    }
    if (progresso) {
      var max = document.documentElement.scrollHeight - vh;
      var f = max > 0 ? limitar(window.scrollY / max) : 1;
      progresso.style.clipPath = 'inset(0 ' + ((1 - f) * 100).toFixed(1) + '% 0 0)';
    }
  }

  window.addEventListener('scroll', function () {
    if (!agendado) { agendado = true; window.requestAnimationFrame(aoRolar); }
  }, { passive: true });
  window.addEventListener('resize', aoRolar);
  aoRolar();

  revelar('.gantt', { threshold: 0.3 });

  // ── Índice ──
  var links = document.querySelectorAll('.indice a');
  if (links.length && temIO) {
    var ioIndice = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var alvo = document.querySelector(a.getAttribute('href'));
      if (alvo) ioIndice.observe(alvo);
    });
  }

  // ── WhatsApp geral ──
  var P = window.Pacote;
  document.querySelectorAll('[data-wa="geral"]').forEach(function (a) { a.href = P.linkWhatsApp(P.MSG_GERAL); });

  // ── Monte seu pacote ──
  var caixas = Array.prototype.slice.call(document.querySelectorAll('input[name="opcional"]'));
  var elTotal = document.getElementById('total');
  var elCheio = document.getElementById('total-cheio');
  var elSelo = document.getElementById('selo-desc');
  var elLinhas = document.getElementById('resumo-linhas');
  var elStatus = document.getElementById('desconto-status');
  var elBarraValor = document.getElementById('barra-total-valor');
  var elAnuncio = document.getElementById('anuncio');
  var btnTodos = document.getElementById('marcar-todos');
  var desconto = document.querySelector('.desconto');
  var resumo = document.querySelector('.resumo');
  var exibido = P.ENTREGAVEIS;
  var quadro = 0;

  function selecionados() {
    return caixas.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
  }

  function escreverTotal(valor) {
    exibido = valor;
    var texto = P.formatar(valor);
    elTotal.textContent = texto;
    elBarraValor.textContent = texto;
  }

  function animarTotal(destino) {
    window.cancelAnimationFrame(quadro);
    var origem = exibido;
    if (reduz || origem === destino) { escreverTotal(destino); return; }
    var inicio = performance.now();
    function passo(agora) {
      var k = Math.min(1, (agora - inicio) / 400);
      var suave = 1 - Math.pow(1 - k, 3);
      escreverTotal(Math.round(origem + (destino - origem) * suave));
      if (k < 1) quadro = window.requestAnimationFrame(passo);
    }
    quadro = window.requestAnimationFrame(passo);
  }

  function linhaResumo(nome, valor) {
    var li = document.createElement('li');
    var a = document.createElement('span');
    var b = document.createElement('span');
    a.textContent = nome;
    b.textContent = P.formatar(valor);
    li.appendChild(a);
    li.appendChild(b);
    return li;
  }

  function atualizar() {
    var ids = selecionados();
    var r = P.calcular(ids);
    var n = P.OPCIONAIS.length - r.faltam;

    elLinhas.textContent = '';
    elLinhas.appendChild(linhaResumo('Entregáveis', P.ENTREGAVEIS));
    r.marcados.forEach(function (o) { elLinhas.appendChild(linhaResumo(o.curto, o.valor)); });

    elCheio.hidden = !r.completo;
    elCheio.textContent = P.formatar(r.cheio);
    elSelo.hidden = !r.completo;
    resumo.classList.toggle('is-completo', r.completo);
    desconto.classList.toggle('is-completo', r.completo);
    desconto.style.setProperty('--p', n / P.OPCIONAIS.length);

    elStatus.textContent = r.completo
      ? '✓ Desconto de 12,5% aplicado'
      : n + ' de 5 opcionais selecionados · ' + (r.faltam === 1 ? 'falta 1' : 'faltam ' + r.faltam) + ' para o desconto';
    btnTodos.textContent = r.completo ? 'Desmarcar todos' : 'Marcar todos (pacote completo)';

    animarTotal(r.total);
    elAnuncio.textContent = 'Total: ' + P.formatar(r.total) + (r.completo ? ', com 12,5% de desconto' : '');

    var link = P.linkWhatsApp(P.mensagem(ids));
    document.querySelectorAll('[data-wa="pacote"]').forEach(function (a) { a.href = link; });
  }

  caixas.forEach(function (c) { c.addEventListener('change', atualizar); });
  btnTodos.addEventListener('click', function () {
    var marcar = !P.calcular(selecionados()).completo;
    caixas.forEach(function (c) { c.checked = marcar; });
    atualizar();
  });
  atualizar();
  elAnuncio.textContent = '';

  // ── Barra de total no celular ──
  var barra = document.querySelector('.barra-total');
  var opcoes = document.querySelector('.opcoes');
  if (barra && temIO) {
    var noInvest = false;
    var resumoVisivel = false;
    var aplicarBarra = function () { barra.classList.toggle('is-on', noInvest && !resumoVisivel); };
    new IntersectionObserver(function (en) { noInvest = en[0].isIntersecting; aplicarBarra(); }).observe(opcoes);
    new IntersectionObserver(function (en) { resumoVisivel = en[0].isIntersecting; aplicarBarra(); }, { threshold: 0.2 }).observe(resumo);
  }
})();
