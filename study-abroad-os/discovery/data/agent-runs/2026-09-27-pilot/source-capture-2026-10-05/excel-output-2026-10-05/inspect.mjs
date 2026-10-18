import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const w=await SpreadsheetFile.importXlsx(await FileBlob.load('china-university-directory-1412-official-links-2026-10-06-v159.xlsx'));
const s=w.worksheets.getItem('รายชื่อ 1412');
for(const r of [375,376,377,393]) console.log(r,JSON.stringify(s.getRange(`C${r}:M${r}`).values[0]));
