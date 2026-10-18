import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const src='china-university-directory-1412-official-links-2026-10-06-v346.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v347.xlsx';
const evidencePath='official-source-evidence-2026-10-06.jsonl';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const ws=wb.worksheets.getItem('รายชื่อ 1412');
const old=(await fs.readFile(evidencePath,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse);
const entries=[];
const updates=[
 {r:300,code:'4144013177',name:'北京师范大学珠海分校',url:'https://www.bnuzh.edu.cn/',title:'北京师范大学珠海校区',note:'已并入北京师范大学珠海校区，原分校已停止独立招生并完成办学转型；该链接为举办高校珠海校区信息，不代表旧分校继续招生。旧分校专属网址不作为当前招生入口。',status:'历史实体；不得作为当前招生链接'},
 {r:306,code:'4145013890',name:'广西工业学院',url:'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--infoId-7715873688%2Cmethod-view%2CschId-391319.dhtml',title:'阳光高考 2026 年招生章程',note:'2026本科招生章程已通过上级审核；章程明确学校网址、招生网址均以学校官方发布为准，故不填猜测域名。',status:'2026章程；校方网址尚待官方发布'},
 {r:397,code:'4113013404',name:'河北大学工商学院',url:'https://icc.hbu.edu.cn/xygk/xyjj.htm',title:'河北大学工商学院历史介绍页',note:'发现该学院历史介绍页，但当前主页可访问性未能稳定确认，也未找到现行招生信息；该候选页仅作追溯线索，不填入F/G。办学状态仍需学校或教育主管部门确认。',status:'历史页面候选；现行状态/招生入口未确认'},
 {r:472,code:'4141014980',name:'河南能源化工学院',url:'https://www.moe.gov.cn/srcsite/A03/s181/202606/t20260616_1440834.html',title:'教育部关于同意设置河南能源化工学院的函',note:'教育部2026年5月批准设立；该批复未给出官网或招生网址，未找到可由校方/主管部门确认的官网，暂不填F/G。',status:'新设学校；官方网址尚未核实'},
 {r:771,code:'4132013646',name:'南京大学金陵学院',url:'https://jjc.nju.edu.cn/73/1f/c18156a750367/page.htm',title:'南京大学后勤服务集团采购/校区移交信息',note:'南京大学官方页面说明金陵学院办学转型、校区移交并终止独立运行；不再提供旧学院网址作为当前招生入口。',status:'已终止独立运行'},
 {r:905,code:'4121013199',name:'沈阳工业大学工程学院',url:'https://liaoning.eol.cn/liaoningnews/202002/t20200221_1712986.shtml',title:'辽宁教育在线关于停止招生的报道',note:'辽宁教育在线报道该学院已停止招生；未找到学校或教育主管部门仍维护的当前官网/招生页，故不填URL。',status:'停止招生信息为媒体来源；旧网址未核实'},
 {r:925,code:'4121013200',name:'沈阳航空航天大学北方科技学院',url:'https://tjj.shenyang.gov.cn/sjfb/ndsj/202412/P020241205593478943633.pdf',title:'沈阳市统计年鉴 2024',note:'沈阳市统计年鉴记录该学院已停止办学；未发现当前独立招生入口。保留登记实体，不把举办高校官网误填为学院主页。',status:'政府统计年鉴记载停止办学'},
 {r:1010,code:'4137014979',name:'临沂工学院',url:'https://www.linyi.gov.cn/info/4971/450639.htm',title:'临沂市人民政府：临沂工学院获批设立',note:'临沂市政府称学校2026年启动首届招生，并提示关注官网，但该发布页未给出官网域名；在校方正式发布前保留F/G空白。',status:'新设；官方域名待确认'},
 {r:1072,code:'4114013608',name:'山西财经大学华商学院',url:'https://www.sxufe.edu.cn/',title:'山西财经大学官网',note:'检索到的官方招生网站属于山西财经大学本部，不能据此推定为华商学院网站；第三方所列域名未获主办高校/主管部门交叉确认，故保持空白。',status:'同名/关联站点未证实归属'},
 {r:1125,code:'4161013685',name:'西安电子科技大学长安学院',url:'https://www.xidian.edu.cn/',title:'西安电子科技大学官网',note:'未找到足以确认长安学院当前独立主页或招生页的校方来源；本部官网不能替代独立学院链接，保持空白，且不据搜索缺失推断其办学状态。',status:'未发现可确认的独立官网'},
 {r:1271,code:'4112013663',name:'南开大学滨海学院',url:'https://news.nankai.edu.cn/zhxw/system/2024/06/14/030062212.shtml',title:'南开大学新闻：滨海学院2024届毕业典礼',note:'南开大学官网确认学院于2024年举行毕业典礼；未将举办高校主页替代为旧学院官网，也未找到可确认的现行独立招生入口。停止招生的准确年份仍需官方依据确认。',status:'官方确认2024届毕业；现行招生入口未确认'},
 {r:1309,code:'4165013559',name:'新疆农业大学科学技术学院',url:'https://xsxy.xjau.edu.cn/lsyg/list.htm',title:'新疆农业大学亚心校区历史沿革',note:'举办高校页面载明教育部同意该学院自2021年起停止招生、终止办学并回归举办高校；旧学院不再作为当前招生实体。',status:'官方页面确认停止招生/终止办学'},
 {r:1332,code:'4153012357',name:'云南交通职业技术大学',url:'https://gaokao.chsi.com.cn/zxdy/forum--method-listDefault%2Ctype-sch%2Cstart-0%2Cforumid-103742.dhtml',title:'阳光高考院校问答',note:'学校答复提供招生网址 https://zs.ynjtc.edu.cn/；但2026章程的学校名称仍显示“云南交通职业技术学院”，与登记名称存在新旧名称/更名时点差异。保留主页空白并标记身份信息需复核。',status:'招生URL已录；名称/代码时点差异待复核'},
 {r:1374,code:'4133013285',name:'浙江中医药大学滨江学院',url:'https://www.zcmu.edu.cn/',title:'浙江中医药大学官网',note:'找到第三方列出的滨江学院子域名，但未能从现行校方页面确认该子域名仍由学校维护；浙江中医药大学官网不能直接当作独立学院主页。保持F/G空白。',status:'历史子域名归属/现行性未确认'}
];
for(const x of updates){
 const name=String(ws.getRange(`D${x.r}`).values[0][0]??'');
 if(name!==x.name) throw new Error(`identity mismatch row ${x.r}: ${name}`);
 if(x.code){const c=String(ws.getRange(`C${x.r}`).values[0][0]??'');if(c!==x.code)throw new Error(`MOE mismatch row ${x.r}: ${c}`)}
 const existing=String(ws.getRange(`H${x.r}`).values[0][0]??'');
 ws.getRange(`H${x.r}`).values=[[Array.from(new Set([existing,x.url].filter(Boolean))).join('\n')]];
 ws.getRange(`K${x.r}:M${x.r}`).values=[[new Date('2026-10-07T00:00:00Z'),'พบหลักฐานทางการ/แหล่งอ้างอิง; ตรวจสถานะตามหมายเหตุ',x.note]];
 const key=`${x.r}|${x.url}`;
 if(!old.some(e=>e.source_row===x.r&&e.final_url===x.url)) entries.push({source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-07',source_row:x.r,moe_code:String(ws.getRange(`C${x.r}`).values[0][0]??''),name_zh:x.name,task_id:null,input_version:null,link_type:'official_evidence',candidate_url:x.url,final_url:x.url,officiality:x.r===905||x.r===1072||x.r===1125||x.r===1374?'candidate_or_reference':'official_or_authoritative',ownership_evidence_url:null,publisher:x.title,published_at:null,cycle:null,degree_level:null,applicant_channel:'Not evidence of international undergraduate eligibility.',evidence_locator:x.note,original_excerpt:null,checked_at:'2026-10-07',retrieval_status:'reviewed; URL retained as evidence only, not necessarily a university homepage',capture_path:null,content_sha256:null,decision:'source_found',unresolved:x.status,next_action:'Review current institution identity and official web ownership before populating homepage/admissions columns.'});
}
await (await SpreadsheetFile.exportXlsx(wb)).save(out);
if(entries.length) await fs.appendFile(evidencePath,entries.map(JSON.stringify).join('\n')+'\n');
console.log(JSON.stringify({out,updated:updates.length,evidenceAdded:entries.length}));
