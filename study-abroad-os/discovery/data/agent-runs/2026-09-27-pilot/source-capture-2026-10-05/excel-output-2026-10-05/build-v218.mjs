import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v217.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v218.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:709,code:'4122010193',name:'吉林农业大学',F:'https://www.jlau.edu.cn/',G:'https://zhaosheng.jlau.edu.cn/',H:['https://www.jlau.edu.cn/xxgk/dxzc.htm','https://www.jlau.edu.cn/zsjy/bkszs.htm'],note:'学校章程确认官网域名；学校本科招生栏目明确链接招生信息网zhaosheng.jlau.edu.cn。国际学生招生另行核实。'},
{row:710,code:'4122010199',name:'长春中医药大学',F:'https://www.ccucm.edu.cn/',G:'https://zhaosheng.ccucm.edu.cn/',H:['https://zhaosheng.ccucm.edu.cn/','https://zhaosheng.ccucm.edu.cn/info/1159/16926.htm','https://www.ccucm.edu.cn/xuexiaozhangcheng.pdf'],note:'校方2026招生章程列出学校官网；本科招生信息网发布2026招生章程、招生简章及录取进度。国际学生招生另行核实。'},
{row:711,code:'4122010200',name:'东北师范大学',F:'https://www.nenu.edu.cn/',G:'https://zsb.nenu.edu.cn/',H:['https://zsb.nenu.edu.cn/','https://zsb.nenu.edu.cn/info/1100/4270.htm','https://publish.nenu.edu.cn/info/1011/2933.htm'],note:'官网域名nenu.edu.cn并有校方年度信息公开报告确认本科招生网；招生网发布招生章程。国内招生页面勿作国际生政策依据。'},
{row:712,code:'4122010204',name:'吉林工程技术师范学院',F:'https://www.jlenu.edu.cn/',G:'https://zs.jlenu.edu.cn/',H:['https://zs.jlenu.edu.cn/info/1087/6232.htm','https://www.jlenu.edu.cn/'],note:'学校官网设本科招生入口；招生就业处官网发布2026年招生章程，学校网址与身份在章程中确认。国际学生另行核实。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
















