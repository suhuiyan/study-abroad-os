import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v249.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v250.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:927,code:'4121013220',name:'沈阳城市学院',F:'https://www.shenyangcu.edu.cn/',G:'https://www.shenyangcu.edu.cn/zszx/bkptlzs/',H:['https://www.shenyangcu.edu.cn/','https://www.shenyangcu.edu.cn/zszx/bkptlzs/'],note:'学校官网发布本科招生信息和2026招生简章、招生计划。'},
{row:928,code:'4121013609',name:'辽宁中医药大学杏林学院',F:'https://lncmxl.edu.cn/',G:'https://zs.lncmxl.edu.cn/',H:['https://lncmxl.edu.cn/','https://zs.lncmxl.edu.cn/'],note:'学校官网及独立招生网发布2026招生计划、录取进度；招生网明确为杏林学院。'},
{row:929,code:'4121013610',name:'辽宁何氏医学院',F:'https://www.huh.edu.cn/',H:['https://www.huh.edu.cn/','https://www.huh.edu.cn/index.php?a=shows&catid=3&id=1014'],note:'学校官网确认院校名称、教育部代码及2026招生简章；未找到可直接确认的独立招生首页。'},
{row:930,code:'4121013621',name:'沈阳科技学院',F:'https://www.syist.edu.cn/',G:'https://zhaosheng.syist.edu.cn/',H:['https://www.syist.edu.cn/','https://zhaosheng.syist.edu.cn/'],note:'学校官网招生就业栏目链接招生信息网；招生处发布2026录取信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























