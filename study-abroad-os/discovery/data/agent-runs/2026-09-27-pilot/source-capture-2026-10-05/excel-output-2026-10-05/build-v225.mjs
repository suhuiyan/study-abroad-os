import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v224.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v225.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:738,code:'4132010323',name:'淮阴师范学院',F:'https://www.hytc.edu.cn/',G:'https://zb.hytc.edu.cn/',H:['https://www.hytc.edu.cn/index.htm','https://zb.hytc.edu.cn/','https://zb.hytc.edu.cn/zszc/pgzszc.htm'],note:'学校主页列有本科生招生入口；本科招生网发布2026年招生章程、录取通知和招生信息。'},
{row:739,code:'4132011049',name:'淮安大学',F:'https://www.hau.edu.cn/',G:'https://zsw.hau.edu.cn/',H:['https://zsw.hau.edu.cn/','https://zsw.hau.edu.cn/tzgg.htm','https://zsw.hau.edu.cn/info/1068/2547.htm'],note:'本科招生网发布2026普通高等教育招生章程、计划与录取进程；学校信息公开资料确认淮安大学官网。'},
{row:740,code:'4132016406',name:'昆山杜克大学',F:'https://www.dukekunshan.edu.cn/zh-hans/',G:'https://admissions.dukekunshan.edu.cn/',H:['https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--infoId-7597041070%2Cmethod-view%2CschId-1884419845.dhtml','https://admissions.dukekunshan.edu.cn/recruitment-guidelines/index.html','https://admissions.dukekunshan.edu.cn/category/rxsq/'],note:'教育部阳光高考平台审核的2026招生章程确认主页及中国本科招生网；内地申请与国际申请渠道应区分。奖学金/助学金政策需按身份和年度单独确认。'},
{row:741,code:'4132011585',name:'连云港师范学院',F:'https://www.lygsf.edu.cn/',G:'https://zs.lygsf.edu.cn/',H:['https://lygsf.edu.cn/','https://ty.lygsf.edu.cn/2026/0625/c109a41002/page.htm','https://zs.lygsf.edu.cn/'],note:'学校官网与2026招生章程确认官方主页、招生网址；招生子站发布2026级新生与招录信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'吉林省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























