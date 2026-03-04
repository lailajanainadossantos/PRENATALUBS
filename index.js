(async function(){
  var status=qs('#status'), tbody=qs('#tbl tbody');
  var params=new URLSearchParams(window.location.search);
  var q=(params.get('q')||'').toLowerCase().trim();
  if(qs('#globalSearch')) qs('#globalSearch').value=params.get('q')||'';
  function row(p){
    var chips=[];
    if(p.dataNascimento){var age=Math.floor(daysBetween(todayISO(),p.dataNascimento)/365.25);if(isFinite(age)) chips.push('<span class="chip">'+age+'a</span>');}
    if(p.gpa) chips.push('<span class="chip">'+p.gpa+'</span>');
    if(p.risco) chips.push('<span class="chip '+(String(p.risco).toLowerCase()==='alto risco'?'warn':'badge')+'">'+p.risco+'</span>');
    if(p.tipoRh) chips.push('<span class="chip">'+p.tipoRh+'</span>');
    if(p.dpp) chips.push('<span class="chip">DPP '+fmtDateBR(p.dpp)+'</span>');
    return '<tr><td style="width:60%"><div class="name">'+p.nome+'</div><div class="sub">'+chips.join(' ')+'</div></td>'+
           '<td style="width:20%"><div class="name">'+(p.ultimaConsulta?fmtDateBR(p.ultimaConsulta):'—')+'</div><div class="sub">Última consulta</div></td>'+
           '<td style="width:20%;text-align:right"><button class="btn small" data-open="'+p.id+'">Abrir</button></td></tr>';
  }
  try{
    var patients=await listPatients();
    patients=patients.map(function(p){p.nome=p.nome||'';return p;});
    if(q) patients=patients.filter(function(p){return (p.nome||'').toLowerCase().indexOf(q)>=0;});
    patients.sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'');});
    tbody.innerHTML=patients.map(row).join('');
    qsa('[data-open]').forEach(function(b){b.addEventListener('click',function(){window.location.href='patient.html?id='+encodeURIComponent(b.dataset.open);});});
    status.className='notice ok'; status.textContent=patients.length?'Total: '+patients.length+' paciente(s).':'Nenhum paciente encontrado.';
  }catch(e){status.className='notice warn';status.textContent=e.message||String(e);}
})();