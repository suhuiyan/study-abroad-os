import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v261.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v262.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1001,code:'4137014277',name:'山东青年政治学院',F:'https://www.sdyu.edu.cn/',G:'https://zsb.sdyu.edu.cn/index.htm',H:['https://www.sdyu.edu.cn/','https://www.sdyu.edu.cn/xxgk/xxjj.htm','https://zsb.sdyu.edu.cn/index.htm'],note:'校方主页链接招生信息网，学校简介确认本科高校身份；招生网公布2026招生计划与录取信息。'},
{row:1002,code:'4137014438',name:'山东管理学院',F:'https://www.sdmu.edu.cn/',G:'https://zs.sdmu.edu.cn/',H:['https://www.sdmu.edu.cn/','https://zs.sdmu.edu.cn/'],note:'校方招生信息网发布2026本科录取信息、招生计划与咨询方式。'},
{row:1004,code:'4137010443',name:'济宁医学院',F:'https://www.jnmc.edu.cn/',G:'https://zhaosheng.jnmc.edu.cn/',H:['https://www.jnmc.edu.cn/','https://zhaosheng.jnmc.edu.cn/'],note:'学校官网确认机构身份与本专科招生咨询电话，招生信息网明确为官方录取查询渠道。'},
{row:1005,code:'4137010446',name:'曲阜师范大学',F:'https://www.qfnu.edu.cn/',G:'https://zsb.qfnu.edu.cn/',H:['https://www.qfnu.edu.cn/','https://zsb.qfnu.edu.cn/'],note:'学校官网与招生信息网均使用校方qfnu.edu.cn域名。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));





























