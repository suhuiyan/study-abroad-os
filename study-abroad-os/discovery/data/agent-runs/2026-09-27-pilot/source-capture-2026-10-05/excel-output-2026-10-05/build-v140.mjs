import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v139.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v140.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=22,code='4134010380',name='巢湖学院';
const F='https://www.chu.edu.cn/';
const G='https://www.chu.edu.cn/zsw/';
const H='https://www.chu.edu.cn/_upload/article/files/59/19/3a74c76348c988ab0fb498b4b43f/87fbdf7c-2099-4cb0-9293-6b7ba1241630.pdf';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'ยืนยันเว็บมหาวิทยาลัยและ招生网จาก章程ปี 2026; พบคู่มือ国际学生ปี 2024 บนโดเมนทางการ แต่ยังไม่พบฉบับปัจจุบัน','学校2026年普通本科招生章程公布官网及招生信息网链接；该招生章程面向普通本科招生。官网可查到2024年国际学生招生简章PDF，但未核实2026/2027版本，旧简章仅作历史参考，不代表当前计划或资助。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code&&x.link_type==='homepage'&&x.final_url===F)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'安徽省',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'巢湖学院',evidence_locator:'巢湖学院2026年普通本科招生章程列学校官网、地址及招生信息网网址',original_excerpt:'学校网址：https://www.chu.edu.cn；学校招生信息网网址：https://www.chu.edu.cn/zsw/',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official homepage and admissions portal verified in school 2026 charter.'},
{...base,cycle:'2026',link_type:'admissions',candidate_url:G,final_url:G,publisher:'巢湖学院招生办公室',page_title:'巢湖学院招生信息网',evidence_locator:'2026年普通本科招生章程指明该站为招生考试、录取信息发布渠道',original_excerpt:'学校招生信息网网址：https://www.chu.edu.cn/zsw/',applicant_channel:'general/domestic admissions; international scope unverified',unresolved:'General admissions site; no international-applicant process established.',decision:'accepted_official_link',retrieval_status:'Official admissions site confirmed by the 2026 charter.'},
{...base,cycle:'2024',link_type:'international_admissions',candidate_url:H,final_url:H,publisher:name,page_title:'巢湖学院2024年国际学生招生简章',evidence_locator:'学校官方域名PDF；内容为2024年国际学生招生简章，明确国际学生入学条件及培养方式',original_excerpt:'巢湖学院2024年国际学生招生简章；留学生招生政策仅适用于2024年',applicant_channel:'international applicants; 2024 cycle',unresolved:'No current-cycle international brochure was located; do not rely on the 2024 brochure for current application dates, programs, fees, or scholarship terms.',decision:'source_found',retrieval_status:'Official historical international student brochure.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
