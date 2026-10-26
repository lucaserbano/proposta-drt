const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../assets/js/pacote.js');

const TODOS = ['site', 'bio', 'posts9', 'foto', 'posts3'];

test('formatar usa R$ e ponto de milhar', () => {
  assert.equal(P.formatar(7885), 'R$ 7.885');
  assert.equal(P.formatar(75), 'R$ 75');
  assert.equal(P.formatar(3660), 'R$ 3.660');
});

test('nenhum opcional: só entregáveis', () => {
  const r = P.calcular([]);
  assert.equal(r.total, 3660);
  assert.equal(r.cheio, 3660);
  assert.equal(r.completo, false);
  assert.equal(r.faltam, 5);
});

test('site + foto', () => {
  assert.equal(P.calcular(['site', 'foto']).total, 6510);
});

test('quatro opcionais (sem bio) não dá desconto', () => {
  const r = P.calcular(['site', 'posts9', 'foto', 'posts3']);
  assert.equal(r.total, 7810);
  assert.equal(r.completo, false);
  assert.equal(r.faltam, 1);
});

test('todos os opcionais: pacote completo', () => {
  const r = P.calcular(TODOS);
  assert.equal(r.cheio, 7885);
  assert.equal(r.total, 6900);
  assert.equal(r.completo, true);
  assert.equal(r.faltam, 0);
});

test('desmarcar um depois de completar volta ao preço cheio', () => {
  const r = P.calcular(['site', 'bio', 'posts9', 'foto']);
  assert.equal(r.total, 7560);
  assert.equal(r.completo, false);
});

test('ids repetidos e desconhecidos são ignorados', () => {
  const r = P.calcular(['site', 'site', 'xyz']);
  assert.equal(r.total, 4710);
  assert.equal(r.marcados.length, 1);
});

test('soma dos opcionais bate com o slide (7.885)', () => {
  const soma = P.OPCIONAIS.reduce((s, o) => s + o.valor, P.ENTREGAVEIS);
  assert.equal(soma, 7885);
});

test('mensagem sem opcionais', () => {
  const m = P.mensagem([]);
  assert.match(m, /^Olá, Lucas! Vi a proposta de identidade visual para o evento de Depressão Resistente ao Tratamento\./);
  assert.match(m, /• Entregáveis \(R\$ 3\.660\)/);
  assert.match(m, /Total: R\$ 3\.660$/);
});

test('mensagem com opcionais lista na ordem do site', () => {
  const m = P.mensagem(['foto', 'site']).split('\n');
  assert.equal(m[3], '• Criação de website responsivo (inscrições no evento) (R$ 1.050)');
  assert.equal(m[4].startsWith('• Cobertura fotográfica do evento'), true);
  assert.equal(m[5], 'Total: R$ 6.510');
});

test('mensagem do pacote completo cita o desconto', () => {
  assert.match(P.mensagem(TODOS), /Total: R\$ 6\.900 \(pacote completo com 12,5% de desconto\)$/);
});

test('link do WhatsApp preserva acentos, bullets e quebras de linha', () => {
  const texto = P.mensagem(TODOS);
  const link = P.linkWhatsApp(texto);
  assert.ok(link.startsWith('https://wa.me/5541999837301?text='));
  assert.equal(decodeURIComponent(link.split('?text=')[1]), texto);
});
