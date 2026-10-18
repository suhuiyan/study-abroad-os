import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v266.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v267.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1026,code:'4137013387',name:'山东外国语职业技术大学',F:'https://www.swut.edu.cn/',G:'https://zsb.swut.cn/',H:['https://www.swut.edu.cn/html/856/','https://zsb.swut.cn/'],note:'学校简介和官网确认校名、招生咨询电话；2026招生章程列出招生网zsb.swut.cn。'},
{row:1028,code:'4137010453',name:'泰山学院',F:'https://www.tsu.edu.cn/',G:'https://zhaosheng.tsu.edu.cn/_t768/main.htm',H:['https://www.tsu.edu.cn/','https://zhaosheng.tsu.edu.cn/_t768/main.htm','https://zhaosheng.tsu.edu.cn/_t768/2026/0511/c1258a136193/page.htm'],note:'学校2026招生章程确认学校代码10453及招生信息网，站点发布招生章程和录取信息。'},
{row:1029,code:'4137013624',name:'泰山科技学院',F:'https://www.tskjxy.edu.cn/',G:'https://zs.tskjxy.edu.cn/',H:['https://www.tskjxy.edu.cn/','https://www.tskjxy.edu.cn/info/1215/16847.htm','https://zs.tskjxy.edu.cn/'],note:'学校2026招生章程确认学校代码13624、官网与招生网网址。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));


































