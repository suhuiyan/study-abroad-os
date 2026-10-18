import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v270.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v271.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1039,code:'4137011688',name:'山东工商学院',F:'https://www.sdtbu.edu.cn/',G:'https://zs.sdtbu.edu.cn/',H:['https://www.sdtbu.edu.cn/','https://zs.sdtbu.edu.cn/'],note:'校方招生信息网发布2026普通高等教育招生章程、招生计划、台湾学生招生简章和录取数据。'},
{row:1040,code:'4137012332',name:'烟台南山学院',F:'https://www.nanshan.edu.cn/',G:'https://zs.nanshan.edu.cn/',H:['https://www.nanshan.edu.cn/','https://zs.nanshan.edu.cn/'],note:'2026普通高等教育招生章程确认学校官网及招办网址，招生就业网公布录取和招生信息。'},
{row:1041,code:'4137013359',name:'烟台理工学院',F:'https://www.yitsd.edu.cn/',G:'https://zs.yitsd.edu.cn/',H:['https://www.yitsd.edu.cn/','https://www.yitsd.edu.cn/index/zsxx.htm','https://www.yitsd.edu.cn/info/1034/19041.htm'],note:'学校官网设招生信息栏目；校方招生章程将招生信息网指定为zs.yitsd.edu.cn。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));






































