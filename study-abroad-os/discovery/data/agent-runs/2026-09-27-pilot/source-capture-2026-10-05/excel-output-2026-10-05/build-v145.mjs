import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v144.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v145.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=112,code='4111011418',name='北京城市学院';
const F='https://www.bcu.edu.cn/';
const G='https://english.bcu.edu.cn/Admissions/Undergraduate_Programs.htm';
const H='https://english.bcu.edu.cn/info/1025/2818.htm\nhttps://english.bcu.edu.cn/Global/Study_Abroad.htm\nhttps://english.bcu.edu.cn/info/1047/2894.htm\nhttps://zs.bcu.edu.cn/';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบคู่มือ International Student Enrollment Brochure พร้อมประกาศเปิดเทอมนักศึกษาต่างชาติใหม่ปี 2026; รายละเอียดทุนต้องสอบถามโรงเรียน และหน้า招生ทั่วไปแยกไว้','北京城市学院官网英文站公布国际学生招生简章，含本科专业、费用和奖学金概述；简章说明具体奖学金程序与要求因项目不同，须联系学校确认。国际交流页面记载2026级国际学生新生开学典礼；但未找到下一轮申请时间。普通招生网为国内招生渠道。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
const prior=before.filter(x=>x.source_row===row&&x.moe_code===code);
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'北京市',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'北京城市学院',evidence_locator:'校方2026招生章程及国际学生招生页面均使用bcu.edu.cn域名',original_excerpt:'Beijing City University; 北京城市学院',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official university homepage confirmed.'},
{...base,link_type:'international_admissions',candidate_url:G,final_url:G,publisher:'北京城市学院',page_title:'Undergraduate Programs / Admissions',evidence_locator:'英文官网招生栏目列国际学生招生简章及Admissions菜单',original_excerpt:'2026/03/12 Beijing City University International Student Enrollment Brochure',applicant_channel:'international applicants',decision:'accepted_official_link',retrieval_status:'Official international admissions index.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:'https://english.bcu.edu.cn/info/1025/2818.htm',final_url:'https://english.bcu.edu.cn/info/1025/2818.htm',publisher:'北京城市学院',page_title:'Beijing City University International Student Enrollment Brochure',evidence_locator:'招生简章涵盖国际学生本科项目、入学条件、学费、申请流程；奖学金条款称各项目要求不同须联系学校',original_excerpt:'International students studying at Beijing City University have the opportunity to obtain scholarships. The application procedures and requirements for each scholarship vary. Please contact us directly for specific details.',applicant_channel:'international applicants; bachelor programs and some graduate offerings',unresolved:'No next-cycle application deadline is stated in the accessible brochure; scholarship specifics require confirmation from the International Cooperation Office.',decision:'source_found',retrieval_status:'Official international student brochure.'},
{...base,cycle:'2026',link_type:'international_programs',candidate_url:'https://english.bcu.edu.cn/Global/Study_Abroad.htm',final_url:'https://english.bcu.edu.cn/Global/Study_Abroad.htm',publisher:'北京城市学院',page_title:'Study Abroad — Incoming Students: Study at BCU',evidence_locator:'英文官网说明国际学生学历、短期及中文课程；记载自2019年以来招收全日制国际学生',original_excerpt:'Students have been coming to BCU on short term or full academic year study for credit since 2015; BCU starts recruiting full-time international students since 2019.',applicant_channel:'international applicants and exchange students',decision:'source_found',retrieval_status:'Official international programs overview.'},
{...base,cycle:'2026',link_type:'notice',candidate_url:'https://english.bcu.edu.cn/info/1047/2894.htm',final_url:'https://english.bcu.edu.cn/info/1047/2894.htm',publisher:'北京城市学院',page_title:'Beijing City University Holds 2026 Opening Ceremony for New International Students',evidence_locator:'官网新闻报道2026级国际学生新生开学典礼并提及墨西哥新生获奖',original_excerpt:'2026 Opening Ceremony for New International Students; an award-winning new student representative from Mexico',applicant_channel:'international students enrolled in 2026; does not establish open application dates',unresolved:'Confirms a 2026 international student cohort but provides no admissions cycle details.',decision:'source_found',retrieval_status:'Official current cohort evidence.'},
{...base,link_type:'admissions',candidate_url:'https://zs.bcu.edu.cn/',final_url:'https://zs.bcu.edu.cn/',publisher:'北京城市学院招生网',page_title:'北京城市学院招生网',evidence_locator:'官方招生网提供2026本科、高职、第二学士学位招生信息',original_excerpt:'2026年北京城市学院本科、高职（专科）招生章程；本科招生、研究生招生',applicant_channel:'general/domestic admissions; international scope unverified',unresolved:'This is the ordinary admissions site, not the international student application channel.',decision:'accepted_official_link',retrieval_status:'Official general admissions site.'}
];
const fresh=ev.filter(x=>!prior.some(y=>y.link_type===x.link_type&&y.final_url===x.final_url));
await fs.appendFile(ep,fresh.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:fresh.length,row,code,name}));
