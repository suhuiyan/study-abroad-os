import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v232.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v233.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:818,code:'4136010405',name:'东华理工大学',F:'https://www.ecut.edu.cn/',G:'https://zsb.ecut.edu.cn/_t1137/main.psp',H:['https://www.ecut.edu.cn/','https://zsb.ecut.edu.cn/_t1137/main.psp','https://yjsy.ecut.edu.cn/_upload/article/files/5b/ba/9c859dc048b2a241ce9698e2e34e/1fabc22e-6004-4889-a28b-b16150adff71.pdf'],note:'学校招生章程列明官网及学校代码10405；本科招生网发布2026计划、招生章程和专业信息。'},
{row:819,code:'4136013432',name:'赣东学院',F:'https://www.gdc.edu.cn/',G:'https://zs.gdc.edu.cn/',H:['https://www.gdc.edu.cn/','https://zs.gdc.edu.cn/','https://zs.gdc.edu.cn/2026/0526/c160a9730/page.htm'],note:'学院2026招生章程确认官网、招生网和招生政策来源；学院官网招生说明包含录取、资助相关政策查询渠道。'},
{row:821,code:'4136010407',name:'江西理工大学',F:'https://www.jxust.edu.cn/',G:'https://zs.jxust.edu.cn/',H:['https://www.jxust.edu.cn/index/sy.htm','https://zs.jxust.edu.cn/','https://zs.jxust.edu.cn/__local/4/81/2F/C98AF191559B4053BE4895DDA7B_5E0BEE66_40B68.pdf'],note:'学校主页及本科招生信息网均为jxust.edu.cn官方站点；2026招生文件明确招生信息网地址。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























