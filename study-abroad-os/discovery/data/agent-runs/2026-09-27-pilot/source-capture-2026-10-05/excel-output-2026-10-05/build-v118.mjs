import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v117.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v118.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=312,code='4145010602',name='广西师范大学';
const F='https://www.gxnu.edu.cn/';
const G='https://english.gxnu.edu.cn/2026/0204/c4263a336145/page.htm';
const H='https://english.gxnu.edu.cn/2026/0409/c4263a339729/page.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบแหล่งทางการรับนักศึกษาต่างชาติปี 2026–2027 และประกาศทุนอาเซียน; ตรวจเงื่อนไขผู้สมัคร/กำหนดเวลาจากคู่มือฉบับเต็มเพิ่มเติม',`${name}（学校代码10602）：国际招生官网列有2026-2027学年国际学生招生简章（2026-02-04）及中国教育部-广西政府东盟学生奖学金简章（2026-04-09）。奖学金为东盟专项，细项及个人资格须查阅完整简章；不推定适用于所有专业/层级。`]];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,cycle:'2026-2027',decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广西师范大学官网',evidence_locator:'官网版权/备案号；国际招生网页抬头为Guangxi Normal University并显示官网互链',original_excerpt:'Guangxi Normal University；桂ICP备05000954号-1',applicant_channel:'general',retrieval_status:'Official university homepage; confirmed by university international admissions domain.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'Office of International Cooperation and Exchanges, Guangxi Normal University',page_title:'Guangxi Normal University International Students Admission Brochure for the 2026-2027 Academic Year',published_at:'2026-02-04',evidence_locator:'Campus Bulletin lists this notice as item 7; linked article title and international admissions office contacts',original_excerpt:'Guangxi Normal University International Students Admission Brochure for the 2026-2027 Academic Year; Admissions Office email admissn@gxnu.edu.cn',applicant_channel:'international students; degree level and eligibility details must be confirmed in full brochure',unresolved:'Page body renders the brochure primarily as images in the available text view; inspect the original brochure for program-level conditions, deadlines, and eligibility.',retrieval_status:'Official university English international admissions domain and 2026-2027 brochure listing confirmed.'},
{...base,link_type:'scholarships',candidate_url:H,final_url:H,publisher:'Office of International Cooperation and Exchanges, Guangxi Normal University',page_title:'Guangxi Normal University 2026-2027 Admissions Brochure: ASEAN Student Scholarship Program Jointly Sponsored by MOE of China and Guangxi Government',published_at:'2026-04-09',evidence_locator:'Campus Bulletin item 2; official article title identifies 2026-2027 cycle and ASEAN scholarship; office contacts on page',original_excerpt:'2026-2027 Admissions Brochure: ASEAN Student Scholarship Program Jointly Sponsored by MOE of China and Guangxi Government',applicant_channel:'ASEAN student applicants; eligible level/program/award details must be checked in full brochure',unresolved:'The full brochure is displayed as images in the available text view; ASEAN scope is explicit in the title, but requirements, award value, deadline, and eligible degree levels are not inferred.',retrieval_status:'Official university international admissions page and current-cycle scholarship announcement confirmed.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
