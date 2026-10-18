import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v259.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v260.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:992,code:'4137012331',name:'山东女子学院',F:'https://www.sdwu.edu.cn/',G:'https://zsxx.sdwu.edu.cn/',H:['https://www.sdwu.edu.cn/','https://zsxx.sdwu.edu.cn/'],note:'学校正式招生章程及校方招生信息明确招生信息网zsxx.sdwu.edu.cn，学校官网域名sdwu.edu.cn。'},
{row:993,code:'4137013006',name:'山东英才学院',F:'https://www.sdycu.edu.cn/',G:'https://zsw.sdycu.edu.cn/',H:['https://www.sdycu.edu.cn/','https://zsw.sdycu.edu.cn/'],note:'学校官方页面发布2026校荐招生信息并确认学校网址，校方招生章程及招生简章标明招生网zsw.sdycu.edu.cn。'},
{row:994,code:'4137013322',name:'山东现代学院',F:'https://www.sdxd.edu.cn/',G:'https://zs.sdxd.edu.cn/',H:['https://www.sdxd.edu.cn/','https://zs.sdxd.edu.cn/','https://www.sdxd.edu.cn/detail/20260224100913mnj4calfvdjfwnwwml.html'],note:'学校官网公布2026招生信息；校方通知明确阳光招生网为zs.sdxd.edu.cn。'},
{row:996,code:'4137013356',name:'山东工程职业技术大学',F:'https://www.suet.edu.cn/',G:'https://www.suet.edu.cn/admission/',H:['https://www.suet.edu.cn/','https://www.suet.edu.cn/admission/','https://www.suet.edu.cn/admission/info/1022/1779.htm'],note:'校方招生办公室网站发布2026招生计划及章程，学校官网确认校名与招生联系方式。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山东省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));



























