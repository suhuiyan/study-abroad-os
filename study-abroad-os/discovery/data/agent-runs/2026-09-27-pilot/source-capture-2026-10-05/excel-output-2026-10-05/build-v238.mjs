import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v237.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v238.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:848,code:'4136013420',name:'南昌职业大学',F:'https://www.nvu.edu.cn/',G:'https://zsb.nvu.edu.cn/index.htm',H:['https://www.nvu.edu.cn/','https://zsb.nvu.edu.cn/index.htm'],note:'学校官网与招生信息网均使用nvu.edu.cn官方域名；招生网发布2026年招生信息。'},
{row:849,code:'4136013421',name:'南昌工学院',F:'https://www.ncpu.edu.cn/',G:'https://zsb.ncpu.edu.cn/',H:['https://www.ncpu.edu.cn/','https://zsb.ncpu.edu.cn/'],note:'学校官网与招生信息网均使用ncpu.edu.cn官方域名；招生网发布2026招生信息并列学校代码13421。'},
{row:850,code:'4136013422',name:'江西外语外贸职业大学',F:'http://www.jxcfs.com/',G:'https://zs.jxcfs.com/',H:['http://www.jxcfs.com/','https://zs.jxcfs.com/','https://www.moe.gov.cn/srcsite/A03/s181/202606/t20260616_1440876.html'],note:'教育部批准设置该校并确认代码4136013422；2026招生章程列明学校官网jxcfs.com及招生网址zs.jxcfs.com。'},
{row:851,code:'4136013429',name:'南昌大学科学技术学院',F:'https://ncuky.edu.cn/',G:'https://ncuky.edu.cn/zsw/',H:['https://ncuky.edu.cn/','https://ncuky.edu.cn/zsw/'],note:'学院官网及招生网为同一官方域名；招生网发布2026招生章程、计划和咨询信息。'},
{row:852,code:'4136013431',name:'南昌交通学院',F:'https://www.ncjti.edu.cn/',G:'https://zsb.ncjti.edu.cn/',H:['https://www.ncjti.edu.cn/','https://zsb.ncjti.edu.cn/'],note:'学校2026招生章程所列网址为学校官网ncjti.edu.cn及招生网zsb.ncjti.edu.cn。'},
{row:853,code:'4136013433',name:'南昌航空大学科技学院',F:'http://stcnchu.edu.cn/',G:'http://zs.stcnchu.edu.cn/',H:['http://stcnchu.edu.cn/','http://zs.stcnchu.edu.cn/'],note:'2026招生章程列明学院网址stcnchu.edu.cn及招生信息网zs.stcnchu.edu.cn，代码与名录一致。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























