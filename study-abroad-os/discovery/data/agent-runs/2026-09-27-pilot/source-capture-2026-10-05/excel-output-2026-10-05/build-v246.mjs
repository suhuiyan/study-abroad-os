import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v245.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v246.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:903,code:'4121013213',name:'锦州医科大学医疗学院',F:'https://www.jymu.edu.cn/',H:['https://www.jymu.edu.cn/'],note:'学院官网介绍确认学校身份及教育部批准设立信息；独立招生子站未确认。'},
{row:904,code:'4121013217',name:'辽宁理工学院',F:'https://www.lise.edu.cn/',G:'https://www.lise.edu.cn/s.php/zhaosheng/',H:['https://www.lise.edu.cn/','https://www.lise.edu.cn/s.php/zhaosheng/','https://www.lise.edu.cn/sites/html/zhaosheng/2026_03/12_22/content-40803.html'],note:'学校招生信息由lise.edu.cn官方域名发布；招生官网提供2026计划、章程和录取信息。'},
{row:906,code:'4121010140',name:'辽宁大学',F:'https://www.lnu.edu.cn/',G:'https://zs.lnu.edu.cn/',H:['https://www.lnu.edu.cn/','https://zs.lnu.edu.cn/','https://zs.lnu.edu.cn/info/14170/71634.htm'],note:'学校2026本科招生章程列明学校官网及本科招生网。'},
{row:907,code:'4121010142',name:'沈阳工业大学',F:'https://www.sut.edu.cn/',G:'https://zsxxw.sut.edu.cn/',H:['https://www.sut.edu.cn/','https://zsxxw.sut.edu.cn/','https://zsxxw.sut.edu.cn/info/1069/2574.htm'],note:'学校2026招生章程列明官网及招生信息网；招生网发布本科招生通知。'},
{row:908,code:'4121010143',name:'沈阳航空航天大学',F:'https://www.sau.edu.cn/',G:'https://zs.sau.edu.cn/index.htm',H:['https://www.sau.edu.cn/','https://zs.sau.edu.cn/index.htm'],note:'学校官网与本科招生网均属sau.edu.cn；招生网发布2026章程和招生计划。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























