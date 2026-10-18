import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v260.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v261.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:997,code:'4137013383',name:'山东财经大学燕山学院',F:'https://ys.sdufe.edu.cn/',G:'https://yszs.sdufe.edu.cn/',H:['https://ys.sdufe.edu.cn/','https://yszs.sdufe.edu.cn/','https://yszs.sdufe.edu.cn/info/1031/1451.htm'],note:'学校官网确认学院身份，官方招生信息网发布2026招生章程和本科招生计划。'},
{row:998,code:'4137013998',name:'齐鲁理工学院',F:'https://www.qlit.edu.cn/',G:'https://www.qlit.edu.cn/zsw/',H:['https://www.qlit.edu.cn/','https://www.qlit.edu.cn/zsw/','https://www.qlit.edu.cn/zsw/zsjh/'],note:'学校官网及招生信息网为同一官方域名，招生站发布2026招生与计划信息。'},
{row:999,code:'4137014100',name:'山东政法学院',F:'https://www.sdupsl.edu.cn/',G:'https://zs.sdupsl.edu.cn/',H:['https://www.sdupsl.edu.cn/','https://zs.sdupsl.edu.cn/'],note:'学校招生信息网发布2026普通高等教育招生章程，校方域名确认学校身份。'},
{row:1000,code:'4137014276',name:'齐鲁师范学院',F:'https://www.qlnu.edu.cn/',G:'https://zsb.qlnu.edu.cn/',H:['https://www.qlnu.edu.cn/','https://zsb.qlnu.edu.cn/','https://www.qlnu.edu.cn/info/1052/230279.htm'],note:'学校官网与招生信息网均为校方域名，发布2026本科招生指南、章程与计划。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));




























