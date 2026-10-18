import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v127.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v128.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=316,code='4145013641',name='桂林学院';
const F='https://www.glc.edu.cn/';
const G='https://www.glc.edu.cn/zsw/';
const H='https://www.glc.edu.cn/info/1555/38524.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบเว็บไซต์/หน้ารับสมัครทั่วไปทางการและหลักฐาน备案รับนักศึกษาต่างชาติ; ยังไม่พบประกาศรอบหรือทุนสำหรับผู้สมัครต่างชาติ','学校官网显示已于2023年取得招收国际学生资格备案（桂教国交〔2023〕14号），但该资格说明未列具体留学生招生计划、专业、费用或申请时间。本科招生网站链接为普通招生渠道，不能据此证明国际生正在招生。请向学校招生办核实国际生招生简章和奖学金。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'桂林学院官方网站',evidence_locator:'学校办公室关于招收国际学生资质公告位于glc.edu.cn并标注版权所有桂林学院',original_excerpt:'桂林学院；版权所有：桂林学院',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official college domain confirmed by institutional page and contact details.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'桂林学院招生办公室',page_title:'桂林学院招生办公室',evidence_locator:'招生办公室官网路径/zsw；学校2026招生章程列招生网站https://www.glc.edu.cn/zsw/',original_excerpt:'招生网站：https://www.glc.edu.cn/zsw/；页面为普通本科招生信息',applicant_channel:'general/domestic undergraduate; foreign-student scope unverified',unresolved:'General undergraduate admissions page; do not treat as international student admissions evidence.',decision:'accepted_official_link',retrieval_status:'Official general admissions site referenced by 2026 admissions charter.'},
{...base,link_type:'notice',candidate_url:H,final_url:H,publisher:'桂林学院学校办公室',page_title:'学校获批招收和培养国际学生资质',published_at:'2023-08-17',evidence_locator:'学校办公室公告正文，援引自治区教育厅批复桂教国交〔2023〕14号',original_excerpt:'自治区教育厅办公室同意对我校招收国际学生资格予以备案。',applicant_channel:'international student recruitment qualification; specific degree/cycle not stated',unresolved:'Qualification is not an admissions announcement. Find a current international-student prospectus and confirm programs, deadlines, tuition, and scholarships.',decision:'source_found',retrieval_status:'Official college notice confirms international-student recruitment filing.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
