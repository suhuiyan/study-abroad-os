import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v120.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v121.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=310,code='4145010596',name='桂林理工大学';
const F='https://www.glut.edu.cn/';
const G='https://gj.glut.edu.cn/info/1072/3787.htm';
const H='https://cfs.glut.edu.cn/info/1365/13104.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบคู่มือทางการปี 2026 สำหรับผู้สมัครต่างชาติหลายระดับ และทุนรัฐบาลกว่างซีสำหรับนักศึกษาอาเซียน; ทุนเฉพาะ本科/ASEAN และปิดรับ 20 พ.ค. 2026 แล้ว',`${name}：国际教育学院发布2026国际学生招生指南（本科、硕士、博士及汉语课程）及广西政府东盟国家本科奖学金简章。该奖学金仅限东盟国籍、全日制本科申请者，申请截止2026-05-20，已过期；指南和奖学金不代表当前仍开放。`]];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,cycle:'2026',decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'桂林理工大学官网',evidence_locator:'高校官方网站主域名glut.edu.cn；国际教育学院页面列示学校名称、官方联系方式和子域名gj.glut.edu.cn',original_excerpt:'桂林理工大学；Guilin University of Technology',applicant_channel:'general',retrieval_status:'Official university homepage domain cross-checked against university international admissions office page and same-domain official units.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'桂林理工大学国际教育学院（国际交流处）',page_title:'2026年桂林理工大学 国际学生招生指南 Guilin University of Technology International Students Admissions Guide',published_at:'2026-01-27',evidence_locator:'国际交流处招生简章栏目；第3节列本科中文/英文授课、硕士、博士及汉语课程；第7节申请材料与在线申请；第8节联系方式',original_excerpt:'本科课程（中文授课/英文授课）、硕士研究生课程、博士研究生课程、汉语课程；请访问cie.glut.edu.cn在线申请。',applicant_channel:'international applicants; undergraduate, master, doctoral, language study',unresolved:'Guide applies to the 2026 recruitment cycle; cycle-specific deadlines are not evident in this page text and must be checked with the admissions office.',retrieval_status:'Official international admissions subdomain; current-cycle guide and responsible office verified.'},
{...base,link_type:'scholarships',candidate_url:H,final_url:H,publisher:'桂林理工大学外国语学院/国际教育学院',page_title:'2026年桂林理工大学“广西政府东盟国家留学生奖学金项目”招生简章',published_at:'2026-04-09',evidence_locator:'正文第一段（项目启动及仅限东盟）；第一至三节（类别、条件、资助）；第四节（截止日期）',original_excerpt:'本项目仅接收东盟国家留学生报名；招生对象仅限全日制在校本科生；免交学费、住宿费、注册费并提供生活补助及综合医疗保险；申请者请于2026年5月20日前提交。',applicant_channel:'ASEAN international applicants; full-time undergraduate only',unresolved:'Application deadline 2026-05-20 has passed. Detailed subject eligibility and award selection should be checked in the original notice; this is not evidence of a currently open scholarship.',retrieval_status:'Official university scholarship notice; applicant scope, coverage, and expired deadline verified.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
