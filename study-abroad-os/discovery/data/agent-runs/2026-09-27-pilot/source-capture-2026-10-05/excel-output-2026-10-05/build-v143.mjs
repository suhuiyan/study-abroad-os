import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v142.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v143.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=88,code='4111010037',name='北京物资学院';
const F='https://www.bwu.edu.cn/';
const G='https://zs.bwu.edu.cn/';
const H='https://is.bwu.edu.cn/newsite.htm\nhttps://is.bwu.edu.cn/info/1176/2819.htm\nhttps://is.bwu.edu.cn/2.pdf\nhttps://is.bwu.edu.cn/info/1189/2933.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบ国际学院ทางการและข้อมูลสมัครคอร์สภาษา非学历; มีแบบฟอร์ม学历生และระเบียบทุน แต่วันรับสมัครไม่ระบุปีชัด และทุนส่วนใหญ่ประเมินนักศึกษาที่กำลังศึกษา','北京物资学院2026本科招生章程列官网及本科招生专网。国际学院网站提供非学历中文学习项目、学历生申请表及奖学金信息；非学历招生页所列春秋申请时段未标明年度，申请前须联系学校确认当期是否开放。奖学金页面主要描述在校国际学生评审，另有新生奖学金评估条款但具体名额和当期要求应询问国际学院。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code&&x.link_type==='homepage'&&x.final_url===F)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'北京市',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'北京物资学院',evidence_locator:'2026年普通本科招生章程列出官网bwu.edu.cn',original_excerpt:'学校网址：http://www.bwu.edu.cn',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official university homepage confirmed in 2026 admissions charter.'},
{...base,cycle:'2026',link_type:'admissions',candidate_url:G,final_url:G,publisher:'北京物资学院本科招生办公室',page_title:'北京物资学院本科招生专网',evidence_locator:'北京物资学院2026年本科招生章程指定招生专网zs.bwu.edu.cn',original_excerpt:'招生专网：http://zs.bwu.edu.cn；适用于2026年本科生招生工作',applicant_channel:'general/domestic admissions; international scope unverified',unresolved:'This site concerns general undergraduate admissions. Use the International School for international applications.',decision:'accepted_official_link',retrieval_status:'Official domestic undergraduate admissions site, verified by 2026 charter.'},
{...base,link_type:'international_admissions',candidate_url:'https://is.bwu.edu.cn/newsite.htm',final_url:'https://is.bwu.edu.cn/newsite.htm',publisher:'北京物资学院国际学院',page_title:'Beijing Wuzi University International School',evidence_locator:'国际学院站点含招生、公告、下载专区、奖学金及招生邮箱study@bwu.edu.cn',original_excerpt:'International School, Beijing Wuzi University; email study@bwu.edu.cn',applicant_channel:'international applicants',decision:'accepted_official_link',retrieval_status:'Official International School portal.'},
{...base,link_type:'international_admissions',candidate_url:'https://is.bwu.edu.cn/info/1176/2819.htm',final_url:'https://is.bwu.edu.cn/info/1176/2819.htm',publisher:'北京物资学院国际学院',page_title:'Program for non-degree students',evidence_locator:'国际学院说明中文非学历课程类别、申请条件与材料；春季申请期10月20日至12月30日、秋季申请期3月20日至6月20日，但页面未注明适用年度',original_excerpt:'Application period: spring students October 20 to December 30; autumn students March 20 to June 20',applicant_channel:'international non-degree language students',unresolved:'Application dates are not tied to a specific year; confirm the next intake before relying on them.',decision:'source_found',retrieval_status:'Official non-degree admissions page; cycle dates lack a year.'},
{...base,link_type:'application_form',candidate_url:'https://is.bwu.edu.cn/2.pdf',final_url:'https://is.bwu.edu.cn/2.pdf',publisher:'北京物资学院国际学院',page_title:'学历留学生入学申请表 / Application Form for Degree Program International Students',evidence_locator:'国际学院官网的学历项目国际学生申请表，含招生办公室邮箱和校址',original_excerpt:'Application Form for Degree Program International Students; International School, Beijing Wuzi University',applicant_channel:'international degree applicants',unresolved:'Confirm the form version and required documents with the International School before submission.',decision:'source_found',retrieval_status:'Official degree-student application form.'},
{...base,link_type:'scholarship_policy',candidate_url:'https://is.bwu.edu.cn/info/1189/2933.htm',final_url:'https://is.bwu.edu.cn/info/1189/2933.htm',publisher:'北京物资学院国际学院',page_title:'Beijing Municipal Scholarship for International Cooperation and Exchange',evidence_locator:'页面说明奖学金面向在校国际学生；综合评分参考学业成绩、宿舍表现及HSK等，并附校级管理办法',original_excerpt:'Funding recipients: Foreign students studying at our university; scholarship is evaluated by total score ranking',applicant_channel:'primarily currently enrolled international students; new-student assessment is subject to the attached rules',unresolved:'The page does not provide a current intake deadline or guaranteed award for new applicants.',decision:'source_found',retrieval_status:'Official scholarship information; distinguish continuing-student review from new-student evaluation.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
