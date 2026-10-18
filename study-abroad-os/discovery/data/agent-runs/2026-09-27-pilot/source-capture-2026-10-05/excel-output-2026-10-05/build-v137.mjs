import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v136.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v137.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=334,code='4145011773',name='广西职业技术大学';
const F='https://www.gxzjy.edu.cn/';
const G='https://zsw.gxzjy.edu.cn/';
const H='https://zsw.gxzjy.edu.cn/index.php?act=view&article_id=2wxaG5PVjBle&module=article&param=29&sys=home';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'ยืนยันเว็บไซต์มหาวิทยาลัยและ招生信息网จาก章程ปี 2026; แหล่งที่พบเป็นการรับสมัครทั่วไป ยังไม่พบประกาศรับนักศึกษาต่างชาติ','学校2026年招生章程由招生信息网发布，确认学校名称、校址及官网。已核对的招生计划和通知均为普通高考/职教高考渠道；此次未找到国际学生专门招生页面或奖学金简章，不据此断定学校不招收国际学生。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广西职业技术大学',evidence_locator:'2026年招生章程列明学校官网、校址、名称及学校代码4145011773',original_excerpt:'学校名称：广西职业技术大学；学校代码：4145011773；学校网址：http://www.gxzjy.edu.cn/',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official homepage confirmed through 2026 admissions charter.'},
{...base,cycle:'2026',link_type:'admissions',candidate_url:G,final_url:G,publisher:'广西职业技术大学招生与就业服务中心',page_title:'广西职业技术大学招生信息网',evidence_locator:'招生信息网主页含2026招生动态、招生章程、计划及新生指南',original_excerpt:'欢迎使用广西职业技术大学招生信息网；2026年招生宣传册、招生章程及招生计划',applicant_channel:'general admissions; predominantly domestic',unresolved:'Current page covers ordinary vocational college and vocational examination admissions. No international-specific admissions page found in this check.',decision:'accepted_official_link',retrieval_status:'Official admissions office site confirmed.'},
{...base,cycle:'2026',link_type:'admissions_notice',candidate_url:H,final_url:H,publisher:'广西职业技术大学招生与就业服务中心',page_title:'广西职业技术大学2026年招生章程',published_at:'2026-06-18',evidence_locator:'章程列学校名称、校址、网址及代码；招生面向普通/职业高考渠道',original_excerpt:'2026年学校招生按本章程规定执行；学校名称和代码4145011773',applicant_channel:'general; international scope not established',unresolved:'The general admissions charter is not evidence of foreign-student recruitment. Confirm international eligibility directly with the university.',decision:'source_found',retrieval_status:'Official 2026 general admissions charter.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
