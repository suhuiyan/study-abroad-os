import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v123.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v124.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=10,code='4134012926',name='亳州学院';
const F='http://www.bzuu.edu.cn/';
const G='http://www.bzuu.edu.cn/zzxx/';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,'']];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบเว็บไซต์และหน้าประกาศรับสมัครทั่วไปทางการ; ยังไม่ยืนยันการรับนักศึกษาต่างชาติ/ทุน','学校官网与招生信息网已在该校2026年招生章程中列明。此次检索未找到该校官网发布的国际学生招生或奖学金简章；普通本科招生信息不能证明招收外国留学生。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'安徽省',source_row:row,moe_code:code,name_zh:name,cycle:null,decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'亳州学院官网',evidence_locator:'学校2026年招生章程所列“学校网址”',original_excerpt:'学校网址：http://www.bzuu.edu.cn/',applicant_channel:'general',retrieval_status:'Official university homepage URL listed in the university admissions charter.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:name,page_title:'亳州学院招生信息网',evidence_locator:'学校2026年招生章程所列“招生网址”及招生考试信息发布说明',original_excerpt:'招生网址：http://www.bzuu.edu.cn/zzxx/；学校相关招生考试、录取信息发布的唯一渠道。',applicant_channel:'domestic undergraduate admissions; foreign-student scope unverified',unresolved:'This channel is for general/domestic admissions; no international student or scholarship notice verified during this search.',retrieval_status:'Official admissions channel identified from university-published admissions charter; not evidence of foreign-student admission.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
