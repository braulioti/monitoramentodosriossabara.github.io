// Cabeçalho e navegação do site. Uso: <script src="assets/includes/header.js"></script> no ponto onde o cabeçalho deve aparecer.
// A página é identificada pela classe do <body> (pg-agora, pg-previsao, pg-painel).
(function(){
  const B='https://monitoramentodosriossabara.github.io/mt3yc9ux7y/';
  const pg=['agora','previsao','painel'].find(p=>document.body.classList.contains('pg-'+p));
  const cur=p=>pg===p?' aria-current="page"':'';
  // No painel, Mapa/Histórico/Como funciona são abas da própria página (botões); nas outras, links para ele
  const painel=pg==='painel';
  const aba=(id,tab,rotulo,hash,sel)=>painel
    ?`<button type="button" role="tab" id="${id}" aria-controls="${tab}" aria-selected="${sel}">${rotulo}</button>`
    :`<a href="${B}painel.html#${hash}">${rotulo}</a>`;
  const html=`<header class="site">
    <div class="in">
      <a class="brand" href="${B}">Rios de <span>Sabará</span></a>
      <nav class="abas"${painel?' role="tablist"':''} aria-label="Seções">
        <a href="${B}"${cur('agora')}>Agora</a>
        <a href="${B}previsao.html"${cur('previsao')}>Previsão</a>
        ${aba('t-mapa','tab-mapa','Mapa','mapa',true)}
        ${aba('t-hist','tab-hist','Histórico','historico',false)}
        ${aba('t-prever','tab-prever','Como funciona','como-funciona',false)}
        <a href="https://monitoramentodosriossabara.github.io/relato/">Participe</a>
      </nav>
    </div>
  </header>`;
  document.currentScript.insertAdjacentHTML('beforebegin',html);
})();
