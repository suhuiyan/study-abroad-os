import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v225.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v226.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:742,code:'4132011641',name:'江苏海洋大学',F:'https://www.jou.edu.cn/',G:'https://zsxx.jou.edu.cn/',H:['https://www.jou.edu.cn/index.htm','https://zsxx.jou.edu.cn/'],note:'学校主页公布招生咨询电话与地址；本科招生网发布招生计划等信息，均为学校官方域名。'},
{row:743,code:'4132013980',name:'南京医科大学康达学院',F:'https://kdc.njmu.edu.cn/',G:'https://kdzs.njmu.edu.cn/',H:['https://kdc.njmu.edu.cn/','https://kdc.njmu.edu.cn/6461/list.htm','https://kdzs.njmu.edu.cn/'],note:'学院官网章程确认学院网址与独立学院身份；官方招生章程/招生网确认本科招生渠道。'},
{row:759,code:'4132010329',name:'江苏警官学院',F:'https://www.jspi.edu.cn/',H:['https://www.jspi.edu.cn/','https://www.jspi.edu.cn/info/1066/15903.htm'],note:'学院官网发布招生考试栏目；2026年普通本科招生章程明确学校网址为 www.jspi.cn。未记录独立招生子站。'},
{row:761,code:'4132010331',name:'南京艺术学院',F:'https://www.nua.edu.cn/',G:'https://zhaosheng.nua.edu.cn/',H:['https://www.nua.edu.cn/','https://zhaosheng.nua.edu.cn/'],note:'学校官网及招生工作网均属学校官方域名；招生工作网发布招生简章与录取信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江苏省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























