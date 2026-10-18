import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v257.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v258.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:976,code:'4137013386',name:'山东石油化工学院',F:'https://www.sdipct.edu.cn/',G:'https://zs.sdipct.edu.cn/',H:['https://www.sdipct.edu.cn/','https://zs.sdipct.edu.cn/'],note:'官网和CHSI采访资料确认学校招生信息网为zs.sdipct.edu.cn，发布招生政策、专业、计划和历年录取信息。'},
{row:977,code:'4137010455',name:'菏泽学院',F:'https://www.hezeu.edu.cn/',G:'https://zsxxw.hezeu.edu.cn/index.htm',H:['https://www.hezeu.edu.cn/','https://zsxxw.hezeu.edu.cn/index.htm','https://jwc.hezeu.edu.cn/content.jsp?urltype=news.NewsContentUrl&wbnewsid=5809&wbtreeid=1017'],note:'学校官网确认校名；招生信息网发布2026招生章程及招生计划，学校教务处亦明确指向此招生官网。'},
{row:982,code:'4137010439',name:'山东第一医科大学',F:'https://www.sdfmu.edu.cn/',G:'https://enrollment.sdfmu.edu.cn/',H:['https://www.sdfmu.edu.cn/','https://enrollment.sdfmu.edu.cn/','https://nursing.sdfmu.edu.cn/info/1101/14816.htm','https://ie.sdfmu.edu.cn/zsxx/zyml.htm'],note:'学校官网确认机构身份；校方二级学院页面明确本科招生信息网地址，国际教育学院发布2026预科、本科招生专业目录及奖学金信息。'},
{row:984,code:'4137010445',name:'山东师范大学',F:'https://www.sdnu.edu.cn/',G:'https://www.zsb.sdnu.edu.cn/',H:['https://www.sdnu.edu.cn/','https://www.zsb.sdnu.edu.cn/'],note:'学校官网及本科招生网均为校方域名；招生网发布2026普通高等教育招生章程及招生通知。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));

























