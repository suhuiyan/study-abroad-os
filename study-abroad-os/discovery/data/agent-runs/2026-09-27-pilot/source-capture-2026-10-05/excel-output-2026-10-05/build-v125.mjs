import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v124.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v125.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=45,code='4134013614',name='马鞍山学院';
const F='http://www.masu.edu.cn/';
const G='http://zs.masu.edu.cn/';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,'']];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบเว็บไซต์และศูนย์招生ทางการ; ยังไม่ยืนยันการรับนักศึกษาต่างชาติ/ทุน','学校官网与招生中心官网列于学校2026年招生章程。检索到的招生章程适用于普通本科/专升本；此次未找到官网国际学生招生或外国留学生奖学金公告，不能据此确认招收国际本科生。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'安徽省',source_row:row,moe_code:code,name_zh:name,cycle:null,decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'马鞍山学院官网',evidence_locator:'学校2026年招生章程列出的学校网址；安徽省教育厅公开信息页亦链接至masu.edu.cn',original_excerpt:'学校网址：http://www.masu.edu.cn/',applicant_channel:'general',retrieval_status:'Official university homepage verified from school admissions charter and provincial education public-information page.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:name,page_title:'马鞍山学院招生中心网',evidence_locator:'学校招生章程列出招生中心网 zs.masu.edu.cn，公布招生计划和录取结果',original_excerpt:'招生计划及录取结果将在我校招生中心网上及时公布，网址：http://zs.masu.edu.cn/',applicant_channel:'general/domestic undergraduate admissions; foreign-student scope unverified',unresolved:'The admissions channel and notices found concern general/d domestic admission and junior-college-to-bachelor admission. No foreign-student or scholarship notice verified.',retrieval_status:'Official admissions center identified from university admissions charter; no foreign admission claim.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
