import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v119.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v120.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=294,code='4144012622',name='湛江科技学院';
const F='https://www.zjkju.edu.cn/';
const G='https://zs.zjkju.edu.cn/';
const H='https://12622.gaokao.haedu.cn/policy/brochure/2026/0623/154833.html';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'เว็บหลัก/招生网 ยืนยันจาก章程ปี 2026; หน้าเว็บ timeout ในการตรวจ; 章程เป็น普通高考 ไม่ยืนยันการรับนักศึกษาต่างชาติหรือทุนต่างชาติ',`${name}（校标识码4144012622）：学校2026夏季高考章程载于河南省阳光高考平台，列明官网www.zjkju.edu.cn、招生网zs.zjkju.edu.cn及适用范围为普通高考本专科；学校招生网站当前访问超时。章程资助条款不作为国际学生奖学金依据。`]];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广东省',source_row:row,moe_code:code,name_zh:name,cycle:'2026',decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'湛江科技学院官网',evidence_locator:'2026年夏季高考招生章程第三十三条列学校网址；章程校名及院校标识码4144012622',original_excerpt:'学校网址：www.zjkju.edu.cn；院校标识码：4144012622',applicant_channel:'general',retrieval_status:'University-issued current-year charter republished by Henan provincial admissions information platform; direct site timed out.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'湛江科技学院招生办公室',page_title:'湛江科技学院招生网',evidence_locator:'2026年夏季高考招生章程第三十三条列招生网址；招生网站内页署名湛江科技学院招生网',original_excerpt:'招生网址：zs.zjkju.edu.cn；学校授权招生办公室解释本章程',applicant_channel:'ordinary-gaokao domestic undergraduate/college applicants; international admissions unknown',unresolved:'官方招生子站直接访问超时；当前国际学生招生是否由该站承办未确认。',retrieval_status:'Official university charter explicitly names this admissions domain; live page timed out during check.'},
{...base,link_type:'admissions_notice',candidate_url:H,final_url:H,publisher:'河南省阳光高考信息平台（河小阳）',page_title:'湛江科技学院2026年夏季高考招生章程',published_at:'2026-06-23',evidence_locator:'第三、四条学校名称及代码；第三十三条官网/招生网；第三十五条适用范围',original_excerpt:'学校名称：湛江科技学院；院校标识码：4144012622；招生网址：zs.zjkju.edu.cn；适用于学校2026年夏季普通高考本、专科招生工作。',applicant_channel:'domestic ordinary-gaokao undergraduate/college applicants; international student eligibility unknown',unresolved:'普通高考章程及资助条款不证明国际学生招生或奖学金资格。',retrieval_status:'Current 2026 charter on provincial admissions platform; school code and official URLs cross-checked.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
