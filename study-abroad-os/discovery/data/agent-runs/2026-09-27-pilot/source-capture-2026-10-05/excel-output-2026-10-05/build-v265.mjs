import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v264.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v265.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1020,code:'4137013320',name:'青岛黄海学院',F:'https://www.qdhhc.edu.cn/',G:'https://www.qdhhc.edu.cn/zhaoshengban/',H:['https://www.qdhhc.edu.cn/','https://www.qdhhc.edu.cn/zhaoshengban/'],note:'学校官网发布2026招生简章；招生办页面发布2026招生章程、招生信息与联系方式。'},
{row:1021,code:'4137013378',name:'青岛城市学院',F:'https://www.qdc.edu.cn/',G:'https://www.qdc.edu.cn/',H:['https://www.qdc.edu.cn/','https://www.qdc.edu.cn/p/'],note:'学校官网提供本科招生入口、招生办公室联系方式及留学生咨询邮箱；使用校方门户作招生入口。'},
{row:1022,code:'4137013995',name:'青岛工学院',F:'https://www.qit.edu.cn/',G:'https://zhaosheng.qit.edu.cn/',H:['https://www.qit.edu.cn/','https://zhaosheng.qit.edu.cn/','https://zhaosheng.qit.edu.cn/info/1107/3842.htm'],note:'学校2026招生章程确认学校名称、代码13995及官网；招生信息网发布2026章程、招生计划。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
































