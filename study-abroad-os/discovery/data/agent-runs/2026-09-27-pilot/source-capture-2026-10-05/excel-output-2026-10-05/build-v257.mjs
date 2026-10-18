import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v256.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v257.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:953,code:'4115012443',name:'兴安职业技术大学',F:'https://www.nmxzy.cn/',G:'https://www.nmxzy.cn/33/list2.htm',H:['https://www.nmxzy.cn/','https://www.nmxzy.cn/33/list2.htm','https://www.nmxzy.cn/2026/0624/c38a14822/page.htm'],note:'学校官网招生信息栏目发布2026招生章程及招生公告。'},
{row:972,code:'4137010449',name:'山东航空学院',F:'https://www.sdua.edu.cn/',G:'https://zs.sdua.edu.cn/',H:['https://www.sdua.edu.cn/','https://zs.sdua.edu.cn/','https://dqgc.sdua.edu.cn/2026/0608/c21093a298323/page.htm'],note:'学校2026本科招生章程明确列出招生信息网zs.sdua.edu.cn。'},
{row:973,code:'4137012818',name:'滨州职业技术大学',F:'https://www.bzpt.edu.cn/',G:'https://zs.bzpt.edu.cn/index.htm',H:['https://www.bzpt.edu.cn/','https://zs.bzpt.edu.cn/index.htm','https://zs.bzpt.edu.cn/info/1008/6451.htm'],note:'学校招生网发布2026普通高等教育招生章程，首页标识学校名及招生功能。'},
{row:974,code:'4137010448',name:'德州学院',F:'https://www.dzu.edu.cn/',G:'https://zs.dzu.edu.cn/index.htm',H:['https://www.dzu.edu.cn/','https://zs.dzu.edu.cn/index.htm','https://www.dzu.edu.cn/info/1101/9269.htm'],note:'学校官网公告确认本科招生信息网网址；2026招生计划、录取信息在招生网发布。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























