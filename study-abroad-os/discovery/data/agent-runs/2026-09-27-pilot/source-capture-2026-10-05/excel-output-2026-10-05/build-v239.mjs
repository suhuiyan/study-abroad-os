import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v238.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v239.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:854,code:'4136013436',name:'江西农业大学南昌商学院',F:'https://ncbcjxau.edu.cn/',G:'https://zs.ncbcjxau.edu.cn/',H:['https://ncbcjxau.edu.cn/','https://zs.ncbcjxau.edu.cn/'],note:'学校官网2026动态及招生就业处网站发布2026招生章程、计划和官方咨询渠道。'},
{row:855,code:'4136013437',name:'南昌医学院',F:'https://www.ncmc.edu.cn/',G:'https://zs.ncmc.edu.cn/',H:['https://www.ncmc.edu.cn/','https://zs.ncmc.edu.cn/','https://www.ncmc.edu.cn/fzghc/info/1031/1460.htm'],note:'学校章程确认学校网址ncmc.edu.cn；官方招生信息网发布2026招生章程及分省计划。'},
{row:856,code:'4136013438',name:'江西师范大学科学技术学院',F:'https://www.jxsdky.edu.cn/',H:['https://www.jxsdky.edu.cn/','https://www.jxsdky.edu.cn/index.htm'],note:'学院官网包含招生就业处及招生信息网导航；未把未能访问确认的独立招生子域写入招生栏。'},
{row:857,code:'4136013440',name:'南昌应用技术师范学院',F:'https://www.nncat.edu.cn/',G:'https://zsjy.nncat.edu.cn/',H:['https://www.nncat.edu.cn/','https://zsjy.nncat.edu.cn/news-413-show.shtml','https://zsjy.nncat.edu.cn/news-tongzhi-list.shtml'],note:'学院官网及招生信息网为nncat.edu.cn官方域名；招生网发布2026招生章程和计划。'},
{row:858,code:'4136013441',name:'江西财经大学现代经济管理学院',F:'https://www.jcxjg.edu.cn/',G:'https://zsjy.jcxjg.edu.cn/',H:['https://www.jcxjg.edu.cn/','https://zsjy.jcxjg.edu.cn/','https://www.jcxjg.edu.cn/upload/79/Attachment/9263247f821.pdf'],note:'学校官网和招生就业网使用jcxjg.edu.cn官方域名；学院官网发布招生章程。'},
{row:859,code:'4136013774',name:'豫章师范学院',F:'https://www.yuznu.edu.cn/',H:['https://www.yuznu.edu.cn/'],note:'学院官方主页列有招生考试信息入口；本次未确认独立招生网址，故仅填写首页。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























