import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v299.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v301.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
{row:1052,code:'4114013535',name:'晋中信息学院',F:'https://www.jzci.edu.cn/',G:'https://zsb.jzci.edu.cn/',H:['https://www.jzci.edu.cn/'],note:'官网与招生信息网；2026招生章程公布学校标识码。'},
{row:1053,code:'4114013538',name:'山西晋中理工学院',F:'https://www.sxjzit.edu.cn/',G:'https://www.sxjzit.edu.cn/',H:['https://www.sxjzit.edu.cn/'],note:'学校官网与招生公告；官网发布2026招生咨询电话。'},
{row:1054,code:'4114013598',name:'晋中健康学院',F:'https://jzjkxy.com/',G:'https://jzjkxy.com/m/html/zsc/',H:['https://jzjkxy.com/'],note:'学校官网与招生处页面；招生处发布2026招生相关信息。'},
{row:1055,code:'4214051189',name:'山西能源学院',F:'https://www.sxie.edu.cn/',G:'https://www.sxie.edu.cn/zsxxw/index.htm',H:['https://www.sxie.edu.cn/'],note:'学校官网及招生信息网，公开2026招生计划与招生章程。'},
{row:1056,code:'4114013537',name:'山西电子科技学院',F:'https://www.sxdzkj.edu.cn/',G:'https://www.sxdzkj.edu.cn/',H:['https://www.sxdzkj.edu.cn/'],note:'学校官网，设本科生招生栏目；招生信息发布于校方域名。'},
{row:1057,code:'4114010812',name:'吕梁学院',F:'https://www.llu.edu.cn/',G:'https://llxyzs.llu.edu.cn/zssy/sy.htm',H:['https://www.llu.edu.cn/'],note:'学校官网及招生就业工作部招生信息网，发布2026录取简报。'},
{row:1058,code:'4114014898',name:'山西医药学院',F:'https://www.sxum.edu.cn/',G:'https://www.sxum.edu.cn/bkszs/',H:['https://www.sxum.edu.cn/'],note:'学校官网及本科生招生信息网，发布2026年本科招生章程与计划。'},
{row:1059,code:'4114013534',name:'山西工学院',F:'https://www.sxct.edu.cn/',G:'https://bkzsw.sxct.edu.cn/',H:['https://www.sxct.edu.cn/'],note:'学校官网与招生网；2026招生章程公布两项网址。'},
{row:1060,code:'4114010108',name:'山西大学',F:'https://www.sxu.edu.cn/',G:'https://bkzs.sxu.edu.cn/',H:['https://www.sxu.edu.cn/'],note:'学校官网与本科招生网，均更新2026招生录取信息。'},
{row:1061,code:'4114010109',name:'太原科技大学',F:'https://www.tyust.edu.cn/',G:'https://zsb.tyust.edu.cn/',H:['https://www.tyust.edu.cn/'],note:'学校官网与本科生招生网，公布2026本科招生章程与录取信息。'},
{row:1062,code:'4114010110',name:'中北大学',F:'https://www.nuc.edu.cn/',G:'https://zbzs.nuc.edu.cn/index.htm',H:['https://www.nuc.edu.cn/'],note:'学校官网与本科招生信息网，发布2026年招生信息。'},
{row:1063,code:'4114010112',name:'太原理工大学',F:'https://www.tyut.edu.cn/',G:'https://zs.tyut.edu.cn/',H:['https://www.tyut.edu.cn/'],note:'学校官网与本科招生网，公布2026年招生章程及录取动态。'},
{row:1064,code:'4114010114',name:'山西医科大学',F:'https://www.sxmu.edu.cn/',G:'https://www.sxmu.edu.cn/bks/',H:['https://www.sxmu.edu.cn/'],note:'学校官网及本科招生入口；与独立设立的山西医药学院分开记录。'},
{row:1065,code:'4114010118',name:'山西师范大学',F:'https://www.sxnu.edu.cn/',G:'https://zsb.sxnu.edu.cn/',H:['https://www.sxnu.edu.cn/'],note:'学校官网与招生信息网，公布2026本科招生章程及录取公告。'},
{row:1066,code:'4114010119',name:'太原师范学院',F:'https://www.tynu.edu.cn/',G:'https://zs.tynu.edu.cn/',H:['https://www.tynu.edu.cn/'],note:'学校官网及招生就业网；2026本科招生章程公布学校代码和招生网址。'},
{row:1067,code:'4114010125',name:'山西财经大学',F:'https://www.sxufe.edu.cn/',G:'https://zhaosheng.sxufe.edu.cn/',H:['https://www.sxufe.edu.cn/'],note:'学校官网及本科招生网，公布2026年招生章程。'},
{row:1068,code:'4114010809',name:'山西中医药大学',F:'https://www.sxtcm.edu.cn/',G:'https://bkzs.sxtcm.edu.cn/',H:['https://www.sxtcm.edu.cn/'],note:'学校官网与本科招生信息网，近期发布2026年招生信息。'},
{row:1069,code:'4114011242',name:'太原学院',F:'https://www.tyu.edu.cn/',G:'https://zs.tyu.edu.cn/',H:['https://www.tyu.edu.cn/'],note:'学校官网及招生网站；官网招生栏目和2026本科招生章程可核验。'},
{row:1070,code:'4114012111',name:'山西警察学院',F:'https://www.sxpc.edu.cn/',G:'https://www.sxpc.edu.cn/',H:['https://www.sxpc.edu.cn/'],note:'学院官网；2026招生章程确认学院名称及官网网址，招生专业公告亦由官方渠道发布。'},
{row:1071,code:'4114012779',name:'山西应用科技学院',F:'https://www.sxcast.edu.cn/',G:'https://zs.sxcast.edu.cn/',H:['https://www.sxcast.edu.cn/'],note:'学校官网与招生信息网，均发布2026招生录取信息。'},
{row:1073,code:'4114013691',name:'山西工商学院',F:'https://www.sxtbu.edu.cn/',G:'https://www.sxtbu.edu.cn/department/zsb/',H:['https://www.sxtbu.edu.cn/'],note:'学校官网公开招生信息；本科招生入口为学校官方域名下页面。'},
{row:1075,code:'4114014101',name:'太原工业学院',F:'https://www.tit.edu.cn/',G:'https://zsxx.tit.edu.cn/',H:['https://www.tit.edu.cn/'],note:'学校官网与招生办网站，发布2026招生录取工作信息。'},
{row:1074,code:'4114013696',name:'山西文化旅游职业大学',F:'https://www.sxvuct.edu.cn/',G:'https://zs.sxvuct.edu.cn/',H:['https://www.sxvuct.edu.cn/'],note:'学校官网和招生网站列于山西省2026年招生院校官方信息。'},
{row:1076,code:'4114014434',name:'山西传媒学院',F:'https://www.cusx.edu.cn/',G:'https://zsw.cusx.edu.cn/',H:['https://www.cusx.edu.cn/'],note:'学校官网与招生网，招生官网发布2026相关通知。'},
{row:1077,code:'4114016201',name:'山西工程科技职业大学',F:'https://www.sxgkd.edu.cn/',G:'https://zsxxw.sxgkd.edu.cn/',H:['https://www.sxgkd.edu.cn/'],note:'学校官网及招生信息网，发布2026录取公告与招生章程。'},
{row:1078,code:'4114010124',name:'忻州师范学院',F:'https://www.xztu.edu.cn/',G:'https://zs.xztu.edu.cn/',H:['https://www.xztu.edu.cn/'],note:'学校官网和招生网，发布2026年本科招生章程与计划。'},
{row:1079,code:'4114014527',name:'山西工程技术学院',F:'https://www.sxit.edu.cn/',G:'https://www.sxit.edu.cn/zsjyc/',H:['https://www.sxit.edu.cn/'],note:'学校官网及招生就业处招生信息网；2026招生章程公布招生网址。'},
{row:1080,code:'4114010123',name:'运城学院',F:'https://www.ycu.edu.cn/',G:'https://www.ycu.edu.cn/zhaosheng/',H:['https://www.ycu.edu.cn/'],note:'学校官网及招生信息网入口由2026年招生章程列明。'},
{row:1081,code:'4114014226',name:'运城职业技术大学',F:'https://www.ycptu.edu.cn/',G:'https://www.ycptu.edu.cn/',H:['https://www.ycptu.edu.cn/'],note:'学校官网；2026招生章程确认官网地址。'},
{row:1082,code:'4114010117',name:'长治医学院',F:'https://www.czmc.com/',G:'https://zsjy.czmc.edu.cn/',H:['https://www.czmc.com/'],note:'学校官网相关招生页面由教务部及招生就业创业信息网发布2026年本科招生信息。'},
{row:1083,code:'4114010122',name:'长治学院',F:'https://www.czc.edu.cn/',G:'https://zs.czc.edu.cn/',H:['https://www.czc.edu.cn/'],note:'学校官网与本科招生网，公布2026年招生章程及录取信息。'},
{row:1086,code:'4161010720',name:'陕西理工大学',F:'https://www.snut.edu.cn/',G:'https://zsjyw.snut.edu.cn/zsw.htm',H:['https://www.snut.edu.cn/'],note:'学校官网与本科招生网；2026年招生章程确认学校官方网址。'},
{row:1089,code:'4161010697',name:'西北大学',F:'https://www.nwu.edu.cn/',G:'https://zsb.nwu.edu.cn/',H:['https://www.nwu.edu.cn/'],note:'学校官网及本科生招生信息网，招生官网确认该信息发布渠道。'},
{row:1090,code:'4161010698',name:'西安交通大学',F:'https://www.xjtu.edu.cn/',G:'https://zs.xjtu.edu.cn/index.htm',H:['https://www.xjtu.edu.cn/'],note:'学校官网及本科招生网，发布2026年招生章程。'},
{row:1091,code:'4161010699',name:'西北工业大学',F:'https://www.nwpu.edu.cn/',G:'https://zsb.nwpu.edu.cn/',H:['https://www.nwpu.edu.cn/'],note:'学校官网与本科招生信息网，招生章程确认其为官方发布渠道。'},
{row:1092,code:'4161010700',name:'西安理工大学',F:'https://www.xaut.edu.cn/',G:'https://zhaosheng.xaut.edu.cn/',H:['https://www.xaut.edu.cn/'],note:'学校官网和本科招生网入口；本科生院官网链接至招生网。'},
{row:1093,code:'4161010701',name:'西安电子科技大学',F:'https://www.xidian.edu.cn/',G:'https://zsb.xidian.edu.cn/',H:['https://www.xidian.edu.cn/'],note:'学校官网与本科招生信息网，2026招生章程公布官方招生网址。'},
{row:1094,code:'4161010702',name:'西安工业大学',F:'https://www.xatu.edu.cn/',G:'https://zsb.xatu.edu.cn/',H:['https://www.xatu.edu.cn/'],note:'学校官网及本科招生信息网，发布2026年招生章程。'},
{row:1095,code:'4161010703',name:'西安建筑科技大学',F:'https://www.xauat.edu.cn/',G:'https://zhaosheng.xauat.edu.cn/',H:['https://www.xauat.edu.cn/'],note:'学校官网与本科招生信息网，2026招生章程确认招生网址。'},
{row:1096,code:'4161010704',name:'西安科技大学',F:'https://www.xust.edu.cn/',G:'https://zs.xust.edu.cn/',H:['https://www.xust.edu.cn/'],note:'学校官网与本科招生信息网；公布2026年本科招生章程。'},
{row:1097,code:'4161010705',name:'西安石油大学',F:'https://www.xsyu.edu.cn/',G:'https://zb.xsyu.edu.cn/',H:['https://www.xsyu.edu.cn/'],note:'学校官网与招生办网站，招生官网发布2026年招生章程。'},
{row:1098,code:'4161010708',name:'陕西科技大学',F:'https://www.sust.edu.cn/',G:'https://bkzs.sust.edu.cn/',H:['https://www.sust.edu.cn/'],note:'学校官网与本科招生信息网，招生章程和招生信息发布于官方招生域名。'},
{row:1099,code:'4161010709',name:'西安工程大学',F:'https://www.xpu.edu.cn/',G:'https://zsb.xpu.edu.cn/',H:['https://www.xpu.edu.cn/'],note:'学校官网和招生办网站，2026本科招生章程确认招生网址。'},
{row:1100,code:'4161010710',name:'长安大学',F:'https://www.chd.edu.cn/',G:'https://zsb.chd.edu.cn/',H:['https://www.chd.edu.cn/'],note:'学校官网与本科招生网，发布2026本科招生章程及专业目录。'},
{row:1101,code:'4161010718',name:'陕西师范大学',F:'https://www.snnu.edu.cn/',G:'https://zsb.snnu.edu.cn/index.htm',H:['https://www.snnu.edu.cn/'],note:'学校官网及本科招生信息网，发布2026年本科招生章程。'},
{row:1102,code:'4161010724',name:'西安外国语大学',F:'https://www.xisu.edu.cn/',G:'https://zhaosheng.xisu.edu.cn/index.htm',H:['https://www.xisu.edu.cn/'],note:'学校官网与本科招生信息网，发布2026年本科招生章程。'},
{row:1103,code:'4161010726',name:'西北政法大学',F:'https://www.nwupl.edu.cn/',G:'https://bkzn.nwupl.edu.cn/',H:['https://www.nwupl.edu.cn/'],note:'学校官网与本科招生官网，2026招生章程确认招生网址。'},
{row:1104,code:'4161010727',name:'西安体育学院',F:'https://www.xaipe.edu.cn/',G:'https://www.xaipe.edu.cn/zsbgs/',H:['https://www.xaipe.edu.cn/'],note:'学校官网与本科招生信息网，发布2026招生章程和招生计划。'},
{row:1105,code:'4161010728',name:'西安音乐学院',F:'https://www.xacom.edu.cn/',G:'https://zsb.xacom.edu.cn/',H:['https://www.xacom.edu.cn/'],note:'学校官网及招生信息网，发布2026年本科招生章程。'},
{row:1106,code:'4161010729',name:'西安美术学院',F:'https://www.xafa.edu.cn/',G:'https://zhshch.xafa.edu.cn/',H:['https://www.xafa.edu.cn/'],note:'学校官网与招生信息网，2026本科招生章程确认官方网址。'},
{row:1107,code:'4161011080',name:'西安文理学院',F:'https://www.xawl.edu.cn/',G:'https://zsb.xawl.edu.cn/',H:['https://www.xawl.edu.cn/'],note:'学校官网及招生信息网，发布2026年招生计划和通知。'},
{row:1108,code:'4161011400',name:'西安培华学院',F:'https://www.peihua.edu.cn/',G:'https://www.peihua.edu.cn/zhaosheng/',H:['https://www.peihua.edu.cn/'],note:'学校官网及招生信息网，2026招生录取信息由招生网发布。'},
{row:1109,code:'4161011560',name:'西安财经大学',F:'https://www.xaufe.edu.cn/',G:'https://zhaosheng.xaufe.edu.cn/',H:['https://www.xaufe.edu.cn/'],note:'学校官网及本科招生信息网；学校说明招生信息以本科招生网发布为准。'},
{row:1110,code:'4161011664',name:'西安邮电大学',F:'https://www.xupt.edu.cn/',G:'https://zhaosheng.xiyou.edu.cn/',H:['https://www.xupt.edu.cn/'],note:'学校官网与本科招生信息网，公布2026年本科招生章程。'},
{row:1111,code:'4161011736',name:'西安航空学院',F:'https://www.xaau.edu.cn/',G:'https://zb.xaau.edu.cn/',H:['https://www.xaau.edu.cn/'],note:'学校官网与招生信息网，发布2026招生录取进程及招生章程。'},
{row:1112,code:'4161011840',name:'西安医学院',F:'https://www.xiyi.edu.cn/',G:'https://zs.xiyi.edu.cn/',H:['https://www.xiyi.edu.cn/'],note:'学校官网与招生信息网，发布2026本科招生章程与计划。'},
{row:1113,code:'4161012712',name:'西安欧亚学院',F:'https://www.eurasia.edu/',G:'https://zhaosheng.eurasia.edu/',H:['https://www.eurasia.edu/'],note:'学校官网与招生网，招生网发布2026录取信息。'},
{row:1114,code:'4161012713',name:'西安外事学院',F:'https://www.xaiu.edu.cn/',G:'https://zsw.xaiu.edu.cn/',H:['https://www.xaiu.edu.cn/'],note:'学校官网与招生网，招生信息通过校方招生渠道发布。'},
{row:1115,code:'4161012714',name:'西安翻译学院',F:'https://www.xafu.edu.cn/',G:'https://zs.xafu.edu.cn/',H:['https://www.xafu.edu.cn/'],note:'学校官网和招生网，发布2026年招生章程。'},
{row:1049,code:'4114013597',name:'山西科技学院',F:'https://www.sxist.edu.cn/',G:'https://bkzs.sxist.edu.cn/',H:['https://www.sxist.edu.cn/'],note:'学校官网与本科招生信息网；官网近期更新至2026年9月。'},
{row:1050,code:'4114010113',name:'山西农业大学',F:'https://www.sxau.edu.cn/',G:'https://zsb.sxau.edu.cn/',H:['https://www.sxau.edu.cn/'],note:'学校官网及本科招生网；学校概况与招生信息均由学校域名发布。'},
{row:1051,code:'4114010121',name:'晋中学院',F:'https://www.jzxy.edu.cn/',G:'https://jzxyzs.jzxy.edu.cn/',H:['https://www.jzxy.edu.cn/'],note:'学校官网与校方招生网站；2026招生章程公布招生网址。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'山西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));






































































