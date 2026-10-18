import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v140.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v141.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=76,code='4111010023',name='北京协和医学院';
const F='https://www.pumc.edu.cn/';
const G='https://yzbss.pumc.edu.cn/';
const H='https://graduate.pumc.edu.cn/';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,H]];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'ยืนยันเว็บไซต์หลักและ研究生招生网จากเว็บไซต์ PUMC; แหล่งที่ค้นพบเกี่ยวกับการรับสมัครเป็นช่องทาง招生ทั่วไป ยังไม่พบคู่มือรับนักศึกษาต่างชาติ','北京协和医学院官网与研究生招生网均为pumc.edu.cn官方站点。研究生招生网发布研究生招生公告，主要针对国内招生；截至核验日未找到正式国际学生招生简章或奖学金项目，不将招生普通公告作为留学生申请依据。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code&&x.link_type==='homepage'&&x.final_url===F)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'北京市',source_row:row,moe_code:code,name_zh:name,officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:'中国医学科学院北京协和医学院',page_title:'Chinese Academy of Medical Sciences, Peking Union Medical College',evidence_locator:'校官网中英文首页列出PUMC校名、学习机会与地址',original_excerpt:'Chinese Academy of Medical Sciences, Peking Union Medical College; Address: No. 9, Dongdan Santiao, Dongcheng District, Beijing',applicant_channel:'general',decision:'accepted_official_link',retrieval_status:'Official institutional homepage confirmed.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:'北京协和医学院研究生招生网',page_title:'北京协和医学院研究生招生网',evidence_locator:'官方研究生招生网提供各学科专业招生计划、通知公告、复试方案及名单',original_excerpt:'各学科专业招生计划；通知公告；复试方案；复试名单公示',applicant_channel:'general postgraduate admissions; international scope unverified',unresolved:'No international applicant guidance verified on this portal.',decision:'accepted_official_link',retrieval_status:'Official graduate admissions portal.'},
{...base,link_type:'admissions_office',candidate_url:H,final_url:H,publisher:'北京协和医学院研究生院',page_title:'北京协和医学院研究生院',evidence_locator:'学校研究生院官网，发布研究生管理与招生信息',original_excerpt:'北京协和医学院研究生院官方网站',applicant_channel:'general postgraduate admissions; international scope unverified',unresolved:'International admissions and scholarships were not confirmed in the pages reviewed.',decision:'accepted_official_link',retrieval_status:'Official graduate school site.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
