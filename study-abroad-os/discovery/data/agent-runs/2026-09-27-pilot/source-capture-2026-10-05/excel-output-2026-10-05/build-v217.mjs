import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v216.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v217.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:705,code:'4122010183',name:'吉林大学',F:'https://www.jlu.edu.cn/',G:'https://zsb.jlu.edu.cn/',H:['https://www.jlu.edu.cn/zsjy.htm','https://gongkai.jlu.edu.cn/info/1028/1956.htm'],note:'学校官网设招生就业及本科招生入口；校方招生章程明确本科招生网站zsb.jlu.edu.cn。国际学生与奖学金项目另行核实。'},
{row:706,code:'4122010186',name:'长春理工大学',F:'https://www.cust.edu.cn/',G:'https://zsb.cust.edu.cn/',H:['https://zsb.cust.edu.cn/bkzn/zszc/index.htm','https://www.cust.edu.cn/zsjy2026/bkszs20261/index.htm'],note:'学校主页链接本科招生栏目；招生网发布2026招生章程并注明本科生招生办公室。该入口为国内本科招生。'},
{row:707,code:'4122010190',name:'长春工业大学',F:'https://www.ccut.edu.cn/',H:['https://www.ccut.edu.cn/gdgl/xxzc.htm','https://xxgk.ccut.edu.cn/'],note:'学校章程明列官网ccut.edu.cn，学校信息公开站可确认机构身份；未确认有效本科招生网址，招生栏留空。国际招生另核。'},
{row:708,code:'4122010191',name:'吉林建筑大学',F:'https://www.jlju.edu.cn/',G:'https://zsxxw.jlju.edu.cn/',H:['https://www.jlju.edu.cn/info/1026/132022.htm','https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view%2CschId-159%2CinfoId-7624578333.dhtml'],note:'学校官网确认招生信息网zsxxw.jlju.edu.cn；教育部阳光高考平台载有已审核的2026年本科招生章程。国际招生另行核实。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));















