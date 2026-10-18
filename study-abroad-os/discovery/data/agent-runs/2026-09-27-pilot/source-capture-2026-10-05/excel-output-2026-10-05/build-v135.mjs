import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v134.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v135.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=330,code='4145010608',name='广西民族大学';
const F='https://www.gxmzu.edu.cn/';
const G='https://gjjy.gxmzu.edu.cn/lxmd/zsxx.htm';
const H='https://gjjy.gxmzu.edu.cn/info/1036/16390.htm\nhttps://gjjy.gxmzu.edu.cn/info/1036/16410.htm\nhttps://www.gxmzu.edu.cn/info/1381/198332.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบประกาศรับนักศึกษาต่างชาติปี 2026 ทั้งปริญญาตรีและบัณฑิตศึกษา และทุนรัฐบาลจีนระดับบัณฑิตศึกษา; เดดไลน์รอบ 2026 ผ่านแล้ว','国际教育学院发布2026年国际学生本科及研究生招生简章，证实两个学历层次均有招生。中国政府奖学金“高水平研究生”项目仅限研究生，申请截止日期为2026-02-27，已过期；页面供核对历史条件，申请下一轮前应查新公告。普通招生网不用于证明留学生招生。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广西民族大学',evidence_locator:'学校官网主页标注校名、地址及备案信息；国际教育学院招生简章交叉引用官网',original_excerpt:'广西民族大学；学校官方网站：https://www.gxmzu.edu.cn/',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official institutional homepage confirmed.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:G,final_url:G,publisher:'广西民族大学国际教育学院',page_title:'招生信息',evidence_locator:'国际教育学院招生信息列表列出2026年国际学生本科、研究生项目简章及奖学金简章',original_excerpt:'2026年广西民族大学国际学生（研究生项目）中文招生简章；2026年广西民族大学国际学生（本科生项目）中文招生简章',applicant_channel:'international applicants; bachelor and graduate',decision:'accepted_official_link',retrieval_status:'Official international admissions index verified.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:'https://gjjy.gxmzu.edu.cn/info/1036/16390.htm',final_url:'https://gjjy.gxmzu.edu.cn/info/1036/16390.htm',publisher:'广西民族大学国际教育学院',page_title:'2026年广西民族大学国际学生（本科生项目）中文招生简章',published_at:'2026-01-10',evidence_locator:'招生简章正文及附件：本科生项目目录、申请表、体检表',original_excerpt:'2026年广西民族大学国际学生（本科生项目）中文招生简章；发布时间2026年1月10日',applicant_channel:'international undergraduate applicants',decision:'accepted_official_link',retrieval_status:'Official 2026 international undergraduate brochure.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:'https://gjjy.gxmzu.edu.cn/info/1036/16410.htm',final_url:'https://gjjy.gxmzu.edu.cn/info/1036/16410.htm',publisher:'广西民族大学国际教育学院',page_title:'2026年广西民族大学国际学生（研究生项目）中文招生简章',published_at:'2026-01-10',evidence_locator:'招生简章正文及附件：2026学术项目目录、申请表、体检表',original_excerpt:'2026年广西民族大学国际学生（研究生项目）中文招生简章；发布时间2026年1月10日',applicant_channel:'international graduate applicants',decision:'accepted_official_link',retrieval_status:'Official 2026 international graduate brochure.'},
{...base,cycle:'2026-2027',link_type:'scholarship',candidate_url:'https://www.gxmzu.edu.cn/info/1381/198332.htm',final_url:'https://www.gxmzu.edu.cn/info/1381/198332.htm',publisher:'广西民族大学',page_title:'2026-2027学年广西民族大学中国政府奖学金“高水平研究生”项目招生简章',published_at:'2025-11-27',evidence_locator:'奖学金简章列申请条件、资助内容、校方代码10608及申请截止日期2026-02-27',original_excerpt:'申请截止日期：2026年2月27日；中国政府奖学金“高水平研究生”项目',applicant_channel:'international graduate only',unresolved:'2026 cycle deadline has passed as of 2026-10-06; use only as historical reference until a new call is published.',decision:'accepted_official_link',retrieval_status:'Official university scholarship notice; deadline expired.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
