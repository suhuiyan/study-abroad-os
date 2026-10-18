import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v253.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v254.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:941,code:'4115010135',name:'内蒙古师范大学',F:'https://www.imnu.edu.cn/',G:'https://zs.imnu.edu.cn/sy.htm',H:['https://www.imnu.edu.cn/','https://zs.imnu.edu.cn/sy.htm'],note:'学校招生办公室官网发布2026年招生章程、简章及招生计划。'},
{row:942,code:'4115010139',name:'内蒙古财经大学',F:'https://www.imufe.edu.cn/',G:'https://www.imufe.edu.cn/zsxxw/',H:['https://www.imufe.edu.cn/','https://www.imufe.edu.cn/zsxxw/'],note:'2026本科招生章程及历年招生信息确认学校官网和招生信息网。'},
{row:943,code:'4115010871',name:'内蒙古建筑职业技术大学',F:'https://www.imaa.edu.cn/',G:'https://zsw.imaa.edu.cn/',H:['https://www.imaa.edu.cn/','https://zsw.imaa.edu.cn/','https://www.moe.gov.cn/srcsite/A03/s181/202506/t20250619_1194816.html'],note:'教育部2025函确认以原内蒙古建筑职业技术学院为基础设置新大学并撤销原建制；校方招生站为zsw.imaa.edu.cn。'},
{row:944,code:'4115011709',name:'呼和浩特民族学院',F:'https://www.imnc.edu.cn/',G:'https://www.imnc.edu.cn/zs/',H:['https://www.imnc.edu.cn/','https://www.imnc.edu.cn/zs/'],note:'学校招生网发布2026本科招生章程与招生计划；官网导航含本科招生入口。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























