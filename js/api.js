function _b64encodeUtf8(str){
  // btoa only supports latin1; this ensures utf-8 safe
  return btoa(unescape(encodeURIComponent(str)));
}
function apiCall(payload){
  const base=(window.APP_CONFIG&&window.APP_CONFIG.APPS_SCRIPT_URL)||"";
  if(!base||base.indexOf("COLE_AQUI")>=0) return Promise.reject(new Error("Configuração ausente: defina APP_CONFIG.APPS_SCRIPT_URL em js/config.js"));
  const cbName="__jsonp_cb_"+Math.random().toString(36).slice(2);
  const payloadB64=_b64encodeUtf8(JSON.stringify(payload||{}));
  const sep = base.indexOf("?")>=0 ? "&" : "?";
  const url=base+sep+"payload="+encodeURIComponent(payloadB64)+"&callback="+encodeURIComponent(cbName)+"&_ts="+Date.now();

  return new Promise(function(resolve,reject){
    let done=false;
    const script=document.createElement("script");
    const timeout=setTimeout(function(){
      if(done) return;
      done=true;
      cleanup();
      reject(new Error("Timeout ao conectar com a planilha (Apps Script)."));
    }, 12000);

    function cleanup(){
      clearTimeout(timeout);
      try{ delete window[cbName]; }catch(e){ window[cbName]=undefined; }
      if(script && script.parentNode) script.parentNode.removeChild(script);
    }

    window[cbName]=function(data){
      if(done) return;
      done=true;
      cleanup();
      if(!data || data.ok!==true){
        reject(new Error((data && data.error) ? data.error : "Erro na API"));
        return;
      }
      resolve(data);
    };

    script.onerror=function(){
      if(done) return;
      done=true;
      cleanup();
      reject(new Error("Falha ao conectar com o Apps Script. Verifique se o Web App está publicado como 'Qualquer pessoa'."));
    };
    script.src=url;
    document.head.appendChild(script);
  });
}

async function listPatients(){return (await apiCall({action:"listPatients"})).patients}
async function upsertPatient(patient){return (await apiCall({action:"upsertPatient",patient})).patient}
async function getPatient(id){return (await apiCall({action:"getPatient",id})).patient}
async function listEvolutions(patientId){return (await apiCall({action:"listEvolutions",patientId})).evolutions}
async function upsertEvolution(evolution){return (await apiCall({action:"upsertEvolution",evolution})).evolution}
async function deleteEvolution(id){return (await apiCall({action:"deleteEvolution",id})).deleted}
