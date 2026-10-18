import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v269.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v270.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1036,code:'4137013379',name:'潍坊理工学院',F:'https://www.wfit.edu.cn/',G:'https://www.wfit.edu.cn/',H:['https://www.wfit.edu.cn/'],note:'2026招生章程可由省级阳光高考平台核验学校名称；官方学校网址为wfit.edu.cn，暂用主页入口。'},
{row:1037,code:'4137010451',name:'鲁东大学',F:'https://www.ldu.edu.cn/',G:'https://zs.ldu.edu.cn/',H:['https://www.ldu.edu.cn/','https://zs.ldu.edu.cn/index.htm','https://zs.ldu.edu.cn/info/1438/3432.htm'],note:'2026招生章程确认学校代码10451、官网及本科招生网址，招生网发布章程与计划。'},
{row:1038,code:'4137011066',name:'烟台大学',F:'https://www.ytu.edu.cn/',G:'https://bkzs.ytu.edu.cn/',H:['https://www.ytu.edu.cn/','https://bkzs.ytu.edu.cn/','https://gk.ytu.edu.cn/info/1204/4182.htm','https://www.ytu.edu.cn/info/1047/21517.htm'],note:'学校信息公开网与官网明确本科招生信息网bkzs.ytu.edu.cn，并发布2026招生信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));





































