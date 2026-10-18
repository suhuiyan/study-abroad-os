import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v126.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v127.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=322,code='4145010594',name='广西科技大学';
const F='https://www.gxust.edu.cn/';
const G='https://www.gxust.edu.cn/gjc/info/1080/2423.htm';
const H='https://www.gxust.edu.cn/gjc/lhlx/jxjxx.htm\nhttps://www.gxust.edu.cn/gjc/info/1080/2164.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบประกาศนักศึกษาต่างชาติทางการปี 2026–2027 ระดับ本科/硕士/ภาษา และหน้าข้อมูลทุน; รอบ秋季本科/硕士 (5 พ.ค.–25 มิ.ย.) ปิดแล้ว','官网2026-2027学年国际学生招生简章覆盖本科、硕士、语言生，列出申请材料、官网报名系统、费用及专业附件。秋季学位申请期为5月5日至6月25日，已于本次核验日前结束；语言生春季申请期为11月5日至12月25日，需确认系统是否开放。奖学金页面列有专项奖学金办法；可见政府东盟全额奖学金简章为2024-2025学年，不能据此推定本年度仍有相同资助。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,cycle:'2026-2027',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广西科技大学官网',evidence_locator:'2026-2027国际学生招生简章自述学校官网为gxust.edu.cn；该页面托管于同一高校域名',original_excerpt:'想了解更多广西科技大学信息，请登录学校官方网站：https://www.gxust.edu.cn/',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'University ownership confirmed by official international student admissions page.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'广西科技大学国际合作与交流处 / 国际教育学院',page_title:'2026-2027学年广西科技大学国际学生招生简章',published_at:'2026-03-13',evidence_locator:'第三节申请时间；第四节费用；第五节申请条件；第六节在线报名和申请材料；附件1专业目录',original_excerpt:'本科、硕士、汉语语言生；学位申请秋季5月5日至6月25日；语言生春季11月5日至12月25日；网上报名系统gxust.liuguanbao.com。',applicant_channel:'international undergraduate, masters, and non-degree language applicants',unresolved:'The 2026 fall degree application deadline (June 25) has passed. The listed spring language-student window begins November 5, 2026; check the official application portal for current availability. Admissions page lists eligibility and degree levels but refer to its attached catalog for specific majors.',decision:'source_found',retrieval_status:'Official current-cycle guide verified; cycle dates and applicant levels recorded.'},
{...base,cycle:null,link_type:'scholarships',candidate_url:'https://www.gxust.edu.cn/gjc/lhlx/jxjxx.htm',final_url:'https://www.gxust.edu.cn/gjc/lhlx/jxjxx.htm',publisher:'广西科技大学国际合作与交流处',page_title:'奖学金信息',evidence_locator:'来华留学 > 奖学金信息; archive links include 2022 annual award rules and application form',original_excerpt:'页面列有广西政府东盟国家留学生奖学金年度评审办法、广西科技大学留学生专项奖学金办法及申请表。',applicant_channel:'international students; current cycle not specified',unresolved:'Archive page includes 2022 scholarship policies; verify current eligibility, awards, and application dates before relying on them.',decision:'source_found',retrieval_status:'Official scholarship information archive identified; no current-year award offer verified.'},
{...base,cycle:'2024-2025',link_type:'scholarships',candidate_url:'https://www.gxust.edu.cn/gjc/info/1080/2164.htm',final_url:'https://www.gxust.edu.cn/gjc/info/1080/2164.htm',publisher:'广西科技大学国际合作与交流处',page_title:'2024-2025学年度广西科技大学广西政府东盟国家留学生全额奖学金招生简章',evidence_locator:'官方奖学金招生简章，资格/资助项目/申请材料/联系办法章节',original_excerpt:'广西政府东盟国家留学生全额奖学金；面向东盟申请人；2024-2025学年度。',applicant_channel:'ASEAN applicants; cycle 2024-2025',unresolved:'Historical scholarship cycle; do not treat as open or available for 2026-2027.',decision:'source_found',retrieval_status:'Official past-cycle scholarship notice; not current.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
