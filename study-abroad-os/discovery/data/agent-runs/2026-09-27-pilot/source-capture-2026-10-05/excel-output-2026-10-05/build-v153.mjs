import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v152.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v153.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const s=w.worksheets.getItem('รายชื่อ 1412');
const old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];
const rows=[
{row:319,code:'4145010605',name:'河池学院',F:'https://www.hcnu.edu.cn/',G:'https://zs.hcnu.edu.cn/',H:['https://zs.hcnu.edu.cn/info/1011/1745.htm','https://en.hcnu.edu.cn/info/1186/1463.htm'],note:'2026年普通本科招生章程明确学校代码、官网和招生网址。国际生方面，官网公布2024年广西政府东盟国家留学生奖学金简章（本科商务英语、汉语国际教育，全额奖学金）；该资助信息为2024年度历史指南，不能视为2026/2027仍开放。'},
{row:320,code:'4145011838',name:'贺州学院',F:'https://www.hzxy.edu.cn/',G:'https://zsb.hzxy.edu.cn/',H:['https://www.hzxy.edu.cn/info/1275/12850.htm','https://fsc.hzxy.edu.cn/'],note:'官网现行本科招生信息服务网已确认。国际学生线索仅作历史参考：官网2015年发布的留学生暂行规定（依据2010年文件）提到外事办负责招生和语言生；外国语学院网站曾于2025年发布国际本科项目招生简章。尚无本轮确认的2026/2027国际生或奖学金招生公告，请联系学校核实。'},
{row:321,code:'4145011546',name:'广西科技师范学院',F:'https://www.gxstnu.edu.cn/',G:'https://zsw.gxstnu.edu.cn/',H:['https://www.hzgrys.net/regulation/1/2026/2057.html'],note:'学校官网和招生网网址由2026年招生章程确认（现可检索的章程副本托管于第三方高校信息网站）。本轮未找到可核实的国际生招生或奖学金官方页面；不作存在或不存在的断言。'},
{row:323,code:'4145012104',name:'柳州职业技术大学',F:'https://www.lzpu.edu.cn/',G:'https://www.lzpu.edu.cn/zjc/',H:['https://www.lzpu.edu.cn/zjc/tzgg/content_106291','https://lzpu.edu.cn/xwzx/xww/xyyw/content_107384'],note:'学校2026招生章程确认官网和招生信息网址。学校2026年报道学历教育国际学生开学典礼，并称在籍联合培养留学生370人；这是在读/合作培养情况，不等同面向个人申请者开放的国际招生或奖学金公告。'},
{row:324,code:'4145013639',name:'柳州工学院',F:'https://www.lzhit.edu.cn/',G:'https://www.lzhit.edu.cn/zsw/',H:['https://www.hzgrys.net/regulation/1/2026/2067.html'],note:'2026年招生章程副本列明学校招生网址，学校域名与该校招生就业处一致。章程页面由第三方高校信息站托管；本轮未找到可核实的国际生招生或奖学金官方页面。'}
];
for(const x of rows){
 if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error(`identity mismatch ${x.row}`);
 const h=String(s.getRange(`H${x.row}`).values[0][0]??'');const nh=[h,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n');
 s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G,nh]];
 s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'官网/招生入口已核实；注明国际招生信息的年份、证据类型或尚未核实状态',x.note]];
 const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};
 const data=[['homepage',x.F,`${x.name}官方网站`,'Official institution homepage confirmed on institutional domain.','current school homepage'],['admissions',x.G,`${x.name}招生信息网站`,'Admissions channel linked from the institution’s official site or 2026 admissions charter.','general/domestic admissions'],...x.H.map(u=>['reference',u,'University source: admissions, international recruitment or student information','Use the note and page date to distinguish current domestic admissions from historical international recruitment or cohort news.','reference only'])];
 for(const[type,url,title,excerpt,channel] of data){if(old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url)||fresh.some(y=>y.source_row===x.row&&y.link_type===type&&y.final_url===url))continue;
 fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:x.name,page_title:title,evidence_locator:type==='reference'?'Official institutional domain; inspect publication date and applicant scope before treating as open admissions.':'2026 admissions charter or current university navigation.',original_excerpt:excerpt,applicant_channel:channel,unresolved:type==='reference'?'International applicant eligibility and current-cycle availability are not established unless the linked page explicitly states them.':undefined,decision:type==='reference'?'source_found':'accepted_official_link',retrieval_status:'URL and institution identity corroborated against official institutional material.'});}
}
await(await SpreadsheetFile.exportXlsx(w)).save(out);
await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');
console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
