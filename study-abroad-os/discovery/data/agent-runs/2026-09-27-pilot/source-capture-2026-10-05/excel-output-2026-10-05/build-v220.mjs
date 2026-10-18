import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v219.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v220.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:717,code:'4122010964',name:'吉林外国语大学',F:'https://www.jisu.edu.cn/',G:'https://zs.jisu.edu.cn/',H:['https://www.jisu.edu.cn/info/1083/6193.htm','https://zsjy.jisu.edu.cn/'],note:'学校官网列出本科招生栏目；校方本科招生咨询信息给出招生网zs.jisu.edu.cn。国际学生项目需分开核实。'},
{row:718,code:'4122011261',name:'吉林工商学院',F:'https://www.jlbtc.edu.cn/',G:'https://zsxxw.jlbtc.edu.cn/',H:['https://www.jlbtc.edu.cn/','https://jwc1.jlbtc.edu.cn/info/2011/12559.htm','https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view%2CschId-751%2CinfoId-7621848918.dhtml'],note:'学校主页通过校方网站及备案信息确认；2026招生章程列学校官网，并引用该招生信息网域名。国际学生另核。'},
{row:719,code:'4122011436',name:'长春汽车职业技术大学',F:'https://www.caii.edu.cn/',G:'https://zs.caii.edu.cn/',H:['https://www.moe.gov.cn/srcsite/A03/s181/202402/t20240202_1114086.html','https://zs.caii.edu.cn/_upload/article/files/f9/fc/333440a14bf0a417d98926ce0f75/ae98c302-c3cf-492c-98c0-ef2bfaa7f34c.pdf'],note:'教育部批复确认学校名称与代码4122011436；招生计划发布于zs.caii.edu.cn。注意部分招生简章仍反映专科/职业本科不同层次，按年度计划核对。'},
{row:720,code:'4122011437',name:'长春工程学院',F:'https://www.ccit.edu.cn/',G:'https://zsb.ccit.edu.cn/',H:['https://www.ccit.edu.cn/xxgk/xxzc.htm','https://zsb.ccit.edu.cn/'],note:'学校章程位于官方ccit.edu.cn，招生信息网发布2026本科招生章程、招生计划及录取进度。国际学生招生另核。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));


















