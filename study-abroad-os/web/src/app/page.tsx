"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, ExternalLink, GraduationCap, LockKeyhole, LogIn, LogOut, MapPin, Menu, Search, ShieldCheck, SlidersHorizontal, Sparkles, UserRound, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { catalog } from "@/lib/catalog";
import { admissionState, eligibility, emptyProfile, stateLabels, type Application, type Profile, type Program } from "@/lib/domain";

type Workspace = { programs: Program[]; user: {name:string;email:string}|null; profile:Profile|null; saved:string[]; applications:Application[]; admin?:boolean; configured:boolean };
type View = "explore"|"scholarships"|"saved"|"plan"|"profile";
const initial: Workspace = {programs:catalog,user:null,profile:null,saved:[],applications:[],configured:false};
const tabs: {id:View; label:string; icon:typeof Search}[] = [
  {id:"explore",label:"สำรวจหลักสูตร",icon:Search},{id:"scholarships",label:"ทุนการศึกษา",icon:Sparkles},{id:"saved",label:"ที่บันทึก",icon:Bookmark},{id:"plan",label:"แผนสมัคร",icon:ClipboardList},{id:"profile",label:"โปรไฟล์",icon:UserRound},
];
const money = (amount:number|null) => amount === null ? "รอตรวจค่าเรียน" : `${new Intl.NumberFormat("th-TH").format(amount)} CNY/ปี`;
const date = (value:string) => value ? new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Shanghai"}).format(new Date(`${value}T00:00:00+08:00`)) : "รอประกาศ";
const label = (s:string) => s === "open" ? "เปิดรับสมัคร" : s === "closed" ? "ปิดรอบ 2026" : s === "upcoming" ? "กำลังจะเปิด" : "ตรวจรอบใหม่";

