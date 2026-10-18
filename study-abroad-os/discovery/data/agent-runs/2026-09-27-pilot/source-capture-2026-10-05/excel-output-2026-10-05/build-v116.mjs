import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v115.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v116.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=270,code='4144013714',name='广州工商学院';
const F='https://www.gzgs.edu.cn/';
const G='https://ies.gzgs.edu.cn/zsxx.htm';
const H='https://www.gzgs.edu.cn/zsb/jzxj/zzzc.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบเว็บไซต์ทางการและหน้ารับสมัคร; ทุน/资助 link เป็นข้อมูลของผู้เรียนทั่วไป ไม่ยืนยันสิทธิของนักศึกษาต่างชาติ',`${name}：官网国际教育学院招生信息页有2026年招生简章，但เป็นโครงการนานาชาติ/合作培养; 页内列出2025年来华留学生招生简章链接至微信公众号，内容无法核验且非当年。资助政策页针对本专科学生，未说明国际生资格；不据此确认国际生奖学金或招生资格。`]];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广东省',source_row:row,moe_code:code,name_zh:name,decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广州工商学院官网',evidence_locator:'官网版权信息及校名；招生就业办链接回同一gzgs.edu.cn域名',original_excerpt:'广州工商学院；版权所有 广州工商学院 粤ICP备09028461',applicant_channel:'general',retrieval_status:'Official university domain; ownership corroborated by university admissions site.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'广州工商学院国际教育学院',page_title:'招生信息',evidence_locator:'2026-10-06页面列示2026年国际教育学院一、二、三、五分院招生简章；第3页列2025年来华留学生简章',original_excerpt:'2026年国际教育学院一分院招生简章；2025年广州工商学院来华留学生简章（链接为微信公众号，无法核验正文）',cycle:'2026 listings; international-student brochure listed for 2025',applicant_channel:'international education offerings; foreign-student eligibility/intake details unknown',unresolved:'2026页列举的是国际教育学院分院招生简章，不能据此认定为国际学生来华学历招生；2025微信文章无法打开且已非当前周期。',retrieval_status:'Official university subdomain and current listing page confirmed; linked foreign-student article could not be independently inspected.'},
{...base,link_type:'scholarships',candidate_url:H,final_url:H,publisher:'广州工商学院招生就业办',page_title:'资助政策',evidence_locator:'官方招生就业办网站的奖助学金-资助政策栏目；列2025修订政策及2026助学贷款指南',original_excerpt:'资助政策；广州工商学院学生奖学金评选办法（修订）；学生减免学费管理办法（修订）',cycle:'2025-2026 policy notices',applicant_channel:'ordinary full-time undergraduate/college students; international student eligibility unknown',unresolved:'政策说明对象为普通全日制本专科学生，页面未说明国际学生是否适用；不得称为面向国际生奖学金。',retrieval_status:'Official university admissions subdomain, page and publisher confirmed; eligibility limited/unknown.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
