/* main.js: todo o JavaScript das páginas (antes inline nos HTML).
   Carregar DEPOIS de const.js e core.js (utilitários: css, fmt, hora, el, api...).
   Cada página tem sua função e o código no final escolhe qual rodar pela classe do <body>:
   pg-agora (index.html), pg-painel (painel.html) e pg-previsao (previsao.html). */

/* ===== Página inicial: situação dos rios agora (index.html) ===== */
function paginaAgora() {

  let nivelGeral=0, sitCache=null;
  let vazaoRaposos=null;
  const GUIA=q=>q==null?null:q>=400?['Emergência','--s3']:q>=150?['Alerta','--s2']:q>=100?['Atenção','--s1']:['Normal','--s0'];
  function cards(sit,res){
    sitCache=sit;
    const box=document.getElementById('cards');box.innerHTML='';
    const by=Object.fromEntries(res.map(r=>[r.codigo,r]));
    for(const s of sit){
      const velhas=s.rio==='Rio das Velhas', sensor=!!(s.onde&&s.onde.includes('Longitudinal'));
      const ref=velhas?by['41200430']:(sensor?by['CEM-6224']:by['41210001']); // chuva do Rio Sabará: Borba Gato (pluviômetro da Av. Longitudinal com defeito)
      const cor=css(CORES[s.nivel_alerta]||'--s0');
      const d=document.createElement('div');d.className='rio';d.style.setProperty('--c',cor);
      const varr=s.variacao_3h_cm;
      const tend=varr==null?'':(varr>5?'subindo':varr<-5?'baixando':'estável')+' ('+(varr>0?'+':'')+fmt(varr/100)+' m em 3 h)';
      const onde=!s.onde?'':s.onde.includes('Raposos')?'medido em Raposos':sensor?'medido em Sabará, Av. Longitudinal':'medido em Caeté';
      const esc=velhas?ESCALA.velhas:(sensor?ESCALA.sabara:null);
      let barra='';
      if(esc&&s.nivel_referencia_cm!=null){
        const pc=v=>Math.max(0,Math.min(100,v/esc.max*100));
        barra=`<div class="barwrap"><div class="bar" style="--t1:${pc(esc.lim[0])}%;--t2:${pc(esc.lim[1])}%;--t3:${pc(esc.lim[2])}%"></div><span class="mk" style="left:${pc(s.nivel_referencia_cm)}%"></span></div>
        <div class="sc"><span style="left:0">0</span><span style="left:${pc(esc.lim[0])}%">${esc.nomes[0]}</span><span style="left:100%">${fmt(esc.max/100,1)} m</span></div>`;
      }
      d.innerHTML=`<div class="l"><span class="nm">${s.rio}<small>${onde}</small></span><span class="v">${fmt(s.nivel_referencia_cm/100)} m<small></small></span></div>${barra}
        <p class="info">${tend?tend+' · ':''}chuva 6 h / 24 h: ${fmt(ref?.chuva_6h,0)} / ${fmt(ref?.chuva_24h,0)} mm · leitura ${hora(s.ultima_leitura)}</p>
        <p class="info guia"></p>
        <p class="motivo"></p>`;
      {const g=d.querySelector('.guia');const gg=velhas?GUIA(vazaoRaposos):null;
       if(gg){g.innerHTML=`Vazão em Raposos: <b>${fmt(vazaoRaposos,0)} m³/s</b> · guia da Defesa Civil: <b style="color:${css(gg[1])}">${gg[0].toLowerCase()}</b> (atenção a partir de 100 m³/s, alerta 150, emergência 400)`;}else g.remove();}
      d.querySelector('.v small').textContent=s.estagio;
      if(s.nivel_alerta>0)d.querySelector('.motivo').textContent=s.motivo;else d.querySelector('.motivo').remove();
      box.appendChild(d);
    }
    heroRios();
  }
  let dcHero='';
  function heroRios(){
    if(!sitCache)return;
    const n=Math.max(0,...sitCache.map(s=>s.nivel_alerta||0));nivelGeral=n;
    const hero=document.getElementById('hero');hero.style.setProperty('--c',css(CORES[n]));{const lm=document.getElementById('linkmapa');if(lm)lm.hidden=n===0;}
    const pior=sitCache.find(s=>(s.nivel_alerta||0)===n);
    document.getElementById('herok').textContent=n?pior.estagio:'Rio normal';
    document.getElementById('heroh').textContent=TIT[n];
    const txt=n?sitCache.filter(s=>s.nivel_alerta>0).map(s=>s.rio+': '+s.motivo).join(' '):'O Rio das Velhas e o Rio Sabará estão no nível normal.';
    document.getElementById('herop').textContent=txt+(dcHero?' '+dcHero:'');
  }

  function grafico(host,serie,opt){
    host.innerHTML='';
    const W=Math.max(320,Math.round(host.clientWidth||860)),R=W<600?92:150,L=44,T=12,ch=W<600?150:170,H=ch+(opt.chuva?110:50);
    const t1=Date.now(),t0=t1-72*3600e3,x=t=>L+(t-t0)/(t1-t0)*(W-L-R);
    const nv=serie.filter(p=>p.nivel_cm!=null);
    const vmax=Math.max(opt.ymin, ...nv.map(p=>p.nivel_cm))*1.08;
    const y=v=>T+ch-v/vmax*ch;
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':opt.titulo});
    const step=vmax>500?200:vmax>200?100:50;
    for(let g=0;g<=vmax;g+=step){el('line',{x1:L,x2:W-R,y1:y(g),y2:y(g),stroke:css('--grid')},svg);const t=el('text',{x:L-6,y:y(g)+4,'text-anchor':'end'},svg);t.textContent=fmt(g/100,1)+' m';}
    for(let d=new Date(t0);d<=t1;d=new Date(d.getTime()+3600e3)){const hh=Number(d.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',hour12:false}));if(hh%(W<600?24:12))continue;const t=el('text',{x:x(d),y:T+ch+16,'text-anchor':'middle'},svg);t.textContent=d.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'})+' '+String(hh).padStart(2,'0')+'h';}
    (opt.limites||[]).forEach(([v,lab,cor])=>{if(v>vmax)return;el('line',{x1:L,x2:W-R,y1:y(v),y2:y(v),stroke:css(cor),'stroke-dasharray':'5 4','stroke-width':1.5},svg);const t=el('text',{x:W-R+6,y:y(v)+4},svg);t.textContent=W<600?fmt(v/100)+' m':fmt(v/100)+' m · '+lab;});
    let p='';nv.forEach(q=>{p+=(p?'L':'M')+x(new Date(q.datahora))+','+y(q.nivel_cm);});
    el('path',{d:p,fill:'none',stroke:css(opt.cor),'stroke-width':2.4},svg);
    if(nv.length){const u=nv[nv.length-1];el('circle',{cx:x(new Date(u.datahora)),cy:y(u.nivel_cm),r:4,fill:css(opt.cor)},svg);}
    if(opt.chuva){
      // chuva por hora
      const hrs={};serie.forEach(q=>{if(q.chuva_mm){const k=Math.floor(new Date(q.datahora)/3600e3);hrs[k]=(hrs[k]||0)+q.chuva_mm;}});
      const cy0=T+ch+28,chh=H-cy0-8,cm=Math.max(20,...Object.values(hrs));
      const bw=(W-L-R)/72*0.8;
      Object.entries(hrs).forEach(([k,v])=>{const h=v/cm*chh;el('rect',{x:x(k*3600e3)-bw/2,y:cy0+chh-h,width:bw,height:h,fill:css('--chuva'),rx:1},svg);});
      el('line',{x1:L,x2:W-R,y1:cy0+chh,y2:cy0+chh,stroke:css('--grid')},svg);
      const t2=el('text',{x:W-R+6,y:cy0+12},svg);t2.textContent=opt.chuvaLab||'Chuva por hora';
      const t=el('text',{x:W-R+6,y:cy0+26},svg);t.textContent='(máx. '+fmt(cm,0)+' mm)';
    }
    if(!nv.length){const t=el('text',{x:W/2,y:T+ch/2,'text-anchor':'middle'},svg);t.textContent='Sem leituras nas últimas 72 h';}
    host.appendChild(svg);
  }

  // 315670023H (Av. Longitudinal): pluviômetro com defeito desde 02/11/2026 (0,2 mm/h constante); fora da tabela até o conserto
  function chuvaTab(res){
    const by=Object.fromEntries(res.map(r=>[r.codigo,r])),agora=Date.now();
    const cel=(v,d,lim)=>{if(v==null)return '<td class="n">—</td>';const c=lim&&v>=lim[1]?'--s2':lim&&v>=lim[0]?'--s1':null;return `<td class="n"${c?` style="font-weight:700;color:${css(c)}"`:''}>${fmt(v,d)}</td>`;};
    const off=[];
    let ultCid='';
    const rows=PLUV.map(([cid,cod,loc])=>{const r=by[cod];const ult=r&&r.ultima_chuva?new Date(r.ultima_chuva).getTime():0;const velho=!ult||agora-ult>3*3600e3;
      if(velho){off.push(cid+' – '+loc);}
      const cab=cid!==ultCid?`<tr class="cid"><td colspan="6">${cid}</td></tr>`:'';ultCid=cid;
      return cab+`<tr${velho?' style="opacity:.55"':''}><td style="white-space:normal;min-width:140px">${loc}</td>`+(velho?'<td class="n">—</td><td class="n">—</td><td class="n">—</td><td class="n">—</td>':
        cel(r.chuva_1h,1)+cel(r.chuva_6h,0,[30,60])+cel(r.chuva_24h,0,[50,100])+cel(r.chuva_72h,0,[120,200]))+`<td>${ult?hora(r.ultima_chuva):'sem dado'}</td></tr>`;}).join('');
    document.getElementById('tabchuva').innerHTML='<thead><tr><th>Pluviômetro</th><th class="n">1 h (mm)</th><th class="n">6 h</th><th class="n">24 h</th><th class="n">72 h</th><th>Última leitura</th></tr></thead><tbody>'+rows+'</tbody>';
    document.getElementById('pluvoff').textContent=off.length?'Sem leitura nas últimas 3 horas (em cinza): '+off.join(', ')+'. Pluviômetro da estação da Av. Longitudinal com defeito desde 02/11/2026, fora da tabela. A estação da ANA em Raposos mede o nível do Rio das Velhas normalmente, mas o pluviômetro dela não transmite chuva desde pelo menos 29/09/2026, por isso não aparece aqui. Pluviômetros do Cemaden que estão fora do ar há meses e não aparecem na tabela: Raposos (Água Limpa), Rio Acima (Morgans), Caeté (Bom Sucesso) e Nova Lima (Centro, Retiro, Rodovia MG-30, Vale do Sereno, Oswaldo Barbosa Penna II).':'Pluviômetro da estação da Av. Longitudinal com defeito desde 02/11/2026, fora da tabela. A estação da ANA em Raposos mede o nível do Rio das Velhas normalmente, mas o pluviômetro dela não transmite chuva desde pelo menos 29/09/2026, por isso não aparece aqui. Pluviômetros do Cemaden fora do ar há meses, que não aparecem na tabela: Raposos (Água Limpa), Rio Acima (Morgans), Caeté (Bom Sucesso) e Nova Lima (Centro, Retiro, Rodovia MG-30, Vale do Sereno, Oswaldo Barbosa Penna II).';
  }

  function tabela(res){
    const t=document.getElementById('tab');
    t.innerHTML='<thead><tr><th>Rio</th><th>Onde é medido</th><th class="n">Nível</th><th class="n">Máx. 24 h</th><th class="n">Chuva 1 h</th><th class="n">6 h</th><th class="n">24 h</th><th class="n">72 h</th><th>Última leitura</th></tr></thead><tbody>'+
     res.filter(r=>ORD.includes(r.codigo)).sort((a,b)=>ORD.indexOf(a.codigo)-ORD.indexOf(b.codigo)).map(r=>`<tr><td>${r.rio}</td><td>${r.nome}</td><td class="n">${fmt(r.nivel_cm/100)} m</td><td class="n">${fmt(r.max_24h_cm/100)} m</td><td class="n">${fmt(r.chuva_1h,1)}</td><td class="n">${fmt(r.chuva_6h,0)}</td><td class="n">${fmt(r.chuva_24h,0)}</td><td class="n">${fmt(r.chuva_72h,0)}</td><td>${hora(r.ultima_leitura)}</td></tr>`).join('')+'</tbody>';
  }

  function origem(host,dados){
    host.innerHTML='';
    const W=Math.max(320,Math.round(host.clientWidth||860)),mob=W<600,R=mob?12:250,L=44,T=12,ch=mob?150:170,H=ch+40;
    const t1=Date.now(),t0=t1-72*3600e3,x=t=>L+(t-t0)/(t1-t0)*(W-L-R);
    const ser=EST.map(([c,n,cor])=>{const p=dados.filter(q=>q.estacao===c);const mn=p.length?Math.min(...p.map(q=>q.nivel_cm)):0;return {n,cor,p:p.map(q=>({t:new Date(q.datahora),v:q.nivel_cm-mn}))};});
    const vmax=Math.max(100,...ser.flatMap(s=>s.p.map(q=>q.v)))*1.1, y=v=>T+ch-v/vmax*ch;
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Subida de cada régua nas últimas 72 horas'});
    const step=vmax>400?200:vmax>200?100:50;
    for(let g=0;g<=vmax;g+=step){el('line',{x1:L,x2:W-R,y1:y(g),y2:y(g),stroke:css('--grid')},svg);const t=el('text',{x:L-6,y:y(g)+4,'text-anchor':'end'},svg);t.textContent='+'+fmt(g/100,1)+' m';}
    for(let d=new Date(t0);d<=t1;d=new Date(d.getTime()+3600e3)){const hh=Number(d.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',hour12:false}));if(hh%(W<600?24:12))continue;const t=el('text',{x:x(d),y:T+ch+16,'text-anchor':'middle'},svg);t.textContent=d.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'})+' '+String(hh).padStart(2,'0')+'h';}
    const ys=[];
    ser.forEach(s=>{if(!s.p.length)return;let p='';s.p.forEach(q=>{p+=(p?'L':'M')+x(q.t)+','+y(q.v);});el('path',{d:p,fill:'none',stroke:css(s.cor),'stroke-width':2.2},svg);
      if(mob)return;const u=s.p[s.p.length-1];let yy=y(u.v)+4;while(ys.some(o=>Math.abs(o-yy)<13))yy+=13;ys.push(yy);
      const t=el('text',{x:W-R+6,y:yy,class:'lab'},svg);t.style.fill=css(s.cor);t.textContent=s.n;});
    host.appendChild(svg);
    if(mob||ser.some(s=>!s.p.length)){const ul=document.createElement('ul');ul.className='leg';ser.forEach(s=>{const li=document.createElement('li');li.innerHTML=`<i style="background:${css(s.cor)}"></i>`;li.append(s.n+(s.p.length?'':' — sem dado agora'));ul.appendChild(li);});host.appendChild(ul);}
  }

  // Chuva MEDIDA nos pluviômetros automáticos de Sabará (Cemaden). Nada de previsão nesta página.
  function chuvaSab(res){
    const by=Object.fromEntries(res.map(r=>[r.codigo,r])),agora=Date.now();
    const vivos=PLUV_SAB.map(([c,l])=>({...by[c],loc:l})).filter(r=>r&&r.ultima_chuva&&agora-new Date(r.ultima_chuva).getTime()<=3*3600e3);
    const T=document.getElementById('sabT'),D=document.getElementById('sabD'),X=document.getElementById('sab72');
    if(!vivos.length){T.textContent='—';D.textContent='Os pluviômetros de Sabará estão sem leitura nas últimas 3 horas.';X.innerHTML='';return;}
    const mx=k=>vivos.reduce((a,r)=>(Number(r[k])||0)>(Number(a[k])||0)?r:a,vivos[0]);
    const h1=mx('chuva_1h'),h24=mx('chuva_24h'),h72=mx('chuva_72h');const c1=Number(h1.chuva_1h)||0;
    const hr=t=>new Date(t).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'});
    T.textContent=fmt(c1,1)+' mm';
    D.innerHTML=(c1>=0.2?`<b>${c1>=10?'Chuva forte':c1>=2?'Chovendo':'Chuva fraca'}</b> na última hora`:'<b>Sem chuva</b> na última hora')+
      ` (maior valor: pluviômetro ${h1.loc}, leitura até ${hr(h1.ultima_chuva)})<br>Últimas 24 h: <b>${fmt(h24.chuva_24h,0)} mm</b> (${h24.loc})`;
    const v72=Number(h72.chuva_72h)||0, pc=Math.min(100,v72);
    X.innerHTML=`<p class="muted" style="margin:14px 0 6px">Últimas 72 h: <b>${fmt(v72,0)} mm</b> (${h72.loc}). O Plano Municipal de Gerenciamento de Riscos usa <b>100 mm em 72 h</b> como referência para a contingência.</p>
     <div class="barwrap"><div class="bar" style="--t1:50%;--t2:80%;--t3:99%"></div><span class="mk" style="left:${pc}%"></span></div>
     <div class="sc"><span style="left:0">0</span><span style="left:100%">100 mm</span></div>`;
  }

  function usinas(au){
    const st=document.getElementById('usinastatus');
    if(!au){st.textContent='Não foi possível ler as réguas das usinas agora.';return;}
    const sub=au.filter(u=>u.subida_cm>=40);
    if(!sub.length){st.style.setProperty('--c',css('--s0'));
      st.textContent='Réguas das usinas sem subida rápida nas últimas 3 horas.';return;}
    st.style.setProperty('--c',css('--s1'));
    st.textContent=sub.map(u=>`${u.nome}: subiu ${fmt(u.subida_cm/100)} m em cerca de 1 hora, com ${fmt(u.chuva_3h_local,0)} mm de chuva no local nas últimas 3 horas.`).join(' ')+
      (sub.some(u=>u.suspeita)?' Como choveu pouco ali, a subida pode vir de chuva mais acima ou de operação da usina; as réguas não permitem saber qual.':' A subida acompanha a chuva no local.');
  }
  function aguaChegando(ar){
    const box=document.getElementById('usinas');box.innerHTML='';
    const a=ar&&ar[0];if(!a||!a.ativo)return;
    const partes=[];
    if(a.subida_rio_acima_3h_cm>=60)partes.push(`O Rio das Velhas em Rio Acima subiu ${fmt(a.subida_rio_acima_3h_cm/100)} m nas últimas 3 horas.`);
    if(a.subida_usina_cm)partes.push(`A régua de ${a.usinas} subiu ${fmt(a.subida_usina_cm/100)} m em cerca de 1 hora.`);
    const sec=document.createElement('section');sec.className='card aviso';sec.style.borderLeftColor=css('--s1');sec.style.borderWidth='2px 2px 2px 6px';sec.style.borderColor=css('--s1');
    const p=document.createElement('p');p.innerHTML='<strong>Subida rápida rio acima.</strong> ';
    p.append(partes.join(' ')+' Essa água passa depois por Raposos e Sabará. Acompanhe o nível em Raposos logo abaixo.');
    sec.appendChild(p);box.appendChild(sec);
  }


  async function alertasDC(){
    const box=document.getElementById('alertasdc');
    try{
      const al=await api('alertas_dc_ativos?select=*&order=enviado_em.desc&limit=5');
      box.innerHTML='';dcHero=al.length?'Há '+(al.length>1?al.length+' alertas oficiais':'um alerta oficial')+' da Defesa Civil em vigor para a região, veja abaixo.':'';heroRios();if(!al.length)return;
      const w=document.createElement('section');w.className='dcs';w.setAttribute('aria-label','Alertas da Defesa Civil');
      for(const a of al){
        const [cor,nome]=SEV[a.severidade]||SEV.Unknown;
        const d=document.createElement('div');d.className='dc';d.style.setProperty('--c',css(cor));
        d.innerHTML='<div class="k"></div><h2></h2><p class="t"></p><p class="i"></p><small></small>';
        d.querySelector('.k').textContent='Alerta oficial da Defesa Civil'+(nome?' · risco '+nome.toLowerCase():'');
        d.querySelector('h2').textContent=a.titulo||a.evento||'Alerta';
        const t=d.querySelector('.t');if(a.descricao&&a.descricao!==a.titulo)t.textContent=a.descricao;else t.remove();
        const i=d.querySelector('.i');if(a.instrucao)i.textContent=a.instrucao;else i.remove();
        d.querySelector('small').textContent='Enviado '+hora(a.enviado_em)+(a.fim?' · válido até '+hora(a.fim):'')+(a.emissor?' · '+a.emissor:'');
        w.appendChild(d);
      }
      box.appendChild(w);
    }catch(e){box.innerHTML='';}
  }
  async function carregar(){
    const st=document.getElementById('stxt'),dot=document.getElementById('dot');
    try{
      const desde=new Date(Date.now()-72*3600e3).toISOString();
      const [sit,res,lr,lc,col,lo,au,ar]=await Promise.all([
        api('situacao_rios?select=*'),
        api('ana_resumo?select=*'),
        api(`ana_leituras?select=datahora,nivel_cm,chuva_mm,vazao_m3s&estacao=eq.41200430&datahora=gte.${desde}&order=datahora`),
        api(`ana_leituras?select=datahora,nivel_cm,chuva_mm,estacao&estacao=in.(41210001,315670023H)&datahora=gte.${desde}&order=datahora`),
        api('ana_coletas?select=executado_em,ok&order=executado_em.desc&limit=1'),
        api(`ana_leituras?select=datahora,nivel_cm,estacao&estacao=in.(41180500,41193000,41195050,41200430)&nivel_cm=not.is.null&datahora=gte.${desde}&order=datahora`),
        api('alerta_usinas?select=*').catch(()=>null),
        api('alerta_rio_acima?select=*').catch(()=>null)]);
      {const q=lr.filter(x=>x.vazao_m3s!=null);vazaoRaposos=q.length?Number(q[q.length-1].vazao_m3s):null;}
      cards(sit,res); chuvaSab(res);
      grafico(document.getElementById('gvelhas'),lr,{cor:'--velhas',ymin:500,titulo:'Nível do Rio das Velhas em Raposos nas últimas 72 horas',
        limites:[[450,'rio subindo','--s1'],[565,'Roças Grandes','--s2'],[670,'Caieira / Ponte','--s3']]});
      const sens=lc.filter(q=>q.estacao==='315670023H'&&q.nivel_cm!=null), cae=lc.filter(q=>q.estacao==='41210001');
      const serieSab=(sens.length?sens.map(q=>({datahora:q.datahora,nivel_cm:q.nivel_cm,chuva_mm:null})):cae.map(q=>({datahora:q.datahora,nivel_cm:q.nivel_cm,chuva_mm:null}))).concat(cae.map(q=>({datahora:q.datahora,nivel_cm:null,chuva_mm:q.chuva_mm})));
      serieSab.sort((x,y)=>new Date(x.datahora)-new Date(y.datahora));
      grafico(document.getElementById('gsabara'),serieSab,{cor:'--sabara',ymin:sens.length?500:150,chuva:true,chuvaLab:'Chuva em Caeté',titulo:'Nível do Rio Sabará e chuva em Caeté nas últimas 72 horas',
        limites:sens.length?[[269,'atenção (Cemaden)','--s1'],[359,'alerta (Cemaden)','--s2'],[448,'transbordamento (Cemaden)','--s3']]:[[237,'pico de dez/2022','--s2']]});
      origem(document.getElementById('gorigem'),lo);
      usinas(au);
      aguaChegando(ar);
      alertasDC();
      tabela(res);
      chuvaTab(res);
      const ult=res.map(r=>r.ultima_leitura).filter(Boolean).sort().pop();
      const atraso=ult?(Date.now()-new Date(ult))/60000:Infinity;
      dot.className='dot'+(atraso>180?' stale':'');
      st.textContent=`Leitura mais recente da ANA: ${hora(ult)}`+(atraso>180?' — a ANA está sem dados novos há mais de 3 horas.':'')+` · Página atualizada às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
    }catch(e){
      dot.className='dot stale';st.innerHTML='<span class="erro">Não foi possível carregar os dados agora.</span> Tentando de novo em 5 minutos.';
    }
  }
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(carregar,400);});
  document.querySelectorAll('details.mais').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)carregar();}));
  carregar();setInterval(carregar,5*60e3);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregar();});
}

/* ===== Previsão do INMET e chuva em mm (previsao.html) ===== */
function paginaPrevisao() {
  let prev=[],sel='Sabará';try{const v=localStorage.getItem('cidPrevI');if(CID.includes(v))sel=v;}catch(e){}
  // Ícone a partir do texto do próprio INMET, para nunca contradizer a previsão oficial
  const EMO=r=>{r=(r||'').toLowerCase();return /trovoad/.test(r)?'⛈️':/isolad/.test(r)&&/chuv|pancad/.test(r)?'🌦️':/chuv|pancad|garoa/.test(r)?'🌧️':/encoberto|nublado/.test(r)?'☁️':/muitas nuvens/.test(r)?'🌥️':/poucas nuvens|parcialmente|sol entre/.test(r)?'⛅':/claro|sol|limpo/.test(r)?'☀️':'🌤️';};
  const futuros=cid=>{const hoje=hojeStr(),h=horaAgora();return prev.filter(x=>x.cidade===cid&&x.dia>=hoje&&!(x.dia===hoje&&FIM[x.periodo]&&h>=FIM[x.periodo]));};
  const nomeP=x=>{const hoje=hojeStr(),am=amanhaStr(),d=new Date(x.dia+'T12:00:00-03:00');
    const n=x.dia===hoje?'Hoje':x.dia===am?'Amanhã':DIAS[d.getUTCDay()][0].toUpperCase()+DIAS[d.getUTCDay()].slice(1)+` <small>${x.dia.slice(8,10)}/${x.dia.slice(5,7)}</small>`;
    return n+(PER[x.periodo]?' · '+PER[x.periodo]:'');};
  function linhas(L){
    return L.map(x=>`<div class="l"><span class="d">${nomeP(x)}</span><span class="r"><span class="e" aria-hidden="true">${EMO(x.resumo)}</span>${esc(x.resumo)}</span><span class="tp">${x.temp_max??'—'}° / ${x.temp_min??'—'}°</span></div>`).join('')||'<p class="muted" style="margin:0">Previsão indisponível no momento.</p>';
  }
  function chuva24(){
    if(!dados)return '';const k=CIDADES.findIndex(c=>c[0]===sel);if(k<0||!dados[k])return '';
    const hj=hojeStr(),ha=horaAgora();const s=horas(dados[k]).filter(h=>(h.dia===hj&&h.h>=ha)||h.dia>hj).slice(0,24).reduce((a,h)=>a+h.p,0);
    return `<br>Chuva nas próximas 24 h: <b style="display:inline;font-size:inherit">${faixa(s)}</b> <small>(estimativa Open-Meteo)</small>`;
  }
  function bacia(){
    const c=document.getElementById('chips');
    if(!c.childElementCount)CID.forEach(n=>{const b=document.createElement('button');b.type='button';b.textContent=n;b.onclick=()=>{sel=n;try{localStorage.setItem('cidPrevI',n)}catch(e){}bacia();if(dados)cidadeMM();};c.appendChild(b);});
    c.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.textContent===sel));
    document.getElementById('cidI').textContent=sel;
    const L=futuros(sel),a=L[0];
    document.getElementById('agoraI').innerHTML=a?`<span class="ic" aria-hidden="true">${EMO(a.resumo)}</span><span class="t">${a.temp_max??'—'}°<small>máx</small></span>
      <span class="d"><b>${nomeP(a)}: ${esc(a.resumo)}</b>Máxima ${a.temp_max??'—'}°, mínima ${a.temp_min??'—'}°${a.int_vento?' · ventos '+esc(a.int_vento.toLowerCase()):''}${chuva24()}</span>`:'';
    document.getElementById('prevB').innerHTML=linhas(L.slice(1));
  }
  async function inmet(){
    const A=document.getElementById('avisosI'),st=document.getElementById('stxt'),dot=document.getElementById('dot');
    try{
      const [av,pv]=await Promise.all([api('inmet_avisos_ativos?select=*'),api('inmet_previsao?select=cidade,dia,periodo,ordem,resumo,temp_max,temp_min,int_vento,atualizado_em&order=dia.asc,ordem.asc')]);
      prev=pv;
      const ag=Date.now(),RK={'Grande Perigo':3,'Perigo':2,'Perigo Potencial':1};
      const ativos=av.filter(a=>new Date(a.inicio)<=ag),um=(ativos.length?ativos:av).slice().sort((x,y)=>(RK[y.severidade]||0)-(RK[x.severidade]||0)||new Date(x.inicio)-new Date(y.inicio)).slice(0,1);
      A.innerHTML=um.length?um.map(a=>{const [c,n]=SEVI[a.severidade]||['--s1',''];
        return `<div class="avI" style="--c:${css(c)}"><b class="t">Alerta de ${esc((a.evento||'').toLowerCase())}${n?' ('+n+')':''} · ${esc(a.severidade)}</b>
        <span>${esc(a.riscos)}</span>${a.instrucoes?`<small>${esc(a.instrucoes)}</small>`:''}<small>${new Date(a.inicio)>ag?'Começa em '+hora(a.inicio)+' e vale até ':'Válido até '}${hora(a.fim)}</small></div>`;}).join('')
        :'<p style="margin:0"><b>Nenhum alerta do INMET para Sabará agora.</b></p>';
          bacia();
      const u=pv.map(x=>x.atualizado_em).filter(Boolean).sort().at(-1);
      dot.className='dot';st.textContent='Previsão do INMET'+(u?' coletada às '+new Date(u).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'}):'')+' · atualiza a cada 30 minutos';
    }catch(e){dot.className='dot stale';st.innerHTML='<span class="erro">Não foi possível carregar a previsão agora.</span> Tentando de novo em alguns minutos.';
      A.innerHTML='<p class="muted" style="margin:0">Consulte direto no <a href="https://alertas2.inmet.gov.br/">site de alertas do INMET</a>.</p>';}
  }
  inmet();setInterval(inmet,15*60e3);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){inmet();if(dados)carregarMM();}});
  // Chuva em milímetros (Open-Meteo): o INMET não informa a quantidade prevista
  const faixa=v=>v==null||isNaN(v)?'—':v<1?'menos de 1 mm':v<5?'até 5 mm':v<15?'5 a 15 mm':v<30?'15 a 30 mm':v<60?'30 a 60 mm':v<100?'60 a 100 mm':'mais de 100 mm';
  const fx=v=>v==null||isNaN(v)?'—':v<1?'&lt;1':v<5?'até 5':v<15?'5–15':v<30?'15–30':v<60?'30–60':v<100?'60–100':'&gt;100';
  let dados=null;
  async function carregarMM(){
    try{
      const u='https://api.open-meteo.com/v1/forecast?latitude='+CIDADES.map(c=>c[1]).join(',')+'&longitude='+CIDADES.map(c=>c[2]).join(',')+
        '&hourly=precipitation,precipitation_probability&daily=precipitation_sum,precipitation_probability_max&forecast_days=8&timezone=America%2FSao_Paulo';
      const r=await fetch(u);if(!r.ok)throw new Error(r.status);let j=await r.json();if(!Array.isArray(j))j=[j];dados=j;
      resumoMM();cidadeMM();bacia();
    }catch(e){document.getElementById('resumo').innerHTML='<tbody><tr><td class="muted">Não foi possível carregar a chuva em milímetros agora. Tentando de novo em alguns minutos.</td></tr></tbody>';}
  }
  function horas(d){return d.hourly.time.map((t,i)=>({t,dia:t.slice(0,10),h:+t.slice(11,13),p:d.hourly.precipitation[i]||0,pr:d.hourly.precipitation_probability?.[i]??0}));}
  function resumoMM(){
    const hj=hojeStr(),am=amanhaStr(),ha=horaAgora();
    const linhas=dados.map((d,k)=>{const hs=horas(d);
      const fut=hs.filter(h=>(h.dia===hj&&h.h>=ha)||h.dia>hj);
      const s24=fut.slice(0,24).reduce((a,h)=>a+h.p,0);
      let m6=0;for(let i=0;i<Math.min(48,fut.length);i++)m6=Math.max(m6,fut.slice(i,i+6).reduce((a,h)=>a+h.p,0));
      const di=d.daily;const ia=di.time.indexOf(am);const s7=di.precipitation_sum.slice(0,7).reduce((a,v)=>a+(v||0),0);
      return {nome:CIDADES[k][0],s24,m6,am:ia>=0?di.precipitation_sum[ia]:null,s7,s48:fut.slice(0,48).reduce((a,h)=>a+h.p,0)};});
    document.getElementById('resumo').innerHTML='<thead><tr><th>Cidade</th><th class="n">Próx. 24 h</th><th class="n">Amanhã</th><th class="n">Maior em 6 h</th><th class="n">7 dias</th></tr></thead><tbody>'+
      linhas.map(l=>`<tr><td><b>${l.nome}</b></td><td class="n"><b>${fx(l.s24)}</b></td><td class="n">${fx(l.am)}</td><td class="n">${fx(l.m6)}</td><td class="n">${fx(l.s7)}</td></tr>`).join('')+'</tbody>';
    const cae=linhas.find(l=>l.nome==='Caeté'),cima=linhas.filter(l=>['Raposos','Nova Lima','Rio Acima','Itabirito'].includes(l.nome));
    const m48=cima.reduce((a,l)=>a+l.s48,0)/cima.length;
    let n=0,t=[];
    if(cae.m6>=60){n=2;t.push(`Previsão de ${faixa(cae.m6)} em 6 horas em Caeté. Nas cheias passadas, chuva assim na cabeceira fez o Rio Sabará subir muito.`);}
    else if(cae.m6>=30){n=1;t.push(`Previsão de ${faixa(cae.m6)} em 6 horas em Caeté. Chuva assim já fez o Rio Sabará subir bastante.`);}
    if(m48>=120){n=Math.max(n,1);t.push(`Previsão de ${faixa(m48)} em 48 h rio acima (média de Raposos, Nova Lima, Rio Acima e Itabirito): o Rio das Velhas pode subir nos próximos dias.`);}
    if(!t.length)t.push('Sem chuva forte prevista em milímetros para Caeté e rio acima nas próximas 48 horas.');
    t.push('É estimativa: acompanhe os alertas oficiais.');
    const p=document.createElement('p');p.className='prevbox';p.style.setProperty('--c',css(['--s0','--s1','--s2'][n]));p.textContent=t.join(' ');
    const b=document.getElementById('sinal');b.innerHTML='';b.appendChild(p);
  }
  function cidadeMM(){
    const k=Math.max(0,CIDADES.findIndex(c=>c[0]===sel)),d=dados[k];
    document.getElementById('cidT').textContent=CIDADES[k][0];
    const di=d.daily,hs=horas(d),hj=hojeStr(),am=amanhaStr(),ha=horaAgora();
    const cel=h=>`<div class="hr${h.p>=1?' mm':''}" title="${h.h}h: ${h.pr}% de chance, ${fmt0(h.p,1)} mm"><span class="h">${h.h}h</span><span class="pb"><i style="height:${Math.max(0,h.pr)}%"></i></span><span class="pc">${h.pr}%</span><span class="mmv">${h.p>=0.1?fmt0(h.p,1):''}</span></div>`;
    const H=hs.filter(h=>h.dia===hj&&h.h>=ha);
    document.getElementById('hoje').innerHTML=H.length?H.map(cel).join(''):'<p class="muted">O dia de hoje já terminou.</p>';
    document.getElementById('amanha').innerHTML=hs.filter(h=>h.dia===am).map(cel).join('');
    document.getElementById('dias').innerHTML=di.time.slice(0,8).map((t,i)=>{const dt=new Date(t+'T12:00:00-03:00');
      const nome=i===0?'Hoje':i===1?'Amanhã':DIAS[dt.getUTCDay()].replace(/^./,c=>c.toUpperCase());
      return `<div class="dia"><span class="n">${nome}<small>${t.slice(8,10)}/${t.slice(5,7)}</small></span><span class="ch">${faixa(di.precipitation_sum[i])}<small>${fmt0(di.precipitation_probability_max[i])}% de chance</small></span></div>`;}).join('');
  }
  carregarMM();setInterval(carregarMM,30*60e3);

}

/* ===== Painel: histórico das cheias e mapa (painel.html) =====
   Os dados (D, SD, VEC) ficam em painel-dados.js; o mapa Leaflet em map.js.
   Aqui o fmt é o do painel (0 casa decimal por padrão), que sombreia o de core.js. */
function paginaPainel() {
  const fmt=(v,dg=0)=>v==null?'—':v.toLocaleString('pt-BR',{minimumFractionDigits:dg,maximumFractionDigits:dg});
  function drawEvent(ev,host){
    const W=1100,H=436,L=62,R=100,T=14,LH=200,RH=40,GAP=14;
    const t0=new Date(ev.ini.replace(' ','T')).getTime(), n=ev.n, x=i=>L+i*(W-L-R)/(n-1);
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Nível dos rios e chuva por hora em '+ev.titulo});
    let mx=600; ST.forEach(([c])=>ev.series[c].nivel.forEach(v=>{if(v>mx)mx=v;})); mx=Math.ceil(mx/200)*200;
    const y=v=>T+LH-v/mx*LH;
    for(let g=0;g<=mx;g+=200){el('line',{x1:L,x2:W-R,y1:y(g),y2:y(g),stroke:css('--grid')},svg);const tx=el('text',{x:L-6,y:y(g)+4,'text-anchor':'end'},svg);tx.textContent=fmt(g/100,0)+' m';}
    // day ticks
    for(let i=0;i<n;i+=24){const dt=new Date(t0+i*36e5);el('line',{x1:x(i),x2:x(i),y1:T,y2:H-8,stroke:css('--grid')},svg);const tx=el('text',{x:x(i)+3,y:H-2},svg);tx.textContent=dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});}
    el('line',{x1:L,x2:W-R,y1:y(565),y2:y(565),stroke:css('--quota'),'stroke-width':1.5,'stroke-dasharray':'4 3'},svg);
    const labs=[];
    ST.forEach(([c,col,nm])=>{const v=ev.series[c].nivel;let d='',pen=false;v.forEach((a,i)=>{if(a==null){pen=false;return;}d+=(pen?'L':'M')+x(i).toFixed(1)+','+y(a).toFixed(1);pen=true;});
      el('path',{d,fill:'none',stroke:css(col),'stroke-width':2,'stroke-linejoin':'round'},svg);
      let li=v.length-1;while(li>0&&v[li]==null)li--; if(v[li]!=null) labs.push([y(v[li])+4,nm]);});
    labs.sort((a,b)=>a[0]-b[0]); for(let k=1;k<labs.length;k++) if(labs[k][0]-labs[k-1][0]<13) labs[k][0]=labs[k-1][0]+13;
    labs.forEach(([yy,nm])=>{const tx=el('text',{x:W-R+6,y:yy,class:'lab'},svg);tx.textContent=nm;});
    // rain strips
    const rmax=Math.max(10,...ST.flatMap(([c])=>ev.series[c].chuva.map(v=>v||0)),...ev.cem.chuva.map(v=>v||0));
    [['41195050','--ev1','Chuva Rio Acima'],['41200430','--ev2','Chuva Raposos'],['41210001','--ev3','Chuva Caeté']].forEach(([c,col,nm],k)=>{
      const top=T+LH+GAP+k*(RH+8), base=top+RH;
      el('line',{x1:L,x2:W-R,y1:base,y2:base,stroke:css('--line')},svg);
      const tx=el('text',{x:W-R+6,y:top+RH/2+4,class:'lab'},svg);tx.textContent=nm;
      const tot=ev.series[c].chuva.reduce((s,v)=>s+(v||0),0);
      if(tot<5){const nd=el('text',{x:(L+W-R)/2,y:top+RH/2+4,'text-anchor':'middle'},svg);nd.textContent='pluviômetro sem registro neste período';}
      ev.series[c].chuva.forEach((v,i)=>{if(!v)return;const h=Math.max(1,v/rmax*RH);el('rect',{x:x(i)-1.6,y:base-h,width:3.2,height:h,rx:1,fill:css(col)},svg);});
      if(k==0){const t2=el('text',{x:L-6,y:top+8,'text-anchor':'end'},svg);t2.textContent=fmt(rmax,0)+' mm/h';}
    });
    // Sabará hourly rain from Cemaden
    {const top=T+LH+GAP+3*(RH+8), base=top+RH; el('line',{x1:L,x2:W-R,y1:base,y2:base,stroke:css('--line')},svg);
     const tx=el('text',{x:W-R+6,y:top+RH/2-2,class:'lab'},svg);tx.textContent='Chuva Sabará';const tx2=el('text',{x:W-R+6,y:top+RH/2+11},svg);tx2.textContent='Cemaden';
     const nm=el('text',{x:L+4,y:top+9},svg);nm.textContent='Pluviômetro '+ev.cem.nome;
     const tot=ev.cem.chuva.reduce((s,v)=>s+(v||0),0);
     if(tot<5){const nd=el('text',{x:(L+W-R)/2,y:top+RH/2+4,'text-anchor':'middle'},svg);nd.textContent='pluviômetro sem registro neste período';}
     ev.cem.chuva.forEach((v,i)=>{if(!v)return;const h=Math.max(1,Math.min(RH,v/rmax*RH));el('rect',{x:x(i)-1.6,y:base-h,width:3.2,height:h,rx:1,fill:css('--sab')},svg);});}
    // observation markers
    ev.obs.forEach(([ts,txt],k)=>{const i=(new Date(ts.replace(' ','T')).getTime()-t0)/36e5; if(i<0||i>n)return;
      el('line',{x1:x(i),x2:x(i),y1:T,y2:T+LH,stroke:css('--mark'),'stroke-width':1.2,'stroke-dasharray':'2 3'},svg);
      const b=el('text',{x:x(i),y:T+10,'text-anchor':'middle',class:'lab','font-size':14},svg);b.textContent=CIRC[k];});
    // hover
    const hl=el('line',{x1:0,x2:0,y1:T,y2:H-30,stroke:css('--muted'),'stroke-width':1,visibility:'hidden'},svg);
    const ov=el('rect',{x:L,y:T,width:W-L-R,height:H-T-10,fill:'transparent'},svg);
    const tip=document.createElement('div');tip.className='tip';
    ov.addEventListener('pointermove',e=>{const r=svg.getBoundingClientRect();const sx=(e.clientX-r.left)/r.width*W;const i=Math.max(0,Math.min(n-1,Math.round((sx-L)/(W-L-R)*(n-1))));
      hl.setAttribute('x1',x(i));hl.setAttribute('x2',x(i));hl.setAttribute('visibility','visible');
      const dt=new Date(t0+i*36e5);
      tip.innerHTML=`<div class="t">${dt.toLocaleDateString('pt-BR')} ${String(dt.getHours()).padStart(2,'0')}h</div>`+ST.map(([c,col,nm])=>`<div><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(${col});margin-right:5px"></i>${nm}: <span>${ev.series[c].nivel[i]==null?'—':fmt(ev.series[c].nivel[i]/100,2)+' m'}</span>${c==='CEMSAB'?'':` · chuva <span>${fmt(ev.series[c].chuva[i],1)} mm</span>`}</div>`).join('');
      tip.style.display='block';const box=host.getBoundingClientRect();let lx=e.clientX-box.left+14;if(lx>box.width-260)lx-=280;tip.style.left=lx+'px';tip.style.top=(e.clientY-box.top+10)+'px';});
    ov.addEventListener('pointerleave',()=>{tip.style.display='none';hl.setAttribute('visibility','hidden');});
    host.appendChild(svg);host.appendChild(tip);
  }
  function render(){
    const box=document.getElementById('events');box.innerHTML='';
    for(const ev of D.events){const c=document.createElement('section');c.className='card';
      c.innerHTML=`<div class="head"><h2>${ev.titulo}</h2><span class="chip">${ev.rio}</span></div><p class="muted">${ev.resumo}</p><div class="chart"></div><ol class="obs">${ev.obs.map(([t,s],k)=>`<li><b>${t.slice(8,10)}/${t.slice(5,7)} ${t.slice(11,16)}</b> ${s}</li>`).join('')}</ol>`;
      box.appendChild(c);drawEvent(ev,c.querySelector('.chart'));}
    // 2011
    const e=D.ev2011, c=document.getElementById('c2011');
    c.innerHTML=`<div class="head"><h2>Dezembro de 2011</h2><span class="chip">Rio das Velhas e Rio Sabará · só dados diários</span></div><p class="muted">Chuva diária em Sabará e em Caeté e nível diário do Rio das Velhas em Honório Bicalho (Nova Lima). A enchente filmada foi no dia 19, depois de 5 dias seguidos de chuva forte (106 mm no dia 18 em Sabará).</p><div class="chart"></div>`;
    const W=1100,H=230,L=62,R=100,T=14,n=e.dias.length,bw=(W-L-R)/n,x=i=>L+i*bw+bw/2;
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Chuva diária e nível em dezembro de 2011'});
    const ch=170, y=v=>T+ch-v/120*ch, yc=v=>T+ch-v/500*ch;
    [0,40,80,120].forEach(g=>{el('line',{x1:L,x2:W-R,y1:y(g),y2:y(g),stroke:css('--grid')},svg);const t=el('text',{x:L-6,y:y(g)+4,'text-anchor':'end'},svg);t.textContent=g+' mm';});
    e.dias.forEach((d,i)=>{[[e.chuva_sabara[i],'--ev1',-1],[e.chuva_caete[i],'--ev3',1]].forEach(([v,col,s])=>{if(!v)return;const h=v/120*ch;el('rect',{x:x(i)+(s<0?-bw*0.38:2),y:T+ch-h,width:bw*0.36,height:h,rx:2,fill:css(col)},svg);});
      if(i%2==0){const t=el('text',{x:x(i),y:H-22,'text-anchor':'middle'},svg);t.textContent=d.slice(8,10)+'/12';}});
    let p='';e.cota_honorio.forEach((v,i)=>{if(v!=null)p+=(p?'L':'M')+x(i)+','+yc(v);});el('path',{d:p,fill:'none',stroke:css('--ev2'),'stroke-width':2},svg);
    const li=e.cota_honorio.length-1;const tl=el('text',{x:W-R+6,y:yc(e.cota_honorio[li]||0)+4,class:'lab'},svg);tl.textContent='Honório Bicalho';
    const i19=e.dias.indexOf('2011-12-19');el('line',{x1:x(i19),x2:x(i19),y1:T,y2:T+ch,stroke:css('--mark'),'stroke-dasharray':'2 3'},svg);const m=el('text',{x:x(i19),y:T+10,'text-anchor':'middle',class:'lab','font-size':14},svg);m.textContent='①';
    const lg=el('text',{x:L,y:H-4},svg);lg.textContent='Barras: chuva diária em Sabará (azul) e em Caeté (verde). Linha: nível diário em Honório Bicalho (escala 0–5 m).';
    c.querySelector('.chart').appendChild(svg);
    c.insertAdjacentHTML('beforeend',`<ol class="obs"><li><b>19/12</b> Enchente registrada em vídeo (YouTube). Honório Bicalho chegou a 4,43 m no dia 16 e 4,23 m no dia 19.</li></ol>`);

    // cheias antigas (1995, 1997) — só dados diários
    function drawOld(id,ev,titulo,chip,resumo,marks,obs){
      const c=document.getElementById(id);
      c.innerHTML=`<div class="head"><h2>${titulo}</h2><span class="chip">${chip}</span></div><p class="muted">${resumo}</p><div class="chart"></div>`;
      const W=1100,H=250,L=62,R=130,T=14,n=ev.dias.length,bw=(W-L-R)/n,x=i=>L+i*bw+bw/2;
      const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Chuva diária e nível do Rio das Velhas: '+titulo});
      const ch=190, y=v=>T+ch-v/160*ch, yc=v=>T+ch-v/1200*ch;
      [0,40,80,120,160].forEach(g=>{el('line',{x1:L,x2:W-R,y1:y(g),y2:y(g),stroke:css('--grid')},svg);const t=el('text',{x:L-6,y:y(g)+4,'text-anchor':'end'},svg);t.textContent=g+' mm';});
      [0,4,8,12].forEach(g=>{const t=el('text',{x:W-R+6,y:yc(g*100)+4,'fill-opacity':0.7},svg);t.textContent=g+' m';});
      ev.dias.forEach((d,i)=>{[[ev.sab[i],'--ev1',-1],[ev.cae[i],'--ev3',1]].forEach(([v,col,s])=>{if(!v)return;const h=Math.min(v,160)/160*ch;el('rect',{x:x(i)+(s<0?-bw*0.38:2),y:T+ch-h,width:bw*0.36,height:h,rx:2,fill:css(col)},svg);});
        if(i%3==0){const t=el('text',{x:x(i),y:H-24,'text-anchor':'middle'},svg);t.textContent=d.slice(8,10)+'/'+d.slice(5,7);}});
      const ln=(arr,col,nm)=>{let p='';arr.forEach((v,i)=>{if(v!=null)p+=(p?'L':'M')+x(i)+','+yc(v);});el('path',{d:p,fill:'none',stroke:css(col),'stroke-width':2.2},svg);
        let im=0;arr.forEach((v,i)=>{if(v!=null&&v>arr[im])im=i});const t=el('text',{x:x(im)+6,y:yc(arr[im])-6,class:'lab'},svg);t.textContent=nm+' '+fmt(arr[im]/100,2)+' m';};
      ln(ev.prs,'--ev4','Ponte Raul Soares');ln(ev.hb,'--ev2','Honório Bicalho');
      marks.forEach(([d,lab])=>{const i=ev.dias.indexOf(d);if(i<0)return;el('line',{x1:x(i),x2:x(i),y1:T,y2:T+ch,stroke:css('--mark'),'stroke-dasharray':'2 3'},svg);const m=el('text',{x:x(i),y:T+10,'text-anchor':'middle',class:'lab','font-size':14},svg);m.textContent=lab;});
      const lg=el('text',{x:L,y:H-4},svg);lg.textContent='Barras: chuva diária em Sabará (azul) e em Caeté (verde). Linhas: nível diário do Rio das Velhas (escala à direita, 0–12 m).';
      c.querySelector('.chart').appendChild(svg);
      c.insertAdjacentHTML('beforeend',`<ol class="obs">${obs.map(([t,s])=>`<li><b>${t}</b> ${s}</li>`).join('')}</ol>`);
    }
    drawOld('c1995',D.antigas['1995'],'Dezembro de 1995','Rio das Velhas · só dados diários · sem notícia encontrada',
      'Temporal concentrado em Sabará, Caeté e Nova Lima. O Rio das Velhas subiu pouco antes de Sabará (Honório Bicalho) e muito depois (Ponte Raul Soares), sinal de que a água veio da chuva local: Rio Sabará, Arrudas e córregos. Não achamos notícias da época.',
      [['1995-12-14','①'],['1995-12-27','②']],
      [['14/12','Chuva de 155 mm em Sabará e 147 mm em Caeté, das maiores já medidas. Honório Bicalho chega a 5,37 m.'],['15/12','Ponte Raul Soares (abaixo de Sabará) chega a 10,55 m, mais do que em 2020 (10,12 m).'],['27/12','Nova subida: 91 mm em Sabará, 103 mm em Caeté no dia 26; Ponte Raul Soares em 9,19 m.']]);
    drawOld('c1997',D.antigas['1997'],'Janeiro de 1997','Rio das Velhas · só dados diários',
      'A "pior enchente" de Sabará até 2020, segundo os moradores. Quatro dias seguidos de chuva forte em toda a bacia; o rio ficou três dias no alto.',
      [['1997-01-03','①'],['1997-01-05','②']],
      [['02 a 06/01','Mais de 300 mm em cinco dias em vários postos: Caeté 339 mm (118 mm no dia 4), Santa Bárbara 336 mm, Sabará 115 mm.'],['03/01','Honório Bicalho passa de 3,62 m para 5,79 m em um dia.'],['05/01','Pico: Honório Bicalho 5,82 m e Ponte Raul Soares 9,57 m. O rio só começa a baixar no dia 6.']]);
    // ranking das cheias
    {const c=document.getElementById('crank'),rk=D.ranking;
     c.innerHTML=`<div class="head"><h2>As maiores cheias do Rio das Velhas desde 1990</h2><span class="chip">Pico na régua da ANA</span></div><p class="muted">Ponte Raul Soares (Lagoa Santa) fica abaixo de Sabará e soma a água do Rio Sabará e do Arrudas. Honório Bicalho (Nova Lima) fica acima. As réguas antigas eram lidas só às 7h e às 17h, então o pico real pode ter sido maior.</p><div class="chart"></div>`;
     const W=1320,rowH=34,L=110,R=560,H=rk.length*rowH+30,mx=1300,xs=v=>L+v/mx*(W-L-R);
     const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Ranking das maiores cheias'});
     [0,400,800,1200].forEach(g=>{el('line',{x1:xs(g),x2:xs(g),y1:0,y2:H-24,stroke:css('--grid')},svg);const t=el('text',{x:xs(g),y:H-8,'text-anchor':'middle'},svg);t.textContent=(g/100)+' m';});
     rk.forEach((r,i)=>{const y0=i*rowH+4;const t=el('text',{x:L-8,y:y0+16,'text-anchor':'end',class:'lab'},svg);t.textContent=r.ev;
       el('rect',{x:L,y:y0+2,width:xs(r.prs)-L,height:13,rx:2,fill:css('--ev4')},svg);
       if(r.hb)el('rect',{x:L,y:y0+17,width:xs(r.hb)-L,height:9,rx:2,fill:css('--ev2')},svg);
       const v=el('text',{x:xs(r.prs)+6,y:y0+14},svg);v.textContent=fmt(r.prs/100,2)+' m';
       const s=el('text',{x:W-R+70,y:y0+18,'fill-opacity':0.8},svg);s.textContent=r.sab;});
     c.querySelector('.chart').appendChild(svg);
     c.insertAdjacentHTML('beforeend',`<p class="note">Barra amarela: Ponte Raul Soares. Barra laranja: Honório Bicalho. Jan/2003 e Dez/1995 não aparecem nas notícias, mas foram confirmadas por relatos de moradores: em 2003 o Rio Sabará invadiu as ruas das Laranjeiras e José Brochado Gomes de madrugada; em 1995 a água subiu e baixou no mesmo dia na Paciência.</p>`);}
    // tables
    const dk=['Chuva no dia (mm)','Chuva 3 dias (mm)','Chuva 7 dias (mm)','Chuva 30 dias (mm)','Chuva no mês até a data (mm)'];
    document.getElementById('tday').innerHTML='<thead><tr><th>Evento</th><th>Pluviômetro</th>'+dk.map(k=>`<th class="n">${k.replace(' (mm)','')}</th>`).join('')+'</tr></thead><tbody>'+D.daily.filter(r=>r['Pluviômetro']!=='Nova Lima (Morro Velho)').map(r=>`<tr><td>${r.Evento}</td><td>${r['Pluviômetro']}</td>`+dk.map(k=>`<td class="n">${fmt(r[k],0)}</td>`).join('')+'</tr>').join('')+'</tbody>';
    const ok=D.cemtab.filter(r=>r.ok);
    document.getElementById('tcem').innerHTML='<thead><tr><th>Momento</th><th>Município</th><th>Pluviômetro</th><th class="n">1 h</th><th class="n">6 h</th><th class="n">24 h</th><th class="n">72 h</th></tr></thead><tbody>'+ok.map((r,i)=>`<tr${i&&ok[i-1].momento!==r.momento?' style="border-top:2px solid var(--line)"':''}><td>${i&&ok[i-1].momento===r.momento?'':r.momento}</td><td>${r.municipio}</td><td>${r.estacao}</td>`+['h1','h6','h24','h72'].map(k=>`<td class="n">${fmt(r[k],0)}</td>`).join('')+'</tr>').join('')+'</tbody>';
    const sk=[['nivel_no_momento_cm','Nível no momento (m)',v=>fmt(v/100,2)],['pico_cm','Pico (m)',v=>fmt(v/100,2)],['hora_pico','Hora do pico',v=>v?v.slice(8,10)+'/'+v.slice(5,7)+' '+v.slice(11,16):'—'],['chuva_6h','Chuva 6 h',v=>fmt(v,0)],['chuva_24h','24 h',v=>fmt(v,0)],['chuva_72h','72 h',v=>fmt(v,0)],['chuva_7d','7 dias',v=>fmt(v,0)],['chuva_15d','15 dias',v=>fmt(v,0)]];
    document.getElementById('tsig').innerHTML='<thead><tr><th>Evento</th><th>Estação</th>'+sk.map(([k,t])=>`<th class="n">${t}</th>`).join('')+'</tr></thead><tbody>'+D.sig.map(r=>`<tr><td>${r.evento}</td><td>${r.estacao.replace(/ \(.*/,'')}</td>`+sk.map(([k,t,f])=>`<td class="n">${r[k]==null?'—':f(r[k])}</td>`).join('')+'</tr>').join('')+'</tbody>';
  }
  function drawStations(){
    document.getElementById('tst').innerHTML='<thead><tr><th>Estação</th><th>Código</th><th>O que mede</th><th>Quem opera</th><th>Endereço aproximado</th><th>Situação</th></tr></thead><tbody>'+SD.st.map(s=>`<tr><td>${s.nome}</td><td>${s.cod==='REGUA'?'—':s.cod}</td><td>${s.mede}</td><td>${s.op}</td><td style="white-space:normal">${s.end}</td><td>${s.sit}</td></tr>`).join('')+'</tbody>';
    if(typeof drawStationMap==='function') drawStationMap();
  }
  render(); drawStations();
  document.getElementById('bCentro').onclick=()=>smap&&smap.setView([-19.8925,-43.811],16);
  document.getElementById('bBacia').onclick=()=>smap&&smap.fitBounds(SD.st.map(s=>[s.la,s.lo]),{padding:[20,20]});
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{render();drawStations();});
  new MutationObserver(()=>{render();drawStations();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  /* abas do painel */
  (() => {
  // move the prediction section into its own tab
  const pv=document.getElementById('prever'); if(pv) document.getElementById('tab-prever').appendChild(pv);
  const fd=document.querySelector('.finds'); if(fd) document.getElementById('tab-prever').prepend(fd);
  const rg=document.getElementById('regua'); if(rg) document.getElementById('tab-prever').appendChild(rg);
  function show(id,user){TABS.forEach(([b,p])=>{const on=p===id;document.getElementById(b).setAttribute('aria-selected',on);document.getElementById(p).hidden=!on;});
    document.getElementById('tit').textContent=NOMES[id][1];
    if(user){try{history.replaceState(null,'','#'+NOMES[id][0])}catch(e){} scrollTo(0,0);}
    setTimeout(()=>{window._riskMap&&window._riskMap.invalidateSize();typeof smap!=='undefined'&&smap&&smap.invalidateSize();},50);
    try{localStorage.setItem('aba',id)}catch(e){}}
  TABS.forEach(([b,p])=>document.getElementById(b).onclick=()=>show(p,true));
  addEventListener('hashchange',()=>{const t={mapa:'tab-mapa',prever:'tab-prever','como-funciona':'tab-prever',historico:'tab-hist'}[location.hash.slice(1)];if(t)show(t);});
  const h=location.hash.replace('#','');const fromHash={mapa:'tab-mapa',prever:'tab-prever','como-funciona':'tab-prever',historico:'tab-hist'}[h];
  let saved=null;try{saved=localStorage.getItem('aba')}catch(e){}
  show(fromHash||saved||'tab-mapa');
  })();
}

const PAGINAS = { 'pg-agora': paginaAgora, 'pg-painel': paginaPainel, 'pg-previsao': paginaPrevisao };
for (const k in PAGINAS) if (document.body.classList.contains(k)) PAGINAS[k]();
