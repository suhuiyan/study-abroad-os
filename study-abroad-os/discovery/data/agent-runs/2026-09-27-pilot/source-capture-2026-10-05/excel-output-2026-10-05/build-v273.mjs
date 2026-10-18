import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v272.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v273.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1046,code:'4137010825',name:'齐鲁医药学院',F:'https://www.qlmu.edu.cn/',G:'https://zhaosheng.qlmu.edu.cn/',H:['https://www.qlmu.edu.cn/','https://zhaosheng.qlmu.edu.cn/'],note:'校方及教育主管部门招生信息将招生信息网列为zhaosheng.qlmu.edu.cn；学校主页为qlmu.edu.cn。'},
{row:1047,code:'4137013009',name:'淄博职业技术大学',F:'https://www.zbpu.edu.cn/',G:'https://zb.zbpu.edu.cn/',H:['https://www.zbpu.edu.cn/','https://zb.zbpu.edu.cn/'],note:'教育部批准设校信息及阳光高考学校资料确认学校身份、官网和招生网zb.zbpu.edu.cn。'},
{row:1048,code:'4114010120',name:'山西大同大学',F:'https://www.sxdtdx.edu.cn/',G:'https://zhs.sxdtdx.edu.cn/',H:['https://www.sxdtdx.edu.cn/','https://zhs.sxdtdx.edu.cn/','https://zhs.sxdtdx.edu.cn/news-show-421.html'],note:'学校2026本科招生章程确认校方官网、招生信息网，招生网发布章程、计划和录取信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));








































