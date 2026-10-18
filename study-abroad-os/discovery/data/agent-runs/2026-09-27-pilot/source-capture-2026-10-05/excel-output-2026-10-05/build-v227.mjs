import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v226.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v227.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:762,code:'4132010850',name:'南京工业职业技术大学',F:'https://www.njuit.edu.cn/',G:'https://zs.njuit.edu.cn/',H:['https://www.njuit.edu.cn/','https://zs.njuit.edu.cn/0e/0c/c2909a69132/page.htm'],note:'学校官网与招生信息网均属校方域名；官方招生信息网发布2026年各省普通高考招生信息，页面列示国标代码10850。'},
{row:764,code:'4132011276',name:'南京工程学院',F:'https://njit.edu.cn/',H:['https://njit.edu.cn/','https://grad.njit.edu.cn/__local/7/E4/A9/CEED6AFC8E178C7E134EFC57EAC_B546C238_1BE6A.pdf'],note:'学校官网为njit.edu.cn；本次只确认学校主页与研究生招生官方页面，未找到可核验的本科招生专站。'},
{row:766,code:'4132011460',name:'南京晓庄学院',F:'https://www.njxzc.edu.cn/',G:'https://zhaosheng.njxzc.edu.cn/',H:['https://www.njxzc.edu.cn/main.psp','https://zhaosheng.njxzc.edu.cn/','https://xcy.njxzc.edu.cn/36/e0/c9686a145120/page.htm'],note:'学校2026年本科招生章程确认招生信息网址；本科招生信息网发布2026招生章程与计划。'},
{row:767,code:'4132012048',name:'南京特殊教育师范学院',F:'https://www.njts.edu.cn/',G:'https://bkzs.njts.edu.cn/',H:['https://www.njts.edu.cn/','https://bkzs.njts.edu.cn/','https://bkzs.njts.edu.cn/_upload/article/files/f7/23/0b000f534d0b8a792d2499ac5e19/2076469d-0aac-4fad-8388-d8be8a4731b2.pdf'],note:'学校主页列明招生办公室联系方式；校方招生页面与招生资料使用bkzs.njts.edu.cn。'},
{row:768,code:'4132012213',name:'南京警察学院',F:'https://www.njpu.edu.cn/',G:'https://apps.eol.cn/2522/recruit/',H:['https://www.njpu.edu.cn/','https://zsjyc.njpu.edu.cn/2026/0702/c28a103952/pagem.htm'],note:'学校官网及招生工作声明确认主页和录取查询网址；招生官方系统由教育在线承载，使用前按当年招生公告核对。'},
{row:770,code:'4132013573',name:'金陵科技学院',F:'https://www.jit.edu.cn/',G:'https://zsb.jit.edu.cn/',H:['https://www.jit.edu.cn/','https://www.jit.edu.cn/zsjy.htm','https://zsb.jit.edu.cn/_d2/index.phtml'],note:'学校招生就业页面明示本科招生网网址；本科招生网发布2026年招生计划与录取信息。'},
{row:772,code:'4132013654',name:'南京理工大学紫金学院',F:'https://zj.njust.edu.cn/',G:'https://zj.njust.edu.cn/zsw/main.htm',H:['https://zj.njust.edu.cn/','https://zj.njust.edu.cn/2025/0515/c7032a112128/page.htm','https://zj.njust.edu.cn/zsw/main.htm'],note:'学院2025招生章程明确官网网址；校内招生网发布招生计划、录取分数等招生信息。'},
{row:773,code:'4132013655',name:'南京航空航天大学金城学院',F:'https://nhjcxy.edu.cn/',G:'https://zsc.nhjcxy.edu.cn/',H:['https://nhjcxy.edu.cn/index.htm','https://zsc.nhjcxy.edu.cn/','https://zsc.nhjcxy.edu.cn/rootfiles/2024/10/29/1731893175384932-1731893175410567.pdf'],note:'学校官网展示招生处电话，学院招生处官网发布招生简章与招生信息。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江苏省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























