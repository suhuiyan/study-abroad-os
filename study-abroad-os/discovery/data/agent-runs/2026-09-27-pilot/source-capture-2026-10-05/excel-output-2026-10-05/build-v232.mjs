import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v231.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v232.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:794,code:'4132013843',name:'南京师范大学泰州学院',F:'https://www.nnutc.edu.cn/',G:'https://zs.nnutc.edu.cn/',H:['https://www.nnutc.edu.cn/','https://zs.nnutc.edu.cn/'],note:'学校官网与招生章程列示招生网；2026年招生章程列出招生网址、学院网址及助学政策。'},
{row:813,code:'4132013989',name:'南京邮电大学通达学院',F:'https://www.nytdc.edu.cn/',G:'https://zs.nytdc.edu.cn/mainm.htm',H:['https://www.nytdc.edu.cn/','https://zs.nytdc.edu.cn/mainm.htm','https://zs.nytdc.edu.cn/119/listm.htm'],note:'学校官网与招生网为学院nytdc.edu.cn域名；招生网发布2026本科章程、计划及咨询信息。'},
{row:816,code:'4132013906',name:'南京师范大学中北学院',F:'https://www.nnudy.edu.cn/',G:'https://zs.nnudy.edu.cn/',H:['https://www.nnudy.edu.cn/','https://zs.nnudy.edu.cn/c107/index.html','https://zs.nnudy.edu.cn/c57/index.html'],note:'官网招生入口及2026普通本科招生章程确认招生网域名；学院代码13906与名单对应。'},
{row:817,code:'4132013986',name:'江苏大学京江学院',F:'https://jjxy.ujs.edu.cn/',G:'https://jjxy.ujs.edu.cn/zsjy/zs.htm',H:['https://jjxy.ujs.edu.cn/','https://jjxy.ujs.edu.cn/zsjy/zs.htm'],note:'学院官网及招生栏目同属江苏大学ujs.edu.cn域名；招生栏目更新2026本科录取和招生信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江苏省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























