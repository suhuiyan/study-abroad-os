import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v254.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v255.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:945,code:'4115012670',name:'呼和浩特职业技术大学',F:'https://www.hhvc.edu.cn/',G:'https://www.hhvc.edu.cn/zsjy1.htm',H:['https://www.hhvc.edu.cn/','https://www.hhvc.edu.cn/zsjy1.htm'],note:'学校官网设招生就业栏目并发布2026招生章程。'},
{row:946,code:'4115012797',name:'内蒙古警察学院',F:'https://www.impc.edu.cn/',G:'https://www.impc.edu.cn/info/1030/36021.htm',H:['https://www.impc.edu.cn/','https://www.impc.edu.cn/info/1030/36021.htm'],note:'学校2026招生章程确认官网与招生咨询信息；此处登记官方章程页作为招生入口证据。'},
{row:947,code:'4115014199',name:'内蒙古大学创业学院',F:'https://www.imuchuangye.cn/',G:'https://zsw.imuchuangye.cn/',H:['https://www.imuchuangye.cn/','https://zsw.imuchuangye.cn/'],note:'阳光高考平台2026招生章程确认学校官网；招生网地址由官方域名入口资料交叉核实。'},
{row:948,code:'4115014205',name:'内蒙古鸿德文理学院',F:'https://www.honder.com/',G:'https://honderzs.jysd.com/',H:['https://www.honder.com/','https://honderzs.jysd.com/','https://www.honder.com/news/info27503.html'],note:'学校官网首页直接链接招生信息网；官网发布2026招生专辑与招生计划。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























