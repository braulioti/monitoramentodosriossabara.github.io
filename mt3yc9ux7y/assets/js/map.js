/* map.js: tudo do mapa (Leaflet) do painel. Carregado depois do leaflet.js e do script principal do painel,
   que define SD, VEC e css. */

/* ===== Mapa das estações (aba Histórico) ===== */
let smap=null;
function drawStationMap(){
  const kind=s=>s.cod==='REGUA'?'--quota':(s.sit.startsWith('Autom')&&s.tipo.startsWith('Nível'))?'--ev2':s.tipo==='Pluviômetro'?'--ev1':'--muted';
  if(typeof L==='undefined') return;
  if(smap){smap.remove();}
  smap=L.map('smap',{preferCanvas:true,zoomSnap:.5}); smap.fitBounds(SD.st.map(s=>[s.la,s.lo]),{padding:[20,20]});
  smap.attributionControl.setPrefix('').addAttribution('© OpenStreetMap · ANA/SNIRH');
  document.getElementById('smap').style.background=css('--bg');
  for(const [n,g] of VEC.s) L.polyline(g,{color:css('--line'),weight:1.5,interactive:false}).addTo(smap);
  for(const [n,g] of VEC.w) L.polyline(g,{color:css('--ev1'),weight:/Velhas|Sabará/.test(n)?3:1.2,opacity:.8}).bindTooltip(n||'curso d’água',{sticky:true}).addTo(smap);
  for(const s of SD.st) L.circleMarker([s.la,s.lo],{radius:7,color:css('--panel'),weight:2,fillColor:css(kind(s)),fillOpacity:1}).bindPopup(`<b>${s.nome}</b><br>${s.mede}<br>${s.end}<br><i>${s.sit}</i>`).bindTooltip(s.nome).addTo(smap);
  for(const p of SD.pts) L.marker([p.la,p.lo],{icon:L.divIcon({className:'',html:`<div style="width:9px;height:9px;background:${css('--fg')};transform:rotate(45deg)"></div>`,iconSize:[9,9]})}).bindTooltip(p.n,{direction:'right'}).addTo(smap);
}
drawStationMap();

