(async function(){
  var params=new URLSearchParams(window.location.search); var id=params.get('id'); if(!id){window.location.href='index.html';return;}
  var patient=await getPatient(id);
  var evs=await listEvolutions(id); evs.sort(function(a,b){return (a.dataConsulta||'').localeCompare(b.dataConsulta||'');});
  var latest=evs.length?evs[evs.length-1]:null;

  qs('#pnome').textContent=patient.nome||'Paciente';
  var chips=[];
  if(patient.dataNascimento){var age=Math.floor(daysBetween(todayISO(),patient.dataNascimento)/365.25);if(isFinite(age)) chips.push('<span class="chip">'+age+'a</span>');}
  if(patient.gpa) chips.push('<span class="chip">'+patient.gpa+'</span>');
  if(patient.risco) chips.push('<span class="chip '+(String(patient.risco).toLowerCase()==='alto risco'?'warn':'badge')+'">'+patient.risco+'</span>');
  if(patient.tipoRh) chips.push('<span class="chip">'+patient.tipoRh+'</span>');
  qs('#pchips').innerHTML=chips.join(' ');

  function ctxFor(dateIso){
    // Regra: cálculos de IG sempre com base na data de hoje
    var baseDate = todayISO();
    var ref=patient.referenciaIG||'usg';
    var dum=(latest&&latest.dum)||patient.dum||'';
    var usgDate=(latest&&latest.usgData)||patient.usgData||'';
    var usgIG=parseIG((latest&&latest.usgIG)||patient.usgIG||'');
    var igDays=null, dpp='', refLabel=(ref==='dum'?'DUM':'USG');
    if(ref==='usg' && usgDate && usgIG){igDays=usgIG.totalDays+daysBetween(baseDate,usgDate);dpp=calcDPPFromUSG(usgDate,usgIG);}
    else if(dum){igDays=daysBetween(baseDate,dum);dpp=calcDPPFromDUM(dum);refLabel='DUM';}
    else if(usgDate && usgIG){igDays=usgIG.totalDays+daysBetween(baseDate,usgDate);dpp=calcDPPFromUSG(usgDate,usgIG);refLabel='USG';}
    var ig=igDays!=null?fmtIG(igDays):null;
    return {refLabel:refLabel, ig:ig, tri:ig?trimestreFromIG(igDays):'', dpp:dpp};
  }

  var ctx=ctxFor(todayISO());
  qs('#kRef').textContent=ctx.refLabel||'—';
  qs('#kIG').textContent=ctx.ig?ctx.ig.label:'—';
  qs('#kTri').textContent=ctx.tri||'—';
  qs('#kDPP').textContent=ctx.dpp?fmtDateBR(ctx.dpp):'—';

  // timeline markers
  var tl=qs('#timeline'); var width=tl.clientWidth-28; var left=14;
  function pos(w){return left+(clamp(w,0,40)/40)*width;}
  if(ctx.ig){var w=ctx.ig.weeks+ctx.ig.days/7; var m=document.createElement('div');m.className='marker today';m.style.left=pos(w)+'px';m.title='Hoje: '+ctx.ig.label;tl.appendChild(m);}
  if(ctx.dpp){var md=document.createElement('div');md.className='marker dpp';md.style.left=pos(40)+'px';md.title='DPP: '+fmtDateBR(ctx.dpp);tl.appendChild(md);}
  evs.forEach(function(ev){
    var c=ctxFor(ev.dataConsulta); if(!c.ig) return;
    var w=c.ig.weeks+c.ig.days/7; var m=document.createElement('div');m.className='marker consulta';m.style.left=pos(w)+'px';
    m.title=fmtDateBR(ev.dataConsulta)+' • '+c.ig.label;
    m.addEventListener('click',function(){window.location.href='consult.html?pid='+encodeURIComponent(id)+'&evid='+encodeURIComponent(ev.id);});
    tl.appendChild(m);
  });

  // history list
  function row(ev){
    var c=ctxFor(ev.dataConsulta);
    var sub=[];
    if(c.ig) sub.push('IG '+c.ig.label);
    if(ev.peso) sub.push('Peso '+ev.peso);
    if(ev.imc) sub.push('IMC '+ev.imc);
    return '<tr><td style="width:70%"><div class="name">'+fmtDateBR(ev.dataConsulta)+'</div><div class="sub">'+sub.join(' • ')+'</div></td>'+
           '<td style="width:30%;text-align:right"><button class="btn small" data-edit="'+ev.id+'">Editar</button></td></tr>';
  }
  qs('#hist tbody').innerHTML = evs.length ? evs.slice().reverse().map(row).join('') : '<tr><td><div class="name">Nenhuma consulta registrada</div><div class="sub">Clique em “Nova consulta” para iniciar a linha do tempo.</div></td><td></td></tr>';
  qsa('[data-edit]').forEach(function(b){b.addEventListener('click',function(){window.location.href='consult.html?pid='+encodeURIComponent(id)+'&evid='+encodeURIComponent(b.dataset.edit);});});

  qs('#btnVoltar').addEventListener('click',function(){window.location.href='index.html';});
  qs('#btnEditar').addEventListener('click',function(){window.location.href='edit_patient.html?id='+encodeURIComponent(id);});
  qs('#btnConsulta').addEventListener('click',function(){window.location.href='consult.html?pid='+encodeURIComponent(id);});
  qs('#btnExames').addEventListener('click',function(){window.location.href='exams.html?pid='+encodeURIComponent(id);});
})();