(async function(){
 var params=new URLSearchParams(window.location.search); var id=params.get('id'); if(!id){window.location.href='index.html';return;}
 var status=qs('#status'); var patient=await getPatient(id);
 status.className='notice ok'; status.textContent='Edite e salve.';
 function splitGPA(gpa){var m=(gpa||'').match(/G(\d*)P(\d*)A(\d*)/i);return m?{g:m[1]||'',p:m[2]||'',a:m[3]||''}:{g:'',p:'',a:''};}
 qs('#nome').value=patient.nome||''; qs('#dn').value=patient.dataNascimento||'';
 var sp=splitGPA(patient.gpa||''); qs('#g').value=sp.g; qs('#p').value=sp.p; qs('#a').value=sp.a;
 qs('#risco').value=patient.risco||''; qs('#hf_dm').checked=!!patient.hf_dm; qs('#hf_has').checked=!!patient.hf_has; qs('#hf_hipo').checked=!!patient.hf_hipo;
 var tipoRh=patient.tipoRh||''; var tm=tipoRh.match(/^(A|B|AB|O)/i); if(tm) qs('#tipo').value=tm[1].toUpperCase(); var rm=tipoRh.match(/Rh([+-])/i); if(rm) qs('#rh').value=rm[1];
 qs('#ref').value=patient.referenciaIG||'usg'; qs('#dum').value=patient.dum||''; qs('#usgData').value=patient.usgData||''; qs('#usgIG').value=patient.usgIG||'';
 qs('#voltar').addEventListener('click',function(){window.location.href='patient.html?id='+encodeURIComponent(id);});
 qs('#salvar').addEventListener('click',async function(){
   var nome=qs('#nome').value.trim(); if(!nome){alert('Nome é obrigatório.');return;}
   var g=qs('#g').value.trim(),p=qs('#p').value.trim(),a=qs('#a').value.trim();
   var gpa=(g||p||a)?('G'+(g||'')+'P'+(p||'')+'A'+(a||'')):'';
   var tipo=qs('#tipo').value,rh=qs('#rh').value; var tipoRh=(tipo&&rh)?(tipo+' Rh'+rh):(tipo?tipo:'');
   var upd=Object.assign({},patient,{nome:nome,dataNascimento:qs('#dn').value||'',gpa:gpa,risco:qs('#risco').value||'',
     hf_dm:qs('#hf_dm').checked?'sim':'',hf_has:qs('#hf_has').checked?'sim':'',hf_hipo:qs('#hf_hipo').checked?'sim':'',
     tipoRh:tipoRh,referenciaIG:qs('#ref').value||'usg',dum:qs('#dum').value||'',usgData:qs('#usgData').value||'',usgIG:(qs('#usgIG').value||'').trim()});
   try{await upsertPatient(upd);window.location.href='patient.html?id='+encodeURIComponent(id);}catch(e){alert(e.message||String(e));}
 });
})();