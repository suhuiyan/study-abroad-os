import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v241.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v242.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:872,code:'4121010171',name:'朝阳师范学院',F:'https://www.cynu.edu.cn/',G:'https://zsgz.cynu.edu.cn/',H:['https://www.cynu.edu.cn/','https://zsgz.cynu.edu.cn/','https://zsgz.cynu.edu.cn/info/1034/1910.htm'],note:'学校2026招生章程由招生信息网发布，招生站点与学校域名cynu.edu.cn一致。'},
{row:873,code:'4121010141',name:'大连理工大学',F:'https://www.dlut.edu.cn/',G:'https://zs.dlut.edu.cn/',H:['https://www.dlut.edu.cn/','https://zs.dlut.edu.cn/'],note:'学校官网列本科生招生入口；本科生招生网发布2026招生信息。'},
{row:875,code:'4121010151',name:'大连海事大学',F:'https://www.dlmu.edu.cn/',G:'https://bkzs.dlmu.edu.cn/',H:['https://www.dlmu.edu.cn/','https://bkzs.dlmu.edu.cn/'],note:'学校官网与本科招生网均属dlmu.edu.cn官方域名；招生网发布2026招生章程及计划。'},
{row:876,code:'4121010152',name:'大连工业大学',F:'https://www.dlpu.edu.cn/',G:'https://zsb.dep.dlpu.edu.cn/',H:['https://www.dlpu.edu.cn/','https://zsb.dep.dlpu.edu.cn/'],note:'学校本科招生信息网由招生就业处维护；学校官网及其官方域名匹配。'},
{row:877,code:'4121010158',name:'大连海洋大学',F:'https://www.dlou.edu.cn/',G:'https://bkzsw.dlou.edu.cn/',H:['https://www.dlou.edu.cn/','https://bkzsw.dlou.edu.cn/','https://zsjy.dlou.edu.cn/zsjz/list2.htm'],note:'学校2026招生章程公布学校网址及本科招生结果查询网站；招生就业处维护招生内容。'},
{row:879,code:'4121010165',name:'辽宁师范大学',F:'https://www.lnnu.edu.cn/',G:'https://notice.lnnu.edu.cn/',H:['https://www.lnnu.edu.cn/','https://notice.lnnu.edu.cn/'],note:'学校官网列本科生招生入口；本科招生处官网发布2026本科招生动态。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























