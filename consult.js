(async function(){
 var params=new URLSearchParams(window.location.search);
 var pid=params.get('pid'); var evid=params.get('evid')||'';
 if(!pid){window.location.href='index.html';return;}
 var patient=await getPatient(pid);
 var evolution=null;
 if(evid){var evs=await listEvolutions(pid); evolution=evs.find(function(e){return e.id===evid;})||null;}
 qs('#title').textContent=(evid?'Editar consulta — ':'Nova consulta — ')+(patient.nome||'');
 qs('#status').className='notice ok';
 qs('#status').textContent='Referência IG: '+((patient.referenciaIG||'usg').toUpperCase())+' (ajuste no cadastro).';

 function habitsText(){
   var parts=[], neg=[];
   if(qs('#tab').value==='sim'){var c=qs('#cig').value.trim();parts.push('Tabagismo ativo'+(c?' ('+c+' cigarros/dia)':'')+'.');} else neg.push('nega tabagismo');
   if(qs('#eti').value==='sim'){var d=qs('#etiDesc').value.trim();parts.push('Etilismo'+(d?' ('+d+')':'')+'.');} else neg.push('nega etilismo');
   if(qs('#spa').value==='sim'){var s=qs('#spaDesc').value.trim();parts.push('Uso de substância psicoativa'+(s?' ('+s+')':'')+'.');} else neg.push('nega uso de substâncias psicoativas');
   if(parts.length===0) return neg.join(', ')+'.';
   if(neg.length) return parts.join(' ')+' '+neg.join(' e ')+'.';
   return parts.join(' ');
 }
 function updateIMC(){ qs('#imc').value=calcIMC(qs('#peso').value, qs('#altura').value); }
 function compute(){
   var ref=patient.referenciaIG||'usg';
   var dataConsulta=qs('#dataConsulta').value||todayISO();
   // Regra: cálculos de IG sempre com base na data de hoje
   var data=todayISO();
   var dum=qs('#dum').value||'';
   var sem=qs('#semUSG').checked;
   var usgData=sem?'':(qs('#usgData').value||'');
   var usgIG=sem?null:parseIG(qs('#usgIG').value||'');
   var igD=dum?fmtIG(daysBetween(data,dum)):null;
   var igU=(usgData&&usgIG)?fmtIG(usgIG.totalDays+daysBetween(data,usgData)):null;
   var igUsed=null, dpp='', refLabel=(ref==='dum'?'DUM':'USG');
   if(ref==='usg' && igU){igUsed=igU;refLabel='USG';dpp=calcDPPFromUSG(usgData,usgIG);}
   else if(igD){igUsed=igD;refLabel='DUM';dpp=calcDPPFromDUM(dum);}
   else if(igU){igUsed=igU;refLabel='USG';dpp=calcDPPFromUSG(usgData,usgIG);}
   qs('#cRef').textContent=refLabel;
   qs('#cIGD').textContent=igD?igD.label:'—';
   qs('#cIGU').textContent=igU?igU.label:'—';
   qs('#cIG').textContent=igUsed?igUsed.label:'—';
   qs('#cMes').textContent=igUsed?mesesAproxFromIG(igUsed.weeks*7+igUsed.days):'—';
   qs('#cTri').textContent=igUsed?trimestreFromIG(igUsed.weeks*7+igUsed.days):'—';
   qs('#cDPP').textContent=dpp?fmtDateBR(dpp):'—';
   qs('#habTexto').textContent=habitsText();
   return {dataConsulta:dataConsulta,dataCalculo:data,dum:dum,usgData:usgData,usgIG:(usgIG?usgIG.label:''),dpp:dpp};
 }
 function bind(){
   ['peso','altura'].forEach(function(id){qs('#'+id).addEventListener('input',function(){updateIMC();compute();});});
   ['dataConsulta','dum','usgData','usgIG'].forEach(function(id){qs('#'+id).addEventListener('input',compute);});
   qs('#semUSG').addEventListener('change',function(){
     var dis=qs('#semUSG').checked;
     qs('#usgData').disabled=dis; qs('#usgIG').disabled=dis;
     if(dis){qs('#usgData').value='';qs('#usgIG').value='';}
     compute();
   });
   ['tab','eti','spa','cig','etiDesc','spaDesc'].forEach(function(id){qs('#'+id).addEventListener('input',function(){qs('#habTexto').textContent=habitsText();});});
 }
 // load initial values
 qs('#dataConsulta').value=(evolution&&evolution.dataConsulta)||todayISO();
 qs('#dum').value=(evolution&&evolution.dum)||patient.dum||'';
 var hasUSG=!!((evolution&&evolution.usgData)||(patient.usgData)||(evolution&&evolution.usgIG)||(patient.usgIG));
 qs('#semUSG').checked = evolution ? !((evolution.usgData)||(evolution.usgIG)) : !hasUSG;
 qs('#usgData').value=(evolution&&evolution.usgData)||patient.usgData||'';
 qs('#usgIG').value=(evolution&&evolution.usgIG)||patient.usgIG||'';
 qs('#usgData').disabled=qs('#semUSG').checked; qs('#usgIG').disabled=qs('#semUSG').checked;
 qs('#peso').value=(evolution&&evolution.peso)||''; qs('#altura').value=(evolution&&evolution.altura)||''; updateIMC();
 qs('#obs').value=(evolution&&evolution.observacoes)||''; qs('#conduta').value=(evolution&&evolution.conduta)||'';
 bind(); compute();

 async function save(next){
   var c=compute();
   var ev={id:(evolution&&evolution.id)||'',patientId:pid,dataConsulta:c.dataConsulta,dum:c.dum,usgData:c.usgData,usgIG:c.usgIG,
     peso:qs('#peso').value.trim(),altura:qs('#altura').value.trim(),imc:qs('#imc').value.trim(),
     habitosTexto:habitsText(),observacoes:qs('#obs').value.trim(),conduta:qs('#conduta').value.trim(),dpp:c.dpp};
   try{
     var saved=await upsertEvolution(ev);
     if(next==='exams') window.location.href='exams.html?pid='+encodeURIComponent(pid)+'&evid='+encodeURIComponent(saved.id);
     else if(next==='copy') window.location.href='requisicao.html?pid='+encodeURIComponent(pid)+'&evid='+encodeURIComponent(saved.id)+'&mode=texto';
     else window.location.href='patient.html?id='+encodeURIComponent(pid);
   }catch(e){alert(e.message||String(e));}
 }
 qs('#voltar').addEventListener('click',function(){window.location.href='patient.html?id='+encodeURIComponent(pid);});
 qs('#salvar').addEventListener('click',function(){save('back');});
 qs('#exames').addEventListener('click',function(){save('exams');});
 qs('#copiar').addEventListener('click',function(){save('copy');});
})();