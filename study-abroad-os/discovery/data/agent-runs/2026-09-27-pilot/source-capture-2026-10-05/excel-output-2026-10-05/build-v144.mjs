import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v143.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v144.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=107,code='4111011232',name='北京信息科技大学';
const F='https://www.bistu.edu.cn/';
const G='https://www.bistu.edu.cn/zsjy/gjxszs/';
const H='https://cie.bistu.edu.cn/zsxx/zsxx1/index.htm\nhttps://lxs.bistu.edu.cn/\nhttps://cie.bistu.edu.cn/docs/2025-11/522f91c92de64e07af574cdfacd01aec.pdf\nhttps://cie.bistu.edu.cn/jxj/d3ca3f14700a405682819f3ed613cc01.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบประกาศรับนักศึกษาต่างชาติปี 2026 ระดับปริญญาตรี/โท/非学历 และระบบสมัคร; รอบฤดูใบไม้ร่วง 2026 ปิดรับ 30 มิ.ย. แล้ว','学校国际学生招生页确认面向全球招收本科、研究生及非学历项目；2026本科简章列申请时间2025-11-01至2026-06-30，现已截止。学校国际招生系统可供后续批次使用，2026招生简章及奖学金页作为历史政策核对，需等下一轮通知。学校2026秋季新生开学典礼公告证实当年确有国际新生，但不代表新一轮申请仍开放。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
const prior=before.filter(x=>x.source_row===row&&x.moe_code===code);
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'北京市',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'北京信息科技大学',evidence_locator:'校级2026本科招生章程及国际学生招生简章均列官网bistu.edu.cn',original_excerpt:'学校全称：北京信息科技大学；学校官网：https://www.bistu.edu.cn',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official homepage corroborated by university and international admissions publications.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:G,final_url:G,publisher:'北京信息科技大学招生就业处 / 国际交流学院',page_title:'国际学生招生',evidence_locator:'学校官方招生就业栏目说明面向全球招收本科、研究生及非学历项目，并列秋季申请时间、申请方式及招生邮箱',original_excerpt:'申请时间：秋季入学申请时间为每年11月至次年6月；申请方式：https://lxs.bistu.edu.cn',applicant_channel:'international applicants; undergraduate, graduate and non-degree',decision:'accepted_official_link',retrieval_status:'Official international admissions overview.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:'https://cie.bistu.edu.cn/zsxx/zsxx1/index.htm',final_url:'https://cie.bistu.edu.cn/zsxx/zsxx1/index.htm',publisher:'北京信息科技大学国际交流学院',page_title:'招生信息',published_at:'2026-02-04',evidence_locator:'官方招生信息目录列2026非学历、本科及硕士国际学生招生简章',original_excerpt:'2026 Application Information for International Students (Non-degree Study Programs); (Bachelor’s Degree); (Master’s Degree)',applicant_channel:'international applicants, all listed levels',unresolved:'2026 call is closed; consult this index for the next cycle.',decision:'accepted_official_link',retrieval_status:'Official 2026 international admissions index.'},
{...base,cycle:'2026',link_type:'application_portal',candidate_url:'https://lxs.bistu.edu.cn/',final_url:'https://lxs.bistu.edu.cn/',publisher:'北京信息科技大学国际交流学院',page_title:'北京信息科技大学国际学生在线申请系统',evidence_locator:'学校国际学生招生介绍指定该系统在线提交申请；系统提供用户指南及2026秋季新生通知',original_excerpt:'申请方式：登录北京信息科技大学国际招生系统 https://lxs.bistu.edu.cn 在线提交申请',applicant_channel:'international applicants',unresolved:'The 2026 fall deadline passed June 30, 2026; check the admissions office for the next open cycle.',decision:'accepted_official_link',retrieval_status:'Official international application portal.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:'https://cie.bistu.edu.cn/docs/2025-11/522f91c92de64e07af574cdfacd01aec.pdf',final_url:'https://cie.bistu.edu.cn/docs/2025-11/522f91c92de64e07af574cdfacd01aec.pdf',publisher:'北京信息科技大学国际交流学院',page_title:'2026 Application Information for International Students (Bachelor’s Degree)',evidence_locator:'2026秋季申请期2025-11-01至2026-06-30；列申请要求、奖学金、费用、邮箱及网上系统',original_excerpt:'2026秋季入学：2025年11月1日至2026年6月30日',applicant_channel:'international undergraduate applicants',unresolved:'The 2026 fall application deadline passed June 30, 2026; next cycle may change.',decision:'source_found',retrieval_status:'Official current-cycle undergraduate brochure; deadline expired.'},
{...base,link_type:'scholarship',candidate_url:'https://cie.bistu.edu.cn/jxj/d3ca3f14700a405682819f3ed613cc01.htm',final_url:'https://cie.bistu.edu.cn/jxj/d3ca3f14700a405682819f3ed613cc01.htm',publisher:'北京信息科技大学国际交流学院',page_title:'国际学生奖学金',published_at:'2025-12-04',evidence_locator:'国际学院介绍北京市政府奖学金资助学费和基础医疗保险，并有校级国际学生奖学金',original_excerpt:'北京来华留学生政府奖学金主要用于学费、在华基础医疗保险；学校另设校级国际学生奖学金',applicant_channel:'international students; specific new-student eligibility and deadlines per current call',unresolved:'The page is general scholarship information; check the 2026/next-cycle brochure for current application requirements and availability.',decision:'source_found',retrieval_status:'Official international scholarship overview.'}
];
const fresh=ev.filter(x=>!prior.some(y=>y.link_type===x.link_type&&y.final_url===x.final_url));
await fs.appendFile(ep,fresh.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:fresh.length,row,code,name}));
