import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v132.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v133.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=296,code='4144013720',name='广东理工学院';
const F='https://www.gdlgxy.edu.cn/index.htm';
const G='https://zsb.gdlgxy.edu.cn/';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,'']];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบเว็บไซต์และ招生网ทางการ; รอบที่ตรวจพบเป็นการ招生ทั่วไป ยังไม่พบประกาศรับนักศึกษาต่างชาติหรือทุน','官网主页标识学校代码13720并设“招生就业—招生信息网”入口；招生网二级域名zsb.gdlgxy.edu.cn及页面版权均标识广东理工学院招生网。本次检索未找到外国留学生招生简章或专项奖学金公告，国内普通招生与学生资助信息不视为国际生招生证据。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广东省',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed',decision:'accepted_official_link'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广东理工学院',evidence_locator:'学校主页标识全日制普通本科院校、学校代码13720；导航含招生信息网',original_excerpt:'全日制普通本科院校 学校代码:13720；招生就业—招生信息网',applicant_channel:'general',retrieval_status:'Official homepage identity and admissions navigation verified.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'广东理工学院招生办公室',page_title:'广东理工学院招生网',evidence_locator:'官方学校主页“招生信息网”入口链接；招生网二级域名页面版权及代码信息',original_excerpt:'Copyright ©2022广东理工学院招生信息网；招生代码13720。',applicant_channel:'general/domestic admissions; international-student scope unverified',unresolved:'No foreign-student prospectus or scholarship notice found in this search. General admissions site does not establish international student recruitment.',retrieval_status:'Official general admissions channel confirmed through the university homepage and matching school code.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
