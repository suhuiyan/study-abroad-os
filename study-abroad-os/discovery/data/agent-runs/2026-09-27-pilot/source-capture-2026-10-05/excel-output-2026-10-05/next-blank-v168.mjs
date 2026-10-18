import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const w=await SpreadsheetFile.importXlsx(await FileBlob.load('china-university-directory-1412-official-links-2026-10-06-v168.xlsx')),s=w.worksheets.getItem('รายชื่อ 1412');let a=[];for(let r=5;r<=1416;r++)if(!s.getRange(`F${r}`).values[0][0])a.push([r,...s.getRange(`C${r}:D${r}`).values[0]]);console.log(JSON.stringify(a.slice(0,22)));

