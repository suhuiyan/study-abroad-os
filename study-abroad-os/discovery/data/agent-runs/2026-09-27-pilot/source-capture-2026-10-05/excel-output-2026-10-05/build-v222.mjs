import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v221.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v222.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:725,code:'4122013601',name:'长春工业大学人文信息学院',F:'https://www.ccutchi.edu.cn/',H:['https://www.ccutchi.edu.cn/'],note:'现行官网ccutchi.edu.cn显示该校2026年动态。未找到可由该官网确认的招生子站，招生栏留空；院校办学状态如有变动应以教育部最新名单核验。'},
{row:726,code:'4122013602',name:'长春电子科技学院',F:'https://www.changdian2001.com/',G:'https://www3.changdian2001.com/html/zs/',H:['https://www.changdian2001.com/','https://www3.changdian2001.com/html/zs/','https://www3.changdian2001.com/html/zs/zsgg/2026/0515/5469.html'],note:'官网及招生信息网位于changdian2001.com校方域名；招生站发布2026招生章程与本科指南。'},
{row:727,code:'4122013603',name:'长春财经学院',F:'https://www.ccufe.edu.cn/',H:['https://www.ccufe.edu.cn/','https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view%2CschId-1848%2CinfoId-7630649138.dhtml'],note:'教育部阳光高考平台审核的2026招生章程确认学校网址ccufe.edu.cn；未确认单独招生网，招生栏留空。'},
{row:728,code:'4122013604',name:'吉林建筑科技学院',F:'https://www.jluat.edu.cn/',G:'https://zsxx.jluat.edu.cn/',H:['https://www.jluat.edu.cn/','https://www.jluat.edu.cn/art/2052478582059069442.html','https://zsxx.jluat.edu.cn/'],note:'学校官网确认招生网址zsxx.jluat.edu.cn；官网招生指南与招生网发布2026招生信息。国际学生政策另核。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));




















