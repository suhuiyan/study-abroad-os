import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v243.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v244.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:890,code:'4121013215',name:'辽宁师范大学海华学院',F:'https://www.lshhxy.edu.cn/',G:'https://zsb.lshhxy.edu.cn/',H:['https://www.lshhxy.edu.cn/','https://zsb.lshhxy.edu.cn/'],note:'学院官网及招生网为同一官方域名体系；招生网发布2026本科录取进程和招生章程。'},
{row:891,code:'4121013218',name:'大连财经学院',F:'https://www.dlufe.edu.cn/',G:'https://join.dlufe.edu.cn/',H:['https://www.dlufe.edu.cn/','https://join.dlufe.edu.cn/'],note:'学院2026招生章程列明学校官网dlufe.edu.cn及招生网join.dlufe.edu.cn。'},
{row:892,code:'4121013599',name:'大连艺术学院',F:'https://www.dac.edu.cn/',G:'https://zsgzc.dac.edu.cn/',H:['https://www.dac.edu.cn/','https://zsgzc.dac.edu.cn/more/1941/2'],note:'学校官网及招生工作处招生网发布2026招生章程和招生计划。'},
{row:894,code:'4121011779',name:'辽东学院',F:'https://www.elnu.edu.cn/',H:['https://www.elnu.edu.cn/'],note:'高校阳光高考平台院校主页列出elnu.edu.cn为学校官网；本次未确认独立招生网址。'},
{row:895,code:'4121010148',name:'辽宁石油化工大学',F:'https://www.lnpu.edu.cn/',G:'https://zhaosheng.lnpu.edu.cn/',H:['https://www.lnpu.edu.cn/','https://zhaosheng.lnpu.edu.cn/','https://www.lnpu.edu.cn/xxgk/xxzdxxgk.htm'],note:'学校官网列招生就业入口；信息公开报告指定zhaosheng.lnpu.edu.cn为招生信息平台，发布2026招生信息。'},
{row:896,code:'4121013201',name:'沈阳工学院',F:'https://www.situ.edu.cn/',G:'https://zsxx.situ.edu.cn/',H:['https://www.situ.edu.cn/','https://zsxx.situ.edu.cn/','https://zsxx.situ.edu.cn/info/1008/2547.htm'],note:'学校官网列招生信息网入口；招生网发布2026招生章程及计划。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























