const EXAMS={laboratorio:{"1º trimestre":["Hemograma completo","Glicemia","Parcial de urina","Urocultura","TSH","TSA","Grupo sanguíneo + fator Rh","Toxoplasmose IgM/IgG","Anti-HBs","VDRL"],
"2º trimestre":["Hemograma","TOTG 75g (0/60/120)","TSA","Urocultura","Parcial de urina","Coombs indireto","Toxoplasmose IgM/IgG","VDRL"],
"3º trimestre":["Hemograma","Glicemia","TSA","Urocultura","Parcial de urina","Coombs indireto","Toxoplasmose IgM/IgG","VDRL","Swab retovaginal (cultura Strepto B)"]},
imagem:[{name:"USG transvaginal (6 a 12 semanas)",window:[6,12]},{name:"USG obstétrico com translucência nucal (11 a 13 semanas e 6 dias)",window:[11,13.9]},{name:"USG obstétrico morfológico (20 a 24 semanas)",window:[20,24]},{name:"USG obstétrico morfológico com Doppler (20 a 24 semanas)",window:[20,24]},{name:"USG obstétrico",window:null}]};
function isIdealWindow(name,igWeeks){
  if(!igWeeks) return false;
  const n=name.toLowerCase();
  if(n.indexOf("totg")==0) return igWeeks>=24&&igWeeks<=28;
  if(n.indexOf("swab")>=0) return igWeeks>=35&&igWeeks<=37;
  if(n.indexOf("coombs")>=0) return igWeeks>=27.5&&igWeeks<=29;
  if(n.indexOf("transluc")>=0) return igWeeks>=11&&igWeeks<=13.9;
  if(n.indexOf("morfol")>=0) return igWeeks>=20&&igWeeks<=24;
  if(n.indexOf("transvaginal")>=0) return igWeeks>=6&&igWeeks<=12;
  return false;
}