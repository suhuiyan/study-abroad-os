import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v255.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v256.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:949,code:'4115014531',name:'内蒙古艺术学院',F:'https://www.imac.edu.cn/',G:'https://zs.imac.edu.cn/',H:['https://www.imac.edu.cn/','https://zs.imac.edu.cn/','https://zs.imac.edu.cn/html-zs/zszcjzsjh/20260515/40229.shtml'],note:'学校2026本科招生章程列明官网与招生信息网址。'},
{row:950,code:'4115010819',name:'呼伦贝尔学院',F:'https://www.hlbec.edu.cn/',G:'https://zsjy.hlbec.edu.cn/',H:['https://www.hlbec.edu.cn/','https://zsjy.hlbec.edu.cn/','https://zsjy.hlbec.edu.cn/info/1013/2186.htm'],note:'学校官网含招生信息网入口；招生网发布2026本科招生章程、计划。'},
{row:951,code:'4115010136',name:'内蒙古民族大学',F:'https://www.imun.edu.cn/',G:'https://zs.imun.edu.cn/',H:['https://www.imun.edu.cn/','https://zs.imun.edu.cn/'],note:'学校2026全日制本科招生章程明确列出官网及招生网址。'},
{row:952,code:'4115011427',name:'集宁师范学院',F:'https://www.jnnu.edu.cn/',G:'https://www.jnnu.edu.cn/zsb',H:['https://www.jnnu.edu.cn/','https://www.jnnu.edu.cn/zsb','https://www.jnnu.edu.cn/zsb/info/1144/1721.htm'],note:'学校官方招生章程列明官网及招生网网址；2026招生办公室章程页面已核实。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























