import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v227.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v228.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:775,code:'4132013905',name:'南京工业大学浦江学院',F:'https://www.njpji.edu.cn/',G:'https://zs.njpji.edu.cn/',H:['https://www.njpji.edu.cn/','https://zs.njpji.edu.cn/'],note:'学院官网及招生官网说明中明确招生咨询渠道；招生网刊载招生章程与录取信息。'},
{row:776,code:'4132013985',name:'苏州科技大学天平学院',F:'https://tpxy.usts.edu.cn/',G:'https://tpxy.usts.edu.cn/zs/',H:['https://tpxy.usts.edu.cn/','https://tpxy.usts.edu.cn/zs/'],note:'学院主页与招生网均托管在苏州科技大学usts.edu.cn域名；招生页更新学院招生与录取信息。'},
{row:777,code:'4132013990',name:'南京财经大学红山学院',F:'https://hs.nufe.edu.cn/',G:'https://hs.nufe.edu.cn/zsxx/main.psp',H:['https://hs.nufe.edu.cn/','https://hs.nufe.edu.cn/zsxx/main.psp','https://hs.nufe.edu.cn/zsxx/2026/0611/c471a27262/pagem.htm'],note:'学院2026招生章程确认学校标识码、官网及招生主页；招生信息网发布2026章程和招生计划。'},
{row:778,code:'4132013994',name:'南京审计大学金审学院',F:'https://www.naujsc.edu.cn/',G:'https://zsb.naujsc.edu.cn/',H:['https://www.naujsc.edu.cn/','https://zsb.naujsc.edu.cn/','https://www.naujsc.edu.cn/2021/0426/c65a113/page.psp'],note:'学院招生工作处页面列明官网地址和招生电话；招就处官网发布2026招生计划与章程。'},
{row:779,code:'4132014436',name:'江苏第二师范学院',F:'https://www.jssnu.edu.cn/',G:'https://zs.jssnu.edu.cn/main.htm',H:['https://www.jssnu.edu.cn/main.htm','https://zs.jssnu.edu.cn/main.htm'],note:'学校官网及本科招生信息网均在jssnu.edu.cn域名下；招生网发布2026招生考试通知。'},
{row:781,code:'4132012056',name:'南通理工学院',F:'https://www.ntit.edu.cn/',G:'https://zs.ntit.edu.cn/',H:['https://www.ntit.edu.cn/','https://zs.ntit.edu.cn/','https://jxpg.ntit.edu.cn/_upload/article/files/b1/df/555c314b47cdb9905175abcdc3a3/e16b3c11-ab04-47a5-b183-92685257da86.pdf'],note:'学校评估资料确认办学主体与官方域名；招生专站位于学校ntit.edu.cn域名下并发布招生信息。'},
{row:782,code:'4132013993',name:'南通大学杏林学院',F:'https://xlxy.ntu.edu.cn/',G:'https://xlxy.ntu.edu.cn/3084/list.htm',H:['https://xlxy.ntu.edu.cn/main.htm','https://xlxy.ntu.edu.cn/3084/list.htm','https://xlxy.ntu.edu.cn/3126/list.htm'],note:'学院官网发布招生栏和2026招生章程；招生信息页面与学院官网同属南通大学ntu.edu.cn域名。'},
{row:784,code:'4132010332',name:'苏州科技大学',F:'https://www.usts.edu.cn/',G:'https://zsb.usts.edu.cn/',H:['https://www.usts.edu.cn/','https://zsb.usts.edu.cn/','https://zsb.usts.edu.cn/news/News_View.asp?NewsID=317'],note:'学校2026年本科招生章程明确本科招生网址；招生官网发布招生章程及政策。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江苏省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























