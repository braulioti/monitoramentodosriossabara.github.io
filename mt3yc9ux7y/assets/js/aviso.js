/* Pop-up de aviso reutilizável (janela modal acessível, com botão de confirmação).

   Uso:
     Aviso.mostrar({ titulo, paragrafos, contatos, botao, chave, sempre, aoFechar });
   Todas as opções são opcionais; o que faltar usa o aviso padrão do painel ("não é uma ferramenta oficial").
     titulo      texto do título
     paragrafos  lista de parágrafos (HTML permitido: use só texto de confiança, nunca dados de usuário)
     contatos    lista de { valor, rotulo } exibida em cartões (telefones etc.); [] para não mostrar
     botao       texto do botão de fechar
     chave       identifica o aviso na sessão: depois de fechado, não reaparece até fechar o navegador
     sempre      true = ignora a chave e abre toda vez
     aoFechar    função chamada ao fechar
   Retorna a função que fecha o aviso, ou null se ele já tinha sido dispensado nesta sessão.
   Este script abre o aviso padrão sozinho ao carregar; para só usar a API, use <script ... data-manual>. */
(function () {
  var PADRAO = {
    titulo: 'Atenção: não é uma ferramenta oficial',
    paragrafos: [
      'Este é um painel informativo, feito de forma voluntária. Os estágios (rio normal, subindo, alto e muito alto) são regras tiradas das cheias passadas, com os dados disponíveis: ele cruza o nível dos rios com a chuva que já caiu e com os níveis que a Defesa Civil usa como referência. <strong>Regra pode errar.</strong>',
      '<strong>Em caso de risco, siga sempre a Defesa Civil de Sabará.</strong> Se tocar sirene ou a Defesa Civil mandar sair, saia na hora.'
    ],
    contatos: [
      { valor: '199', rotulo: 'Defesa Civil, 24 horas' },
      { valor: '(31) 3672-7722', rotulo: 'Defesa Civil de Sabará' },
      { valor: '193', rotulo: 'Corpo de Bombeiros' },
      { valor: '40199', rotulo: 'SMS com seu CEP para receber alertas oficiais' }
    ],
    botao: 'Entendi',
    chave: 'rs_aviso_ok'
  };
  var css = [
    '.av-fundo{position:fixed;inset:0;z-index:9999;background:rgba(8,14,20,.72);display:grid;place-items:center;',
    'padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));overflow:auto}',
    '.av-caixa{--av:#c2364b;width:min(560px,100%);background:var(--panel,#fff);color:var(--fg,#0b1c2c);border:3px solid var(--av);border-top-width:12px;',
    'border-radius:16px;padding:22px 20px 18px;display:grid;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,.45);font-size:16px;line-height:1.5}',
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .av-caixa{--av:#e2566a}}:root[data-theme="dark"] .av-caixa{--av:#e2566a}',
    '.av-tit{margin:0;color:var(--av);font-weight:900;font-size:clamp(22px,6vw,30px);line-height:1.15;letter-spacing:.01em;text-transform:uppercase;text-wrap:balance}',
    '.av-caixa p{margin:0}',
    '.av-tel{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}',
    '.av-tel div{border:1px solid var(--line,#dfe4ea);border-radius:10px;padding:8px 10px;background:var(--fill,#f4f6f8)}',
    '.av-tel b{display:block;font-size:20px;white-space:nowrap;color:var(--fg,#0b1c2c)}',
    '.av-tel span{font-size:13px;color:var(--muted,#53606c)}',
    '.av-ok{font:inherit;font-weight:800;font-size:17px;border:0;border-radius:12px;padding:14px 16px;background:var(--av);color:#fff;cursor:pointer;min-height:48px}',
    '.av-ok:focus-visible{outline:3px solid var(--fg,#0b1c2c);outline-offset:3px}'
  ].join('');
  var n = 0, estiloOk = false;
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function mostrar(opc) {
    var o = {}; for (var k in PADRAO) o[k] = opc && opc[k] !== undefined ? opc[k] : PADRAO[k];
    var sempre = !!(opc && opc.sempre);
    try { if (!sempre && sessionStorage.getItem(o.chave)) return null; } catch (e) {}
    if (!estiloOk) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); estiloOk = true; }
    var id = 'av-' + (++n);
    var f = document.createElement('div'); f.className = 'av-fundo';
    f.innerHTML = '<div class="av-caixa" role="alertdialog" aria-modal="true" aria-labelledby="' + id + '-t" aria-describedby="' + id + '-d">' +
      '<p class="av-tit" id="' + id + '-t">' + esc(o.titulo) + '</p>' +
      '<div id="' + id + '-d" style="display:grid;gap:10px">' +
      o.paragrafos.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
      (o.contatos.length ? '<div class="av-tel">' + o.contatos.map(function (c) { return '<div><b>' + esc(c.valor) + '</b><span>' + esc(c.rotulo) + '</span></div>'; }).join('') + '</div>' : '') +
      '</div><button type="button" class="av-ok">' + esc(o.botao) + '</button></div>';
    document.body.appendChild(f);
    var prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    var b = f.querySelector('.av-ok'); b.focus();
    function fechar() {
      if (!f.parentNode) return;
      try { if (!sempre) sessionStorage.setItem(o.chave, '1'); } catch (e) {}
      document.body.style.overflow = prev; f.remove();
      if (opc && typeof opc.aoFechar === 'function') opc.aoFechar();
    }
    b.addEventListener('click', fechar);
    f.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); if (e.key === 'Tab') { e.preventDefault(); b.focus(); } });
    return fechar;
  }
  window.Aviso = { mostrar: mostrar, padrao: PADRAO };
  var auto = !(document.currentScript && document.currentScript.hasAttribute('data-manual'));
  if (auto) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mostrar(); }); else mostrar(); }
})();
