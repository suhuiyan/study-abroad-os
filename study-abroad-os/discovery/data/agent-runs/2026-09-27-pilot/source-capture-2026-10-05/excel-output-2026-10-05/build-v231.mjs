import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v230.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v231.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:805,code:'4132011998',name:'徐州工程学院',F:'https://www.xzit.edu.cn/',G:'https://zjc.xzit.edu.cn/',H:['https://zjc.xzit.edu.cn/','https://xxgk.xzit.edu.cn/3150/list.htm'],note:'学校信息公开目录列有本科生招生与招生章程；招生站由学校招生就业处运营。'},
{row:807,code:'4132013988',name:'江苏师范大学科文学院',F:'https://kwxy.jsnu.edu.cn/',G:'https://kwzs.jsnu.edu.cn/',H:['https://kwxy.jsnu.edu.cn/','https://kwzs.jsnu.edu.cn/'],note:'2026招生章程列明学院官网和招生网址，官方域名隶属江苏师范大学jsnu.edu.cn。'},
{row:808,code:'4132010305',name:'盐城工学院',F:'https://www.ycit.cn/',G:'https://zjb.ycit.edu.cn/',H:['https://www.ycit.cn/','https://zjb.ycit.edu.cn/'],note:'学校主页列有本科生招生入口；招生网声明其为本科招生信息唯一官方发布平台。'},
{row:809,code:'4132010324',name:'盐城师范学院',F:'https://www.yctu.edu.cn/',G:'https://zs.yctu.edu.cn/main.htm',H:['https://www.yctu.edu.cn/','https://zs.yctu.edu.cn/main.htm'],note:'本科招生网发布2026省内外计划、招生咨询和录取信息；页面列有学校招生办联系方式。'},
{row:810,code:'4132011117',name:'扬州大学',F:'https://www.yzu.edu.cn/',G:'https://zhaoban.yzu.edu.cn/',H:['https://www.yzu.edu.cn/','https://zhaoban.yzu.edu.cn/'],note:'学校本科招生网发布高考招生政策与计划；该站点为学校官方yzu.edu.cn域名。'},
{row:811,code:'4132011462',name:'扬州职业技术大学',F:'https://www.yzpc.edu.cn/',G:'https://zsjy.yzpc.edu.cn/',H:['https://www.yzpc.edu.cn/main.htm','https://zsjy.yzpc.edu.cn/','https://zsjy.yzpc.edu.cn/_upload/article/files/fe/7f/db84dc474082af1f4cb958a17dd2/f351d959-5f4a-46d4-b4d3-1f0c6fd96a24.pdf'],note:'学校官网启用现名且列出招生网入口；校方招生简章明确招生网址zsjy.yzpc.edu.cn。'},
{row:812,code:'4132013987',name:'扬州大学广陵学院',F:'https://glxy.yzu.edu.cn/',G:'https://glxy.yzu.edu.cn/zsw',H:['https://glxy.yzu.edu.cn/zsw','https://apps.eol.cn/2554/article/153916.html'],note:'招生网由学院招生就业处运营；招生咨询资料列明学院招生网及招生电话。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江苏省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























