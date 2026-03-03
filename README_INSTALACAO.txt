PRÉ-NATAL • BANCO UBS (Palhoça) — arquivos do site (sem login)

1) CRIAR A PLANILHA (Google Sheets)
- Crie uma planilha nova no Google Drive com 2 abas exatamente com estes nomes:
  1) PACIENTES
  2) EVOLUCOES

2) CABEÇALHOS (linha 1)

ABA "PACIENTES":
id | nome | dataNascimento | gpa | risco | hf_dm | hf_has | hf_hipo | tipoRh | referenciaIG | dum | usgData | usgIG | updatedAt

ABA "EVOLUCOES":
id | patientId | dataConsulta | dum | usgData | usgIG | peso | altura | imc | habitosTexto | observacoes | conduta | dpp | updatedAt

3) GOOGLE APPS SCRIPT
- Planilha > Extensões > Apps Script
- Cole apps_script/Code.gs em Code.gs
- Defina o SPREADSHEET_ID (ID da planilha)
- Deploy > New deployment > Web app
  Execute as: Me
  Who has access: Anyone
- Copie a URL do Web App.

4) CONFIGURAR O SITE
- Cole a URL do Web App em js/config.js (APPS_SCRIPT_URL).

5) SUBIR OS ARQUIVOS
- Hospedagem estática (Netlify/Vercel/GitHub Pages). Arquivo inicial: index.html


OBS: Regra do projeto — cálculos de IG/Trimestre/DPP exibidos no site e na requisição são sempre baseados na data de hoje (independente da data registrada da consulta).
