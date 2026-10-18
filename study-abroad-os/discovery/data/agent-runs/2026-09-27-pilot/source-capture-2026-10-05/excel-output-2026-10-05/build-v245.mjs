import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v244.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v245.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:897,code:'4121010147',name:'辽宁工程技术大学',F:'https://www.lntu.edu.cn/',G:'https://bkzsxxw.lntu.edu.cn/',H:['https://www.lntu.edu.cn/','https://bkzsxxw.lntu.edu.cn/'],note:'学校官网及本科招生信息网发布2026招生章程、录取进程和考生信息。'},
{row:898,code:'4121013900',name:'辽宁财贸学院',F:'https://www.lncmxy.edu.cn/',H:['https://www.lncmxy.edu.cn/'],note:'2026招生章程确认学校名称及办学情况；学校官网域名由招生宣传与公开院校目录交叉核实，本次未确认独立招生子站。'},
{row:899,code:'4121010154',name:'辽宁工业大学',F:'https://www.lnut.edu.cn/',G:'https://zjc.lnut.edu.cn/index/zsw/',H:['https://www.lnut.edu.cn/','https://zjc.lnut.edu.cn/index/zsw/','https://www.lnut.edu.cn/info/1152/189735.htm'],note:'学校2026招生章程及招生就业网确认学校主页与本科招生信息入口。'},
{row:900,code:'4121010160',name:'锦州医科大学',F:'https://www.jzmu.edu.cn/',G:'https://zsjyc.jzmu.edu.cn/',H:['https://www.jzmu.edu.cn/','https://zsjyc.jzmu.edu.cn/','https://zsjyc.jzmu.edu.cn/info/1216/1453.htm'],note:'学校官网及本科招生网均属jzmu.edu.cn；招生网发布2026本科招生章程。'},
{row:901,code:'4121010167',name:'渤海大学',F:'https://www.bhu.edu.cn/',G:'https://zsxx.bhu.edu.cn/',H:['https://www.bhu.edu.cn/','https://zsxx.bhu.edu.cn/','https://zsxx.bhu.edu.cn/engine2/general/4166266/detail?engineInstanceId=656004&pageId=85719'],note:'学校官网与本科招生信息网均属bhu.edu.cn官方域名；招生网发布2026招生章程和计划。'},
{row:902,code:'4121012595',name:'辽宁理工职业大学',F:'https://www.lnvut.edu.cn/',G:'https://www.lnvut.edu.cn/enro/index.htm',H:['https://www.lnvut.edu.cn/','https://www.lnvut.edu.cn/enro/index.htm','https://www.lnvut.edu.cn/enro/info/1002/1797.htm'],note:'学校官网及招生信息网发布2026招生章程、招生计划；名称及代码与表格一致。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'辽宁省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));
























