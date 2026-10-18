import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v233.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v234.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:822,code:'4136010413',name:'赣南医科大学',F:'https://www.gmu.edu.cn/',G:'https://zs.gmu.cn/',H:['https://www.gmu.edu.cn/index.htm','https://zs.gmu.cn/'],note:'学校官网展示本科生招生入口；2026本科招生章程明确招生信息网zs.gmu.cn，并列明奖助学金及资助体系。'},
{row:823,code:'4136010418',name:'赣南师范大学',F:'https://www.gnnu.edu.cn/',G:'https://zs.gnnu.edu.cn/',H:['https://zs.gnnu.edu.cn/'],note:'招生信息网发布2026本科招生章程、招生计划与政策；与学校gnnu.edu.cn官方域名一致。'},
{row:824,code:'4136013434',name:'赣南科技学院',F:'https://www.gnust.edu.cn/',G:'https://zs.gnust.edu.cn/',H:['https://www.gnust.edu.cn/','https://zs.gnust.edu.cn/zsxx.htm'],note:'学校官网与招生信息网使用gnust.edu.cn域名；招生信息网发布学院招生资料。'},
{row:825,code:'4136013439',name:'赣南师范大学科技学院',F:'https://www.gnnustc.com/',G:'https://zs.gnnustc.com/',H:['https://www.gnnustc.com/','https://zs.gnnustc.com/'],note:'学院防伪招生声明明确官网与招生信息网是招生信息发布渠道。'},
{row:826,code:'4136010419',name:'井冈山大学',F:'https://www.jgsu.edu.cn/',G:'https://zs.jgsu.edu.cn/',H:['https://www.jgsu.edu.cn/','https://zs.jgsu.edu.cn/'],note:'学校主页确认为井冈山大学；招生章程及招生信息公布招生网址zs.jgsu.edu.cn。'},
{row:827,code:'4136010408',name:'景德镇陶瓷大学',F:'https://www.jcu.edu.cn/',G:'https://zs.jcu.edu.cn/',H:['https://www.jcu.edu.cn/home.htm','https://zs.jcu.edu.cn/','https://zs.jcu.edu.cn/bkszs/zsjz.htm'],note:'2026本科招生章程明确学校网址和招生信息网；招生就业处发布本科招生章程与录取信息。'},
{row:828,code:'4136010894',name:'景德镇学院',F:'https://www.jdzu.edu.cn/',G:'https://zsw.jdzu.edu.cn/',H:['https://www.jdzu.edu.cn/','https://zsw.jdzu.edu.cn/index.htm','https://zsw.jdzu.edu.cn/info/1012/2901.htm'],note:'学校官网列招生信息入口；2026招生章程发布于招生办公室官网。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























