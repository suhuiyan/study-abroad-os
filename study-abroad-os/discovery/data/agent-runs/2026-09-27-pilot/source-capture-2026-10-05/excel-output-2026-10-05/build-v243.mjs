import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v242.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v243.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:882,code:'4121010841',name:'辽宁对外经贸学院',F:'https://www.luibe.edu.cn/',H:['https://www.luibe.edu.cn/'],note:'2026招生章程列明学校官网luibe.edu.cn；本次未确认独立招生网站，故只记录学校主页。'},
{row:884,code:'4121011432',name:'辽宁警察学院',F:'https://www.lnpc.cn/',G:'https://zsjy.lnp.edu.cn/',H:['https://www.lnp.edu.cn/collegeIntroduction.html','https://zsjy.lnp.edu.cn/c_1/2026/2059435662996389890.html'],note:'学校官网及2026招生章程确认机构身份；招生章程指定zsjy.lnp.edu.cn为网址。'},
{row:885,code:'4121012026',name:'大连民族大学',F:'https://www.dlnu.edu.cn/',G:'https://zs.dlnu.edu.cn/',H:['https://www.dlnu.edu.cn/','https://zs.dlnu.edu.cn/'],note:'学校官网及招生网均属dlnu.edu.cn官方域名；招生网发布2026本科招生章程。'},
{row:886,code:'4121013198',name:'大连工程学院',F:'https://www.dlutci.edu.cn/',G:'https://zhaosheng.dlutci.edu.cn/',H:['https://www.dlutci.edu.cn/xxgk/xxjj.htm','https://zhaosheng.dlutci.edu.cn/'],note:'学校简介确认2026年经教育部批准转设为大连工程学院；官方招生信息网发布2026招生章程。'},
{row:887,code:'4121013203',name:'大连工业大学艺术与信息工程学院',F:'https://www.caie.edu.cn/',H:['https://www.caie.edu.cn/','https://caie.edu.cn/info/1256/2534.htm'],note:'学院官网发布2026招生章程；独立招生网未单独核实，因此仅记录学校主页。'},
{row:888,code:'4121013207',name:'大连科技学院',F:'https://www.dlust.edu.cn/',G:'https://sub2.dlust.edu.cn/kjzs/',H:['https://www.dlust.edu.cn/','https://sub2.dlust.edu.cn/kjzs/','https://sub2.dlust.edu.cn/kjzs/detail-3673.html'],note:'学校官网经备案信息确认机构身份；校方招生网发布2026新生及招生公告。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























