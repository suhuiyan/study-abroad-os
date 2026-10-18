import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v265.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v266.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1023,code:'4137014327',name:'青岛电影学院',F:'https://www.qdfa.edu.cn/',G:'https://www.qdfa.edu.cn/',H:['https://www.qdfa.edu.cn/'],note:'学校2026普通高等教育招生章程确认学校官网及招生联系方式；暂用官网为统一入口。'},
{row:1024,code:'4137014878',name:'康复大学',F:'https://www.uhrs.edu.cn/',G:'https://www.uhrs.edu.cn/zsgz/yjszs.htm',H:['https://www.uhrs.edu.cn/','https://www.uhrs.edu.cn/zsgz/yjszs.htm'],note:'学校官网公布招生热线及研究生招生信息；尚未确认本科国际招生专页，链接仅作为校方招生入口。'},
{row:1025,code:'4137012062',name:'日照职业技术大学',F:'https://www.rzpt.edu.cn/',G:'https://gotorzu.rzpt.cn/',H:['https://www.rzpt.edu.cn/index.htm','https://gotorzu.rzpt.cn/','https://gotorzu.rzpt.cn/index/zxgg.htm','https://www.moe.gov.cn/srcsite/A03/s181/202603/t20260319_1431469.html'],note:'教育部批复学校设置；校方招生站说明2026年更名并发布2026本科、专科招生计划及港澳台招生简章。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));

































