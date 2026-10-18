import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v116.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v117.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=184,code='4135012710',name='闽南理工学院';
const F='https://www.mnust.edu.cn';
const G='https://12710.gaokao.haedu.cn/policy/brochure/2026/0623/154244.html';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,null]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบเว็บทางการจาก章程ปี 2026 บนแพลตฟอร์มข้อมูลสอบเข้าระดับมณฑล; ลิงก์รับสมัครเป็น普通高考 ไม่ยืนยันช่องทางนักศึกษาต่างชาติ',`${name}：河南省阳光高考信息平台发布的2026普通高考招生章程确认学校名称及官网https://www.mnust.edu.cn；学校官网访问超时，未能检查页面。该章程适用于普通高考本科招生，不证明外国留学生招生或奖学金资格。`]];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'福建省',source_row:row,moe_code:code,name_zh:name,cycle:'2026',decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'学校网站（由2026招生章程确认）',evidence_locator:'2026普通高考招生章程联系方式/第二十五条学校网址；河小阳河南省阳光高考信息平台',original_excerpt:'学校网址：https://www.mnust.edu.cn',applicant_channel:'general',retrieval_status:'Government admissions platform republishes the school-issued 2026 charter, which names this homepage; direct site timed out during check.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'河南省阳光高考信息平台（河小阳）',page_title:'闽南理工学院2026年普通高考招生章程',published_at:'2026-06-23',evidence_locator:'章程第一、二条（学校名称及招生范围）；第二十五条（学校联系方式与官网）；页面发布信息',original_excerpt:'学校名称：闽南理工学院；本章程适用于闽南理工学院2026年普通高校招生工作。学校网址：https://www.mnust.edu.cn',applicant_channel:'domestic ordinary-gaokao undergraduate applicants; international student eligibility unknown',unresolved:'此为普通高考招生章程；未证明外国留学生招生通道、国际生奖学金或外国申请人资格。学校官网直接访问超时。',retrieval_status:'Current 2026 charter on provincial admissions information platform; exact school name, cycle, and official homepage confirmed.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
