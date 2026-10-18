import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v222.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v223.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:729,code:'4122013605',name:'长春建筑学院',F:'https://www.jladi.edu.cn/',G:'https://zhaosheng.jladi.edu.cn/',H:['https://www.jladi.edu.cn/2026/0520/c686a57026/pagem.htm','https://zhaosheng.jladi.edu.cn/','https://zhaosheng.jladi.edu.cn/996/list.htm'],note:'学校官网发布2026招生章程并链接招生信息网；招生网发布2026招生简章、章程及录取动态。'},
{row:730,code:'4122013606',name:'长春科技学院',F:'https://www.cstu.edu.cn/',G:'https://www.cstu.edu.cn/zsw/index.htm',H:['https://www.cstu.edu.cn/','https://www.cstu.edu.cn/zsw/index.htm'],note:'学校主页及招生信息网位于cstu.edu.cn校方域名；招生网发布2026报考指南。'},
{row:731,code:'4122013607',name:'吉林动画学院',F:'https://www.jlai.edu.cn/',G:'https://zs.jlai.edu.cn/',H:['https://www.jlai.edu.cn/tzgg.htm','https://zs.jlai.edu.cn/','https://xxgk.jlai.edu.cn/'],note:'学校官网、招生办与信息公开平台采用jlai.edu.cn校方域名；招生办发布2026本科招生简章，信息公开站发布2026章程。'},
{row:732,code:'4122013623',name:'长春大学旅游学院',F:'https://www.tccu.edu.cn/',G:'https://www.tccu.edu.cn/zsc/main.htm',H:['https://www.tccu.edu.cn/','https://www.tccu.edu.cn/zsc/main.htm'],note:'学校主页及招生信息网发布2026年招生章程、简章、计划和录取进度；信息均为该校官方域名。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));





















