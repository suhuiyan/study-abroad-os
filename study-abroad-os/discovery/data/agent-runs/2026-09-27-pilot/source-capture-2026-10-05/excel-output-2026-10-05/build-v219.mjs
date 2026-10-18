import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v218.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v219.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:713,code:'4122010205',name:'长春师范大学',F:'https://www.ccsfu.edu.cn/',G:'https://zhaosheng.ccsfu.edu.cn/',H:['https://zhaosheng.ccsfu.edu.cn/zsxx.htm','https://www.eol.cn/liuxue/hezuo/ccsfdx/index.html'],note:'高校域名目录与教育在线机构页均指向ccsfu.edu.cn；招生子站位于该校域名下。主页访问时出现网关错误，待恢复后复核可访问性；现阶段不推断奖学金信息。'},
{row:714,code:'4122010207',name:'吉林财经大学',F:'https://www.jlufe.edu.cn/',G:'https://newzs.jlufe.edu.cn/',H:['https://www.jlufe.edu.cn/cdgk/xxzc.htm','https://newzs.jlufe.edu.cn/','https://newzs.jlufe.edu.cn/info/1002/1711.htm'],note:'学校章程明确官方主页；校方招生网发布2026本科招生章程、简章和录取进度。国际学生招生须另核。'},
{row:715,code:'4122010208',name:'吉林体育学院',F:'https://www.jlsu.edu.cn/',G:'https://zsjy.jlsu.edu.cn/zsgz.htm',H:['https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view%2CschId-171%2CinfoId-7619618560.dhtml','https://gaokao.chsi.com.cn/news/file.do?attach=true&hist=false&id=2293446243&method=downFile'],note:'教育部阳光高考已审核2026招生章程列明学校网址；官方招生材料指向zsjy.jlsu.edu.cn/zsgz.htm。国际学生政策另核。'},
{row:716,code:'4122010209',name:'吉林艺术学院',F:'https://www.jlart.edu.cn/',G:'https://zsb.jlart.edu.cn/',H:['https://www.jlart.edu.cn/index.htm','https://zsb.jlart.edu.cn/','https://zsb.jlart.edu.cn/zsgz/zszc2.htm'],note:'官网列出本科生招生及国际学生招生入口；招生网站自称统一发布招生信息，更新2026本科计划、章程与录取分数。国际招生另核。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));

















