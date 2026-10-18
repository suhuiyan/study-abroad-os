import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v81.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v82.xlsx';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
const d=new Date('2026-10-06T00:00:00Z');
const schools=[
{row:462,id:'R-4141010464-ddf7fc70ad9c',code:'4141010464',name:'河南科技大学',F:'https://www.haust.edu.cn/',G:'https://zjc.haust.edu.cn/',H:'https://zjc.haust.edu.cn/info/1133/35053.htm',quote:'学校网址：https://www.haust.edu.cn；国家奖学金、国家励志奖学金、国家助学金、助学贷款、勤工助学、绿色通道、临时困难救助'},
{row:493,id:'R-4141010466-872b0ac1d152',code:'4141010466',name:'河南农业大学',F:'https://www.henau.edu.cn/',G:'https://zs.henau.edu.cn/index.html',H:'https://zs.henau.edu.cn/html/detail/enrollment_brochure/202605191745.html',quote:'河南农业大学2026年本科招生章程；校内资助：学校每年从事业收入中足额提取4%-6%的经费用于单项奖学金、勤工助学补贴、临时困难补助等资助项目'},
{row:495,id:'R-4141010471-88a94bb2a2d4',code:'4141010471',name:'河南中医药大学',F:'https://www.hactcm.edu.cn/',G:'https://ptzs.hactcm.edu.cn/',H:'https://ptzs.hactcm.edu.cn/info/2096/15016.htm',quote:'河南中医药大学2026年招生章程；国家奖学金、国家励志奖学金、国家助学金、助学贷款、勤工助学、绿色通道等'},
{row:496,id:'R-4141010484-e98ce141567b',code:'4141010484',name:'河南财经政法大学',F:'http://www.huel.edu.cn/',G:'http://zs.huel.edu.cn',H:'https://10484.gaokao.haedu.cn/policy/brochure/2026/0511/151758.html',quote:'2026招生章程列学校网址和招生办网址；章程称学校构建“奖、助、贷、免、勤、补、减”七位一体资助工作体系'}
];
for(const a of schools){sh.getRange(`F${a.row}:H${a.row}`).values=[[a.F,a.G,a.H]];sh.getRange(`K${a.row}:M${a.row}`).values=[[d,'已核验大学官网及本科招生入口；2026年章程或资助信息可追溯',a.name==='河南财经政法大学'?'H为河南省阳光高考信息平台刊载的学校2026年招生章程；章程明确列出学校及招生办网址，并说明奖助贷等资助体系。':'H为学校官方本科招生章程，包含学生资助或奖助政策。']];}
await wb.recalculate();
await (await SpreadsheetFile.exportXlsx(wb)).save(out);
const common={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',input_version:null,capture_path:null,content_sha256:null};
const ev=[];
for(const a of schools){
 const base={region:'河南省',source_row:a.row,task_id:a.id,moe_code:a.code,name_zh:a.name,cycle:'2026',degree_level:'undergraduate',applicant_channel:'domestic applicants',decision:'accepted_official_link',next_action:null};
 const isHuel=a.name==='河南财经政法大学';
 const publisher=isHuel?'河南省阳光高考信息平台（省级招考信息平台，刊载高校招生章程）':a.name+'本科招生办公室';
 const own=isHuel?a.H:a.F;
 ev.push({...common,...base,link_type:'homepage',candidate_url:a.F,final_url:a.F,officiality:'confirmed',ownership_evidence_url:own,page_title:a.name,publisher:isHuel?'河南省阳光高考信息平台':a.name,published_at:null,evidence_locator:'Official university identity and homepage listed in the 2026 admissions charter.',original_excerpt:a.name,retrieval_status:'School homepage verified in official charter or linked official domain',unresolved:isHuel?'2026 charter copy is hosted by the Henan provincial Sunshine Gaokao platform; school URL is stated in the charter.':null});
 ev.push({...common,...base,link_type:'admissions',candidate_url:a.G,final_url:a.G,officiality:'confirmed',ownership_evidence_url:isHuel?a.H:a.G,page_title:a.name+'本科招生网',publisher,published_at:'2026',evidence_locator:'Official university admissions homepage or 2026 school admissions charter identifies the admissions URL.',original_excerpt:a.quote.split('；')[0],retrieval_status:isHuel?'Admissions URL explicitly stated in the provincial platform copy of the university charter':'Official university admissions channel verified',unresolved:isHuel?'招生办 URL is explicitly stated in the university-issued charter hosted by the provincial platform.':null});
 ev.push({...common,...base,link_type:'scholarships',candidate_url:a.H,final_url:a.H,officiality:'confirmed',ownership_evidence_url:a.H,page_title:a.name+'2026年招生章程及学生资助政策',publisher,published_at:'2026',evidence_locator:'2026 undergraduate admissions charter describes scholarship/aid support; publisher and source scope recorded in notes.',original_excerpt:a.quote,retrieval_status:isHuel?'Province-hosted 2026 school charter verified; contains scholarships, grants, loans, fee reductions and work-study':'Official university 2026 undergraduate admissions charter with student aid information',unresolved:isHuel?'Hosted by Henan provincial Sunshine Gaokao platform, not university domain; charter text identifies the school and its official URLs.':null});
}
await fs.appendFile('official-source-evidence-2026-10-06.jsonl',ev.map(r=>JSON.stringify(r)).join('\n')+'\n','utf8');
console.log(out,ev.length);