/* ===== Mapa de riscos (aba Mapa) ===== */
// Dados: assets/json/places.json (bairros/locais; nivelVelhasM = nível em Raposos, em m, a partir do qual a água chega;
// subidaSabaraM = subida do Rio Sabará, em m), assets/json/streets.json (ruas) assets/json/waters.json (rios), assets/json/events.json (ocorrências: data, tipo, texto, lat, lon) e assets/json/reports.json (relatos de moradores: titulo, texto, lat, lon).
Promise.all(['places','streets','waters','events','reports'].map(n=>fetch('assets/json/'+n+'.json').then(r=>r.json()))).then(([places,streets,waters,events,reports])=>{
const PLACES=places.map(p=>[p.nome,p.lat,p.lon,p.nivelVelhasM,p.subidaSabaraM]);
const EVTS=events.map(e=>({d:e.data,t:e.tipo,n:e.texto,la:e.lat,lo:e.lon}));
const RELATOS=reports.map(r=>[r.lat,r.lon,r.titulo,r.texto]);
const WATERS=waters.map(w=>[w.nome,w.principal,w.pontos]);
const STREETS=streets.map(s=>[s.nome,s.principal,s.pontos]);
const D={"bounds":[[-19.92972222222222,-43.87],[-19.859722222222224,-43.775]],"w":342,"h":252,"levels":[0.5,1.0,1.5,2.0,2.5,3.0,3.5,4.0,4.5,5.0,5.5,6.0,6.5,7.0,7.5,8.0,8.5,9.0,9.5,10.0,10.5,11.0,11.5,12.0],"lv":"assets/images/nivel-velhas.png","ls":"assets/images/nivel-sabara.png","shade":"assets/images/relevo-sombreado.png"};
const GEO={"png": "assets/images/risco-geologico.png"};
const tok=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const hex=c=>{const m=c.replace('#','');return [0,2,4].map(i=>parseInt(m.slice(i,i+2),16));};
const map=window._riskMap=L.map('map',{preferCanvas:true,zoomSnap:.5,maxZoom:18,minZoom:13,attributionControl:true}).fitBounds(D.bounds);
map.attributionControl.setPrefix('').addAttribution('© OpenStreetMap · Copernicus DEM');
map.setMaxBounds(L.latLngBounds(D.bounds).pad(.3));
const shade=L.imageOverlay(D.shade,D.bounds,{opacity:.55}).addTo(map);
map.createPane('geoPane').style.zIndex=440; map.getPane('geoPane').style.pointerEvents='none';
const geoL=L.imageOverlay(GEO.png,D.bounds,{pane:'geoPane',opacity:.85});
const ocL=L.layerGroup().addTo(map);
const relL=L.layerGroup().addTo(map);
for(const [la,lo,t,x] of RELATOS){ L.circleMarker([la,lo],{radius:7,color:tok('--navy'),weight:2,fillColor:tok('--goldb'),fillOpacity:1}).bindPopup('<b></b><br><span></span>').on('popupopen',e=>{const el=e.popup.getElement();el.querySelector('b').textContent=t;el.querySelector('span').textContent=x;}).addTo(relL); }
for(const e of EVTS){L.marker([e.la,e.lo],{icon:L.divIcon({className:'',html:`<div style="width:12px;height:12px;background:#6b3fa0;border:2px solid #fff;transform:rotate(45deg)"></div>`,iconSize:[12,12]})}).bindPopup(`<b>${e.t} · ${e.d}</b><br>${e.n}`).addTo(ocL);}
map.createPane('floodPane').style.zIndex=450; map.getPane('floodPane').style.pointerEvents='none';
const flood=L.imageOverlay('',D.bounds,{className:'flood',pane:'floodPane'}).addTo(map);
let streetLayer=L.layerGroup().addTo(map), waterLayer=L.layerGroup().addTo(map), labelLayer=L.layerGroup(), placeLayer=L.layerGroup().addTo(map);
function drawVectors(){
  streetLayer.clearLayers(); waterLayer.clearLayers(); labelLayer.clearLayers();
  const edge=tok('--street-edge'), st=tok('--street'), mj=tok('--major');
  for(const [n,maj,g] of STREETS){ L.polyline(g,{color:edge,weight:maj?7:4.5,interactive:false}).addTo(streetLayer); }
  for(const [n,maj,g] of STREETS){ L.polyline(g,{color:maj?mj:st,weight:maj?5:3,interactive:false}).addTo(streetLayer); }
  for(const [n,big,g] of WATERS){ L.polyline(g,{color:tok('--velhas'),weight:big?3:1.5,opacity:.9,interactive:false}).addTo(waterLayer); }
  const seen={};
  for(const [n,maj,g] of STREETS){ if(!n) continue; const m=g[Math.floor(g.length/2)];
    const prev=seen[n]||[]; if(prev.some(p=>map.distance(p,m)<350)) continue; prev.push(m); seen[n]=prev;
    L.tooltip({permanent:true,direction:'center',className:'street-label',interactive:false}).setLatLng(m).setContent(n).addTo(labelLayer); }
}
const sv=document.getElementById('sv'), ss=document.getElementById('ss');
const fmt=v=>v.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
let LVd=null, LSd=null;
function px(src){return new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=D.w;c.height=D.h;const x=c.getContext('2d');x.drawImage(i,0,0);r(x.getImageData(0,0,D.w,D.h).data);};i.src=src;});}
const cv=document.createElement('canvas'); cv.width=D.w; cv.height=D.h; const cx=cv.getContext('2d');
// Ajuste: altura acima do rio no relevo ≈ nível em Raposos − OFF (pontos da Defesa Civil e cheias de 2020/2022)
const OFF=3.0, R=()=>+sv.value*0.5;
const OFIC={'Santo Antônio de Roça Grande':'3,10 m','Centro':'3,10 m','Arraial Velho':'3,50 m','Siderúrgica':'3,50 m','Gaia':'3,50 m','Vila Michel':'3,50 m','Caieira':'3,50 m'};
document.querySelectorAll('.presets:not(.presets-s) button').forEach(b=>b.onclick=()=>{sv.value=Math.round(+b.dataset.r*2);update();});
document.querySelectorAll('.presets-s button').forEach(b=>b.onclick=()=>{ss.value=+b.dataset.s;sv.value=b.dataset.r?Math.round(+b.dataset.r*2):sv.min;update();});
function update(){
  const r=R(), a=Math.max(0,Math.min(24,Math.round((r-OFF)/0.5))), b=+ss.value, La=a?D.levels[a-1]:0, Lb=b?D.levels[b-1]:0;
  document.getElementById('rv').textContent=fmt(r)+' m'; document.getElementById('rs').textContent='+'+fmt(Lb)+' m';
  document.getElementById('rvr').textContent='Simulação: nível normal em Raposos fica perto de 2 m.';
  if(LVd){ const im=cx.createImageData(D.w,D.h), o=im.data, cv1=hex(tok('--velhas')), cs1=hex(tok('--sabara'));
    for(let p=0;p<D.w*D.h;p++){const v=LVd[p*4], s=LSd[p*4]; let c=null;
      if(v===0) c=cv1; else if(v<255&&v<=a) c=cv1; else if(s<255&&s>0&&s<=b) c=cs1; else if(s===0) c=cs1;
      if(c){o[p*4]=c[0];o[p*4+1]=c[1];o[p*4+2]=c[2];o[p*4+3]=(v===0||s===0)?230:200;}}
    cx.putImageData(im,0,0); flood.setUrl(cv.toDataURL()); }
  placeLayer.clearLayers(); const tb=document.getElementById('tb'); tb.innerHTML='';
  const rows=PLACES.filter(p=>p[3]!==null||p[4]!==null).sort((x,y)=>Math.min(x[3]??99,x[4]??99)-Math.min(y[3]??99,y[4]??99));
  for(const [n,la,lo,fv,fs] of PLACES){ const hv=fv!==null&&a&&fv<=La, hs=fs!==null&&b&&fs<=Lb, hit=hv||hs;
    L.circleMarker([la,lo],{radius:hit?6:3.5,color:'#fff',weight:1.5,fillColor:hit?tok('--hit'):tok('--muted'),fillOpacity:1}).bindTooltip(n,{permanent:hit,direction:'right',offset:[6,0],className:'bairro-label'+(hit?' hit':'')}).addTo(placeLayer); }
  for(const [n,la,lo,fv,fs] of rows){ const hv=fv!==null&&a&&fv<=La, hs=fs!==null&&b&&fs<=Lb; const tr=document.createElement('tr'); if(hv||hs) tr.className='on';
    tr.innerHTML=`<td></td><td class="n${hv?' onv':''}">${fv===null?'—':fmt(fv+OFF)+' m'}</td><td class="n${hs?' ons':''}">${fs===null?'—':'+'+fmt(fs)+' m'}</td><td class="n">${OFIC[n]||'—'}</td>`; tr.firstChild.textContent=n; tb.appendChild(tr);
    tr.style.cursor='pointer'; tr.onclick=()=>map.setView([la,lo],16.5); }
}
function labelsByZoom(){ if(map.getZoom()>=15.5) labelLayer.addTo(map); else labelLayer.remove(); }
map.on('zoomend',labelsByZoom);
document.getElementById('geo').onchange=e=>{e.target.checked?geoL.addTo(map):geoL.remove();document.getElementById('lgeo').hidden=!e.target.checked;};
document.getElementById('ocor').onchange=e=>e.target.checked?ocL.addTo(map):ocL.remove();
document.getElementById('rel').onchange=e=>e.target.checked?relL.addTo(map):relL.remove();
document.getElementById('relevo').onchange=e=>e.target.checked?shade.addTo(map):shade.remove();
sv.oninput=update; ss.oninput=update;
function retheme(){drawVectors(); labelsByZoom(); update();}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',retheme);
new MutationObserver(retheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
drawVectors(); labelsByZoom(); update();
Promise.all([px(D.lv),px(D.ls)]).then(([a,b])=>{LVd=a;LSd=b;update();});

}).catch(e=>console.error('Não foi possível carregar os dados do mapa de riscos',e));
