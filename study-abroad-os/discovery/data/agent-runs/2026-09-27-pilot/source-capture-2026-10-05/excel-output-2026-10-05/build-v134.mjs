import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v133.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v134.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=314,code='4145011825',name='桂林航天工业学院';
const F='https://guat.edu.cn/';
const G='https://zsw.guat.edu.cn/';
const H='https://gjc.guat.edu.cn/xzzx/lhlx.htm\nhttps://guat.edu.cn/info/1379/23603.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบเว็บไซต์/招生网ทางการ และหลักฐานว่ามีนักศึกษาต่างชาติใหม่ปี 2026; พบแบบฟอร์มสมัคร留学生ลงวันที่ 2020 ต้องยืนยันฉบับปัจจุบัน','学校官网公布2026年秋季学期来华留学生新生开学典礼，证实当年有国际新生；国际交流处下载页仍能找到2020年留学生申请表，但未见当年招生简章或最新申请时间，旧表不可直接视为有效。招生网为普通招生渠道。应联系国际交流处获取当前留学生招生专业、截止时间、奖学金及新版申请表。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'桂林航天工业学院',evidence_locator:'2026年招生章程列学校网址guat.edu.cn；网站备案及校园地址一致',original_excerpt:'桂林航天工业学院；地址：桂林市金鸡路2号；桂ICP备05001199号',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official homepage verified through university charter, filing record, and address.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'桂林航天工业学院招生办公室',page_title:'桂林航天工业学院招生办公室',evidence_locator:'招生办公室官网；2026招生章程列出学校及招生网址',original_excerpt:'学校网址：http://www.guat.edu.cn；招生网址：http://zsw.guat.edu.cn/',applicant_channel:'general/domestic admissions; international-student scope unverified',unresolved:'The admissions site primarily serves domestic general admissions. Use the International Exchange Office for international student application information.',decision:'accepted_official_link',retrieval_status:'Official admissions site verified in the university 2026 admissions charter.'},
{...base,cycle:'2020',link_type:'application_portal',candidate_url:'https://gjc.guat.edu.cn/xzzx/lhlx.htm',final_url:'https://gjc.guat.edu.cn/xzzx/lhlx.htm',publisher:'桂林航天工业学院国际交流处',page_title:'来华留学',published_at:'2020-05-26',evidence_locator:'国际交流处 > 下载中心 > 来华留学；留学生申请表及体格检查表附件',original_excerpt:'桂林航天工业学院来华留学生申请表；发布时间2020年5月26日。',applicant_channel:'international applicants; current cycle not specified',unresolved:'The available application form is from 2020. Do not use it without confirming current requirements and obtaining the latest application materials from the International Exchange Office.',decision:'source_found',retrieval_status:'Official international student materials page found; linked form is historical.'},
{...base,cycle:'2026',link_type:'notice',candidate_url:'https://guat.edu.cn/info/1379/23603.htm',final_url:'https://guat.edu.cn/info/1379/23603.htm',publisher:'桂林航天工业学院国际教育学院',page_title:'我校举行2026年秋季学期来华留学生开学典礼',published_at:'2026-09-23',evidence_locator:'新闻正文说明2026年秋季来华留学生新生参加开学典礼；来源为国际教育学院',original_excerpt:'2026年秋季学期来华留学生开学典礼；全体来华留学生新生参加。',applicant_channel:'incoming international students; no new admissions dates or degree levels stated',unresolved:'Confirms international students enrolled in fall 2026, but does not give recruitment scope, application period, or scholarship details.',decision:'source_found',retrieval_status:'Current official evidence of an incoming international student cohort; not an admissions notice.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
