import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const src='china-university-directory-1412-official-links-2026-10-06-v159.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v160.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sheet=wb.worksheets.getItem('รายชื่อ 1412');
const existing=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse);
const additions=[];
const schools=[
 {row:375,code:'4152010661',name:'遵义医科大学',home:'https://www.zmu.edu.cn/',admissions:'https://zyzb.zmu.edu.cn/',refs:['https://guizhou.eol.cn/gzgd/202605/t20260525_2737199.shtml'],note:'学校官网与2026年普通本科招生章程副本确认官网 https://www.zmu.edu.cn/、招生网 https://zyzb.zmu.edu.cn/，代码4152010661；章程托管于教育在线。检索到的国际教育页面为历史页面，未确认2026国际学生招生或奖学金。'},
 {row:376,code:'4152010664',name:'遵义师范学院',home:'https://www.zync.edu.cn/',admissions:'https://www.zync.edu.cn/zsxx/',refs:['https://www.hzgrys.net/regulation/1/2025/2348.html','https://www.zync.edu.cn/zsxx/info/1094/1437.htm'],note:'学校官网为 https://www.zync.edu.cn/。招生信息网 https://www.zync.edu.cn/zsxx/ 列于2025年招生章程副本及校方2021年公告；官网当前访问不稳定，招生入口时效性待复核。2025年章程只适用于普通高考，不代表国际生招生。'},
 {row:377,code:'4152013653',name:'遵义医科大学医学与科技学院',home:'https://www.mtszmu.com/',admissions:'',refs:['https://mts.zmu.edu.cn/'],note:'搜索索引将 https://www.mtszmu.com/ 标记为学校官网且显示学校备案信息；该页面访问超时，未找到可确认的招生入口，因此G列留空。另有历史目录列出 https://mts.zmu.edu.cn/，未据此推断其仍为现行官网。国际生招生及奖学金未核实。'},
 {row:393,code:'4113010096',name:'保定学院',home:'https://www.bdu.edu.cn/',admissions:'https://zsxx.bdu.edu.cn/',refs:['https://zsxx.bdu.edu.cn/info/1076/1568.htm'],note:'学校官网2026年招生章程确认代码4113010096、学校官网 https://www.bdu.edu.cn/ 及招生信息网 https://zsxx.bdu.edu.cn/。该章程面向全国普通高考招生；资助措施针对困难学生，未证明国际学生招生或海外申请奖学金。'}
];
for (const x of schools) {
 const code=String(sheet.getRange(`C${x.row}`).values[0][0]??'');
 const name=String(sheet.getRange(`D${x.row}`).values[0][0]??'');
 if(code!==x.code||name!==x.name) throw new Error(`identity mismatch at ${x.row}: ${code} ${name}`);
 const oldG=String(sheet.getRange(`G${x.row}`).values[0][0]??'');
 const oldH=String(sheet.getRange(`H${x.row}`).values[0][0]??'');
 sheet.getRange(`F${x.row}:H${x.row}`).values=[[x.home,x.admissions||oldG,[oldH,...x.refs].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];
 sheet.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验学校官网/招生资料；国际生和奖学金适用性见备注',x.note]];
 const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};
 const ds=[['homepage',x.home,'Official institutional homepage'],...(x.admissions?[['admissions',x.admissions,'Official admissions portal']]:[]),...x.refs.map(u=>['reference',u,'Admissions reference / official site evidence'])];
 for(const [type,url,title] of ds) if(!existing.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url)) additions.push({...base,link_type:type,candidate_url:url,final_url:url,publisher:x.name,page_title:title,evidence_locator:type==='reference'?'See workbook notes for publication and access details.':'Institutional domain and official admissions publication.',applicant_channel:type==='admissions'?'domestic admissions portal; international applicant eligibility not established':'institutional homepage or admissions evidence; verify intended applicant group',unresolved:type==='reference'?'Current international student admissions and scholarship availability are not established.':undefined,decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:x.row===377?'Search index identifies this domain as the college site; direct fetch timed out.':'Confirmed on institutional domain or school-issued publication.'});
}
await (await SpreadsheetFile.exportXlsx(wb)).save(out);
if(additions.length) await fs.appendFile(ep,additions.map(JSON.stringify).join('\n')+'\n');
console.log(JSON.stringify({out,rows:schools.map(x=>x.row),evidenceAdded:additions.length}));
