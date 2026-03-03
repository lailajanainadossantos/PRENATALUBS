(async function(){
 var params=new URLSearchParams(window.location.search);
 var pid=params.get('pid'); var evid=params.get('evid')||'';
 if(!pid){window.location.href='index.html';return;}
 var status=qs('#status');
 var patient=await getPatient(pid);
 var evolution=null;
 var evs=await listEvolutions(pid); evs.sort(function(a,b){return (a.dataConsulta||'').localeCompare(b.dataConsulta||'');});
 if(evid) evolution=evs.find(function(e){return e.id===evid;})||null;
 else evolution=evs.length?evs[evs.length-1]:null;

 var selectedLab=new Set(), selectedImg=new Set(); var fontSize=12;

 function ctx(){
   var ref=patient.referenciaIG||'usg';
   var base=todayISO();
   // Regra: cálculos de IG sempre com base na data de hoje
   var dum=(evolution&&evolution.dum)||patient.dum||'';
   var usgDate=(evolution&&evolution.usgData)||patient.usgData||'';
   var usgIG=parseIG((evolution&&evolution.usgIG)||patient.usgIG||'');
   var igDays=null, dpp='', refLabel=(ref==='dum'?'DUM':'USG');
   if(ref==='usg' && usgDate && usgIG){igDays=usgIG.totalDays+daysBetween(base,usgDate);dpp=calcDPPFromUSG(usgDate,usgIG);}
   else if(dum){igDays=daysBetween(base,dum);dpp=calcDPPFromDUM(dum);refLabel='DUM';}
   else if(usgDate && usgIG){igDays=usgIG.totalDays+daysBetween(base,usgDate);dpp=calcDPPFromUSG(usgDate,usgIG);refLabel='USG';}
   var ig=igDays!=null?fmtIG(igDays):null;
   return {ig:ig, tri:ig?trimestreFromIG(igDays):'', igWeeks:ig?(ig.weeks+ig.days/7):null, refLabel:refLabel, dpp:dpp};
 }
 function item(name, highlighted){
   var cls=highlighted?'notice ok':'notice';
   var tag=highlighted?'<span class="chip ok">Período ideal</span>':'';
   return '<label class="'+cls+'" style="display:flex;justify-content:space-between;align-items:center;gap:10px">'+
          '<span style="display:flex;align-items:center;gap:10px"><input type="checkbox" data-name="'+name+'"/><span style="font-weight:900">'+name+'</span></span>'+tag+'</label>';
 }
 function render(){
   var c=ctx();
   qs('#title').textContent='Modo exames — '+(patient.nome||'');
   qs('#kIG').textContent=c.ig?c.ig.label:'—';
   qs('#kTri').textContent=c.tri||'—';
   qs('#kDPP').textContent=c.dpp?fmtDateBR(c.dpp):'—';
   qs('#kRef').textContent=c.refLabel||'—';

   var labTri = c.tri.indexOf('2')===0?'2º trimestre':(c.tri.indexOf('3')===0?'3º trimestre':'1º trimestre');
   qs('#labTriLabel').textContent=labTri;

   var triList=EXAMS.laboratorio[labTri]||[];
   qs('#labTriList').innerHTML=triList.map(function(n){return item(n,isIdealWindow(n,c.igWeeks)||(n.toLowerCase().indexOf('coombs')>=0 && (patient.tipoRh||'').indexOf('Rh-')>=0 && isIdealWindow(n,c.igWeeks)));}).join('');

   var other=[]; Object.keys(EXAMS.laboratorio).forEach(function(k){if(k!==labTri) EXAMS.laboratorio[k].forEach(function(x){other.push(x);});});
   other=Array.from(new Set(other));
   qs('#labOtherList').innerHTML=other.map(function(n){return item(n,isIdealWindow(n,c.igWeeks)||(n.toLowerCase().indexOf('coombs')>=0 && (patient.tipoRh||'').indexOf('Rh-')>=0 && isIdealWindow(n,c.igWeeks)));}).join('');

   qs('#imgList').innerHTML=EXAMS.imagem.map(function(o){var hl=o.window?(c.igWeeks!=null && c.igWeeks>=o.window[0] && c.igWeeks<=o.window[1]):false; return item(o.name,hl);}).join('');

   qsa('input[type=checkbox][data-name]').forEach(function(cb){
     var n=cb.dataset.name;
     cb.checked = selectedLab.has(n)||selectedImg.has(n);
     cb.addEventListener('change',function(){
       var inImg=!!cb.closest('#tabImg');
       if(inImg){ if(cb.checked) selectedImg.add(n); else selectedImg.delete(n); }
       else { if(cb.checked) selectedLab.add(n); else selectedLab.delete(n); }
     });
   });

   status.className='notice ok';
   status.textContent='Selecione os exames (sem bloqueio). Destaque = janela ideal.';
   qs('#fontVal').textContent=String(fontSize);
 }

 function switchTab(key){
   qsa('.tab').forEach(function(t){t.classList.toggle('active', t.dataset.tab===key);});
   qs('#tabLab').style.display=key==='lab'?'':'none';
   qs('#tabImg').style.display=key==='img'?'':'none';
 }

 qsa('.tab').forEach(function(t){t.addEventListener('click',function(){switchTab(t.dataset.tab);});});
 qs('#labAddBtn').addEventListener('click',function(){var v=qs('#labAdd').value.trim(); if(!v) return; selectedLab.add(v); qs('#labAdd').value=''; render();});
 qs('#imgAddBtn').addEventListener('click',function(){var v=qs('#imgAdd').value.trim(); if(!v) return; selectedImg.add(v); qs('#imgAdd').value=''; render();});
 qs('#fontMinus').addEventListener('click',function(){fontSize=clamp(fontSize-1,10,16); qs('#fontVal').textContent=String(fontSize);});
 qs('#fontPlus').addEventListener('click',function(){fontSize=clamp(fontSize+1,10,16); qs('#fontVal').textContent=String(fontSize);});
 qs('#voltar').addEventListener('click',function(){window.location.href='patient.html?id='+encodeURIComponent(pid);});
 function payload(){return encodeURIComponent(JSON.stringify({lab:Array.from(selectedLab), img:Array.from(selectedImg), fontSize:fontSize}));}
 qs('#gerar').addEventListener('click',function(){window.location.href='requisicao.html?pid='+encodeURIComponent(pid)+(evid?'&evid='+encodeURIComponent(evid):'')+'&mode=pdf&sel='+payload();});
 qs('#copiar').addEventListener('click',function(){window.location.href='requisicao.html?pid='+encodeURIComponent(pid)+(evid?'&evid='+encodeURIComponent(evid):'')+'&mode=texto&sel='+payload();});

 render();
})();