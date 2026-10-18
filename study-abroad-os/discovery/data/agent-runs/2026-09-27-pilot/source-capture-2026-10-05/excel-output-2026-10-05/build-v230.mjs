import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v229.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v230.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:796,code:'4132013992',name:'常州大学怀德学院',F:'https://www.hdc.cczu.edu.cn/',G:'https://hdzs.cczu.edu.cn/',H:['https://www.hdc.cczu.edu.cn/_web/main.psp','https://hdzs.cczu.edu.cn/'],note:'学院官网列出招生网入口；招生网发布2026普通本科招生章程、招生计划并标注院校国标码13992。'},
{row:798,code:'4132010848',name:'无锡职业技术大学',F:'https://www.wxit.edu.cn/',G:'https://zs.wxit.edu.cn/',H:['https://zs.wxit.edu.cn/'],note:'学校招生就业处官网发布2026招生章程及招生简章；招生网站位于学校wxit.edu.cn官方域名。'},
{row:799,code:'4132013571',name:'无锡太湖学院',F:'https://www.wxu.edu.cn/',G:'https://zs.wxu.edu.cn/',H:['https://www.wxu.edu.cn/','https://zs.wxu.edu.cn/','https://www.wxu.edu.cn/u/cms/thxy/202411/15135835t3uj.pdf'],note:'学校官网和招生就业网公布招生电话、校址及国标代码13571；信息公开材料确认招生网网址。'},
{row:800,code:'4132013982',name:'无锡学院',F:'https://www.cwxu.edu.cn/',G:'https://zs.cwxu.edu.cn/',H:['https://www.cwxu.edu.cn/','https://zs.cwxu.edu.cn/','https://zs.cwxu.edu.cn/info/1002/1583.htm'],note:'学校2025招生章程明确官网和招生网网址；目前招生站发布2026招生计划与章程。'},
{row:802,code:'4132010313',name:'徐州医科大学',F:'https://www.xzhmu.edu.cn/',G:'https://zsb.xzhmu.edu.cn/',H:['https://zsb.xzhmu.edu.cn/'],note:'本科招生信息网发布2026招生章程及本科招生动态；招生站位于学校xzhmu.edu.cn域名。'},
{row:803,code:'4132010320',name:'江苏师范大学',F:'https://www.jsnu.edu.cn/',G:'https://bkzs.jsnu.edu.cn/',H:['https://www.jsnu.edu.cn/'],note:'学校主页与本科招生网为jsnu.edu.cn官方域名；本科招生章程及专项招生信息通过校方招生网发布。'},
{row:804,code:'4132010849',name:'江苏建筑职业技术大学',F:'https://www.jsjzi.edu.cn/',G:'https://zsjy.jsviat.edu.cn/',H:['https://www.jsjzi.edu.cn/','https://www.jsviat.edu.cn/_t380/2026/0228/c4207a151980/page.htm','https://www.jsviat.edu.cn/main.psp'],note:'江苏省政府2026年设置通知确认学校升格更名；现行学校主页与官方招生简章/计划页采用学校域名。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江苏省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























