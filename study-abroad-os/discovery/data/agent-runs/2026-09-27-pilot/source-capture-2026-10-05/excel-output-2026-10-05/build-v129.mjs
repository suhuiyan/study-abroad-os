import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v128.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v129.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=295,code='4144010580',name='肇庆学院';
const F='https://www.zqu.edu.cn/';
const G='https://wsc.zqu.edu.cn/info/1270/9451.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,'']];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบประกาศรับนักศึกษาต่างชาติทางการปี 2026 ระดับ本科/硕士 พร้อมทุน; ปิดรับ 15 ส.ค. 2026','官网对外交流合作部发布2026年国际学生学历教育招生简章，接受本科、硕士申请，截止日期均为2026年8月15日（已过）。简章列广东省政府来粤留学生奖学金：本科新生/在读各10,000元，研究生新生/在读各20,000元；并列砚园奖学金15,000/8,000/5,000元。以上为该年度公告，不代表下一年度名额或政策。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广东省',source_row:row,moe_code:code,name_zh:name,cycle:'2026',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'肇庆学院官网',evidence_locator:'国际学生招生公告的学校信息部分列出学校网址zqu.edu.cn',original_excerpt:'学校网址：http://www.zqu.edu.cn',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official university homepage identified by its international admissions notice.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'肇庆学院对外交流合作部',page_title:'2026年肇庆学院国际学生招生简章（学历教育） / 2026 Zhaoqing University International Student Admission Announcement',published_at:'2026-06-24',evidence_locator:'资格与截止日期；本科/硕士申请材料；第九节奖学金及金额；联系方式',original_excerpt:'外国公民可申请本科/硕士；截止2026年8月15日；广东省政府奖学金本科生10,000元、研究生20,000元；砚园奖学金一/二/三等15,000/8,000/5,000元。',applicant_channel:'international undergraduate and masters applicants',unresolved:'2026 application deadline (August 15) has passed. Scholarship amounts are tied to the 2026 notice; verify the next cycle and eligibility before applying.',decision:'source_found',retrieval_status:'Official 2026 foreign-student degree admissions announcement with eligibility, deadline, and scholarship amounts verified.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
