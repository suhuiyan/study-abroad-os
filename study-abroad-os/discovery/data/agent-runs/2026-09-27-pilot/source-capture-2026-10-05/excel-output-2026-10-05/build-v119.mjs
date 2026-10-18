import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v118.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v119.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=293,code='4144010579',name='岭南师范学院';
const F='https://www.lingnan.edu.cn/';
const G='https://newsnew.lingnan.edu.cn/info/1073/1182556.htm';
const H='https://pmplatform.chinese.cn/ui/schoolTable/schoolTable.html';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบเว็บทางการและข่าวปี 2026 ระบุเปิดรับนักศึกษาต่างชาติภาคฤดูใบไม้ร่วง; ทุน国际中文教师奖学金 แสดงเฉพาะหมวด研修生ในสารบบทางการ',`${name}：学校官网确认校名及国际教育职能。国际交流与合作处2026-06-24报道：2026级汉语进修班42人结业，并称当年秋季继续招收来华留学生，但未提供当年申请简章/截止日。国际中文教师奖学金官方接收院校目录列本校为研修生类别；不据此推定学历奖学金。`]];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广东省',source_row:row,moe_code:code,name_zh:name,cycle:'2026',decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'岭南师范学院官网',evidence_locator:'学校官网、学校概况页校名与备案信息',original_excerpt:'岭南师范学院；学校官网版权与校名',applicant_channel:'general',retrieval_status:'Official university domain; name and institutional identity confirmed.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'岭南师范学院国际交流与合作处（与港澳台事务办公室、国际教育与文化学院合署）',page_title:'汉语为媒 文化同行——岭南师范学院举行2026年来华留学汉语进修生结业仪式',published_at:'2026-06-24',evidence_locator:'正文记载2026级汉语进修班42名留学生结业；末段称当年秋季继续开展来华留学生招生培养',original_excerpt:'2026级汉语进修班全体学员；学校今年秋季将继续开展来华留学生招生培养工作。',applicant_channel:'international students; autumn 2026 recruiting intent stated, application details unknown',unresolved:'新闻未提供2026秋季招生简章、项目层级、条件、申请窗口或截止日期。',retrieval_status:'Official university news from the responsible international office; confirms recruitment intent only.'},
{...base,link_type:'scholarships',candidate_url:H,final_url:H,publisher:'国际中文教师奖学金官方在线申请平台',page_title:'国际中文教师奖学金接收院校（2026年）',evidence_locator:'接收院校表序号234列“岭南师范学院”；类别列仅见研修生标记',original_excerpt:'国际中文教师奖学金接收院校（2026年）；234 岭南师范学院（研修生）',applicant_channel:'international Chinese language teacher scholarship; non-degree training category listed',unresolved:'官方名录列研修生类别，不据此认定本科学位、硕士或博士奖学金可用。具体项目条件请以本校2026招生简章为准。',retrieval_status:'Official scholarship program host-institution table; school and listed category checked.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
