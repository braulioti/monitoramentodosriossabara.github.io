/* Dados do painel (eventos, estações, vias). Os dados ficam em assets/json/*.json; este script os carrega,
   define as globais D, SD e VEC e só então carrega main.js, map.js, rt.js e aviso.js (que dependem delas).
   Carregar depois de const.js e core.js (e do Leaflet). */
(function(){
  const J=n=>fetch('assets/json/'+n+'.json').then(r=>{if(!r.ok)throw new Error(n+': '+r.status);return r.json();});
  const SCRIPTS=['main','map','rt','aviso'];
  Promise.all(['daily','cotas-diarias','ev2011','cheias','sig','cotas','cemtab','antigas','ranking',
               'stations','station-points','vec-waters','vec-streets'].map(J)).then(v=>{
    window.D={daily:v[0],cotas_diarias:v[1],ev2011:v[2],events:v[3],sig:v[4],cotas:v[5],cemtab:v[6],antigas:v[7],ranking:v[8]};
    window.SD={st:v[9],pts:v[10]};
    window.VEC={w:v[11],s:v[12]};
    // async=false: os scripts injetados executam na ordem em que foram adicionados
    for(const n of SCRIPTS){const s=document.createElement('script');s.src='assets/js/'+n+'.js';s.async=false;document.body.appendChild(s);}
  }).catch(e=>console.error('Não foi possível carregar os dados do painel',e));
})();
