import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v252.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v253.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:937,code:'4115010126',name:'内蒙古大学',F:'https://www.imu.edu.cn/',G:'https://zhaosheng.imu.edu.cn/',H:['https://www.imu.edu.cn/','https://zhaosheng.imu.edu.cn/','https://zhaosheng.imu.edu.cn/info/1003/1081.htm'],note:'学校2026本科招生章程明确列出官网及招生信息网址。'},
{row:938,code:'4115010128',name:'内蒙古工业大学',F:'https://www.imut.edu.cn/',G:'https://zsb.imut.edu.cn/',H:['https://www.imut.edu.cn/','https://zsb.imut.edu.cn/','https://zsb.imut.edu.cn/info/1030/1716.htm'],note:'学校2026本科招生章程确认招生网址zsb.imut.edu.cn。'},
{row:939,code:'4115010129',name:'内蒙古农业大学',F:'https://www.imau.edu.cn/',G:'https://zhaosheng.imau.edu.cn/',H:['https://www.imau.edu.cn/','https://zhaosheng.imau.edu.cn/'],note:'阳光高考院校信息及校方招生站确认官网与招生网网址。'},
{row:940,code:'4115010132',name:'内蒙古医科大学',F:'https://www.immu.edu.cn/',G:'https://pgzs.immu.edu.cn/',H:['https://www.immu.edu.cn/','https://pgzs.immu.edu.cn/'],note:'学校2026普通本科招生章程明确列出官网及本科招生信息网址。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























