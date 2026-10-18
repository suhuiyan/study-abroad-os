import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v228.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v229.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:785,code:'4132010333',name:'苏州工学院',F:'https://www.szut.edu.cn/',G:'https://zsb.szut.edu.cn/',H:['https://www.szut.edu.cn/','https://zsb.szut.edu.cn/'],note:'学校新官网公告说明已启用szut.edu.cn并逐步停用旧域名；本科招生网发布2026招生计划与章程。'},
{row:786,code:'4132011054',name:'苏州职业技术大学',F:'https://jsspu.edu.cn/',G:'https://zhaosheng.jsspu.edu.cn/',H:['https://jsspu.edu.cn/','https://zhaosheng.jsspu.edu.cn/2026/0224/c1211a190094/page.htm'],note:'学校官网与招生官网确认现用校名及招生渠道；2026招生简章说明资助政策以校方招生网站为准。'},
{row:787,code:'4132013983',name:'苏州城市学院',F:'https://www.szcu.edu.cn/',G:'https://zs.szcu.edu.cn/',H:['https://www.szcu.edu.cn/','https://www.szcu.edu.cn/2026/0107/c551a84443/page.htm'],note:'学校2026招生简章明确学校网址和招生网址；学校官网确认在办主页。'},
{row:788,code:'4132013984',name:'苏州大学应用技术学院',F:'https://tec.suda.edu.cn/',G:'https://tec.suda.edu.cn/zs/index.htm',H:['https://tec.suda.edu.cn/','https://tec.suda.edu.cn/zs/index.htm'],note:'学院官网与招生网同属苏州大学suda.edu.cn域名；招生页发布2026招生计划及录取通知。'},
{row:789,code:'4132013991',name:'江苏科技大学苏州理工学院',F:'https://szlg.just.edu.cn/',G:'https://zs.justsit.edu.cn/',H:['https://zs.justsit.edu.cn/2026/0520/c248a24138/page.htm'],note:'学院2026本科招生章程明确招生网址；该官方章程核验招生渠道，主页地址按校方域名登记。'},
{row:791,code:'4132014160',name:'宿迁学院',F:'https://www.squ.edu.cn/',G:'https://zb.squ.edu.cn/',H:['https://zb.squ.edu.cn/','https://zb.squ.edu.cn/__local/A/00/D2/414EAA26C83587A8D9D33A2B373_EF290E51_2A2B0.pdf'],note:'学校招生网发布2026招生章程、计划及招生通知；与学校squ.edu.cn域名一致。'},
{row:792,code:'4132012917',name:'泰州学院',F:'https://www.tzu.edu.cn/',G:'https://zsb.tzu.edu.cn/',H:['https://www.tzu.edu.cn/','https://zsb.tzu.edu.cn/','https://tzu.edu.cn/_upload/article/files/28/39/5559eb0249b69a275b003b1edee0/dfb8fc1e-d1df-423d-93ab-a5fa316f3447.pdf'],note:'学校招生章程确认学校官网及招生网址；招生网发布2026招生计划与招生章程。'},
{row:793,code:'4132013842',name:'南京理工大学泰州科技学院',F:'https://www.nustti.edu.cn/',G:'https://zs.nustti.edu.cn/default/',H:['https://www.nustti.edu.cn/','https://zs.nustti.edu.cn/default/','https://zs.nustti.edu.cn/UploadFiles/2021招生专刊.pdf'],note:'学校主页列有招生网入口；招生网发布2026招生与录取通知。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江苏省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























