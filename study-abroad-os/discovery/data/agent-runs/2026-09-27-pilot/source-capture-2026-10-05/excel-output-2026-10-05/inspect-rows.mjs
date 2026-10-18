import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const w=await SpreadsheetFile.importXlsx(await FileBlob.load('china-university-directory-1412-official-links-2026-10-06-v340.xlsx'));const s=w.worksheets.getItem('รายชื่อ 1412');for(const r of [1310,1312,1344,1345,1347])console.log(r,JSON.stringify(s.getRange(`A${r}:P${r}`).values[0]));
