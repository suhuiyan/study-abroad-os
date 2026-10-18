import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v234.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v235.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:829,code:'4136013435',name:'景德镇艺术职业大学',F:'https://www.jdzvua.edu.cn/',G:'https://zsc.jdzvua.edu.cn/',H:['https://www.jdzvua.edu.cn/','https://zsc.jdzvua.edu.cn/'],note:'2026招生章程确认学校官网与招生网；招生网为学校发布招生政策、计划和录取结果的官方平台。'},
{row:830,code:'4136011785',name:'江西职业技术大学',F:'https://www.jxpu.edu.cn/',G:'https://zsw.jxpu.edu.cn/',H:['https://www.jxpu.edu.cn/','https://zsw.jxpu.edu.cn/index.htm','https://zsw.jxpu.edu.cn/info/1177/3729.htm'],note:'学校官网与招生网已按现用校名运营；2026招生简章明确招生网站及咨询方式。'},
{row:831,code:'4136011843',name:'九江学院',F:'https://www.jju.edu.cn/',G:'https://zs.jju.edu.cn/',H:['https://www.jju.edu.cn/index.htm','https://zs.jju.edu.cn/'],note:'学校官网列招生电话与地址；招生信息网发布2026招生通知、录取信息与招生政策。'},
{row:832,code:'4136013430',name:'南昌大学共青学院',F:'https://www.ncugqxy.edu.cn/',H:['https://www.ncugqxy.edu.cn/','https://www.ncugqxy.edu.cn/info/1045/40430.htm'],note:'学院官网发布2026年活动与招生联系方式；本次尚未确认独立招生网地址，故仅登记主页。'},
{row:834,code:'4136010403',name:'南昌大学',F:'https://www.ncu.edu.cn/',G:'https://zjc.ncu.edu.cn/zs',H:['https://www.ncu.edu.cn/','https://zjc.ncu.edu.cn/','https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--infoId-7624469636%2Cmethod-view%2CschId-314.dhtml'],note:'经教育部阳光高考平台审核的2026招生章程确认招生信息网；学校官网列招生就业工作处。'},
{row:835,code:'4136010404',name:'华东交通大学',F:'https://www.ecjtu.edu.cn/',G:'https://zjc.ecjtu.edu.cn/recruit/index',H:['https://www.ecjtu.edu.cn/','https://zjc.ecjtu.edu.cn/recruit/index'],note:'学校信息公开报告确认官方招生信息网；招生站位于学校ecjtu.edu.cn域名。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'江西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























