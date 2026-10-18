import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v137.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v138.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=5,code='4134010372',name='安庆师范大学';
const F='https://www.aqnu.edu.cn/';
const G='https://zsw.aqnu.edu.cn/';
const H='https://gjjl.aqnu.edu.cn/wgrlh/lxs.htm\nhttps://xxgk.aqnu.edu.cn/info/1014/12324.htm\nhttps://xxgk.aqnu.edu.cn/info/1014/2338.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบหน้า留学生ทางการและคู่มือรับนักศึกษาต่างชาติปี 2026; มีระเบียบทุนของมหาวิทยาลัย แต่ประกาศทุนรัฐบาลจีนรอบ 2026-27 หมดเขต 10 มี.ค. 2026','国际交流与合作处官网设有留学生专区，信息公开网发布2026年留学生招生简章。另有校级国际学生奖学金评审办法，但主要适用于在读自费国际学生的评审，不应理解为新生入学奖学金。2026-2027中国政府奖学金高水平研究生项目通知的校内申报截止日为2026-03-10，已过期。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
const prior=before.filter(x=>x.source_row===row&&x.moe_code===code);
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'安徽省',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'安庆师范大学',evidence_locator:'校级站群、信息公开网和国际交流处均使用aqnu.edu.cn域名；正式校名相符',original_excerpt:'安庆师范大学',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official university homepage confirmed through university subsite and public information.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'安庆师范大学本科招生网',page_title:'安庆师范大学本科招生网',evidence_locator:'校方本科招生网，供普通本科招生信息查询',original_excerpt:'安庆师范大学本科招生网',applicant_channel:'general/domestic admissions; international scope unverified',decision:'accepted_official_link',retrieval_status:'Official general undergraduate admissions site.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:'https://gjjl.aqnu.edu.cn/wgrlh/lxs.htm',final_url:'https://gjjl.aqnu.edu.cn/wgrlh/lxs.htm',publisher:'安庆师范大学国际交流与合作处',page_title:'留学生',evidence_locator:'留学生专区列招生简章、网上申请及相关材料；页面显示2026招生简章',original_excerpt:'安庆师范大学留学生招生简章(2026)；国际学生奖学金评审办法',applicant_channel:'international applicants',decision:'accepted_official_link',retrieval_status:'Official international-student admissions and information hub.'},
{...base,cycle:'2026',link_type:'international_admissions',candidate_url:'https://xxgk.aqnu.edu.cn/info/1014/12324.htm',final_url:'https://xxgk.aqnu.edu.cn/info/1014/12324.htm',publisher:'安庆师范大学信息公开网 / 外事办',page_title:'安庆师范大学留学生招生简章(2026) Anqing Normal University International Students Admission Brochure (2026)',published_at:'2026-03-10',evidence_locator:'2026留学生招生简章发布页；责任编辑外事办',original_excerpt:'安庆师范大学留学生招生简章(2026)；发表时间2026-03-10',applicant_channel:'international applicants; 2026 cohort',decision:'accepted_official_link',retrieval_status:'Official current-cycle international admission brochure.'},
{...base,link_type:'scholarship_policy',candidate_url:'https://xxgk.aqnu.edu.cn/info/1014/2338.htm',final_url:'https://xxgk.aqnu.edu.cn/info/1014/2338.htm',publisher:'安庆师范大学信息公开网',page_title:'安庆师范大学国际学生奖学金评审办法',evidence_locator:'校级管理办法：学业奖学金面向自费国际学生；优秀奖学金评定申请人须已在校学习一年以上；申请在每年10月底前提交',original_excerpt:'国际学生需在每年10月底前向国际交流与合作处提交申请材料；优秀奖学金申请人须在我校学习一学年以上',applicant_channel:'enrolled international students; not necessarily new entrant funding',unresolved:'This is an internal scholarship review policy, not proof of an admission scholarship for incoming students.',decision:'source_found',retrieval_status:'Official scholarship rule located; scope limited to enrolled-student awards.'}
];
const fresh=ev.filter(x=>!prior.some(y=>y.link_type===x.link_type&&y.final_url===x.final_url));
await fs.appendFile(ep,fresh.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:fresh.length,row,code,name}));
