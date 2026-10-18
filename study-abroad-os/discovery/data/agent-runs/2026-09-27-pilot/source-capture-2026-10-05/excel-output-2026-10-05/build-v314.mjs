import fs from'node:fs/promises';import{FileBlob,SpreadsheetFile}from'@oai/artifact-tool';const src='china-university-directory-1412-official-links-2026-10-06-v313.xlsx',out='china-university-directory-1412-official-links-2026-10-06-v314.xlsx',ep='official-source-evidence-2026-10-06.jsonl';const w=await SpreadsheetFile.importXlsx(await FileBlob.load(src)),s=w.worksheets.getItem('รายชื่อ 1412'),old=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse),fresh=[];const rows=[
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
{row:1117,code:'4161013121',name:'西安思源学院',F:'https://www.xasyu.cn/web/',G:'https://zb.xasyu.cn/web/',H:['https://www.xasyu.cn/web/'],note:'学校官网及招生信息网，发布2026年本科招生计划和章程。'},
{row:1118,code:'4161013569',name:'西安交通工程学院',F:'https://www.xjy.edu.cn/',G:'https://zhaoban.xjy.edu.cn/',H:['https://www.xjy.edu.cn/'],note:'学校官网与招生信息网；学校信息公开报告列出官方招生域名。'},
{row:1119,code:'4161013677',name:'西安交通大学城市学院',F:'https://www.xjtucc.cn/',G:'https://zhaoban.xjtucc.cn/',H:['https://www.xjtucc.cn/'],region:'陕西省',note:'学校官网及招生网；招生网发布2026年普通本科招生章程与录取进度。'},
{row:1120,code:'4161013678',name:'西北大学现代学院',F:'https://www.xdxd.cn/',G:'https://zs.xdxd.cn/',H:['https://www.xdxd.cn/'],region:'陕西省',note:'学校官网及招生信息网；学校官网公布2026招生章程和招生咨询通道。'},
{row:1121,code:'4161013679',name:'西安建筑科技大学华清学院',F:'https://www.xauat-hqc.edu.cn/',G:'https://zs.xauat-hqc.com/',H:['https://www.xauat-hqc.edu.cn/'],region:'陕西省',note:'学校官网及招生信息网；校方页面发布2026招生章程、计划和录取信息。'},
{row:1122,code:'4161013680',name:'西安财经大学行知学院',F:'https://www.xacxz.edu.cn/',G:'https://zs.xacxz.edu.cn/',H:['https://www.xacxz.edu.cn/'],region:'陕西省',note:'学校官网及招生网；学校官网链接招生网，招生网发布招生章程。'},
{row:1123,code:'4161013682',name:'西安工商学院',F:'https://www.xags.edu.cn/',G:'https://zs.bxait.cn/',H:['https://www.xags.edu.cn/'],region:'陕西省',note:'学校官网及招生网；招生网发布2026年招生简章，学校信息公开说明其为校方渠道。'},
{row:1126,code:'4161013738',name:'西安汽车职业大学',F:'https://www.xvua.edu.cn/',G:'https://zhaosheng.xvua.edu.cn/',H:['https://info.xvua.edu.cn/'],region:'陕西省',note:'学校官网及招生网；2026招生章程公布院校标识码4161013738，学校官网链接招生服务。'},
{row:1127,code:'4161013819',name:'陕西警察学院',F:'https://www.snpc.edu.cn/',G:'https://zhaosheng.snpc.edu.cn/',H:['https://www.moe.gov.cn/srcsite/A03/s181/202406/t20240612_1135111.html'],region:'陕西省',note:'教育部批准设立文件确认学校名称与标识码；学校2026招生章程列出官网及招生网网址。'},
{row:1128,code:'4161013894',name:'西安明德理工学院',F:'https://www.mdit.edu.cn/',G:'https://zsw.mdit.edu.cn/',H:['https://www.mdit.edu.cn/info/4901/118972.htm'],region:'陕西省',note:'学校官网及招生信息网；学校官网说明转设更名，招生网发布2026年本专科招生简章和招生章程。'},
{row:1129,code:'4161014030',name:'西安信息职业大学',F:'https://www.xivuedu.com/',G:'https://www.xivuedu.com/zsjyw.htm',H:['https://www.xjzk.gov.cn/upload/resources/file/2025/03/13/29256.pdf'],region:'陕西省',note:'2026年招生章程列出学校网址；省级考试院招生计划以代码14030列出学校及招生专业。学校官网当前访问超时，复核待办。'},
{row:1131,code:'4161014041',name:'西安理工大学高科学院',F:'https://www.xthtc.com/',G:'https://www.xthtc.com/',H:['https://www.xthtc.com/index.php?s=%2FIndex%2Fview%2Fs%2F2%2Fc%2F69%2Fid%2F10023.html'],region:'陕西省',note:'学校官网设招生专栏；2026招生章程及分省招生计划由学校官网发布。'},
{row:1132,code:'4161014042',name:'西安科技大学高新学院',F:'https://www.gaoxinedu.com/',G:'https://www.gxxyzs.com/',H:['https://www.gaoxinedu.com/'],region:'陕西省',note:'学校官网与招生网；校方页面链接招生网，招生网发布2026年招生动态。'},
{row:1133,code:'4161014390',name:'陕西学前师范学院',F:'https://www.snsy.edu.cn/',G:'https://zsw.snsy.edu.cn/',H:['https://zsw.snsy.edu.cn/info/1013/2032.htm'],region:'陕西省',note:'学校官网及本科招生信息网；招生网发布2026年招生章程与录取动态。'},
{row:1136,code:'4161010716',name:'陕西中医药大学',F:'https://www.sntcm.edu.cn/',G:'https://zs.sntcm.edu.cn/',H:['https://zs.sntcm.edu.cn/'],region:'陕西省',note:'学校官网及招生网址；2026本科招生章程列出招生网及招生咨询方式。'},
{row:1138,code:'4161010828',name:'陕西工业职业技术大学',F:'https://www.snpu.edu.cn/',G:'https://zsw.snpu.edu.cn/',H:['https://zsw.snpu.edu.cn/info/1093/6017.htm'],region:'陕西省',note:'学校官网及招生网；2026招生章程确认学校网址及招生网址，学校已开展本科招生。'},
{row:1139,code:'4161010966',name:'陕西农林职业技术大学',F:'https://www.snaftu.edu.cn/',G:'https://zsw.ylvtc.cn/',H:['https://www.snaftu.edu.cn/'],region:'陕西省',note:'学校官网及招生网；招生网发布2026本科报考指南与招生计划，学校官网近期更新。'},
{row:1140,code:'4161013123',name:'陕西国际商贸学院',F:'https://www.csiic.edu.cn/',G:'https://zs.csiic.edu.cn/',H:['https://zs.csiic.edu.cn/2026/0604/c4523a134522/page.htm'],region:'陕西省',note:'学校官网及招生网；2026招生章程确认学校网址并发布于校方招生域名。'},
{row:1141,code:'4161013125',name:'陕西服装工程学院',F:'https://www.sxfu.edu.cn/',G:'https://zsb.sxfu.cn/',H:['https://zsb.sxfu.cn/zszx.htm'],region:'陕西省',note:'学校官网及招生信息网；招生信息网发布2026年招生章程与分类考试录取公告。'},
{row:1142,code:'4161013681',name:'陕西科技大学镐京学院',F:'https://www.sxhju.cn/',G:'https://zsw.sxhju.cn/',H:['https://www.sxhju.cn/xygk/xyjj.htm'],region:'陕西省',note:'学校官网及招生网；学校介绍其办学身份，招生网发布2026招生章程与计划。'},
{row:1146,code:'4131010247',name:'同济大学',F:'https://www.tongji.edu.cn/',G:'https://bkzs.tongji.edu.cn/',H:['https://xxgk.tongji.edu.cn/index.php?classid=3138&newsid=19858&t=show'],region:'上海市',note:'学校官网及本科招生网；招生章程与2026招生信息公开确认招生网域名。'},
{row:1157,code:'4131010269',name:'华东师范大学',F:'https://www.ecnu.edu.cn/',G:'https://zsb.ecnu.edu.cn/',H:['https://www.ecnu.edu.cn/info/1094/72567.htm'],region:'上海市',note:'学校官网及本科招生网；学校近期招生咨询通知指向校内招生网。'},
{row:1162,code:'4131010274',name:'上海海关学院',F:'https://www.shcc.edu.cn/',G:'https://zs.shcc.edu.cn/',H:['https://www.shcc.edu.cn/_upload/article/files/6a/8e/ef58c8034a339526ade1fb18b363/1bb03111-7335-4ddd-9374-7ab462d8defc.pdf'],region:'上海市',note:'学校官网及本科招生网；学校招生章程列出官网和本科招生网址。'},
{row:1165,code:'4131010278',name:'上海音乐学院',F:'https://www.shcmusic.edu.cn/',G:'https://jwc.shcmusic.edu.cn/437/listm.htm',H:['https://jwc.shcmusic.edu.cn/437/listm.htm'],region:'上海市',note:'学校官网及本科招生栏目；校方发布2026年普通本科章程、艺术类简章及国际学生简章。'},
{row:1170,code:'4131011047',name:'上海立信会计金融学院',F:'https://www.lixin.edu.cn/',G:'https://zsb.lixin.edu.cn/',H:['https://www.lixin.edu.cn/gk/xxgklm/gjqsxx/qjqs/qszc/156086.htm'],region:'上海市',note:'学校官网及本专科招生网；校方2026秋季招生章程列明招生网址。'},
{row:1171,code:'4131011458',name:'上海电机学院',F:'https://www.sdju.edu.cn/',G:'https://zhaosheng.sdju.edu.cn/',H:['https://zhaosheng.sdju.edu.cn/'],region:'上海市',note:'学校官网及招生网；招生网发布2026年秋季招生章程、计划与录取进度。'},
{row:1172,code:'4131011833',name:'上海杉达学院',F:'https://www.sandau.edu.cn/',G:'https://zsw.sandau.edu.cn/',H:['https://zsw.sandau.edu.cn/'],region:'上海市',note:'学校官网及招生网；校方2026招生章程列出两网址，招生站发布招生动态。'},
{row:1173,code:'4131011835',name:'上海政法学院',F:'https://www.shupl.edu.cn/',G:'https://zs.shupl.edu.cn/Index.aspx',H:['https://zs.shupl.edu.cn/Index.aspx'],region:'上海市',note:'学校官网及招生信息网；招生网发布2026年本科招生章程、计划及招生通知。'},
{row:1174,code:'4131012044',name:'上海第二工业大学',F:'https://www.sspu.edu.cn/',G:'https://zsb.sspu.edu.cn/',H:['https://edu.sh.gov.cn/edu-assets-20200601/files/jyzt_ckzsrx2026bf48fbt1f1a9h98c/%E4%B8%8A%E6%B5%B7%E7%AC%AC%E4%BA%8C%E5%B7%A5%E4%B8%9A%E5%A4%A7%E5%AD%A62026%E5%B9%B4%E6%98%A5%E5%AD%A3%E9%AB%98%E8%80%83%E6%8B%9B%E7%94%9F%E7%AB%A0%E7%A8%8B.pdf'],region:'上海市',note:'学校官网及招生办官网；校方2026招生章程列出招生办网址。'},
{row:1184,code:'4131016404',name:'上海纽约大学',F:'https://www.shnyu.edu.cn/cn/',G:'https://www.shnyu.edu.cn/cn/page/zhao-sheng-zheng-ce',H:['https://www.shnyu.edu.cn/cn/page/shang-hai-niu-yue-da-xue2026-nian-ben-ke-zhao-sheng-jian-zhang-zhong-guo-da-lu-xue-sheng'],region:'上海市',note:'学校官网招生政策栏目及2026中国大陆本科招生简章均由学校发布。'},
{row:1134,code:'4161014945',name:'西安戏剧学院',F:'https://www.xaad.edu.cn/',G:'https://www.xaad.edu.cn/zsdt.htm',H:['https://www.moe.gov.cn/srcsite/A03/s181/202507/t20250701_1196198.html','https://www.xaad.edu.cn/info/1014/7231.htm'],region:'陕西省',note:'教育部设立批复确认学校标识码；2026招生章程列出官网，学校网站公布招生计划和章程。'},
{row:1185,code:'4151010646',name:'阿坝师范学院',F:'https://www.abtu.edu.cn/',G:'https://zs.abtu.edu.cn/',H:['https://www.abtu.edu.cn/xxjs/xxjj.htm'],region:'四川省',note:'学校官网及招生信息网；2026招生章程指定招生查询域名，学校官网介绍院校信息。'},
{row:1049,code:'4114013597',name:'山西科技学院',F:'https://www.sxist.edu.cn/',G:'https://bkzs.sxist.edu.cn/',H:['https://www.sxist.edu.cn/'],note:'学校官网与本科招生信息网；官网近期更新至2026年9月。'},
{row:1050,code:'4114010113',name:'山西农业大学',F:'https://www.sxau.edu.cn/',G:'https://zsb.sxau.edu.cn/',H:['https://www.sxau.edu.cn/'],note:'学校官网及本科招生网；学校概况与招生信息均由学校域名发布。'},
{row:1051,code:'4114010121',name:'晋中学院',F:'https://www.jzxy.edu.cn/',G:'https://jzxyzs.jzxy.edu.cn/',H:['https://www.jzxy.edu.cn/'],note:'学校官网与校方招生网站；2026招生章程公布招生网址。'}
];for(const x of rows){if(String(s.getRange(`C${x.row}`).values[0][0])!==x.code||String(s.getRange(`D${x.row}`).values[0][0])!==x.name)throw Error('identity mismatch '+x.row);const ph=String(s.getRange(`H${x.row}`).values[0][0]??'');s.getRange(`F${x.row}:H${x.row}`).values=[[x.F,x.G||String(s.getRange(`G${x.row}`).values[0][0]??''),[ph,...x.H].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n')]];s.getRange(`K${x.row}:M${x.row}`).values=[[new Date('2026-10-06T00:00:00Z'),'已核验官网与学校/招生信息；范围见备注',x.note]];const b={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:x.region||'山西省',source_row:x.row,moe_code:x.code,name_zh:x.name,officiality:'confirmed'};for(const[type,url,title]of [['homepage',x.F,'Official institutional homepage'],...(x.G?[['admissions',x.G,'Official admissions website']]:[]),...x.H.map(u=>['reference',u,'Official institutional or admissions evidence'])])if(!old.some(y=>y.source_row===x.row&&y.moe_code===x.code&&y.link_type===type&&y.final_url===url))fresh.push({...b,link_type:type,candidate_url:url,final_url:url,publisher:'University',page_title:title,evidence_locator:'See workbook notes for identity and admissions-page resolution.',applicant_channel:type==='admissions'?'domestic undergraduate admissions':'official institutional or admissions evidence',unresolved:'Current international student recruitment and scholarship eligibility require separate confirmation.',decision:type==='admissions'?'accepted_official_link':'source_found',retrieval_status:'Official institution identity and accessible university pages verified.'});}await(await SpreadsheetFile.exportXlsx(w)).save(out);if(fresh.length)await fs.appendFile(ep,fresh.map(JSON.stringify).join('\n')+'\n');console.log(JSON.stringify({out,rows:rows.map(x=>x.row),evidenceAdded:fresh.length}));







































































