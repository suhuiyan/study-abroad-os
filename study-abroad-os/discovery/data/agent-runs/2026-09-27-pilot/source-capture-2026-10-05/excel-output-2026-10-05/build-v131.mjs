import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v130.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v131.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
const items=[
 {row:271,code:'4144013717',name:'广州科技职业技术大学',home:'https://www.gkd.edu.cn/',admissions:'https://zs.gkd.edu.cn/',region:'广东省', note:'已核验学校官网及普通招生网；本次未找到国际学生招生公告，不将普通招生信息视为留学生招生。',excerpt:'学校网址：https://www.gkd.edu.cn；招生网址：https://zs.gkd.edu.cn。'},
 {row:272,code:'4144013902',name:'广州新华学院',home:'https://www.xhsysu.edu.cn/',admissions:'https://zsb.xhsysu.edu.cn/',region:'广东省', note:'已核验学校官网及普通招生网；本次未找到国际学生招生公告，不将普通招生信息视为留学生招生。',excerpt:'广州新华学院招生网页面链接学校主页；招生章程列学校网址xhsysu.edu.cn及招生网址zsb.xhsysu.edu.cn。'}
];
for(const x of items){
 if(String(sh.getRange(`C${x.row}`).values[0][0])!==x.code||String(sh.getRange(`D${x.row}`).values[0][0])!==x.name) throw Error(`identity mismatch ${x.row}`);
 sh.getRange(`F${x.row}:H${x.row}`).values=[[x.home,x.admissions,'']];
 sh.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),x.note,`${x.name}：已核验学校主页和普通招生入口均为学校官方域名/学校招生信息发布渠道。当前检索未找到外国留学生招生简章或国际学生奖学金公告；普通本科招生信息不作为国际招生证据。`]];
}
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(items.some(x=>before.some(e=>e.source_row===x.row&&e.moe_code===x.code))) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const ev=[];
for(const x of items){
 const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:x.region,source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed',decision:'accepted_official_link'};
 ev.push({...base,link_type:'homepage',candidate_url:x.home,final_url:x.home,publisher:x.name,page_title:`${x.name}官网`,evidence_locator:x.row===271?'学校官网招聘公告明确标注学校官网地址':'招生网站学校主页链接及主站版权信息',original_excerpt:x.row===271?'学校官网：https://www.gkd.edu.cn/':'广州新华学院；广州新华学院版权所有',applicant_channel:'general',retrieval_status:'Official institution homepage verified.'});
 ev.push({...base,link_type:'admissions',candidate_url:x.admissions,final_url:x.admissions,publisher:`${x.name}招生办公室`,page_title:`${x.name}招生信息网`,evidence_locator:x.row===271?'学校2026普通专升本招生简章列学校网址和招生网址':'招生网站自称广州新华学院招生网，学校招生章程列示招生网址',original_excerpt:x.excerpt,applicant_channel:'general/domestic admissions; international-student scope unverified',unresolved:'This is a general admissions channel. No foreign-student admission notice verified during this search.',retrieval_status:'Official general admissions channel verified; does not establish international student recruitment.'});
}
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,updated:items.map(x=>({row:x.row,code:x.code,name:x.name})),evidence:ev.length}));
