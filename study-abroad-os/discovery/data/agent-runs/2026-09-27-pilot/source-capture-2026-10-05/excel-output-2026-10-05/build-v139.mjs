import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v138.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v139.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=7,code='4134010378',name='安徽财经大学';
const F='https://www.aufe.edu.cn/';
const G='https://zsjy.aufe.edu.cn/';
const H='https://intex.aufe.edu.cn/\nhttps://intex.aufe.edu.cn/_upload/article/files/93/7b/45ee907f4aed9d4809518ada0f50/dbe11df3-ee55-4767-8485-c13a2540fb64.pdf';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'ยืนยันเว็บมหาวิทยาลัย เว็บ招生 และเว็บ国际教育学院; พบคู่มือรับนักศึกษาต่างชาติปี 2024 แต่ยังไม่พบฉบับปี 2026 จากแหล่งทางการ','校方本科招生信息网由学校招生部门运营，国际教育网站含2024年硕士留学生招生简章及当前国际教育内容。此次未在校方域名找到2026留学生招生简章；过往项目、专业、费用不可视为现行。第三方出现的2026招生简章日期晚于本次核验日，未采用。请通过官方国际教育网站核实新一轮项目和奖学金。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code&&x.link_type==='homepage'&&x.final_url===F)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'安徽省',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'安徽财经大学',evidence_locator:'安徽财经大学校官网',original_excerpt:'安徽财经大学；官网：https://www.aufe.edu.cn',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official institutional homepage confirmed.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'安徽财经大学本科招生办公室',page_title:'安徽财经大学本科招生信息网',evidence_locator:'国家阳光高考平台展示2026招生章程并指向该校本科招生信息网；学校2026章程称其为招生信息发布渠道',original_excerpt:'安徽财经大学本科招生信息网：https://zsjy.aufe.edu.cn',applicant_channel:'general/domestic admissions; international scope unverified',decision:'accepted_official_link',retrieval_status:'Official school undergraduate admissions portal corroborated by 2026 admissions charter.'},
{...base,cycle:'2024',link_type:'international_admissions',candidate_url:'https://intex.aufe.edu.cn/_upload/article/files/93/7b/45ee907f4aed9d4809518ada0f50/dbe11df3-ee55-4767-8485-c13a2540fb64.pdf',final_url:'https://intex.aufe.edu.cn/_upload/article/files/93/7b/45ee907f4aed9d4809518ada0f50/dbe11df3-ee55-4767-8485-c13a2540fb64.pdf',publisher:'安徽财经大学国际交流中心',page_title:'安徽财经大学2024年硕士留学生招生简章',evidence_locator:'官方国际交流中心域名上的硕士留学生招生PDF；标明国际商务、旅游管理及收费、奖学金等2024政策',original_excerpt:'安徽财经大学2024年硕士留学生招生简章；学费住宿费及奖学金以2024学年安排为准',applicant_channel:'international graduate applicants; 2024 cycle',unresolved:'Historical brochure only; not current-cycle guidance.',decision:'source_found',retrieval_status:'Official historical international graduate admission brochure.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
