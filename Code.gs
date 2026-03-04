const SPREADSHEET_ID = "COLE_AQUI_O_ID_DA_PLANILHA";
const SHEET_PATIENTS = "PACIENTES";
const SHEET_EVOLUTIONS = "EVOLUCOES";

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action;
    if(!action) return json_({ok:false,error:"Ação ausente."});
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const shP = ss.getSheetByName(SHEET_PATIENTS);
    const shE = ss.getSheetByName(SHEET_EVOLUTIONS);
    if(!shP || !shE) return json_({ok:false,error:"Abas PACIENTES/EVOLUCOES não encontradas."});

    if(action==="listPatients") return json_({ok:true,patients:listPatients_(shP,shE)});
    if(action==="getPatient") return json_({ok:true,patient:getById_(shP,body.id)});
    if(action==="upsertPatient") return json_({ok:true,patient:upsert_(shP,body.patient)});
    if(action==="listEvolutions") return json_({ok:true,evolutions:listByPatient_(shE,body.patientId)});
    if(action==="upsertEvolution") return json_({ok:true,evolution:upsert_(shE,body.evolution)});
    if(action==="deleteEvolution") return json_({ok:true,deleted:delById_(shE,body.id)});

    return json_({ok:false,error:"Ação desconhecida: "+action});
  }catch(err){
    return json_({ok:false,error:String(err)});
  }
}

function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function headers_(sh){
  const lastCol = sh.getLastColumn();
  const hdr = sh.getRange(1,1,1,lastCol).getValues()[0];
  const map = {};
  for(let i=0;i<hdr.length;i++){
    const k = String(hdr[i]||"").trim();
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
    for(let i=0;i<hdr.length;i++) o[String(hdr[i])] = r[i]===null?"":r[i];
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
  for(let i=0;i<hdr.length;i++) o[String(hdr[i])] = vals[i]===null?"":vals[i];
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
    const v = (obj[k]!==undefined)?obj[k]:"";
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
    return Object.assign({},p,{ultimaConsulta: ev? (ev.dataConsulta||""):"", dpp: ev? (ev.dpp||""):""});
  });
}
