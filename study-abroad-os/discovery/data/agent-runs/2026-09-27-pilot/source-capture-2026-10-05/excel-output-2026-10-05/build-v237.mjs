import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v236.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v237.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:842,code:'4136011318',name:'江西科技师范大学',F:'https://www.jxstnu.edu.cn/',G:'https://bkzs.jxstnu.edu.cn/',H:['https://www.jxstnu.edu.cn/','https://bkzs.jxstnu.edu.cn/info/1061/2781.htm','https://bkzs.jxstnu.edu.cn/zszc.htm'],note:'本科招生信息网发布2026普通本科招生章程和政策；网站隶属jxstnu.edu.cn官方域名。'},
{row:843,code:'4136011319',name:'江西水利电力大学',F:'https://www.juwp.edu.cn/',G:'https://envo.juwp.edu.cn/',H:['https://www.juwp.edu.cn/wzdh.htm','https://envo.juwp.edu.cn/'],note:'学校网站导航列招生信息网；招生就业处官方站介绍为江西水利电力大学招生信息网。'},
{row:844,code:'4136011504',name:'江西警察学院',F:'https://www.jxga.edu.cn/',H:['https://www.jxga.edu.cn/','https://stu.jxga.edu.cn/info/1221/16583.htm'],note:'学校官网及赣州市公安局转引的2026招生问答引用学校官网域名；本次未核验独立招生子站。'},
{row:845,code:'4136012795',name:'南昌理工学院',F:'https://www.nut.edu.cn/',G:'https://cx.nut.edu.cn/',H:['https://www.nut.edu.cn/','https://cx.nut.edu.cn/index.html#/','https://dzb.nut.edu.cn/frontend/article/detail?id=71'],note:'学校主页列招生信息网；学校信息公开报告说明招生信息网发布招生政策、计划和报到信息。'},
{row:846,code:'4136012938',name:'江西应用科技学院',F:'https://www.jxuas.com/',G:'https://www.jxuas.com/zhaosheng/',H:['https://www.jxuas.com/','https://www.jxuas.com/zhaosheng/','https://www.jxuas.edu.cn/zhaosheng/info/1065/1978.htm'],note:'学校官网列招生网入口；2026招生简章在学院官网发布并确认国标代码12938。'},
{row:847,code:'4136013418',name:'江西服装学院',F:'https://www.jift.edu.cn/',G:'https://zsb.jift.edu.cn/',H:['https://www.jift.edu.cn/','https://zsb.jift.edu.cn/index.htm','https://zsb.jift.edu.cn/zsxx/zsjz.htm'],note:'学校主页与招生信息网均属jift.edu.cn官方域名；招生网发布2026招生简章、计划和录取信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























