// Rodapé do site. Uso: <script src="assets/includes/footer.js"></script> no ponto onde o rodapé deve aparecer.
// O texto muda conforme a página, identificada pela classe do <body> (pg-agora, pg-previsao, pg-painel).
(function(){
  const RELATO='https://monitoramentodosriossabara.github.io/relato/';
  const AUTORIA='Painel desenvolvido por <strong>Simone de Figueiredo Cunha</strong> com auxílio de IA.';
  const pg=['agora','previsao','painel'].find(p=>document.body.classList.contains('pg-'+p));
  const P={
    agora:`<footer>
      <div><strong>Morou ou mora na beira do rio?</strong> <a href="${RELATO}">Conte o que você lembra das enchentes</a> (pode mandar áudio e fotos).</div>
      <div class="lai">Este painel reúne dados públicos da ANA e do Cemaden e informações obtidas junto à Defesa Civil de Sabará, por meio da Lei de Acesso à Informação. Parte dos dados solicitados não consta nos registros municipais; todo o material disponível foi fornecido, inclusive o Mapeamento de Áreas de Risco de 2023. Para complementar as informações históricas, contamos com os relatos dos moradores.</div>
      <div>Dados: ANA (Agência Nacional de Águas), estações telemétricas 41195050 Rio das Velhas em Rio Acima, 41200430 Rio das Velhas em Raposos, 41210001 Ribeirão Caeté em Caeté, 41180500 Rio Itabirito (rede da PCH Rio de Pedras) e 41193000 Rio do Peixe (abaixo de PCH) em Nova Lima; Cemaden, estação hidrológica 315670023H Ribeirão Sabará (Av. Longitudinal) e pluviômetros automáticos. Coleta automática a cada 15 minutos; a ANA costuma publicar com 30 a 60 minutos de atraso. A página se atualiza sozinha a cada 5 minutos.</div>
      <div>${AUTORIA}</div>
    </footer>`,
    previsao:`<footer>
      <div>Previsão e alertas do <a href="https://portal.inmet.gov.br/">INMET</a>; chuva em milímetros do <a href="https://open-meteo.com/">Open-Meteo</a>. O painel não usa a previsão para definir os estágios dos rios: os estágios usam o nível dos rios e a chuva que já caiu, medida nos pluviômetros. Para alertas, o que vale são os alertas oficiais da Defesa Civil.</div>
      <div>${AUTORIA}</div>
    </footer>`,
    painel:`<footer class="rodape">
      <p class="aviso"><strong>Sobre os dados.</strong> Este painel reúne dados públicos da ANA e do Cemaden e informações obtidas junto à Defesa Civil de Sabará, por meio da Lei de Acesso à Informação. Parte dos dados solicitados não consta nos registros municipais; todo o material disponível foi fornecido, inclusive o Mapeamento de Áreas de Risco de 2023, que fundamenta a calibração do mapa. Para complementar as informações históricas, contamos com a colaboração dos moradores: se você mora ou já morou perto do rio, <a href="${RELATO}" style="color:var(--accent)">responda ao formulário</a> e conte o que lembra das enchentes.</p>
      <p class="autoria">${AUTORIA}</p>
    </footer>`
  };
  document.currentScript.insertAdjacentHTML('beforebegin',P[pg]||'');
})();
