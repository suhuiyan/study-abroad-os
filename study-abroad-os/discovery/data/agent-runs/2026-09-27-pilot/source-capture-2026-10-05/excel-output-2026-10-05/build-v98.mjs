import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v97.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v98.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const schools=[
{row:256,code:'4144011846',name:'广东外语外贸大学',F:'https://www.gdufs.edu.cn/',G:'https://zs.gdufs.edu.cn/',H:'https://nstu.gdufs.edu.cn/info/1021/10636.htm',title:'助学圆梦，励志成才——广东外语外贸大学本科生资助政策简介',publisher:'广东外语外贸大学学生工作部',excerpt:'2026年本科生奖助政策：列明奖学金及资助类型。其中国家助学金以家庭经济困难认定为条件，台湾/港澳侨学生奖学金范围单列；国际学生适用性未证实。',locator:'学校标识码见2026年招生章程：https://www.gdufs.edu.cn/info/1373/254036.htm；奖助政策页面发布于2026-05-20。',unresolved:'普通本科奖助政策的多数类别不表示适用于国际新生；需向国际教育招生渠道确认。'},
{row:257,code:'4144012046',name:'广州职业技术大学',F:'https://www.gzpyp.edu.cn/',G:'https://www.gzpyp.edu.cn/zs',H:'https://www.gzhpu.edu.cn/zs/zsxx/zszc/content_72407',title:'广州职业技术大学2026年夏季高考招生章程',publisher:'广州职业技术大学招生信息网（学校官网）',excerpt:'官方2026年章程经检索确认学校标识码4144012046、网址、招生网址及资助学生政策（助学贷款、奖助学金、勤工助学等）。国际学生资格未确认。',locator:'2026-05-19章程；第四条学校标识码、第三十二条资助政策、第三十三条官网/招生网。',unresolved:'章程针对夏季普通高考招生，资助政策不能据此推断适用于国际学生。'}
];
const old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(old.some(x=>schools.some(s=>x.source_row===s.row&&x.moe_code===s.code)))throw Error('Duplicate evidence; refusing write.');
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412'); const d=new Date('2026-10-06T00:00:00Z');
for(const s of schools){const c=sh.getRange(`C${s.row}`).values[0][0],n=sh.getRange(`D${s.row}`).values[0][0];if(String(c)!==s.code||String(n)!==s.name)throw Error(`Identity mismatch ${s.row}: ${c} ${n}`);sh.getRange(`F${s.row}:H${s.row}`).values=[[s.F,s.G,s.H]];sh.getRange(`K${s.row}:M${s.row}`).values=[[d,'ตรวจรหัส MOE กับเว็บไซต์ทางการและข้อมูล章程/ทุนปี 2026; ขอบเขตทุนสำหรับนักศึกษาต่างชาติยังไม่ยืนยัน',`${s.name}：已核验学校代码、官网、招生入口及2026年章程/奖助资料；留学生适用资格未作推断。`]];}
wb.recalculate(); await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const common={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',input_version:null,capture_path:null,content_sha256:null};const entries=[];
for(const s of schools){const b={...common,region:'广东省',source_row:s.row,task_id:null,moe_code:s.code,name_zh:s.name,cycle:'2026',degree_level:'undergraduate',applicant_channel:'domestic applicants',decision:'accepted_official_link',next_action:null,officiality:'confirmed',publisher:s.publisher,published_at:'2026',unresolved:s.unresolved};for(const[link_type,url,page_title,original_excerpt]of[['homepage',s.F,`${s.name}官网`,`${s.name}官方主页`],['admissions',s.G,`${s.name}招生网`,'官方招生入口'],['scholarships',s.H,s.title,s.excerpt]])entries.push({...b,link_type,candidate_url:url,final_url:url,ownership_evidence_url:s.H,page_title,evidence_locator:s.locator,original_excerpt,retrieval_status:'First-party school website/source; MOE identity matched against workbook; applicant-scope caveat recorded.'});}
await fs.appendFile(ep,entries.map(x=>JSON.stringify(x)).join('\n')+'\n');console.log(JSON.stringify({out,added:entries.length,schools:schools.map(s=>s.name)}));

