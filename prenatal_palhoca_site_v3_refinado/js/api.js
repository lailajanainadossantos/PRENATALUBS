async function apiCall(payload){
  const url=(window.APP_CONFIG&&window.APP_CONFIG.APPS_SCRIPT_URL)||"";
  if(!url||url.indexOf("COLE_AQUI")>=0) throw new Error("Configuração ausente: defina APP_CONFIG.APPS_SCRIPT_URL em js/config.js");
  const res=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
  const data=await res.json();
  if(!data.ok) throw new Error(data.error||"Erro na API");
  return data;
}
async function listPatients(){return (await apiCall({action:"listPatients"})).patients}
async function upsertPatient(patient){return (await apiCall({action:"upsertPatient",patient})).patient}
async function getPatient(id){return (await apiCall({action:"getPatient",id})).patient}
async function listEvolutions(patientId){return (await apiCall({action:"listEvolutions",patientId})).evolutions}
async function upsertEvolution(evolution){return (await apiCall({action:"upsertEvolution",evolution})).evolution}
async function deleteEvolution(id){return (await apiCall({action:"deleteEvolution",id})).deleted}