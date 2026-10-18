import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v240.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v241.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:866,code:'4136011508',name:'新余学院',F:'https://www.xyc.edu.cn/',G:'https://zb.xyc.edu.cn/',H:['https://www.xyc.edu.cn/','https://zb.xyc.edu.cn/','https://zb.xyc.edu.cn/zszn/zyjs.htm'],note:'学校官网及招生网均属xyc.edu.cn；2026招生章程列明招生网网址。'},
{row:867,code:'4136012766',name:'江西工程学院',F:'https://www.jxue.edu.cn/',G:'https://zsc.jxue.edu.cn/',H:['https://www.jxue.edu.cn/','https://zsc.jxue.edu.cn/2026/0522/c229a46577/page.htm'],note:'学校官网及阳光招生网发布2026招生章程与招生信息。'},
{row:868,code:'4136010417',name:'宜春学院',F:'https://www.jxycu.edu.cn/',G:'https://zsw.jxycu.edu.cn/zsw/',H:['https://www.jxycu.edu.cn/','https://zsw.jxycu.edu.cn/zsw/','https://zsw.jxycu.edu.cn/zsw/_t952/2026/0430/c2076a151646/page.htm'],note:'学校官网及招生网发布2026普通本科招生章程、招生计划及录取信息。'},
{row:869,code:'4121010146',name:'辽宁科技大学',F:'https://www.ustl.edu.cn/',H:['https://www.ustl.edu.cn/','https://www.ustl.edu.cn/info/1044/1704.htm'],note:'学校章程确认校名与官方域名ustl.edu.cn；本次仅确认首页和学校章程，招生独立入口待单独核实。'},
{row:870,code:'4121010169',name:'鞍山师范学院',F:'https://www.asnc.edu.cn/',G:'https://zsw.asnc.edu.cn/',H:['https://www.asnc.edu.cn/','https://zsw.asnc.edu.cn/','https://zsw.asnc.edu.cn/tzgg/5af860ff76814043ad2f28eb101ed00c.htm'],note:'校方2026级新生提醒指定zsw.asnc.edu.cn为官方招生信息平台；学校官网确认机构。'},
{row:871,code:'4121011430',name:'辽宁科技学院',F:'https://www.lnist.edu.cn/',G:'https://zs.lnist.edu.cn/',H:['https://www.lnist.edu.cn/','https://zs.lnist.edu.cn/'],note:'招生网由辽宁科技学院招生与就业处主办，并链接学校官网；发布2026招生章程。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























