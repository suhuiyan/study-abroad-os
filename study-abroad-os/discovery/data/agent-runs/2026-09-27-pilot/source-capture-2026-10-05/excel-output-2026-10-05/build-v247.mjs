import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v246.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v247.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:909,code:'4121010144',name:'沈阳理工大学',F:'https://www.sylu.edu.cn/',H:['https://www.sylu.edu.cn/','https://zs.sylu.edu.cn/'],note:'学校官网及招生站域名由官方站点和校方资料核对；招生站可用性需后续复核。'},
{row:911,code:'4121010149',name:'沈阳化工大学',F:'https://www.syuct.edu.cn/',G:'https://zhaosheng.syuct.edu.cn/index.htm',H:['https://www.syuct.edu.cn/','https://zhaosheng.syuct.edu.cn/index.htm','https://zhaosheng.syuct.edu.cn/info/1018/2010.htm'],note:'官网招生页确认本科招生信息网；2026年全日制普通本科招生章程已发布。'},
{row:912,code:'4121010153',name:'沈阳建筑大学',F:'https://www.sjzu.edu.cn/',G:'https://zs.sjzu.edu.cn/',H:['https://www.sjzu.edu.cn/','https://zs.sjzu.edu.cn/','https://zs.sjzu.edu.cn/info/1031/18511.htm'],note:'学校本科招生网发布2026年本科招生章程，章程与学校名称、代码及官网对应。'},
{row:913,code:'4121010157',name:'沈阳农业大学',F:'https://www.syau.edu.cn/',G:'https://zs.syau.edu.cn/',H:['https://www.syau.edu.cn/','https://zs.syau.edu.cn/','https://swxy.syau.edu.cn/info/1651/6034.htm'],note:'学校官方2026年本科招生章程列明招生网址zs.syau.edu.cn；学校官网确认身份。'},
{row:915,code:'4121010162',name:'辽宁中医药大学',F:'https://www.lnutcm.edu.cn/',G:'https://zs.lnutcm.edu.cn/',H:['https://www.lnutcm.edu.cn/','https://zs.lnutcm.edu.cn/','https://xxgk.lnutcm.edu.cn/__local/B/E3/07/D02BC6BF3DC160ADC735F55072E_BE5084C7_608DE.pdf'],note:'学校官网确认机构身份；学校信息公开年报确认本科招生信息网为官方发布平台。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























