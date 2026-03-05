const SPREADSHEET_ID = "133Qmxc1aGsoPRTgz3emp6hVFK1aYfiFy-7mA7aUnna4";
const SHEET_PATIENTS = "PACIENTES";
const SHEET_EVOLUTIONS = "EVOLUCOES";

function doGet(e){
  try{
    const params = (e && e.parameter) ? e.parameter : {};
    // Suporte JSONP para evitar bloqueio (CORS) quando o site estiver no GitHub Pages
    const cb = params.callback;
    const payloadB64 = params.payload || "";
    let body = {};
    if(payloadB64){
      body = JSON.parse(Utilities.newBlob(Utilities.base64Decode(payloadB64)).getDataAsString("utf-8"));
    }
    // Se não vier payload, apenas responde OK (teste)
    if(!body.action){
      return respond_({ok:true, note:"OK"}, cb);
    }
    const data = route_(body);
    return respond_(data, cb);
  }catch(err){
    const cb = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;
    return respond_({ok:false, error:String(err)}, cb);
  }
}

function doPost(e){
  // Mantém POST para uso futuro (se hospedar no próprio Apps Script ou em servidor com CORS)
  try{
    const body = JSON.parse((e && e.postData && e.postData.contents) ? e.postData.contents : "{}");
    if(!body.action) return respond_({ok:false, error:"Ação ausente."}, null);
    return respond_(route_(body), null);
  }catch(err){
    return respond_({ok:false, error:String(err)}, null);
  }
}

function route_(body){
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const shP = getOrCreateSheet_(ss, SHEET_PATIENTS, [
    "id", "nome", "dataNascimento", "gpa", "risco", "hf_dm", "hf_has", "hf_hipo", "tipoRh",
    "referenciaIG", "dum", "usgData", "usgIG", "updatedAt"
  ]);
  const shE = getOrCreateSheet_(ss, SHEET_EVOLUTIONS, [
    "id", "patientId", "dataConsulta", "dum", "usgData", "usgIG", "peso", "altura", "imc",
    "habitosTexto", "observacoes", "conduta", "dpp", "updatedAt"
  ]);

  const action = body.action;

  if(action==="listPatients") return {ok:true, patients:listPatients_(shP, shE)};
  if(action==="getPatient") return {ok:true, patient:getById_(shP, body.id)};
  if(action==="upsertPatient") return {ok:true, patient:upsert_(shP, body.patient)};

  if(action==="listEvolutions") return {ok:true, evolutions:listByPatient_(shE, body.patientId)};
  if(action==="upsertEvolution") return {ok:true, evolution:upsert_(shE, body.evolution)};
  if(action==="deleteEvolution") return {ok:true, deleted:delById_(shE, body.id)};

  return {ok:false, error:"Ação desconhecida: "+action};
}

function respond_(obj, callback){
  const txt = JSON.stringify(obj);
  if(callback){
    return ContentService
      .createTextOutput(callback + "(" + txt + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(txt)
    .setMimeType(ContentService.MimeType.JSON);
}

/* ===== Helpers ===== */

function getOrCreateSheet_(ss, name, headers){
  let sh = ss.getSheetByName(name);
  if(!sh) sh = ss.insertSheet(name);
  const lastCol = Math.max(sh.getLastColumn(), headers.length);
  if(sh.getLastRow() === 0){
    sh.getRange(1,1,1,headers.length).setValues([headers]);
  }else{
    const hdr = sh.getRange(1,1,1,lastCol).getValues()[0];
    const current = hdr.map(h => String(h||"").trim());
    const needsFix = headers.some((h,i)=>current[i]!==h);
    if(needsFix){
      sh.getRange(1,1,1,headers.length).setValues([headers]);
    }
  }
  return sh;
}

function headers_(sh){
  const lastCol=sh.getLastColumn();
  const hdr=sh.getRange(1,1,1,lastCol).getValues()[0];
  const map={};
  for(let i=0;i<hdr.length;i++){
    const k=String(hdr[i]||"").trim();
    if(k) map[k]=i+1;
  }
  return map;
}

function uuid_(){
  const s = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return s.slice(0,12);
}

function findRowById_(sh,id){
  if(!id) return 0;
  const h=headers_(sh);
  const col=h["id"];
  const last=sh.getLastRow();
  if(last<2) return 0;
  const vals=sh.getRange(2,col,last-1,1).getValues();
  for(let i=0;i<vals.length;i++){
    if(String(vals[i][0])===String(id)) return i+2;
  }
  return 0;
}

function getAll_(sh){
  const lastRow=sh.getLastRow(), lastCol=sh.getLastColumn();
  if(lastRow<2) return [];
  const hdr=sh.getRange(1,1,1,lastCol).getValues()[0];
  const rows=sh.getRange(2,1,lastRow-1,lastCol).getValues();
  return rows.map(r=>{
    const o={};
    for(let i=0;i<hdr.length;i++) o[String(hdr[i])]=(r[i]===null?"":r[i]);
    return o;
  });
}

function getById_(sh,id){
  const row=findRowById_(sh,id);
  if(!row) throw new Error("Registro não encontrado.");
  const lastCol=sh.getLastColumn();
  const hdr=sh.getRange(1,1,1,lastCol).getValues()[0];
  const vals=sh.getRange(row,1,1,lastCol).getValues()[0];
  const o={};
  for(let i=0;i<hdr.length;i++) o[String(hdr[i])]=(vals[i]===null?"":vals[i]);
  return o;
}

function upsert_(sh,obj){
  if(!obj) throw new Error("Dados ausentes.");
  const h=headers_(sh);
  const now=new Date().toISOString();
  let id=String(obj.id||"");
  let row=id?findRowById_(sh,id):0;

  if(!row){
    id=uuid_();
    row=sh.getLastRow()+1;
    sh.insertRowAfter(sh.getLastRow());
    sh.getRange(row,h["id"]).setValue(id);
  }
  Object.keys(h).forEach(k=>{
    if(k==="id") return;
    const v=(obj[k]!==undefined)?obj[k]:"";
    sh.getRange(row,h[k]).setValue(v);
  });
  if(h["updatedAt"]) sh.getRange(row,h["updatedAt"]).setValue(now);
  return getById_(sh,id);
}

function delById_(sh,id){
  const row=findRowById_(sh,id);
  if(!row) return false;
  sh.deleteRow(row);
  return true;
}

function listByPatient_(sh,patientId){
  return getAll_(sh).filter(r=>String(r.patientId||"")===String(patientId||""));
}

function listPatients_(shP,shE){
  const patients=getAll_(shP);
  const evol=getAll_(shE);
  const byP={};
  evol.forEach(ev=>{
    const pid=String(ev.patientId||"");
    if(!pid) return;
    const dt=String(ev.dataConsulta||"");
    if(!byP[pid] || String(byP[pid].dataConsulta||"")<dt) byP[pid]=ev;
  });
  return patients.map(p=>{
    const ev=byP[String(p.id||"")]||null;
    return Object.assign({},p,{
      ultimaConsulta: ev ? (ev.dataConsulta||"") : "",
      dpp: ev ? (ev.dpp||"") : ""
    });
  });
}
