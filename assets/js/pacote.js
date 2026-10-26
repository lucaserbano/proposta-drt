/* Regras de preço da proposta. Fonte única dos valores.
   No navegador fica em window.Pacote; no Node, em module.exports (testes). */
(function (root) {
  'use strict';

  var ENTREGAVEIS = 3660;
  var PACOTE_COMPLETO = 6900;
  var WA_NUMERO = '5541999837301';
  var MSG_GERAL = 'Olá, Lucas! Vi a proposta de identidade visual para o evento de DRT e gostaria de conversar.';

  var OPCIONAIS = [
    { id: 'site', curto: 'Website responsivo', nome: 'Criação de website responsivo (inscrições no evento)', valor: 1050 },
    { id: 'bio', curto: 'Bio do Instagram', nome: 'Criação e organização de bio do perfil no Instagram', valor: 75 },
    { id: 'posts9', curto: '9 postagens (pré-evento)', nome: 'Pacote de 9 postagens para feed do Instagram (copywriting e design)', valor: 975 },
    { id: 'foto', curto: 'Cobertura fotográfica', nome: 'Cobertura fotográfica do evento (3 períodos = 1,5 dia), com edição em tempo real', valor: 1800 },
    { id: 'posts3', curto: '3 postagens (pós-evento)', nome: 'Pacote de 3 postagens para feed do Instagram (pós-evento)', valor: 325 }
  ];

  function formatar(valor) {
    return 'R$ ' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function calcular(ids) {
    var marcados = OPCIONAIS.filter(function (o) { return ids.indexOf(o.id) !== -1; });
    var cheio = marcados.reduce(function (soma, o) { return soma + o.valor; }, ENTREGAVEIS);
    var completo = marcados.length === OPCIONAIS.length;
    return {
      marcados: marcados,
      cheio: cheio,
      total: completo ? PACOTE_COMPLETO : cheio,
      completo: completo,
      faltam: OPCIONAIS.length - marcados.length
    };
  }

  function mensagem(ids) {
    var r = calcular(ids);
    var linhas = [
      'Olá, Lucas! Vi a proposta de identidade visual para o evento de Depressão Resistente ao Tratamento.',
      'Quero contratar:',
      '• Entregáveis (' + formatar(ENTREGAVEIS) + ')'
    ];
    r.marcados.forEach(function (o) { linhas.push('• ' + o.nome + ' (' + formatar(o.valor) + ')'); });
    linhas.push('Total: ' + formatar(r.total) + (r.completo ? ' (pacote completo com 12,5% de desconto)' : ''));
    return linhas.join('\n');
  }

  function linkWhatsApp(texto) {
    return 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(texto);
  }

  var api = {
    ENTREGAVEIS: ENTREGAVEIS,
    PACOTE_COMPLETO: PACOTE_COMPLETO,
    WA_NUMERO: WA_NUMERO,
    MSG_GERAL: MSG_GERAL,
    OPCIONAIS: OPCIONAIS,
    formatar: formatar,
    calcular: calcular,
    mensagem: mensagem,
    linkWhatsApp: linkWhatsApp
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Pacote = api;
})(this);
