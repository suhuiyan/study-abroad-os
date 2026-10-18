import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v121.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v122.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=311,code='4145010601',name='桂林医科大学';
const F='https://www.glmu.edu.cn/';
const G='https://www.glmu.edu.cn/gjjyjlzx/zszl/lhlxszsjz.htm';
const H='https://www.glmu.edu.cn/gjjyjlzx/info/1161/2545.htm\nhttps://www.glmu.edu.cn/gjjyjlzx/info/1161/2532.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบ招生专栏ทางการ: คู่มือรับนักศึกษาต่างชาติและประกาศทุนอาเซียนปี 2026; ประกาศทุนที่ตรวจพบหมดเขตรับสมัครแล้ว 12 เม.ย. และ 20 พ.ค. 2026',`${name}（标识码4145010601）：国际教育学院招生专栏列本科、硕士、博士招生简章及2026-2027学年度教育部—广西奖学金、2026广西政府东盟奖学金。两项奖学金截止日分别为2026-04-12、2026-05-20，均已过；仅作来源记录，不代表仍开放。`]];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,cycle:'2026-2027',decision:'accepted_official_link',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'桂林医科大学官网',evidence_locator:'国际教育学院招生专栏“学校首页”导航；官网根域名与招生子站同属glmu.edu.cn',original_excerpt:'桂林医科大学官网；国际教育学院、国际合作与交流处',applicant_channel:'general',retrieval_status:'Official university homepage linked from the international admissions site.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'桂林医科大学国际教育学院、国际合作与交流处',page_title:'来华留学生招生简章',evidence_locator:'招生专栏导航列2026本科、硕士、博士招生简章及2026-2027奖学金简章；联系方式列官方单位与邮箱',original_excerpt:'桂林医科大学2026年来华留学生本科、硕士、博士招生简章；2026-2027学年度及2026年奖学金项目招生简章',applicant_channel:'international students; degree admissions across undergraduate/master/doctoral; use individual brochure for level-specific details',retrieval_status:'Official university international admissions index, current 2026 listings verified.'},
{...base,link_type:'scholarships',candidate_url:'https://www.glmu.edu.cn/gjjyjlzx/info/1161/2545.htm',final_url:'https://www.glmu.edu.cn/gjjyjlzx/info/1161/2545.htm',publisher:'桂林医科大学国际教育学院',page_title:'桂林医科大学2026-2027学年度 教育部—广西壮族自治区共设东盟国家留学生奖学金项目招生简章',published_at:'2026-03-30',evidence_locator:'第1节东盟国别；第2节招生类别/资助；第5节截止时间',original_excerpt:'面向东盟国家本科、硕士、博士申请者；免报名费、学费、校内住宿费、综合医疗保险并提供生活补助；报名截至2026年4月12日。',applicant_channel:'ASEAN applicants; undergraduate, master and doctoral categories',unresolved:'Application deadline 2026-04-12 has passed. Specific award remains subject to China Scholarship Council final documents.',retrieval_status:'Official university scholarship notice; scope, coverage, and closed deadline verified.'},
{...base,link_type:'scholarships',candidate_url:'https://www.glmu.edu.cn/gjjyjlzx/info/1161/2532.htm',final_url:'https://www.glmu.edu.cn/gjjyjlzx/info/1161/2532.htm',publisher:'桂林医科大学国际教育学院',page_title:'桂林医科大学2026年广西政府东盟国家奖学金招生简章',published_at:'2026-03-13',evidence_locator:'第2至4节申请条件、全日制本科招生类别与资助；第6节报名截止时间',original_excerpt:'招生对象为东盟国家全日制本科生；免报名费、学费和校内住宿费并提供生活费及保险；申请截止2026年5月20日。',applicant_channel:'ASEAN applicants; full-time undergraduate only',unresolved:'Application deadline 2026-05-20 has passed; scholarship availability for later cycles not established.',retrieval_status:'Official university scholarship notice; applicant scope, coverage, and closed deadline verified.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
