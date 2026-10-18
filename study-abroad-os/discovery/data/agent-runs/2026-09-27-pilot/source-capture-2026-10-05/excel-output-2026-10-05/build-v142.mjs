import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v141.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v142.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=87,code='4111010036',name='对外经济贸易大学';
const F='https://www.uibe.edu.cn/';
const G='https://sie.uibe.edu.cn/en/';
const H='https://sie.uibe.edu.cn/en/Newsss/NotAnn/015d323bb31249e280505021cd4ca20c.htm\nhttps://sie.uibe.edu.cn/zslq2/jxjsq2/bjszfjxj2/index.htm\nhttps://sie.uibe.edu.cn/en/Apply/ApOn/index.htm';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'ยืนยันเว็บไซต์หลัก/招生 และ国际学院; พบทุน政府奖学金เส้นทาง丝绸之路กับทุนรัฐบาลปักกิ่ง รอบปี 2026 หมดเขตแล้ว','国际学院官网发布2026年中国政府奖学金“丝绸之路”项目，申请须于5月25日前完成；北京市政府奖学金新生通知规定申请期为5月18日至6月30日。两项均已过2026年截止日，仅作上一轮政策参考。官方国际教育门户提供本科、硕士、博士、非学历项目及奖学金导航。2026普通本科招生网属于普通招生渠道。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code&&x.link_type==='homepage'&&x.final_url===F)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'北京市',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'对外经济贸易大学',evidence_locator:'校方2026普通本科招生章程列学校主页uibe.edu.cn及校址',original_excerpt:'学校网址：http://www.uibe.edu.cn；学校全称对外经济贸易大学',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official university homepage corroborated by school 2026 admissions charter.'},
{...base,cycle:'2026',link_type:'admissions',candidate_url:'https://aeo.uibe.edu.cn/front/showContent.jspa?contentId=109396',final_url:'https://aeo.uibe.edu.cn/front/showContent.jspa?contentId=109396',publisher:'对外经济贸易大学招生就业处',page_title:'2026年全日制普通本科招生章程',published_at:'2026-06-05',evidence_locator:'章程列普通本科招生组织及招生就业处官网；面向常规本科招生',original_excerpt:'学校本科招生工作实行本科招生委员会统一领导、招生就业处具体执行',applicant_channel:'general/domestic admissions; international scope unverified',unresolved:'This is the general undergraduate admissions channel, not the international admissions portal.',decision:'accepted_official_link',retrieval_status:'Official 2026 general undergraduate admissions charter.'},
{...base,link_type:'international_admissions',candidate_url:G,final_url:G,publisher:'对外经济贸易大学国际学院',page_title:'School of International Education, UIBE',evidence_locator:'国际学院官网菜单含本科、硕士、博士、非学历项目、在线报名及奖学金申请',original_excerpt:'Bachelor’s, Master’s, Doctoral and Non-Degree Programs; Apply Online; Scholarship Application',applicant_channel:'international applicants',decision:'accepted_official_link',retrieval_status:'Official international admissions portal.'},
{...base,cycle:'2026',link_type:'scholarship',candidate_url:'https://sie.uibe.edu.cn/en/Newsss/NotAnn/015d323bb31249e280505021cd4ca20c.htm',final_url:'https://sie.uibe.edu.cn/en/Newsss/NotAnn/015d323bb31249e280505021cd4ca20c.htm',publisher:'对外经济贸易大学国际学院',page_title:'2026 Silk Road Program of Chinese Government Scholarship in UIBE',evidence_locator:'官方通知说明招生专业、全额资助包含学费住宿生活费保险；CSC系统须于5月25日前申报，Agency No.10036',original_excerpt:'Applicants shall finish CSC application before May 25. Late submission ... invalid.',applicant_channel:'international graduate; English-taught master’s',unresolved:'2026 application deadline (May 25) passed as of 2026-10-06; await next cycle notice.',decision:'source_found',retrieval_status:'Official 2026 scholarship call; deadline expired.'},
{...base,cycle:'2026',link_type:'scholarship',candidate_url:'https://sie.uibe.edu.cn/zslq2/jxjsq2/bjszfjxj2/index.htm',final_url:'https://sie.uibe.edu.cn/zslq2/jxjsq2/bjszfjxj2/index.htm',publisher:'对外经济贸易大学国际学院',page_title:'新生申请2026学年北京来华留学生政府奖学金的通知',evidence_locator:'通知适用于获录取的新生；资助类别A/B/C，列明学历条件、材料及申请时间5月18日至6月30日',original_excerpt:'申请奖学金的新生应在05月18日至06月30日之间向对外经济贸易大学招生与项目开发部提出申请',applicant_channel:'international new students; undergraduate, master, foundation scholarship categories',unresolved:'Application period ended June 30, 2026; use only for historical requirements until next call.',decision:'source_found',retrieval_status:'Official 2026 Beijing Government Scholarship notice; deadline expired.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
