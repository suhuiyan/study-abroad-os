import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v220.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v221.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:721,code:'4122011441',name:'吉林警察学院',F:'https://www.jljcxy.com/',G:'https://zsw.jljcxy.com/',H:['https://www.hzgrys.net/regulation/1/2026/552.html','https://zsw.jljcxy.com/info/1010/4171.htm'],note:'2026年招生章程列明学校官网jljcxy.com；招生网站zsw.jljcxy.com发布2026章程及招生信息。公安专业有额外报考条件，按当年省级公安招考要求核对。'},
{row:722,code:'4122011726',name:'长春大学',F:'https://www.ccu.edu.cn/',G:'https://zsb.ccu.edu.cn/',H:['https://ccu.edu.cn/info/1381/33901.htm','https://www.eol.cn/jilin/jlgd/202606/t20260602_2739855.shtml'],note:'学校2026招生章程确认主页；校方招生简章明确本科招生信息网zsb.ccu.edu.cn。国际招生与奖学金需另核。'},
{row:723,code:'4122013161',name:'长春职业技术大学',F:'https://www.cvit.edu.cn/',G:'https://www.cvit.edu.cn/index/zsxx.htm',H:['https://www.cvit.edu.cn/xxgk.htm','https://www.cvit.edu.cn/index/zsxx.htm'],note:'学校官网和招生信息页发布2026职业本科及专科招生计划；两种培养层次应分开确认，国际学生政策另核。'},
{row:724,code:'4122013600',name:'长春光华学院',F:'https://www.ghu.edu.cn/',G:'https://zsb.ghu.edu.cn/',H:['https://www.ghu.edu.cn/','https://zsb.ghu.edu.cn/index.htm'],note:'学校主页及招生办子站使用ghu.edu.cn校方域名；招生站发布2026招生章程、计划与录取进程。国际招生与奖学金另核。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));



















