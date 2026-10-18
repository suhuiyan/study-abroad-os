import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v258.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v259.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:985,code:'4137010456',name:'山东财经大学',F:'https://www.sdufe.edu.cn/',G:'https://zhaosheng.sdufe.edu.cn/',H:['https://www.sdufe.edu.cn/','https://www.sdufe.edu.cn/zsjy/zs.htm','https://zhaosheng.sdufe.edu.cn/'],note:'学校招生专页及2026招生章程确认本科招生信息网zhaosheng.sdufe.edu.cn。'},
{row:987,code:'4137010458',name:'山东艺术学院',F:'https://www.sdca.edu.cn/',G:'https://zsbgs.sdca.edu.cn/',H:['https://www.sdca.edu.cn/','https://zsbgs.sdca.edu.cn/','https://zsbgs.sdca.edu.cn/zsxx/zszc.htm'],note:'学校官网与本科招生信息网均为校方域名，招生网发布2026招生简章和招生章程。'},
{row:989,code:'4137010908',name:'山东工艺美术学院',F:'https://www.sdada.edu.cn/',G:'https://www.sdada.edu.cn/',H:['https://www.sdada.edu.cn/','https://art.sdada.edu.cn/','https://xxgk.sdada.edu.cn/'],note:'学校官网及信息公开网确认机构身份；校方站点有招生考试信息栏目，未确认独立招生专站，暂列学校官网入口。'},
{row:990,code:'4137011324',name:'山东警察学院',F:'https://www.sdpc.edu.cn/',G:'https://zsjy.sdpc.edu.cn/index/zsxx.htm',H:['https://www.sdpc.edu.cn/','https://zsjy.sdpc.edu.cn/index/zsxx.htm','https://www.sdpc.edu.cn/info/1101/18837.htm'],note:'学校2026普通高等教育招生章程确认校名、学校代码11324及官网；招生就业网发布2026章程、简章和计划。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));


























