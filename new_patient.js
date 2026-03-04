(function(){
 qs('#cancelar').addEventListener('click',function(){window.location.href='index.html';});
 qs('#salvar').addEventListener('click',async function(){
   var nome=qs('#nome').value.trim(); if(!nome){alert('Informe o nome completo.');qs('#nome').focus();return;}
   var g=qs('#g').value.trim(),p=qs('#p').value.trim(),a=qs('#a').value.trim();
   var gpa=(g||p||a)?('G'+(g||'')+'P'+(p||'')+'A'+(a||'')):'';
   var tipo=qs('#tipo').value,rh=qs('#rh').value;
   var tipoRh=(tipo&&rh)?(tipo+' Rh'+rh):(tipo?tipo:'');
   var patient={id:'',nome:nome,dataNascimento:qs('#dn').value||'',gpa:gpa,risco:qs('#risco').value||'',
     hf_dm:qs('#hf_dm').checked?'sim':'',hf_has:qs('#hf_has').checked?'sim':'',hf_hipo:qs('#hf_hipo').checked?'sim':'',
     tipoRh:tipoRh,referenciaIG:qs('#ref').value||'usg',dum:'',usgData:'',usgIG:''};
   try{var saved=await upsertPatient(patient);window.location.href='patient.html?id='+encodeURIComponent(saved.id);}
   catch(e){alert(e.message||String(e));}
 });
})();