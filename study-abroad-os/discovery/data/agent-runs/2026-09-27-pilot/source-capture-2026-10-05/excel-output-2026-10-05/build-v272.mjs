import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v271.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v272.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1042,code:'4137013997',name:'青岛农业大学海都学院',F:'https://www.hdxy.edu.cn/',G:'https://www.hdxy.edu.cn/zs',H:['https://www.hdxy.edu.cn/','https://www.hdxy.edu.cn/zs'],note:'学校校方文件指明2026专升本考试系统和招生信息在官网招生栏目hdxy.edu.cn/zs发布。'},
{row:1043,code:'4137014002',name:'烟台科技学院',F:'https://www.ytkj.edu.cn/',G:'https://zs.ytkj.edu.cn/',H:['https://www.ytkj.edu.cn/','https://zs.ytkj.edu.cn/'],note:'校方2026招生章程确认学校官网、招生网网址并发布招生信息。'},
{row:1044,code:'4137010904',name:'枣庄学院',F:'https://www.uzz.edu.cn/',G:'https://zsb.uzz.edu.cn/index.php',H:['https://www.uzz.edu.cn/','https://zsb.uzz.edu.cn/index.php','https://zsb.uzz.edu.cn/index.php?menu=ZSZC&sys=home'],note:'学校2026招生章程确认学校代码10904、官网和招生网；招生网发布招生计划、章程和录取结果。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));







































