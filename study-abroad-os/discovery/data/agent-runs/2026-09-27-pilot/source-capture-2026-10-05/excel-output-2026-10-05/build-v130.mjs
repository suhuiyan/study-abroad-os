import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v129.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v130.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=278,code='4144011656',name='广东石油化工学院';
const F='https://www.gdupt.edu.cn/';
const G='https://zs.gdupt.edu.cn/';
const H='https://site.gdupt.edu.cn/xxjj/xxjj.htm\nhttps://site.gdupt.edu.cn/oiec/info/1089/2692.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบหน้าเว็บ招生และข้อมูล留学生ทางการ; มีบางหลักสูตรรับ留学生 แต่หน้าหลักสูตรล่าสุดที่พบลงวันที่ 2024 ต้องสอบถามรอบปัจจุบัน','官网简介明确说明面向世界各地招收部分专业学历留学生及汉语、中国文化进修生；学校信息显示2013年获留学生招生资格。对外交流合作部“Programs for International Students”页面列出的附件页发布日期为2024年3月10日，未显示2026招生批次、专业目录更新、截止日期或奖学金，因此需联系该部门确认当前招生。普通招生网仅作学校招生入口。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广东省',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广东石油化工学院',evidence_locator:'大学官网首页及其学校简介链接',original_excerpt:'广东石油化工学院；官网联系方式列招生网址与学校地址。',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official university homepage verified.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:name,page_title:'广东石油化工学院招生网',evidence_locator:'学校官网联系方式明确列“学校招生网址”zs.gdupt.edu.cn',original_excerpt:'学校招生网址：https://zs.gdupt.edu.cn',applicant_channel:'general admissions; international scope not stated on this portal',unresolved:'General admissions portal. Use the international affairs office for foreign-student application requirements and current programs.',decision:'accepted_official_link',retrieval_status:'Official admissions channel listed on university homepage.'},
{...base,link_type:'notice',candidate_url:'https://site.gdupt.edu.cn/xxjj/xxjj.htm',final_url:'https://site.gdupt.edu.cn/xxjj/xxjj.htm',publisher:'广东石油化工学院',page_title:'学校简介',evidence_locator:'“对外合作”段落',original_excerpt:'2013年，获招收留学生资格；面向世界各地招收石油工程、化学工程与工艺（石油化工方向）、国际经济与贸易等部分专业学历留学生及汉语与中国文化进修生。',applicant_channel:'international degree programs in selected fields and non-degree students',decision:'source_found',retrieval_status:'Official university profile confirms international recruitment scope; no current-cycle dates.'},
{...base,cycle:'2024',link_type:'notice',candidate_url:'https://site.gdupt.edu.cn/oiec/info/1089/2692.htm',final_url:'https://site.gdupt.edu.cn/oiec/info/1089/2692.htm',publisher:'广东石油化工学院对外交流合作部',page_title:'PROGRAMS FOR INTERNATIONAL STUDENTS',published_at:'2024-03-10',evidence_locator:'对外交流合作部公告页面及其附件Programs for International students.pdf',original_excerpt:'PROGRAMS FOR INTERNATIONAL STUDENTS；2024-03-10；Please check the attached files.',applicant_channel:'international students; exact current cycle unspecified',unresolved:'This is an older programs attachment page. Current majors, deadlines, scholarships, and application process must be verified with the office.',decision:'source_found',retrieval_status:'Official foreign-student programs page identified; attachment details are from 2024.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
