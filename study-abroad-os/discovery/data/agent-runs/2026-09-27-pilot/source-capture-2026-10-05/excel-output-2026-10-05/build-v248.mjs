import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v247.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v248.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:916,code:'4121010163',name:'沈阳药科大学',F:'https://www.syphu.edu.cn/',G:'https://zs.syphu.edu.cn/',H:['https://www.syphu.edu.cn/','https://zs.syphu.edu.cn/','https://www.syphu.edu.cn/info/1064/34811.htm'],note:'学校官网确认机构身份；本科招生网持续发布2026招生录取信息。'},
{row:917,code:'4121010164',name:'沈阳医学院',F:'https://www.symc.edu.cn/',G:'https://zssy.symc.edu.cn/',H:['https://www.symc.edu.cn/','https://zssy.symc.edu.cn/','https://zssy.symc.edu.cn/info/3161/8091.htm'],note:'学校官方2026招生章程和招生网确认学校本科招生入口。'},
{row:918,code:'4121010166',name:'沈阳师范大学',F:'https://www.synu.edu.cn/',G:'https://zs.synu.edu.cn/',H:['https://www.synu.edu.cn/','https://zs.synu.edu.cn/'],note:'学校官方2026本科招生信息及学校官网确认招生网zs.synu.edu.cn。'},
{row:920,code:'4121010176',name:'沈阳体育学院',F:'https://www.syty.edu.cn/',G:'https://zs.syty.edu.cn/',H:['https://www.syty.edu.cn/','https://zs.syty.edu.cn/','https://zs.syty.edu.cn/info/1172/1809.htm'],note:'学校2026本科专业招生章程确认招生站点；学校官网与本科招生网对应。'},
{row:921,code:'4121010177',name:'沈阳音乐学院',F:'https://www.sycm.edu.cn/',G:'https://www.sycm.edu.cn/info.aspx?DWid=66',H:['https://www.sycm.edu.cn/','https://www.sycm.edu.cn/info.aspx?DWid=66','https://www.sycm.edu.cn/list_son.aspx?DWid=66&Mid=237&Sid=-1'],note:'学校官网及本科招生网发布2026本科招生章程、考试与招生动态。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























