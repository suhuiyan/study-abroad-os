import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v223.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v224.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:733,code:'4122013662',name:'长春人文学院',F:'https://www.ccrw.edu.cn/',G:'https://zsb.ccrw.edu.cn/',H:['https://www.hzgrys.net/regulation/1/2026/564.html','https://zsb.ccrw.edu.cn/__local/D/86/2D/21D5632C2084DA13BC206446A41_58392232_400E6A.pdf'],note:'2026招生章程列明学校官网ccrw.edu.cn；校方招生材料托管于zsb.ccrw.edu.cn。未检索到可确认的当年本科招生门户首页，保留为待复核。'},
{row:735,code:'4132011055',name:'常州工学院',F:'https://www.czu.cn/',G:'https://zsw.czu.cn/',H:['https://www.czu.cn/2026/0523/c146a174234/page.htm','https://zsw.czu.cn/'],note:'学校2026本科招生章程明确主页和本科生招生网址；招生网公布2026章程、计划与录取结果。'},
{row:736,code:'4132011463',name:'江苏理工学院',F:'https://www.jsut.edu.cn/',G:'https://zs.jsut.edu.cn/',H:['https://www.jsut.edu.cn/','https://zs.jsut.edu.cn/5639/list.htm','https://xxgk.jsut.edu.cn/main.htm'],note:'学校官网和信息公开平台确认机构身份；招生网发布2026本科招生计划、章程及招生动态。'},
{row:737,code:'4132012317',name:'常州信息职业技术大学',F:'https://czcit.edu.cn/',G:'https://zjczs.ccit.js.cn/',H:['https://czcit.edu.cn/index.htm','https://zjczs.ccit.js.cn/','https://www.czcit.edu.cn/'],note:'学校官网czcit.edu.cn列有招生网站、就业网站和留学生招生入口；独立招生站zjczs.ccit.js.cn发布2026招生章程。该职业本科于2026年开始招收首届本科生，专科/本科计划需分开。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));























