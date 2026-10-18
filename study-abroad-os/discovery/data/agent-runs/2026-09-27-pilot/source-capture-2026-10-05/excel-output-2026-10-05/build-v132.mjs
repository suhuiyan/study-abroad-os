import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v131.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v132.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=288,code='4144014880',name='深圳理工大学';
const F='https://www.suat-sz.edu.cn/';
const G='https://english.sztu.edu.cn/INTERNATIONAL_STUDENTS/Degree_Program1/Application_Procedure.htm';
const H='https://gjxs.sztu.edu.cn/sso/login?mfa=LOCAL_LOGIN';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบหน้ารับสมัครนักศึกษาต่างชาติทางการระดับ Degree; หน้าแก้ไข 7 ก.ย. ระบุสมัคร 1 พ.ย. 2026–1 พ.ค. 2027 แต่กำหนดแจ้งผล ก.ค. 2026 ขัดกับรอบสมัคร ต้องยืนยันกับมหาวิทยาลัย','官网英文国际学生页面列为Degree Program，页面标注2026-09-07更新，申请时间为2026年11月1日至2027年5月1日，网申链接已列出。页面录取流程同时写“2026年7月通知预录取/7月底确定录取”，早于所列申请开始时间，存在明显时间矛盾；申请周期虽尚未开始，建议先联系国际处核实招生批次及结果时间。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广东省',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'深圳理工大学',evidence_locator:'学校官网主页及ICP备案；国际学生页面链接学校中文站',original_excerpt:'深圳理工大学；版权所有：深圳理工大学；粤ICP备2021148220号',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official university homepage and institutional identity confirmed.'},
{...base,cycle:'2026-2027',link_type:'admissions',candidate_url:G,final_url:G,publisher:'深圳理工大学国际合作与交流处',page_title:'Application Procedure and Materials',published_at:'2026-09-07',evidence_locator:'国际学生 > Degree Program > Application Procedure；申请时间及流程、申请材料、录取流程',original_excerpt:'Application period: November 1, 2026-May 1, 2027; the same page also states pre-admission results in July 2026 and final admission by the end of July 2026.',applicant_channel:'international degree program applicants; programs taught in Chinese and English',unresolved:'Internal timeline conflict: results are stated for July 2026, before the listed application period begins on November 1, 2026. Confirm the correct intake and decision dates with the International Office before relying on the schedule. No scholarship statement verified on this page.',decision:'source_found',retrieval_status:'Official foreign-student application page verified; cycle dates are internally inconsistent.'},
{...base,cycle:'2026-2027',link_type:'application_portal',candidate_url:H,final_url:H,publisher:'深圳理工大学',page_title:'国际学生网上申请系统',evidence_locator:'Official application-procedure page explicitly links the applicant portal',original_excerpt:'请登录https://gjxs.sztu.edu.cn/sso/login?mfa=LOCAL_LOGIN在线报名。',applicant_channel:'international student applicants',unresolved:'Portal is linked from official university admissions page; check the applicable cycle and current form status.',decision:'source_found',retrieval_status:'Application portal linked directly from the official international admissions page.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
