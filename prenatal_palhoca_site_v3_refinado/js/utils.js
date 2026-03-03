function qs(s,e=document){return e.querySelector(s)};function qsa(s,e=document){return Array.from(e.querySelectorAll(s))}
function fmtDateBR(iso){if(!iso)return"";const d=new Date(iso+"T00:00:00");return String(d.getDate()).padStart(2,'0')+"/"+String(d.getMonth()+1).padStart(2,'0')+"/"+d.getFullYear()}
function todayISO(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,'0')+"-"+String(d.getDate()).padStart(2,'0')}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function daysBetween(a,b){if(!a||!b)return null;return Math.round((new Date(a+"T00:00:00")-new Date(b+"T00:00:00"))/(1000*60*60*24))}
function addDays(iso,days){if(!iso)return"";const d=new Date(iso+"T00:00:00");d.setDate(d.getDate()+days);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,'0')+"-"+String(d.getDate()).padStart(2,'0')}
function parseIG(t){if(!t)return null;t=String(t).toLowerCase().replace(/,/g,' ').replace(/\s+/g,' ').trim();let m=t.match(/(\d{1,2})\s*s(?:em)?(?:anas?)?\s*(\d{1,2})?\s*d?/);let w=null,d=0;if(m){w=parseInt(m[1],10);d=m[2]?parseInt(m[2],10):0}else{m=t.match(/(\d{1,2})\s*(?:sem|semanas?)\s*(?:e)?\s*(\d{1,2})/);if(m){w=parseInt(m[1],10);d=parseInt(m[2],10)}else{m=t.match(/^(\d{1,2})$/);if(m){w=parseInt(m[1],10);d=0}}}if(w===null||isNaN(w)||isNaN(d))return null;d=clamp(d,0,6);return{weeks:w,days:d,totalDays:w*7+d,label:(w+"s"+d+"d")}}
function fmtIG(total){if(total==null)return null;const w=Math.floor(total/7),d=total%7;return{weeks:w,days:d,label:(w+"s"+d+"d")}}
function calcIMC(p,a){p=parseFloat(p);a=parseFloat(a);if(!isFinite(p)||!isFinite(a)||a<=0)return"";return (p/(a*a)).toFixed(1)}
function trimestreFromIG(days){if(days==null)return"";const w=Math.floor(days/7);if(w<=13)return"1º trimestre";if(w<=27)return"2º trimestre";return"3º trimestre"}
function mesesAproxFromIG(days){if(days==null)return"";return ((days/7)/4.3).toFixed(1)}
function calcDPPFromDUM(dum){return dum?addDays(dum,280):""}
function calcDPPFromUSG(usgDate,ig){if(!usgDate||!ig)return"";return addDays(usgDate,280-ig.totalDays)}

function toast(msg){
  var t=document.createElement('div');
  t.textContent=msg;
  t.style.position='fixed';
  t.style.left='50%';
  t.style.bottom='18px';
  t.style.transform='translateX(-50%)';
  t.style.background='rgba(15,23,42,.92)';
  t.style.color='#fff';
  t.style.padding='10px 12px';
  t.style.borderRadius='14px';
  t.style.fontWeight='800';
  t.style.zIndex='9999';
  t.style.boxShadow='0 10px 30px rgba(2,6,23,.25)';
  document.body.appendChild(t);
  setTimeout(function(){t.style.opacity='0';t.style.transition='opacity .25s ease';}, 1400);
  setTimeout(function(){t.remove();}, 1700);
}
