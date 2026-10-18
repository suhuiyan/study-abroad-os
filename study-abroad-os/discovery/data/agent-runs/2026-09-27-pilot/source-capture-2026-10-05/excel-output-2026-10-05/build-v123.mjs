import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v122.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v123.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=326,code='4145010598',name='广西医科大学';
const F='https://www.gxmu.edu.cn/';
const G='https://gjy.gxmu.edu.cn/en/NN/Notice/t224270.html';
const H='https://gjy.gxmu.edu.cn/cn/xwtz/tzgg/t231837.html\nhttps://gjy.gxmu.edu.cn/cn/xwtz/tzgg/t231836.html';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบคู่มือ招生นักศึกษาต่างชาติปี 2026 และทุนอาเซียนทางการ 2 โครงการ; รอบ本科และกำหนดทุนที่ตรวจพบปิดแล้ว (15 ส.ค., 10 พ.ค., 12 เม.ย. 2026)',`${name}：国际教育学院发布2026本科国际生招生简章（英文页面列申请期1月1日至8月15日）及2026年广西政府东盟奖学金（5月10日截止）、教育部—广西东盟奖学金（4月12日截止）。截至本次核验上述申请期均已结束；不代表仍开放。`]];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,cycle:'2026',decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广西医科大学官网',evidence_locator:'国际教育学院招生简章页“学校主页”链接至gxmu.edu.cn；官网信息与学校中英文名称一致',original_excerpt:'广西医科大学；Guangxi Medical University',applicant_channel:'general',retrieval_status:'University homepage linked from official international education site.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'广西医科大学国际教育学院',page_title:'2026 Admission Brochure for International Undergraduate Students of Guangxi Medical University',published_at:'2025-11-27',evidence_locator:'Section IV application opens; V materials/CSCA; VII financial aid; footer identifies official university application portal',original_excerpt:'2026 international undergraduate programs; application portal gxmu.at0086.cn; Fall term application period January 1 to August 15; 2026 entrants must submit CSCA results.',applicant_channel:'international undergraduate applicants; multiple Chinese-taught majors and English-taught MBBS',unresolved:'The 2026 fall application period listed as January 1-August 15 has passed. Page title says 2026 but published in November 2025; future-cycle dates must be verified on the official portal.',retrieval_status:'Official English admissions page; program scope, application portal, and listed period verified.'},
{...base,link_type:'scholarships',candidate_url:'https://gjy.gxmu.edu.cn/cn/xwtz/tzgg/t231837.html',final_url:'https://gjy.gxmu.edu.cn/cn/xwtz/tzgg/t231837.html',publisher:'广西医科大学国际教育学院',page_title:'2026年广西医科大学“广西政府东盟国家留学奖学金”招生简章',published_at:'2026-04-10',evidence_locator:'申请资格（ASEAN本科/硕博）；第三节资助标准；第四节申请流程截止日',original_excerpt:'面向东盟国家学士、硕士、博士申请者；包含报名费、学费、校内住宿、保险、课本及生活费；请于2026年5月10日前提交。',applicant_channel:'ASEAN applicants; undergraduate, masters, and doctoral',unresolved:'Application deadline 2026-05-10 has passed; no later cycle inferred.',retrieval_status:'Official university scholarship notice; applicant scope, benefits, and expired deadline verified.'},
{...base,link_type:'scholarships',candidate_url:'https://gjy.gxmu.edu.cn/cn/xwtz/tzgg/t231836.html',final_url:'https://gjy.gxmu.edu.cn/cn/xwtz/tzgg/t231836.html',publisher:'广西医科大学国际教育学院',page_title:'2026年广西医科大学中国政府奖学金“教育部—广西壮族自治区共设东盟国家留学生奖学金项目”招生简章',published_at:'2026-04-10',evidence_locator:'招生名额/层次；申请资格；资助内容；申请流程截止时间',original_excerpt:'东盟申请人；本科2名、硕士5名、博士2名；免学费、校内住宿和保险并提供生活费；须于2026年4月12日前提交。',applicant_channel:'ASEAN applicants; undergraduate, masters, and doctoral',unresolved:'Application deadline 2026-04-12 has passed; candidate number is not final scholarship award count.',retrieval_status:'Official university/CSC Type B notice; applicant scope, funded benefits, and deadline verified.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
