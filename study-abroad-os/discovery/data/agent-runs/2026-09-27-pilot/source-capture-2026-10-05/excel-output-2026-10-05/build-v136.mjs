import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v135.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v136.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=332,code='4145011548',name='广西财经学院';
const F='https://www.gxufe.edu.cn/';
const G='https://www.gxufe.edu.cn/www/subWebSites/zsxx/index.html';
const H='https://www.gxufe.edu.cn/www/subWebSites/gjjlc/index.html\nhttps://www.gxufe.edu.cn/www/subWebSites/jxjyxy/index.html\nhttps://www.gxufe.edu.cn/wwwservice/download?client=pc&fileid=74b15d35-5801-3566-bfdf-f4324c795e9c.doc&open=true';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'ยืนยันเว็บมหาวิทยาลัย/เว็บ招生 และหน่วยงาน国际合作与交流处; พบแบบฟอร์มสมัครและประกาศแผนรับนักศึกษาต่างชาติปี 2025 แต่ยังไม่พบประกาศรอบ 2026','学校官网设有国际合作与交流处及2025年国际学生招生计划公告，并提供国际学生申请表，表格覆盖语言、本科和硕士类别。现有招生计划为2025年，申请表未见本轮有效期；申请前请联系国际合作处确认2026/2027计划、专业、奖学金与有效材料。普通招生信息网主要面向国内普招。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广西财经学院',evidence_locator:'首页显示校名及联系方式；官方招生章程交叉列出主页网址、域名及相思湖校区地址',original_excerpt:'学校官网：https://www.gxufe.edu.cn/；招生网站：https://www.gxufe.edu.cn/www/subWebSites/zsxx/index.html',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official university homepage confirmed through institutional admissions charter.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'广西财经学院招生信息网',page_title:'广西财经学院招生信息网',evidence_locator:'官网招生信息网页列招生动态、招生政策及联系信息',original_excerpt:'广西财经学院招生信息网；招生咨询电话0771-3845585',applicant_channel:'general/domestic admissions; international scope unverified',unresolved:'This portal is the general university admissions site; use the International Cooperation Office for international applicant guidance.',decision:'accepted_official_link',retrieval_status:'Official general admissions portal confirmed.'},
{...base,cycle:'2025',link_type:'international_admissions',candidate_url:'https://www.gxufe.edu.cn/www/subWebSites/gjjlc/index.html',final_url:'https://www.gxufe.edu.cn/www/subWebSites/gjjlc/index.html',publisher:'广西财经学院国际合作与交流处港澳台办公室',page_title:'广西财经学院 - 国际合作与交流处港澳台办公室',published_at:'2026-09-24',evidence_locator:'官方国际合作处近期新闻含2026年秋季国际学生开学典礼；单位地址相思湖校区大学西路189号',original_excerpt:'学校与泰国川登喜大学合作项目举行2026年秋季学期国际学生开学典礼；发布时间2026-09-24',applicant_channel:'international students in exchange partnership; does not establish open degree admissions',unresolved:'Current evidence confirms an international student cohort in a partner program, not open international degree admission.',decision:'source_found',retrieval_status:'Official international office and current international student activity confirmed.'},
{...base,cycle:'2025',link_type:'application_portal',candidate_url:'https://www.gxufe.edu.cn/www/subWebSites/jxjyxy/index.html',final_url:'https://www.gxufe.edu.cn/www/subWebSites/jxjyxy/index.html',publisher:'广西财经学院继续教育学院（教务处相关部门）',page_title:'广西财经学院继续教育学院',published_at:'2025-06-10',evidence_locator:'学院招生专栏列“2025年国际学生招生计划”，发布时间2025-06-10',original_excerpt:'2025年国际学生招生计划；2025-06-10',applicant_channel:'international; current published plan is 2025',unresolved:'No 2026 plan located. Confirm the current cycle with the university before relying on this historical plan.',decision:'source_found',retrieval_status:'Official school page lists a dated international-student recruitment plan.'},
{...base,link_type:'application_form',candidate_url:'https://www.gxufe.edu.cn/wwwservice/download?client=pc&fileid=74b15d35-5801-3566-bfdf-f4324c795e9c.doc&open=true',final_url:'https://www.gxufe.edu.cn/wwwservice/download?client=pc&fileid=74b15d35-5801-3566-bfdf-f4324c795e9c.doc&open=true',publisher:name,page_title:'广西财经学院留学生申请表',evidence_locator:'官方域名下载的申请表，含语言项目、本科项目及硕士研究生项目材料清单；需以国际合作处当期要求为准',original_excerpt:'本科项目需提交1-8项；硕士研究生项目需提交1-9项；申请表载官方学校网址及gxcjxylxs@163.com',applicant_channel:'international applicants; language, bachelor and master categories',unresolved:'The form has no confirmed current-cycle validity. Contact the university before use.',decision:'source_found',retrieval_status:'Official international applicant form found on university domain.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
