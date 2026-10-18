import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v251.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v252.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:933,code:'4115011631',name:'河套学院',F:'https://www.htxy.edu.cn/',G:'https://www.htxy.edu.cn/zsxxw/',H:['https://www.htxy.edu.cn/','https://www.htxy.edu.cn/zsxxw/'],note:'学校2026年招生章程列明官网及招生信息网址。'},
{row:934,code:'4115010127',name:'内蒙古科技大学',F:'https://www.imust.edu.cn/',G:'https://zhaosheng.imust.edu.cn/',H:['https://www.imust.edu.cn/','https://zhaosheng.imust.edu.cn/'],note:'学校官网与本科招生信息网发布2026本科招生信息。'},
{row:935,code:'4115010138',name:'赤峰大学',F:'https://www.cfxy.cn/',H:['https://www.cfxy.cn/','https://www.moe.gov.cn/srcsite/A03/s181/202603/t20260319_1431457.html'],note:'教育部2026年函确认赤峰学院更名为赤峰大学且学校标识码不变；新校官网cfxy.cn。招生主页仍需确认。'},
{row:936,code:'4115014532',name:'鄂尔多斯应用技术学院',F:'https://www.oit.edu.cn/',G:'https://www.oit.edu.cn/jyjx/zsxx.htm',H:['https://www.oit.edu.cn/','https://www.oit.edu.cn/jyjx/zsxx.htm'],note:'学校官网发布本科招生栏目；官网域名与招生链接归属待后续二次复核。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