export default function Home() {
  const [workspace,setWorkspace] = useState<Workspace>(initial);
  const [view,setView] = useState<View>("explore");
  const [selected,setSelected] = useState<string|null>(null);
  const [search,setSearch] = useState("");
  const [city,setCity] = useState("ทั้งหมด");
  const [language,setLanguage] = useState("ทั้งหมด");
  const [subject,setSubject] = useState("ทั้งหมด");
  const [showAuth,setShowAuth] = useState(false);
  const [authMode,setAuthMode] = useState<"signin"|"signup">("signin");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [name,setName] = useState("");
  const [form,setForm] = useState<Profile>(emptyProfile);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [mobileNav,setMobileNav] = useState(false);

  const reload = useCallback(async () => {
    try {
      const response = await fetch("/api/workspace",{cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "โหลดข้อมูลไม่สำเร็จ");
      setWorkspace(data);
      setForm(data.profile ? {...emptyProfile,...data.profile} : emptyProfile);
    } catch (error) { setMessage(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ"); }
  },[]);
  useEffect(()=>{ const timer=setTimeout(()=>void reload(),0); return ()=>clearTimeout(timer); },[reload]);
  useEffect(()=>{ if(message) { const timer=setTimeout(()=>setMessage(""),5500); return ()=>clearTimeout(timer); } },[message]);

  const act = useCallback(async (action:string,data?:unknown,programId?:string,saved?:boolean) => {
    if(!workspace.user) { setShowAuth(true); setMessage("เข้าสู่ระบบเพื่อบันทึกข้อมูล"); return false; }
    setBusy(true);
    try {
      const response=await fetch("/api/workspace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,data,programId,saved})});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error??"บันทึกไม่สำเร็จ");
      await reload();
      setMessage("บันทึกแล้ว");
      return true;
    } catch(error){setMessage(error instanceof Error?error.message:"บันทึกไม่สำเร็จ");return false;}
    finally{setBusy(false);}
  },[workspace.user,reload]);

  async function submitAuth(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try {
      const result=authMode==="signup" ? await authClient.signUp.email({name,email,password}) : await authClient.signIn.email({email,password});
      if(result.error) throw new Error(result.error.message??"เข้าสู่ระบบไม่สำเร็จ");
      setShowAuth(false);setPassword("");await reload();setMessage(authMode==="signup"?"สร้างบัญชีแล้ว":"เข้าสู่ระบบแล้ว");
    }catch(error){setMessage(error instanceof Error?error.message:"เข้าสู่ระบบไม่สำเร็จ");}
    finally{setBusy(false);}
  }
  async function signOut(){await authClient.signOut();await reload();setView("explore");setMessage("ออกจากระบบแล้ว");}

  const programs=workspace.programs.length?workspace.programs:catalog;
  const cities=["ทั้งหมด",...new Set(programs.map(p=>p.city))];
  const subjects=["ทั้งหมด",...new Set(programs.map(p=>p.subject))];
  const filtered=useMemo(()=>programs.filter(p=>{
    const q=search.trim().toLowerCase();
    return (!q||[p.university,p.chineseName,p.name,p.city,p.subject].some(v=>v.toLowerCase().includes(q))) && (city==="ทั้งหมด"||p.city===city) && (language==="ทั้งหมด"||p.language===language) && (subject==="ทั้งหมด"||p.subject===subject);
  }),[programs,search,city,language,subject]);
  const current=programs.find(p=>p.id===selected)??null;
  const profile=workspace.profile??form;
  const scholarships=programs.flatMap(p=>p.scholarships.map(s=>({program:p,scholarship:s})));

  const go=(next:View)=>{setView(next);setSelected(null);setMobileNav(false);window.scrollTo({top:0,behavior:"smooth"});};
  const programCard=(p:Program)=>{
    const state=admissionState(p); const bookmarked=workspace.saved.includes(p.id);
    return <article className="program-row" key={p.id}>
      <div className="program-main">
        <div className="program-top"><span className="uni-mark">{p.university.split(" ").map(x=>x[0]).slice(0,2).join("")}</span><span className="uni-text">{p.university}<small>{p.chineseName}</small></span><span className={`status status-${state}`}>{label(state)}</span></div>
        <button className="program-title" onClick={()=>setSelected(p.id)}>{p.name}<ArrowRight size={17}/></button>
        <div className="program-meta"><span><MapPin size={15}/>{p.city}</span><span>{p.language==="Chinese"?"ภาษาจีน":"ภาษาอังกฤษ"}</span><span>{p.kind==="program"?"หลักสูตร":"เส้นทางรับสมัคร"}</span><span>รอบ {p.intake}</span></div>
        <p className="program-description">{p.description}</p>
      </div>
      <div className="program-side"><div><small>ค่าเรียน</small><strong>{money(p.tuition)}</strong></div><div><small>ปิดรับสมัคร</small><strong>{date(p.deadline)}</strong></div><div className="row-actions"><button className={`icon-button ${bookmarked?"active":""}`} title={bookmarked?"นำออกจากที่บันทึก":"บันทึกตัวเลือก"} aria-label={bookmarked?"นำออกจากที่บันทึก":"บันทึกตัวเลือก"} onClick={()=>void act("save",undefined,p.id,!bookmarked)}><Bookmark size={19} fill={bookmarked?"currentColor":"none"}/></button><button className="small-button" onClick={()=>setSelected(p.id)}>รายละเอียด <ArrowRight size={16}/></button></div></div>
    </article>;
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"sidebar-open":""}`}>
      <button className="brand" onClick={()=>go("explore")}><span className="brand-symbol"><GraduationCap size={22}/></span><span>Study Abroad <b>OS</b><small>China undergraduate</small></span></button>
      <div className="sidebar-group"><span className="sidebar-caption">พื้นที่ทำงาน</span>{tabs.map(t=><button key={t.id} className={`nav-item ${view===t.id?"selected":""}`} onClick={()=>go(t.id)}><t.icon size={19}/><span>{t.label}</span>{t.id==="saved"&&workspace.saved.length>0&&<em>{workspace.saved.length}</em>}{t.id==="plan"&&workspace.applications.length>0&&<em>{workspace.applications.length}</em>}</button>)}</div>
      <div className="sidebar-bottom"><div className="scope-note"><ShieldCheck size={20}/><span>ข้อมูลจากมหาวิทยาลัย<br/>และประกาศทุนทางการ</span></div><div className="sidebar-user">{workspace.user?<><span className="avatar">{workspace.user.name.slice(0,1).toUpperCase()}</span><span className="user-identity"><b>{workspace.user.name}</b><small>{workspace.user.email}</small></span><button className="icon-button" title="ออกจากระบบ" aria-label="ออกจากระบบ" onClick={()=>void signOut()}><LogOut size={18}/></button></>:<button className="login-side" onClick={()=>setShowAuth(true)}><LogIn size={18}/> เข้าสู่ระบบ / สมัครสมาชิก</button>}</div></div>
    </aside>
    {mobileNav&&<button className="nav-scrim" aria-label="ปิดเมนู" onClick={()=>setMobileNav(false)}/>}
    <div className="content-wrap"><header className="topbar"><button className="menu-button" aria-label="เปิดเมนู" onClick={()=>setMobileNav(true)}><Menu size={22}/></button><div className="crumb">Study Abroad OS <span>/</span> {tabs.find(t=>t.id===view)?.label}</div><div className="top-right"><span className="scope-chip">ปริญญาตรี · จีน</span>{workspace.user?<button className="top-avatar" title={workspace.user.name} onClick={()=>go("profile")}>{workspace.user.name.slice(0,1).toUpperCase()}</button>:<button className="top-login" onClick={()=>setShowAuth(true)}>เข้าสู่ระบบ <ArrowRight size={16}/></button>}</div></header>
    <main className="content">
      {view==="explore"&&<><div className="page-heading"><div><div className="eyebrow">DISCOVER CHINA</div><h1>ค้นหาเส้นทางเรียนต่อจีน</h1><p>มหาวิทยาลัยจีน 10 แห่ง พร้อมหลักสูตร ทุน และประกาศรับสมัครที่ตรวจจากเว็บไซต์ทางการ</p></div><div className="heading-stat"><strong>10</strong><span>มหาวิทยาลัยชุดแรก</span></div></div>
        <div className="filter-bar"><label className="search-field"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหามหาวิทยาลัย สาขา หรือเมือง" aria-label="ค้นหา"/></label><div className="filters"><span className="filter-icon"><SlidersHorizontal size={18}/></span><label><span>เมือง</span><select value={city} onChange={e=>setCity(e.target.value)}>{cities.map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={15}/></label><label><span>ภาษา</span><select value={language} onChange={e=>setLanguage(e.target.value)}><option>ทั้งหมด</option><option value="Chinese">ภาษาจีน</option><option value="English">ภาษาอังกฤษ</option></select><ChevronDown size={15}/></label><label><span>สาขา</span><select value={subject} onChange={e=>setSubject(e.target.value)}>{subjects.map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={15}/></label></div></div>
        <div className="results-title"><div><h2>รายการหลักสูตรและเส้นทางรับสมัคร</h2><span>{filtered.length} รายการ</span></div><small>อ้างอิงรอบที่ระบุในแต่ละรายการ · เวลาปักกิ่ง</small></div><div className="list">{filtered.map(programCard)}{filtered.length===0&&<div className="empty"><Search size={24}/><b>ไม่พบรายการที่ตรงกับตัวกรอง</b><button onClick={()=>{setSearch("");setCity("ทั้งหมด");setLanguage("ทั้งหมด");setSubject("ทั้งหมด")}}>ล้างตัวกรอง</button></div>}</div>
      </>}
      {view==="scholarships"&&<><div className="page-heading"><div><div className="eyebrow">FUND YOUR STUDIES</div><h1>ทุนการศึกษา</h1><p>ดูสิทธิที่ทุนครอบคลุม เงื่อนไข และวิธียื่นจากประกาศของแต่ละแห่ง</p></div><div className="heading-stat"><strong>{scholarships.length}</strong><span>รายการทุนอ้างอิง</span></div></div><div className="list scholarship-list">{scholarships.map(({program:p,scholarship:s})=><article className="scholarship-row" key={`${p.id}-${s.name}`}><div><span className="mini-kicker">{p.university} · {p.city}</span><h2>{s.name}</h2><p>{s.coverage}</p><div className="scholarship-detail"><span><CalendarDays size={15}/> วันปิดทุน: {date(s.deadline)}</span><span><ShieldCheck size={15}/> {s.conditions}</span></div><p className="route-note">วิธียื่น: {s.route}</p></div><div className="scholarship-links"><button className="small-button" onClick={()=>setSelected(p.id)}>ดูหลักสูตร <ArrowRight size={16}/></button><a href={s.source} target="_blank" rel="noopener noreferrer">ประกาศทุน <ExternalLink size={15}/></a></div></article>)}</div></>}
      {view==="saved"&&<><div className="page-heading"><div><div className="eyebrow">YOUR SHORTLIST</div><h1>ที่บันทึกไว้</h1><p>เก็บตัวเลือกที่อยากติดตามไว้ในบัญชีของคุณ</p></div></div>{!workspace.user?<EmptyAuth onClick={()=>setShowAuth(true)}/>:workspace.saved.length?<div className="list">{programs.filter(p=>workspace.saved.includes(p.id)).map(programCard)}</div>:<div className="empty"><Bookmark size={25}/><b>ยังไม่มีรายการที่บันทึก</b><button onClick={()=>go("explore")}>ไปสำรวจหลักสูตร <ArrowRight size={15}/></button></div>}</>}
      {view==="plan"&&<><div className="page-heading"><div><div className="eyebrow">APPLICATION JOURNEY</div><h1>แผนสมัครเรียน</h1><p>รายการงานและเอกสารสำหรับแต่ละตัวเลือก เก็บความคืบหน้าไว้ในบัญชี</p></div></div>{!workspace.user?<EmptyAuth onClick={()=>setShowAuth(true)}/>:workspace.applications.length?<div className="list">{workspace.applications.map(app=>{const p=programs.find(item=>item.id===app.programId);if(!p)return null;const done=app.tasks.filter(t=>t.done).length;return <article className="plan-row" key={app.id}><div className="plan-header"><div><span className="mini-kicker">{p.university} · {p.city}</span><h2>{p.name}</h2><p>เป้าหมายปี {app.targetIntake} · {done}/{app.tasks.length} งานเสร็จแล้ว</p></div><button className="icon-button" title="ดูประกาศมหาวิทยาลัย" onClick={()=>setSelected(p.id)}><ExternalLink size={18}/></button></div><div className="progress"><span style={{width:`${app.tasks.length?done/app.tasks.length*100:0}%`}}/></div><div className="task-list">{app.tasks.map((task,i)=><label key={task.id} className="task"><input type="checkbox" checked={task.done} disabled={busy} onChange={()=>void act("application",{...app,tasks:app.tasks.map((t,j)=>j===i?{...t,done:!t.done}:t)})}/><span className={task.done?"done":""}>{task.title}</span><input className="task-date" aria-label={`กำหนดเวลา ${task.title}`} title="กำหนดเวลาที่ต้องการ" type="date" value={task.due} disabled={busy} onChange={e=>void act("application",{...app,tasks:app.tasks.map((t,j)=>j===i?{...t,due:e.target.value}:t)})}/></label>)}</div><label className="notes-label">บันทึกส่วนตัว<textarea value={app.notes} onChange={e=>setWorkspace(w=>({...w,applications:w.applications.map(a=>a.id===app.id?{...a,notes:e.target.value}:a)}))} onBlur={()=>void act("application",app)} placeholder="คำถาม เอกสารที่ต้องตาม หรือสิ่งที่ต้องตรวจเพิ่มเติม"/></label></article>})}</div>:<div className="empty"><ClipboardList size={25}/><b>ยังไม่มีแผนสมัคร</b><button onClick={()=>go("explore")}>เลือกหลักสูตรเพื่อเริ่ม <ArrowRight size={15}/></button></div>}</>}
      {view==="profile"&&<><div className="page-heading"><div><div className="eyebrow">STUDENT PROFILE</div><h1>โปรไฟล์ของคุณ</h1><p>ใช้ข้อมูลนี้เทียบเงื่อนไขภาษาและวุฒิเบื้องต้นกับมหาวิทยาลัย</p></div></div>{!workspace.user?<EmptyAuth onClick={()=>setShowAuth(true)}/>:<form className="profile-form" onSubmit={e=>{e.preventDefault();void act("profile",form)}}><div className="form-section-title"><span className="section-icon"><UserRound size={20}/></span><div><h2>ข้อมูลสำหรับตรวจคุณสมบัติ</h2><p>ข้อมูลส่วนตัวไม่แสดงต่อผู้ใช้คนอื่น</p></div></div><div className="form-grid"><label>ชื่อที่ใช้เรียก<input required maxLength={80} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>วุฒิการศึกษา<select value={form.qualification} onChange={e=>setForm({...form,qualification:e.target.value as Profile["qualification"]})}><option value="m6">มัธยมศึกษาปีที่ 6</option><option value="ib">IB Diploma</option><option value="alevel">A-Level</option><option value="foundation">Foundation</option><option value="other">อื่น ๆ</option></select></label><label>เกรดเฉลี่ย (เต็ม 4.0)<input type="number" min="0" max="4" step="0.01" value={form.gpa??""} onChange={e=>setForm({...form,gpa:e.target.value===""?null:Number(e.target.value)})}/></label><label>ปีที่ต้องการเข้าเรียน<input value={form.intake} maxLength={40} onChange={e=>setForm({...form,intake:e.target.value})}/></label></div><div className="form-section-title divider"><span className="section-icon"><GraduationCap size={20}/></span><div><h2>ผลสอบภาษาและ CSCA</h2><p>เว้นช่องว่างได้ หากยังไม่ได้สอบ</p></div></div><div className="form-grid"><label>HSK ระดับ<select value={form.hskLevel??""} onChange={e=>setForm({...form,hskLevel:e.target.value?Number(e.target.value):null})}><option value="">ยังไม่มี</option>{[1,2,3,4,5,6].map(x=><option key={x} value={x}>HSK {x}</option>)}</select></label><label>HSK คะแนน<input type="number" min="0" max="300" value={form.hskScore??""} onChange={e=>setForm({...form,hskScore:e.target.value===""?null:Number(e.target.value)})}/></label><label>วันที่สอบ HSK<input type="date" value={form.hskDate} onChange={e=>setForm({...form,hskDate:e.target.value})}/></label><label>IELTS รวม<input type="number" min="0" max="9" step="0.5" value={form.ielts??""} onChange={e=>setForm({...form,ielts:e.target.value===""?null:Number(e.target.value)})}/></label><label>IELTS ทักษะที่ต่ำสุด<input type="number" min="0" max="9" step="0.5" value={form.ieltsMinBand??""} onChange={e=>setForm({...form,ieltsMinBand:e.target.value===""?null:Number(e.target.value)})}/></label><label>วันที่สอบ IELTS<input type="date" value={form.ieltsDate} onChange={e=>setForm({...form,ieltsDate:e.target.value})}/></label><label>CSCA<select value={form.csca} onChange={e=>setForm({...form,csca:e.target.value as Profile["csca"]})}><option value="not-yet">ยังไม่ได้สอบ</option><option value="taken">สอบแล้ว</option><option value="unknown">ไม่แน่ใจ</option></select></label></div><button className="primary-button" type="submit" disabled={busy}><Check size={18}/> บันทึกโปรไฟล์</button></form>}</>}
      <footer className="footer"><span>Study Abroad OS · China undergraduate</span><span>ข้อมูลประกาศรับสมัครเปลี่ยนได้ กรุณาเปิดแหล่งทางการก่อนยื่นสมัคร</span></footer>
    </main></div>
    {current&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="detail-panel" role="dialog" aria-modal="true" aria-label={`รายละเอียด ${current.name}`}><div className="detail-head"><button className="back-button" onClick={()=>setSelected(null)}><ArrowLeft size={18}/> กลับ</button><button className="icon-button" title="ปิด" aria-label="ปิด" onClick={()=>setSelected(null)}><X size={20}/></button></div><div className="detail-body"><div className="eyebrow">{current.university} · {current.city}</div><h2>{current.name}</h2><p className="detail-uni">{current.chineseName}</p><div className="detail-chips"><span>{current.language==="Chinese"?"สอนภาษาจีน":"สอนภาษาอังกฤษ"}</span><span>รอบ {current.intake}</span><span>{stateLabels[admissionState(current)]}</span></div><p className="detail-intro">{current.description}</p>
      <div className="fact-grid"><div><small>ค่าเรียน</small><strong>{money(current.tuition)}</strong><span>{current.feeNote}</span></div><div><small>ปิดรับสมัคร</small><strong>{date(current.deadline)}</strong><span>{current.deadlineNote}</span></div></div>
      <section className="detail-section"><h3>เทียบคุณสมบัติเบื้องต้น</h3>{workspace.profile?<><p className="section-hint">{eligibility(profile,current).status}</p>{eligibility(profile,current).checks.map(c=><div className="check-row" key={c.label}><span className={`check-mark check-${c.state}`}>{c.state==="pass"?<Check size={14}/>:c.state==="gap"?"!":"?"}</span><div><strong>{c.label}</strong><p>{c.detail}</p></div></div>)}</>:<div className="profile-prompt"><CircleHelp size={20}/><span>กรอกโปรไฟล์เพื่อเทียบ HSK, IELTS และ CSCA</span><button onClick={()=>{setSelected(null);go("profile")}}>ไปที่โปรไฟล์ <ArrowRight size={14}/></button></div>}</section>
      <section className="detail-section"><h3>เอกสารและเงื่อนไข</h3><p className="section-hint">{current.academicNote}</p><div className="doc-list">{current.documents.map(d=><div key={d}><CheckCircle2 size={16}/>{d}</div>)}</div></section>
      <section className="detail-section"><h3>ทุนที่เกี่ยวข้อง</h3>{current.scholarships.length?current.scholarships.map(s=><div className="mini-scholarship" key={s.name}><strong>{s.name}</strong><p>{s.coverage}</p><small>{s.conditions}</small><div>วันปิดทุน: {date(s.deadline)}</div><a href={s.source} target="_blank" rel="noopener noreferrer">อ่านประกาศทุน <ExternalLink size={14}/></a></div>):<p className="section-hint">ยังไม่พบทุนที่ยืนยันว่าใช้กับเส้นทางนี้ ตรวจทุนกับมหาวิทยาลัยโดยตรง</p>}</section>
      <section className="source-section"><ShieldCheck size={18}/><div><b>แหล่งทางการ</b><p>ตรวจข้อมูลล่าสุด {date(current.checkedAt)} · {current.verification==="reviewed"?"ตรวจทานแล้ว":"ตรวจทานบางส่วน"}</p><p>{current.reviewNote}</p><a href={current.source} target="_blank" rel="noopener noreferrer">เปิดประกาศต้นฉบับ <ExternalLink size={14}/></a>{current.requirementsSource!==current.source&&<a href={current.requirementsSource} target="_blank" rel="noopener noreferrer">เกณฑ์คุณสมบัติ <ExternalLink size={14}/></a>}</div></section>
      </div><div className="detail-actions"><button className="outline-button" onClick={()=>void act("save",undefined,current.id,!workspace.saved.includes(current.id))}><Bookmark size={17} fill={workspace.saved.includes(current.id)?"currentColor":"none"}/>{workspace.saved.includes(current.id)?"บันทึกแล้ว":"บันทึกตัวเลือก"}</button><button className="primary-button" disabled={busy} onClick={async()=>{const ok=await act("start",undefined,current.id);if(ok){setSelected(null);go("plan")}}}><ClipboardList size={17}/> สร้างแผนสมัคร</button></div></section></div>}
    {showAuth&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAuth(false)}}><section className="auth-dialog" role="dialog" aria-modal="true" aria-label="เข้าสู่ระบบ"><div className="auth-top"><span className="section-icon"><LockKeyhole size={20}/></span><button className="icon-button" aria-label="ปิด" onClick={()=>setShowAuth(false)}><X size={20}/></button></div><h2>{authMode==="signin"?"เข้าสู่ระบบ":"สร้างบัญชี"}</h2><p>บันทึกตัวเลือกและติดตามแผนสมัครของคุณ</p><form onSubmit={e=>void submitAuth(e)}>{authMode==="signup"&&<label>ชื่อ<input required value={name} onChange={e=>setName(e.target.value)}/></label>}<label>อีเมล<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>รหัสผ่าน<input type="password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} placeholder={authMode==="signup"?"อย่างน้อย 12 ตัวอักษร":""}/></label><button type="submit" className="primary-button" disabled={busy}>{authMode==="signin"?"เข้าสู่ระบบ":"สมัครสมาชิก"} <ArrowRight size={17}/></button></form><button className="auth-switch" onClick={()=>setAuthMode(authMode==="signin"?"signup":"signin")}>{authMode==="signin"?"ยังไม่มีบัญชี? สมัครสมาชิก":"มีบัญชีแล้ว? เข้าสู่ระบบ"}</button></section></div>}
    {message&&<div className="toast" role="status">{message}<button aria-label="ปิดแจ้งเตือน" onClick={()=>setMessage("")}><X size={15}/></button></div>}
  </div>;
}

function EmptyAuth({onClick}:{onClick:()=>void}){return <div className="empty"><LockKeyhole size={24}/><b>เข้าสู่ระบบเพื่อใช้พื้นที่ส่วนตัว</b><p>ตัวเลือกและแผนสมัครจะบันทึกไว้กับบัญชีของคุณ</p><button onClick={onClick}>เข้าสู่ระบบ <ArrowRight size={15}/></button></div>}
