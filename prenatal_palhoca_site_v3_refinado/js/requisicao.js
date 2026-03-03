(async function(){
 var params=new URLSearchParams(window.location.search);
 var pid=params.get('pid'); var evid=params.get('evid')||''; var mode=params.get('mode')||'pdf';
 var selRaw=params.get('sel')?decodeURIComponent(params.get('sel')):''; var sel=selRaw?JSON.parse(selRaw):{lab:[],img:[],fontSize:12};
 if(!pid){window.location.href='index.html';return;}
 var patient=await getPatient(pid);
 var evolution=null;
 var evs=await listEvolutions(pid); evs.sort(function(a,b){return (a.dataConsulta||'').localeCompare(b.dataConsulta||'');});
 if(evid) evolution=evs.find(function(e){return e.id===evid;})||null;
 else evolution=evs.length?evs[evs.length-1]:null;

 function context(){
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
   return {ig:ig,dpp:dpp,refLabel:refLabel,dum:dum};
 }
 function idade(){
   if(!patient.dataNascimento) return '—';
   var yrs=Math.floor(daysBetween(todayISO(),patient.dataNascimento)/365.25);
   return isFinite(yrs)?String(yrs):'—';
 }
 var c=context();
 qs('#inst2').textContent=((window.APP_CONFIG&&window.APP_CONFIG.PREFEITURA)||'PREFEITURA MUNICIPAL DE PALHOÇA').toUpperCase();
 qs('#inst3').textContent=((window.APP_CONFIG&&window.APP_CONFIG.SECRETARIA)||'SECRETARIA MUNICIPAL DE SAÚDE').toUpperCase();
 qs('#inst4').textContent=((window.APP_CONFIG&&window.APP_CONFIG.UBS_TITULO)||'UBS RIO GRANDE').toUpperCase();
 qs('#pNome').textContent=patient.nome||'—';
 qs('#pIdade').textContent=idade();
 qs('#pIG').textContent=c.ig?c.ig.label:'—';
 qs('#pDPP').textContent=c.dpp?fmtDateBR(c.dpp):'—';
 qs('#labUl').innerHTML=(sel.lab||[]).map(function(x){return '<li>'+x+'</li>';}).join('');
 qs('#imgUl').innerHTML=(sel.img||[]).map(function(x){return '<li>'+x+'</li>';}).join('');
 qs('#secLab').style.display=(sel.lab&&sel.lab.length)?'':'none';
 qs('#secImg').style.display=(sel.img&&sel.img.length)?'':'none';
 qs('#page').style.fontSize=(sel.fontSize||12)+'px';
 var d=new Date(); qs('#localData').textContent=((window.APP_CONFIG&&window.APP_CONFIG.MUNICIPIO)||'Palhoça')+', '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();

 function evoText(){
   var gpa=patient.gpa||'G__P__A__';
   var risco=patient.risco||'—';
   var igStr=c.ig?(c.ig.weeks+' semanas e '+c.ig.days+' dias'):'—';
   var igFonte=(c.refLabel==='USG'?'por USG':'por DUM');
   var dumTxt=c.dum?fmtDateBR(c.dum):'__/__/____';
   var dppTxt=c.dpp?fmtDateBR(c.dpp):'__/__/____';
   var hab=(evolution&&evolution.habitosTexto)||'nega etilismo, nega tabagismo e nega uso de substâncias psicoativas.';
   var ex=(sel.lab||[]).concat(sel.img||[]);
   var exTxt=ex.length?('Exames solicitados: '+ex.join('; ')+'.'):'';
   var obs=(evolution&&evolution.observacoes)||''; var cond=(evolution&&evolution.conduta)||'';
   var obsTxt=obs.trim()?('Observações: '+obs.trim()+'.'):'';
   var condTxt=cond.trim()?('Conduta: '+cond.trim()+'.'):'';
   return ('Gestante '+gpa+', risco '+risco+'. IG '+igStr+' '+igFonte+' (DUM '+dumTxt+'), DPP '+dppTxt+'. '+hab+' '+exTxt+' '+obsTxt+' '+condTxt).replace(/\s+/g,' ').trim();
 }
 var txt=evoText();

 qs('#voltar').addEventListener('click',function(){window.history.back();});
 qs('#imprimir').addEventListener('click',function(){window.print();});
 qs('#copiar').addEventListener('click',async function(){
   try{await navigator.clipboard.writeText(txt);toast('Texto copiado.');}
   catch(e){prompt('Copie o texto:',txt);}
 });
 if(mode==='texto'){setTimeout(function(){qs('#copiar').click();},250);}
})();