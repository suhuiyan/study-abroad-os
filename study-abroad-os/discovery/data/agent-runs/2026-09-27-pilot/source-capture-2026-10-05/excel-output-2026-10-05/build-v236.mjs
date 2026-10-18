import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v235.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v236.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:836,code:'4136010406',name:'南昌航空大学',F:'https://www.nchu.edu.cn/',G:'https://zsw.nchu.edu.cn/',H:['https://www.nchu.edu.cn/','https://zsw.nchu.edu.cn/index.php?menu=SPLM&sys=home','https://zsjy.nchu.edu.cn/zszx/content_192004'],note:'学校主页列招生信息网；2026招生章程明确本科招生信息网网址zsw.nchu.edu.cn。'},
{row:837,code:'4136010410',name:'江西农业大学',F:'https://www.jxau.edu.cn/',G:'https://zs.jxau.edu.cn/',H:['https://www.jxau.edu.cn/','https://zs.jxau.edu.cn/ueditor/php/upload/file/20220503/1651567913571104.pdf'],note:'学校主页与本科招生站同属jxau.edu.cn域名；本次证据包含学校本科招生章程。'},
{row:838,code:'4136010412',name:'江西中医药大学',F:'https://www.jxutcm.edu.cn/',G:'https://zsxxw.jxutcm.edu.cn/sy.htm',H:['https://www.jxutcm.edu.cn/','https://zsxxw.jxutcm.edu.cn/sy.htm','https://zsxxw.jxutcm.edu.cn/info/1010/2982.htm'],note:'招生信息网发布2026招生章程、分省计划及录取查询；学校主页与招生站均为jxutcm.edu.cn官方域名。'},
{row:839,code:'4136010414',name:'江西师范大学',F:'https://www.jxnu.edu.cn/',G:'https://zsjy.jxnu.edu.cn/',H:['https://www.jxnu.edu.cn/','https://zsjy.jxnu.edu.cn/'],note:'本科招生网发布2026招生公告、政策与录取查询；网站列有招生办公室地址和联系方式。'},
{row:840,code:'4136010421',name:'江西财经大学',F:'https://www.jxufe.edu.cn/',H:['https://www.jxufe.edu.cn/','https://www.jxufe.edu.cn/index.php'],note:'学校官网现行主页列本科招生入口；未找到可核验的本科招生子站URL，本次仅记录主页。'},
{row:841,code:'4136010846',name:'江西科技学院',F:'https://www.jxut.edu.cn/',G:'https://zjc.jxut.edu.cn/ygzs.htm',H:['https://www.jxut.edu.cn/','https://zjc.jxut.edu.cn/','https://zjc.jxut.edu.cn/ygzs.htm','https://zjc.jxut.edu.cn/info/1343/28552.htm'],note:'学校官网确认当前主页；招生就业处2026招生简章和阳光招生网发布招生政策、计划及咨询信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























