import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v263.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v264.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1017,code:'4137010868',name:'青岛滨海学院',F:'https://www.qdbhu.edu.cn/',G:'https://zsb.qdbhu.edu.cn/',H:['https://www.qdbhu.edu.cn/','https://zsb.qdbhu.edu.cn/','https://zsb.qdbhu.edu.cn/info/1221/3121.htm','https://zsb.qdbhu.edu.cn/xxgk.htm'],note:'2026招生章程确认学校名称、代码10868及官网；招生网公布2026招生简章、招生专业与章程。'},
{row:1018,code:'4137011065',name:'青岛大学',F:'https://www.qdu.edu.cn/',G:'https://zs.qdu.edu.cn/',H:['https://www.qdu.edu.cn/','https://www.qdu.edu.cn/ksfw.htm','https://zs.qdu.edu.cn/'],note:'学校官网考生服务列出本科生招生入口；本科招生网发布2026招生章程和录取公告。'},
{row:1019,code:'4137013015',name:'青岛恒星科技学院',F:'https://www.hx.cn/',G:'https://zs.hx.cn/',H:['https://www.hx.cn/','https://zs.hx.cn/','https://zs.hx.cn/content/zszc/3649c076ecb348299f75414b88209a1a'],note:'学校2026招生章程确认学校名称、代码13015、办学层次及官网；招生网发布招生章程。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));































