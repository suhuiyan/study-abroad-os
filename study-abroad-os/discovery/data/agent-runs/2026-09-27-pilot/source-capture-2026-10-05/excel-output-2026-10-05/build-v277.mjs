import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v276.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v277.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1052,code:'4114013535',name:'晋中信息学院',F:'https://www.jzci.edu.cn/',G:'https://zsb.jzci.edu.cn/',H:['https://www.jzci.edu.cn/'],note:'官网与招生信息网；2026招生章程公布学校标识码。'},
{row:1053,code:'4114013538',name:'山西晋中理工学院',F:'https://www.sxjzit.edu.cn/',G:'https://www.sxjzit.edu.cn/',H:['https://www.sxjzit.edu.cn/'],note:'学校官网与招生公告；官网发布2026招生咨询电话。'},
{row:1054,code:'4114013598',name:'晋中健康学院',F:'https://jzjkxy.com/',G:'https://jzjkxy.com/m/html/zsc/',H:['https://jzjkxy.com/'],note:'学校官网与招生处页面；招生处发布2026招生相关信息。'},
{row:1055,code:'4214051189',name:'山西能源学院',F:'https://www.sxie.edu.cn/',G:'https://www.sxie.edu.cn/zsxxw/index.htm',H:['https://www.sxie.edu.cn/'],note:'学校官网及招生信息网，公开2026招生计划与招生章程。'},
{row:1056,code:'4114013537',name:'山西电子科技学院',F:'https://www.sxdzkj.edu.cn/',G:'https://www.sxdzkj.edu.cn/',H:['https://www.sxdzkj.edu.cn/'],note:'学校官网，设本科生招生栏目；招生信息发布于校方域名。'},
{row:1057,code:'4114010812',name:'吕梁学院',F:'https://www.llu.edu.cn/',G:'https://llxyzs.llu.edu.cn/zssy/sy.htm',H:['https://www.llu.edu.cn/'],note:'学校官网及招生就业工作部招生信息网，发布2026录取简报。'},
{row:1058,code:'4114014898',name:'山西医药学院',F:'https://www.sxum.edu.cn/',G:'https://www.sxum.edu.cn/bkszs/',H:['https://www.sxum.edu.cn/'],note:'学校官网及本科生招生信息网，发布2026年本科招生章程与计划。'},
{row:1059,code:'4114013534',name:'山西工学院',F:'https://www.sxct.edu.cn/',G:'https://bkzsw.sxct.edu.cn/',H:['https://www.sxct.edu.cn/'],note:'学校官网与招生网；2026招生章程公布两项网址。'},
{row:1060,code:'4114010108',name:'山西大学',F:'https://www.sxu.edu.cn/',G:'https://bkzs.sxu.edu.cn/',H:['https://www.sxu.edu.cn/'],note:'学校官网与本科招生网，均更新2026招生录取信息。'},
{row:1049,code:'4114013597',name:'山西科技学院',F:'https://www.sxist.edu.cn/',G:'https://bkzs.sxist.edu.cn/',H:['https://www.sxist.edu.cn/'],note:'学校官网与本科招生信息网；官网近期更新至2026年9月。'},
{row:1050,code:'4114010113',name:'山西农业大学',F:'https://www.sxau.edu.cn/',G:'https://zsb.sxau.edu.cn/',H:['https://www.sxau.edu.cn/'],note:'学校官网及本科招生网；学校概况与招生信息均由学校域名发布。'},
{row:1051,code:'4114010121',name:'晋中学院',F:'https://www.jzxy.edu.cn/',G:'https://jzxyzs.jzxy.edu.cn/',H:['https://www.jzxy.edu.cn/'],note:'学校官网与校方招生网站；2026招生章程公布招生网址。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));













































