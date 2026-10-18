import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v267.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v268.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1030,code:'4137013999',name:'山东财经大学东方学院',F:'https://www.sdor.cn/',G:'https://zs.sdor.cn/',H:['https://www.sdor.cn/main.htm','https://zs.sdor.cn/'],note:'2026招生章程确认学校代码13999、官网和招生网；招生网发布2026录取工作信息。'},
{row:1031,code:'4137013874',name:'山东外事职业大学',F:'https://www.sdws.edu.cn/',G:'https://zs.sdws.edu.cn/',H:['https://www.sdws.edu.cn/','https://zs.sdws.edu.cn/'],note:'学校官网与招生信息网使用校方域名；如校方门户跳转异常，保留招生站入口供核验。'},
{row:1032,code:'4137010438',name:'山东第二医科大学',F:'https://www.sdsmu.edu.cn/',G:'https://zs.sdsmu.edu.cn/',H:['https://www.sdsmu.edu.cn/','https://zs.sdsmu.edu.cn/','https://wsc.sdsmu.edu.cn/gjjyxy/lxwy/list.psp'],note:'学校官网与招生信息网发布2026本科招生章程、指南；国际教育网站发布2026国际学生本科招生简章。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));



































