"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  LockKeyhole,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { catalog } from "@/lib/catalog";
import { officialLinksForProgram } from "@/lib/official-links";
import { readWorkspace, type Workspace } from "@/lib/workspace";
import {
  defaultPreferences,
  preferencesSchema,
  programMatch,
  type Preferences,
} from "@/lib/discovery";
import { profileSchema } from "@/lib/domain";
import { ProfileIntro } from "@/components/profile-intro";
import { MatchSummary } from "@/components/match-summary";
import { useDialog } from "@/components/use-dialog";
import {
  admissionState,
  eligibility,
  emptyProfile,
  stateLabels,
  type Application,
  type Profile,
  type Program,
} from "@/lib/domain";

type View =
  "explore" | "scholarships" | "saved" | "plan" | "profile" | "settings";
const profileKey = "study-abroad-profile-v1";
const preferencesKey = "study-abroad-preferences-v1";
const introKey = "study-abroad-intro-v1";
const initial: Workspace = {
  programs: catalog,
  user: null,
  profile: null,
  saved: [],
  applications: [],
  configured: false,
  catalogSource: "bundled",
};
const tabs: { id: View; label: string; icon: typeof Search }[] = [
  { id: "explore", label: "สำรวจหลักสูตร", icon: Search },
  { id: "scholarships", label: "ทุนการศึกษา", icon: Sparkles },
  { id: "saved", label: "ที่บันทึก", icon: Bookmark },
  { id: "plan", label: "แผนสมัคร", icon: ClipboardList },
  { id: "profile", label: "โปรไฟล์", icon: UserRound },
  { id: "settings", label: "ตั้งค่า", icon: SlidersHorizontal },
];
const money = (amount: number | null) =>
  amount === null
    ? "รอตรวจค่าเรียน"
    : `${new Intl.NumberFormat("th-TH").format(amount)} CNY/ปี`;
const verifiedValue = (program: Program, key: string, value: unknown) =>
  program.facts?.[key]?.status === "verified" &&
  program.facts[key].value === value;
const tuitionLabel = (program: Program) =>
  verifiedValue(program, "tuition", program.tuition)
    ? money(program.tuition)
    : "รอตรวจสอบค่าเรียน";
const deadlineLabel = (program: Program) =>
  program.deadline && verifiedValue(program, "deadline", program.deadline)
    ? date(program.deadline)
    : "รอตรวจสอบ";
const scholarshipDeadlineLabel = (
  program: Program,
  name: string,
  deadline: string,
) => {
  const fact = program.scholarshipFacts?.find((item) => item.name === name)
    ?.facts.deadline;
  return deadline && fact?.status === "verified" && fact.value === deadline
    ? date(deadline)
    : "รอตรวจสอบรอบที่สมัคร";
};
const date = (value: string) =>
  value
    ? new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Shanghai",
      }).format(new Date(`${value}T00:00:00+08:00`))
    : "รอประกาศ";
const label = (s: string, program: Program) =>
  s === "open"
    ? "เปิดรับสมัคร"
    : s === "closed"
      ? `ปิดรอบ ${program.cycle?.year ?? program.intake}`
      : s === "upcoming"
        ? "กำลังจะเปิด"
        : "ตรวจรอบใหม่";
const statusLabels: Record<Application["status"], string> = {
  preparing: "กำลังเตรียม",
  submitted: "ส่งใบสมัครแล้ว",
  offer: "ได้รับผลตอบรับ",
  closed: "ปิดแผน",
};

export default function Home() {
  const [workspace, setWorkspace] = useState<Workspace>(initial);
  const [view, setView] = useState<View>("explore");
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("ทั้งหมด");
  const [subject, setSubject] = useState("ทั้งหมด");
  const [scholarshipsOnly, setScholarshipsOnly] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [form, setForm] = useState<Profile>(emptyProfile);
  const [localProfile, setLocalProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);
  const [showIntro, setShowIntro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [saveStates, setSaveStates] = useState<
    Record<string, "idle" | "saving" | "saved" | "error" | "conflict">
  >({});
  useDialog(showAuth ? "auth" : selected);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(profileKey);
        if (stored) {
          const profile = profileSchema.safeParse(JSON.parse(stored));
          if (profile.success) {
            setLocalProfile(profile.data);
            setForm(profile.data);
          }
        }
        const storedPreferences = localStorage.getItem(preferencesKey);
        if (storedPreferences) {
          const parsed = preferencesSchema.safeParse(
            JSON.parse(storedPreferences),
          );
          if (parsed.success) setPreferences(parsed.data);
        }
        setShowIntro(!localStorage.getItem(introKey));
      } catch {
        setShowIntro(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const saveLocalProfile = (
    profile: Profile,
    nextPreferences = preferences,
  ) => {
    setLocalProfile(profile);
    setForm(profile);
    setPreferences(nextPreferences);
    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(preferencesKey, JSON.stringify(nextPreferences));
      setMessage("บันทึกบนอุปกรณ์นี้แล้ว");
    } catch {
      setMessage(
        "ใช้ข้อมูลได้ในหน้านี้ แต่เบราว์เซอร์ไม่อนุญาตให้บันทึกบนอุปกรณ์",
      );
    }
  };
  const savePreferences = (nextPreferences: Preferences) => {
    setPreferences(nextPreferences);
    try {
      localStorage.setItem(preferencesKey, JSON.stringify(nextPreferences));
      setMessage("บันทึกความต้องการแล้ว");
    } catch {
      setMessage("ใช้ความต้องการนี้ได้ในหน้านี้ แต่บันทึกบนอุปกรณ์ไม่ได้");
    }
  };
  const closeIntro = () => {
    setShowIntro(false);
    try {
      localStorage.setItem(introKey, "seen");
    } catch {
      /* Browsing remains available without storage. */
    }
  };

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await readWorkspace();
      setWorkspace(data);
      setForm((current) => data.profile ?? current);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void reload(), 0);
    return () => clearTimeout(timer);
  }, [reload]);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const act = useCallback(
    async (
      action: string,
      data?: unknown,
      programId?: string,
      saved?: boolean,
    ) => {
      if (!workspace.user) {
        setShowAuth(true);
        setMessage("เข้าสู่ระบบเพื่อบันทึกข้อมูล");
        return false;
      }
      setBusy(true);
      try {
        const response = await fetch("/api/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, data, programId, saved }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "บันทึกไม่สำเร็จ");
        await reload();
        setMessage("บันทึกแล้ว");
        return true;
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [workspace.user, reload],
  );

  const mutateApplication = useCallback(
    async (
      app: Application,
      patch: Partial<
        Pick<Application, "status" | "tasks" | "notes" | "targetIntake">
      >,
    ) => {
      setSaveStates((states) => ({ ...states, [app.id]: "saving" }));
      try {
        const response = await fetch("/api/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "application",
            data: {
              id: app.id,
              programId: app.programId,
              expectedVersion: app.version,
              patch,
            },
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          setSaveStates((states) => ({
            ...states,
            [app.id]: response.status === 409 ? "conflict" : "error",
          }));
          throw new Error(result.error ?? "บันทึกไม่สำเร็จ");
        }
        setWorkspace((current) => ({
          ...current,
          applications: current.applications.map((item) =>
            item.id === app.id ? result.application : item,
          ),
        }));
        if (patch.notes !== undefined)
          setNoteDrafts((drafts) => ({ ...drafts, [app.id]: patch.notes! }));
        setSaveStates((states) => ({ ...states, [app.id]: "saved" }));
        return true;
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
        return false;
      }
    },
    [],
  );

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const result =
        authMode === "signup"
          ? await authClient.signUp.email({ name, email, password })
          : await authClient.signIn.email({ email, password });
      if (result.error)
        throw new Error(result.error.message ?? "เข้าสู่ระบบไม่สำเร็จ");
      setShowAuth(false);
      setPassword("");
      await reload();
      setMessage(authMode === "signup" ? "สร้างบัญชีแล้ว" : "เข้าสู่ระบบแล้ว");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    await authClient.signOut();
    await reload();
    setView("explore");
    setForm(localProfile ?? emptyProfile);
    setMessage("ออกจากระบบแล้ว");
  }

  const programs = workspace.programs;
  const profile = workspace.profile ?? localProfile ?? form;
  const hasProfile = Boolean(workspace.profile || localProfile);
  const cities = ["ทั้งหมด", ...new Set(programs.map((p) => p.city))];
  const subjects = ["ทั้งหมด", ...new Set(programs.map((p) => p.subject))];
  const filtered = useMemo(
    () =>
      programs
        .filter((p) => {
          const q = search.trim().toLowerCase();
          return (
            (!q ||
              [p.university, p.chineseName, p.name, p.city, p.subject].some(
                (v) => v.toLowerCase().includes(q),
              )) &&
            (city === "ทั้งหมด" || p.city === city) &&
            (subject === "ทั้งหมด" || p.subject === subject) &&
            (!scholarshipsOnly || p.scholarships.length > 0)
          );
        })
        .sort((a, b) =>
          hasProfile
            ? programMatch(profile, preferences, b).score -
              programMatch(profile, preferences, a).score
            : 0,
        ),
    [
      programs,
      search,
      city,
      subject,
      scholarshipsOnly,
      hasProfile,
      profile,
      preferences,
    ],
  );
  const current = programs.find((p) => p.id === selected) ?? null;
  const scholarships = programs.flatMap((p) =>
    p.scholarships.map((s) => ({ program: p, scholarship: s })),
  );
  const universityCount = new Set(programs.map((p) => p.universityId)).size;
  const hasFilters = Boolean(
    search.trim() ||
    city !== "ทั้งหมด" ||
    subject !== "ทั้งหมด" ||
    scholarshipsOnly,
  );
  const resetFilters = () => {
    setSearch("");
    setCity("ทั้งหมด");
    setSubject("ทั้งหมด");
    setScholarshipsOnly(false);
  };

  const go = (next: View) => {
    setView(next);
    setSelected(null);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const programCard = (p: Program) => {
    const state = admissionState(p);
    const bookmarked = workspace.saved.includes(p.id);
    return (
      <article className="program-row" key={p.id}>
        <div className="program-main">
          <div className="program-top">
            <span className="uni-mark">
              {p.university
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span className="uni-text">
              {p.university}
              <small>{p.chineseName}</small>
            </span>
            <span className={`status status-${state}`}>{label(state, p)}</span>
          </div>
          <button className="program-title" onClick={() => setSelected(p.id)}>
            {p.name}
            <ArrowRight size={17} />
          </button>
          <div className="program-meta">
            <span>
              <MapPin size={15} />
              {p.city}
            </span>
            <span>{p.language === "Chinese" ? "ภาษาจีน" : "ภาษาอังกฤษ"}</span>
            <span>{p.kind === "program" ? "หลักสูตร" : "เส้นทางรับสมัคร"}</span>
            <span>รอบ {p.intake}</span>
          </div>
          <p className="program-description">{p.description}</p>
          {hasProfile && (
            <MatchSummary match={programMatch(profile, preferences, p)} />
          )}
          <p className="program-trust">
            <ShieldCheck size={13} /> ตรวจข้อมูลล่าสุด {date(p.checkedAt)} ·{" "}
            {p.verification === "reviewed" ? "ตรวจทานแล้ว" : "ตรวจทานบางส่วน"}
          </p>
        </div>
        <div className="program-side">
          <div>
            <small>ค่าเรียน</small>
            <strong>{tuitionLabel(p)}</strong>
          </div>
          <div>
            <small>ปิดรับสมัคร</small>
            <strong>{deadlineLabel(p)}</strong>
          </div>
          <div className="row-actions">
            <button
              className={`icon-button ${bookmarked ? "active" : ""}`}
              title={bookmarked ? "นำออกจากที่บันทึก" : "บันทึกตัวเลือก"}
              aria-label={bookmarked ? "นำออกจากที่บันทึก" : "บันทึกตัวเลือก"}
              onClick={() => void act("save", undefined, p.id, !bookmarked)}
            >
              <Bookmark size={19} fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <button className="small-button" onClick={() => setSelected(p.id)}>
              รายละเอียด <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <button className="brand" onClick={() => go("explore")}>
          <span className="brand-symbol">
            <GraduationCap size={22} />
          </span>
          <span>
            Study Abroad <b>OS</b>
            <small>China undergraduate</small>
          </span>
        </button>
        <div className="sidebar-group">
          <span className="sidebar-caption">พื้นที่ทำงาน</span>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${view === t.id ? "selected" : ""}`}
              aria-current={view === t.id ? "page" : undefined}
              onClick={() => go(t.id)}
            >
              <t.icon size={19} />
              <span>{t.label}</span>
              {t.id === "saved" && workspace.saved.length > 0 && (
                <em>{workspace.saved.length}</em>
              )}
              {t.id === "plan" && workspace.applications.length > 0 && (
                <em>{workspace.applications.length}</em>
              )}
            </button>
          ))}
          {workspace.admin && (
            <Link className="nav-item" href="/admin">
              <ShieldCheck size={19} />
              <span>ตรวจทานข้อมูล</span>
            </Link>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="scope-note">
            <ShieldCheck size={20} />
            <span>
              ข้อมูลจากมหาวิทยาลัย
              <br />
              และประกาศทุนทางการ
            </span>
          </div>
          <div className="sidebar-user">
            {workspace.user ? (
              <>
                <span className="avatar">
                  {workspace.user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="user-identity">
                  <b>{workspace.user.name}</b>
                  <small>{workspace.user.email}</small>
                </span>
                <button
                  className="icon-button"
                  title="ออกจากระบบ"
                  aria-label="ออกจากระบบ"
                  onClick={() => void signOut()}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button className="login-side" onClick={() => setShowAuth(true)}>
                <LogIn size={18} /> เข้าสู่ระบบ / สมัครสมาชิก
              </button>
            )}
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="ปิดเมนู"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="content-wrap">
        <header className="topbar">
          <button
            className="menu-button"
            aria-label="เปิดเมนู"
            aria-expanded={mobileNav}
            onClick={() => setMobileNav(true)}
          >
            <Menu size={22} />
          </button>
          <div className="crumb">
            Study Abroad OS <span>/</span>{" "}
            {tabs.find((t) => t.id === view)?.label}
          </div>
          <div className="top-right">
            <span className="scope-chip">ปริญญาตรี · จีน</span>
            {workspace.user ? (
              <button
                className="top-avatar"
                title={workspace.user.name}
                onClick={() => go("profile")}
              >
                {workspace.user.name.slice(0, 1).toUpperCase()}
              </button>
            ) : (
              <button className="top-login" onClick={() => setShowAuth(true)}>
                เข้าสู่ระบบ <ArrowRight size={16} />
              </button>
            )}
          </div>
        </header>
        <main className="content">
          {loading && (
            <p role="status" className="loading-note">
              กำลังโหลดข้อมูลล่าสุด…
            </p>
          )}
          {loadError && (
            <div className="load-error" role="alert">
              <span>
                {loadError} ·
                แสดงข้อมูลที่โหลดได้ล่าสุดหรือชุดข้อมูลที่มากับเว็บ
              </span>
              <button className="small-button" onClick={() => void reload()}>
                ลองโหลดใหม่
              </button>
            </div>
          )}
          {!workspace.configured && (
            <div className="service-banner" role="status">
              <CircleHelp size={18} />
              <span>
                ใช้ชุดข้อมูลที่มากับเว็บพร้อมแหล่งอ้างอิง ·
                โปรไฟล์เก็บบนอุปกรณ์นี้ได้ บัญชีและแผนสมัครรอเชื่อมฐานข้อมูล
              </span>
            </div>
          )}
          {view === "explore" && (
            <>
              {showIntro ? (
                <ProfileIntro
                  profile={profile}
                  preferences={preferences}
                  cities={cities}
                  subjects={subjects}
                  busy={busy}
                  signedIn={Boolean(workspace.user)}
                  onSkip={closeIntro}
                  onSubmit={async (nextProfile, nextPreferences) => {
                    if (workspace.user) {
                      if (!(await act("profile", nextProfile))) return;
                      setPreferences(nextPreferences);
                      try {
                        localStorage.setItem(
                          preferencesKey,
                          JSON.stringify(nextPreferences),
                        );
                      } catch {
                        setMessage(
                          "บันทึกบัญชีแล้ว แต่เก็บตัวกรองบนอุปกรณ์ไม่ได้",
                        );
                      }
                    } else saveLocalProfile(nextProfile, nextPreferences);
                    setScholarshipsOnly(nextPreferences.scholarshipInterest);
                    closeIntro();
                  }}
                />
              ) : (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">DISCOVER CHINA</div>
                      <h1>ค้นหาเส้นทางเรียนต่อจีน</h1>
                      <p>
                        สำรวจหลักสูตรจากมหาวิทยาลัยจีน พร้อมแหล่งข้อมูล
                        และสถานะการตรวจสอบที่เปิดเผยชัดเจน
                      </p>
                    </div>
                    <div className="heading-stat">
                      <strong>{universityCount}</strong>
                      <span>มหาวิทยาลัยในชุดข้อมูล</span>
                    </div>
                  </div>
                  <div className="filter-bar">
                    <div className="discovery-toolbar">
                      <span>
                        {hasProfile
                          ? "เรียงตามความต้องการที่ระบุ · ยังไม่ใช่การรับรองผลสมัคร"
                          : "สำรวจได้ทันที หรือบอกความต้องการเพื่อเรียงตัวเลือก"}
                      </span>
                      <button
                        className="small-button"
                        onClick={() => setShowIntro(true)}
                      >
                        {hasProfile
                          ? "ปรับความต้องการ"
                          : "ช่วยหาตัวเลือกให้ฉัน"}
                      </button>
                    </div>
                    <label className="search-field">
                      <Search size={19} />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหามหาวิทยาลัย สาขา หรือเมือง"
                        aria-label="ค้นหา"
                      />
                    </label>
                    <div className="filters">
                      <span className="filter-icon">
                        <SlidersHorizontal size={18} />
                      </span>
                      <label>
                        <span>เมือง</span>
                        <select
                          value={city}
                          aria-label="กรองเมือง"
                          onChange={(e) => setCity(e.target.value)}
                        >
                          {cities.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                        <ChevronDown size={15} />
                      </label>
                      <label>
                        <span>สาขา</span>
                        <select
                          value={subject}
                          aria-label="กรองสาขา"
                          onChange={(e) => setSubject(e.target.value)}
                        >
                          {subjects.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                        <ChevronDown size={15} />
                      </label>
                    </div>
                  </div>
                  <div className="results-title">
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={scholarshipsOnly}
                        onChange={(event) =>
                          setScholarshipsOnly(event.target.checked)
                        }
                      />
                      มีข้อมูลทุนอ้างอิง
                    </label>
                    <div>
                      <h2>รายการหลักสูตรและเส้นทางรับสมัคร</h2>
                      <span role="status" aria-live="polite">
                        {filtered.length} รายการ
                      </span>
                    </div>
                    <div className="results-meta">
                      <small>
                        อ้างอิงรอบที่ระบุในแต่ละรายการ · เวลาปักกิ่ง
                      </small>
                      {hasFilters && (
                        <button className="text-button" onClick={resetFilters}>
                          ล้างตัวกรอง
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="list">
                    {filtered.map(programCard)}
                    {filtered.length === 0 && (
                      <div className="empty">
                        <Search size={24} />
                        <b>
                          {programs.length
                            ? "ไม่พบรายการที่ตรงกับตัวกรอง"
                            : "ยังไม่มีรายการในชุดข้อมูลนี้"}
                        </b>
                        <p>
                          ลองค้นหาคำอื่น หรือล้างตัวกรองเพื่อดูตัวเลือกทั้งหมด
                        </p>
                        <button onClick={resetFilters}>ล้างตัวกรอง</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          {view === "scholarships" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">FUND YOUR STUDIES</div>
                  <h1>ทุนการศึกษา</h1>
                  <p>
                    ดูสิทธิที่ทุนครอบคลุม เงื่อนไข
                    และวิธียื่นจากประกาศของแต่ละแห่ง
                  </p>
                </div>
                <div className="heading-stat">
                  <strong>{scholarships.length}</strong>
                  <span>รายการทุนอ้างอิง</span>
                </div>
              </div>
              <div className="list scholarship-list">
                {scholarships.map(({ program: p, scholarship: s }) => (
                  <article
                    className="scholarship-row"
                    key={`${p.id}-${s.name}`}
                  >
                    <div>
                      <span className="mini-kicker">
                        {p.university} · {p.city}
                      </span>
                      <h2>{s.name}</h2>
                      <p>{s.coverage}</p>
                      <div className="scholarship-detail">
                        <span>
                          <CalendarDays size={15} /> วันปิดทุน:{" "}
                          {scholarshipDeadlineLabel(p, s.name, s.deadline)}
                        </span>
                        <span>
                          <ShieldCheck size={15} /> {s.conditions}
                        </span>
                      </div>
                      <p className="route-note">วิธียื่น: {s.route}</p>
                      <p className="program-trust">
                        ข้อมูลอ้างอิงจากประกาศเดิม · ตรวจล่าสุด{" "}
                        {date(p.checkedAt)} · ตรวจเงื่อนไขรอบเป้าหมายจากต้นฉบับ
                      </p>
                    </div>
                    <div className="scholarship-links">
                      <button
                        className="small-button"
                        onClick={() => setSelected(p.id)}
                      >
                        ดูหลักสูตร <ArrowRight size={16} />
                      </button>
                      <a
                        href={s.source}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ประกาศทุน <ExternalLink size={15} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          {view === "saved" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR SHORTLIST</div>
                  <h1>ที่บันทึกไว้</h1>
                  <p>เก็บตัวเลือกที่อยากติดตามไว้ในบัญชีของคุณ</p>
                </div>
              </div>
              {!workspace.user ? (
                <EmptyAuth onClick={() => setShowAuth(true)} />
              ) : workspace.saved.length ? (
                <div className="list">
                  {programs
                    .filter((p) => workspace.saved.includes(p.id))
                    .map(programCard)}
                </div>
              ) : (
                <div className="empty">
                  <Bookmark size={25} />
                  <b>ยังไม่มีรายการที่บันทึก</b>
                  <button onClick={() => go("explore")}>
                    ไปสำรวจหลักสูตร <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === "plan" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">APPLICATION JOURNEY</div>
                  <h1>แผนสมัครเรียน</h1>
                  <p>
                    รายการงานและเอกสารสำหรับแต่ละตัวเลือก
                    เก็บความคืบหน้าไว้ในบัญชี
                  </p>
                </div>
              </div>
              {!workspace.user ? (
                <EmptyAuth onClick={() => setShowAuth(true)} />
              ) : workspace.applications.length ? (
                <div className="list">
                  {workspace.applications.map((app) => {
                    const p = programs.find(
                      (item) => item.id === app.programId,
                    );
                    if (!p) return null;
                    const done = app.tasks.filter((t) => t.done).length;
                    const note = noteDrafts[app.id] ?? app.notes;
                    const saveState = saveStates[app.id] ?? "idle";
                    return (
                      <article className="plan-row" key={app.id}>
                        <div className="plan-header">
                          <div>
                            <span className="mini-kicker">
                              {p.university} · {p.city}
                            </span>
                            <h2>{p.name}</h2>
                            <p>
                              เป้าหมายปี {app.targetIntake} · {done}/
                              {app.tasks.length} งานเสร็จแล้ว
                            </p>
                          </div>
                          <button
                            className="icon-button"
                            title="ดูประกาศมหาวิทยาลัย"
                            onClick={() => setSelected(p.id)}
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>
                        <div className="plan-controls">
                          <label>
                            สถานะ
                            <select
                              value={app.status}
                              onChange={(e) =>
                                void mutateApplication(app, {
                                  status: e.target
                                    .value as Application["status"],
                                })
                              }
                            >
                              {Object.entries(statusLabels).map(
                                ([value, text]) => (
                                  <option key={value} value={value}>
                                    {text}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                          <label>
                            ปีเป้าหมาย
                            <input
                              defaultValue={app.targetIntake}
                              pattern="20[0-9]{2}(-[0-9]{2})?"
                              onBlur={(e) => {
                                if (e.target.value !== app.targetIntake)
                                  void mutateApplication(app, {
                                    targetIntake: e.target.value,
                                  });
                              }}
                            />
                          </label>
                        </div>
                        <div className="progress">
                          <span
                            style={{
                              width: `${app.tasks.length ? (done / app.tasks.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <div className="task-list">
                          {app.tasks.map((task, i) => (
                            <label key={task.id} className="task">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() =>
                                  void mutateApplication(app, {
                                    tasks: app.tasks.map((t, j) =>
                                      j === i ? { ...t, done: !t.done } : t,
                                    ),
                                  })
                                }
                              />
                              <span className={task.done ? "done" : ""}>
                                {task.title}
                              </span>
                              <input
                                className="task-date"
                                aria-label={`กำหนดเวลาส่วนตัว ${task.title}`}
                                title="กำหนดเวลาส่วนตัว ไม่ใช่วันปิดรับสมัครทางการ"
                                type="date"
                                value={task.due}
                                onChange={(e) =>
                                  void mutateApplication(app, {
                                    tasks: app.tasks.map((t, j) =>
                                      j === i
                                        ? { ...t, due: e.target.value }
                                        : t,
                                    ),
                                  })
                                }
                              />
                            </label>
                          ))}
                        </div>
                        <label className="notes-label">
                          บันทึกส่วนตัว
                          <textarea
                            value={note}
                            onChange={(e) => {
                              setNoteDrafts((drafts) => ({
                                ...drafts,
                                [app.id]: e.target.value,
                              }));
                              setSaveStates((states) => ({
                                ...states,
                                [app.id]: "idle",
                              }));
                            }}
                            placeholder="คำถาม เอกสารที่ต้องตาม หรือสิ่งที่ต้องตรวจเพิ่มเติม"
                          />
                        </label>
                        <div className="note-actions">
                          <span className={`save-state save-${saveState}`}>
                            {saveState === "saving"
                              ? "กำลังบันทึก"
                              : saveState === "saved"
                                ? "บันทึกแล้ว"
                                : saveState === "conflict"
                                  ? "มีข้อมูลใหม่จากอีกหน้า กรุณาโหลดข้อมูลล่าสุด"
                                  : saveState === "error"
                                    ? "บันทึกไม่สำเร็จ"
                                    : "ยังไม่ได้บันทึก"}
                          </span>
                          {saveState === "conflict" && (
                            <button
                              className="outline-button"
                              onClick={() => void reload()}
                            >
                              โหลดข้อมูลล่าสุด
                            </button>
                          )}
                          <button
                            className="small-button"
                            disabled={
                              saveState === "saving" || note === app.notes
                            }
                            onClick={() =>
                              void mutateApplication(app, { notes: note })
                            }
                          >
                            บันทึกโน้ต
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty">
                  <ClipboardList size={25} />
                  <b>ยังไม่มีแผนสมัคร</b>
                  <button onClick={() => go("explore")}>
                    เลือกหลักสูตรเพื่อเริ่ม <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === "profile" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">STUDENT PROFILE</div>
                  <h1>โปรไฟล์ของคุณ</h1>
                  <p>
                    ใช้ข้อมูลนี้เทียบเงื่อนไขภาษาและวุฒิเบื้องต้นกับมหาวิทยาลัย
                  </p>
                </div>
              </div>
              {!workspace.user && (
                <p className="section-hint">
                  โปรไฟล์นี้เก็บบนอุปกรณ์นี้
                  เข้าสู่ระบบเมื่อพร้อมใช้บัญชีเพื่อเก็บข้อมูลข้ามอุปกรณ์
                </p>
              )}
              <form
                className="profile-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const result = profileSchema.safeParse(form);
                  if (!result.success) {
                    setMessage("กรุณาตรวจข้อมูลโปรไฟล์");
                    return;
                  }
                  if (workspace.user) {
                    void act("profile", result.data).then((saved) => {
                      if (saved) savePreferences(preferences);
                    });
                  } else saveLocalProfile(result.data, preferences);
                }}
              >
                <div className="form-section-title">
                  <span className="section-icon">
                    <UserRound size={20} />
                  </span>
                  <div>
                    <h2>ข้อมูลสำหรับตรวจคุณสมบัติ</h2>
                    <p>ข้อมูลส่วนตัวไม่แสดงต่อผู้ใช้คนอื่น</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label>
                    ชื่อที่ใช้เรียก
                    <input
                      required
                      maxLength={80}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    วุฒิการศึกษา
                    <select
                      value={form.qualification}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          qualification: e.target
                            .value as Profile["qualification"],
                        })
                      }
                    >
                      <option value="m6">มัธยมศึกษาปีที่ 6</option>
                      <option value="ib">IB Diploma</option>
                      <option value="alevel">A-Level</option>
                      <option value="foundation">Foundation</option>
                      <option value="other">อื่น ๆ</option>
                    </select>
                  </label>
                  <label>
                    เกรดเฉลี่ย (เต็ม 4.0)
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={form.gpa ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gpa:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    ปีที่ต้องการเข้าเรียน
                    <input
                      value={form.intake}
                      maxLength={40}
                      onChange={(e) =>
                        setForm({ ...form, intake: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="form-section-title divider">
                  <span className="section-icon">
                    <GraduationCap size={20} />
                  </span>
                  <div>
                    <h2>ผลสอบภาษาและ CSCA</h2>
                    <p>เว้นช่องว่างได้ หากยังไม่ได้สอบ</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label>
                    HSK ระดับ
                    <select
                      value={form.hskLevel ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          hskLevel: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    >
                      <option value="">ยังไม่มี</option>
                      {[1, 2, 3, 4, 5, 6].map((x) => (
                        <option key={x} value={x}>
                          HSK {x}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    HSK คะแนน
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={form.hskScore ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          hskScore:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    วันที่สอบ HSK
                    <input
                      type="date"
                      value={form.hskDate}
                      onChange={(e) =>
                        setForm({ ...form, hskDate: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    IELTS รวม
                    <input
                      type="number"
                      min="0"
                      max="9"
                      step="0.5"
                      value={form.ielts ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ielts:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    IELTS ทักษะที่ต่ำสุด
                    <input
                      type="number"
                      min="0"
                      max="9"
                      step="0.5"
                      value={form.ieltsMinBand ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ieltsMinBand:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    วันที่สอบ IELTS
                    <input
                      type="date"
                      value={form.ieltsDate}
                      onChange={(e) =>
                        setForm({ ...form, ieltsDate: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    CSCA
                    <select
                      value={form.csca}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          csca: e.target.value as Profile["csca"],
                        })
                      }
                    >
                      <option value="not-yet">ยังไม่ได้สอบ</option>
                      <option value="taken">สอบแล้ว</option>
                      <option value="unknown">ไม่แน่ใจ</option>
                    </select>
                  </label>
                  <label>
                    วิชา CSCA ที่สอบ
                    <input
                      value={form.cscaSubjects.join(", ")}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          cscaSubjects: e.target.value
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="เช่น Mathematics, Physics"
                    />
                  </label>
                  <label>
                    ภาษาข้อสอบ CSCA
                    <select
                      value={form.cscaLanguage}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          cscaLanguage: e.target
                            .value as Profile["cscaLanguage"],
                        })
                      }
                    >
                      <option value="unknown">ไม่แน่ใจ</option>
                      <option value="Chinese">ภาษาจีน</option>
                      <option value="English">ภาษาอังกฤษ</option>
                    </select>
                  </label>
                  <label>
                    วันที่สอบ CSCA
                    <input
                      type="date"
                      value={form.cscaExamDate}
                      onChange={(e) =>
                        setForm({ ...form, cscaExamDate: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    คะแนน CSCA (ถ้ามี)
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={form.cscaScore ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          cscaScore:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                <div className="form-grid preference-fields">
                  <label>
                    สาขาที่สนใจ
                    <select
                      value={form.subject}
                      onChange={(event) =>
                        setForm({ ...form, subject: event.target.value })
                      }
                    >
                      <option value="">ยังไม่แน่ใจ / ทุกสาขา</option>
                      {subjects
                        .filter((value) => value !== "ทั้งหมด")
                        .map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                    </select>
                  </label>
                  <label>
                    งบค่าเรียนต่อปี (CNY, ไม่รวมค่าครองชีพ)
                    <input
                      type="number"
                      min={0}
                      max={20000000}
                      value={form.budget ?? ""}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          budget:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={busy}
                >
                  <Check size={18} /> บันทึกโปรไฟล์
                </button>
              </form>
              {localProfile && (
                <button
                  className="text-button forget-profile"
                  onClick={() => {
                    try {
                      localStorage.removeItem(profileKey);
                      localStorage.removeItem(preferencesKey);
                    } catch {
                      /* Clear the current session too. */
                    }
                    setLocalProfile(null);
                    setPreferences(defaultPreferences);
                    setScholarshipsOnly(false);
                    setForm(workspace.profile ?? emptyProfile);
                    setMessage("ลบโปรไฟล์บนอุปกรณ์นี้แล้ว");
                  }}
                >
                  ลบโปรไฟล์บนอุปกรณ์นี้
                </button>
              )}
            </>
          )}
          {view === "settings" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">APP SETTINGS</div>
                  <h1>ตั้งค่า</h1>
                  <p>ปรับความต้องการที่ใช้เรียงคำแนะนำมหาวิทยาลัย</p>
                </div>
              </div>
              <section className="profile-form">
                <div className="form-section-title">
                  <span className="section-icon">
                    <SlidersHorizontal size={20} />
                  </span>
                  <div>
                    <h2>ความต้องการในการค้นหา</h2>
                    <p>เลือกภาษาเรียนที่สนใจ แล้วบันทึกไว้บนอุปกรณ์นี้</p>
                  </div>
                </div>
                <div className="form-grid">
                  <label>
                    ภาษาเรียนที่สนใจ
                    <select
                      aria-label="ภาษาเรียนที่สนใจ"
                      value={preferences.language}
                      onChange={(event) =>
                        setPreferences({
                          ...preferences,
                          language: event.target
                            .value as Preferences["language"],
                        })
                      }
                    >
                      <option value="ทั้งหมด">ทั้งหมด</option>
                      <option value="Chinese">ภาษาจีน</option>
                      <option value="English">ภาษาอังกฤษ</option>
                    </select>
                  </label>
                </div>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => savePreferences(preferences)}
                >
                  <Check size={18} /> บันทึกการตั้งค่า
                </button>
              </section>
            </>
          )}
          <footer className="footer">
            <span>Study Abroad OS · China undergraduate</span>
            <span>
              ข้อมูลประกาศรับสมัครเปลี่ยนได้ กรุณาเปิดแหล่งทางการก่อนยื่นสมัคร
            </span>
          </footer>
        </main>
      </div>
      {current && !showAuth && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <section
            className="detail-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`รายละเอียด ${current.name}`}
          >
            <div className="detail-head">
              <button className="back-button" onClick={() => setSelected(null)}>
                <ArrowLeft size={18} /> กลับ
              </button>
              <button
                className="icon-button"
                title="ปิด"
                aria-label="ปิด"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="detail-body">
              <div className="eyebrow">
                {current.university} · {current.city}
              </div>
              <h2>{current.name}</h2>
              <p className="detail-uni">{current.chineseName}</p>
              <div className="detail-chips">
                <span>
                  {current.language === "Chinese"
                    ? "สอนภาษาจีน"
                    : "สอนภาษาอังกฤษ"}
                </span>
                <span>รอบ {current.intake}</span>
                <span>{stateLabels[admissionState(current)]}</span>
              </div>
              <p className="detail-intro">{current.description}</p>
              <div className="fact-grid">
                <div>
                  <small>ค่าเรียน</small>
                  <strong>{tuitionLabel(current)}</strong>
                  <span>
                    {verifiedValue(current, "tuition", current.tuition)
                      ? current.feeNote
                      : "ค่าเรียนเฉพาะหลักสูตรและรอบนี้ยังรอตรวจสอบจากประกาศต้นฉบับ"}
                  </span>
                </div>
                <div>
                  <small>ปิดรับสมัคร</small>
                  <strong>{deadlineLabel(current)}</strong>
                  <span>{current.deadlineNote}</span>
                </div>
              </div>
              <section className="detail-section">
                <h3>เทียบคุณสมบัติเบื้องต้น</h3>
                {hasProfile ? (
                  <>
                    <p className="section-hint">
                      {eligibility(profile, current).status}
                    </p>
                    {eligibility(profile, current).checks.map((c) => (
                      <div className="check-row" key={c.label}>
                        <span className={`check-mark check-${c.state}`}>
                          {c.state === "pass" ? (
                            <Check size={14} />
                          ) : c.state === "gap" ? (
                            "!"
                          ) : (
                            "?"
                          )}
                        </span>
                        <div>
                          <strong>{c.label}</strong>
                          <p>{c.detail}</p>
                          {c.source && (
                            <a
                              href={c.source}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              หลักฐานของเงื่อนไข <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="profile-prompt">
                    <CircleHelp size={20} />
                    <span>กรอกโปรไฟล์เพื่อเทียบ HSK, IELTS และ CSCA</span>
                    <button
                      onClick={() => {
                        setSelected(null);
                        go("profile");
                      }}
                    >
                      ไปที่โปรไฟล์ <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </section>
              <section className="detail-section">
                <h3>เอกสารและเงื่อนไข</h3>
                <p className="section-hint">{current.academicNote}</p>
                <div className="doc-list">
                  {current.documents.map((d) => (
                    <div key={d}>
                      <CheckCircle2 size={16} />
                      {d}
                    </div>
                  ))}
                </div>
              </section>
              <section className="detail-section">
                <h3>ทุนที่เกี่ยวข้อง</h3>
                {current.scholarships.length ? (
                  current.scholarships.map((s) => (
                    <div className="mini-scholarship" key={s.name}>
                      <strong>{s.name}</strong>
                      <p>{s.coverage}</p>
                      <small>{s.conditions}</small>
                      <div>
                        วันปิดทุน:{" "}
                        {scholarshipDeadlineLabel(current, s.name, s.deadline)}
                      </div>
                      <small>
                        ข้อมูลอ้างอิงจากประกาศเดิม
                        ต้องตรวจสิทธิและรอบเป้าหมายอีกครั้ง
                      </small>
                      <a
                        href={s.source}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        อ่านประกาศทุน <ExternalLink size={14} />
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="section-hint">
                    ยังไม่พบทุนที่ยืนยันว่าใช้กับเส้นทางนี้
                    ตรวจทุนกับมหาวิทยาลัยโดยตรง
                  </p>
                )}
              </section>
              <section className="source-section">
                <ShieldCheck size={18} />
                <div>
                  <b>แหล่งทางการ</b>
                  <p>
                    ตรวจข้อมูลล่าสุด {date(current.checkedAt)} ·{" "}
                    {current.verification === "reviewed"
                      ? "ตรวจทานแล้ว"
                      : "ตรวจทานบางส่วน"}
                  </p>
                  <p>{current.reviewNote}</p>
                  <div className="official-link-list">
                    {officialLinksForProgram(current).map((link) => (
                      <a
                        href={link.url}
                        key={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label} <ExternalLink size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            </div>
            <div className="detail-actions">
              <button
                className="outline-button"
                onClick={() =>
                  void act(
                    "save",
                    undefined,
                    current.id,
                    !workspace.saved.includes(current.id),
                  )
                }
              >
                <Bookmark
                  size={17}
                  fill={
                    workspace.saved.includes(current.id)
                      ? "currentColor"
                      : "none"
                  }
                />
                {workspace.saved.includes(current.id)
                  ? "บันทึกแล้ว"
                  : "บันทึกตัวเลือก"}
              </button>
              <label className="start-intake">
                ปีเป้าหมาย
                <input
                  value={form.intake}
                  pattern="20[0-9]{2}(-[0-9]{2})?"
                  onChange={(e) => setForm({ ...form, intake: e.target.value })}
                />
              </label>
              <button
                className="primary-button"
                disabled={busy}
                onClick={async () => {
                  if (!workspace.user) {
                    setShowAuth(true);
                    return;
                  }
                  setBusy(true);
                  try {
                    const response = await fetch("/api/workspace", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "start",
                        programId: current.id,
                        targetIntake: form.intake,
                      }),
                    });
                    const result = await response.json();
                    if (!response.ok)
                      throw new Error(result.error ?? "สร้างแผนไม่สำเร็จ");
                    await reload();
                    setSelected(null);
                    go("plan");
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "สร้างแผนไม่สำเร็จ",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <ClipboardList size={17} /> สร้างแผนสมัคร
              </button>
            </div>
          </section>
        </div>
      )}
      {showAuth && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <section
            className="auth-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="เข้าสู่ระบบ"
          >
            <div className="auth-top">
              <span className="section-icon">
                <LockKeyhole size={20} />
              </span>
              <button
                className="icon-button"
                aria-label="ปิด"
                onClick={() => setShowAuth(false)}
              >
                <X size={20} />
              </button>
            </div>
            <h2>{authMode === "signin" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</h2>
            <p>บันทึกตัวเลือกและติดตามแผนสมัครของคุณ</p>
            {!workspace.configured && (
              <p role="status">
                ระบบบัญชีรอเชื่อมฐานข้อมูล
                คุณค้นหาและเก็บโปรไฟล์บนอุปกรณ์นี้ได้ก่อน
              </p>
            )}
            <form
              onSubmit={(e) => {
                if (!workspace.configured) {
                  e.preventDefault();
                  return;
                }
                void submitAuth(e);
              }}
            >
              {authMode === "signup" && (
                <label>
                  ชื่อ
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              <label>
                อีเมล
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                รหัสผ่าน
                <input
                  type="password"
                  minLength={12}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    authMode === "signup" ? "อย่างน้อย 12 ตัวอักษร" : ""
                  }
                />
              </label>
              <button
                type="submit"
                className="primary-button"
                disabled={busy || !workspace.configured}
              >
                {authMode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}{" "}
                <ArrowRight size={17} />
              </button>
            </form>
            <button
              className="auth-switch"
              onClick={() =>
                setAuthMode(authMode === "signin" ? "signup" : "signin")
              }
            >
              {authMode === "signin"
                ? "ยังไม่มีบัญชี? สมัครสมาชิก"
                : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
            </button>
          </section>
        </div>
      )}
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="ปิดแจ้งเตือน" onClick={() => setMessage("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyAuth({ onClick }: { onClick: () => void }) {
  return (
    <div className="empty">
      <LockKeyhole size={24} />
      <b>เข้าสู่ระบบเพื่อใช้พื้นที่ส่วนตัว</b>
      <p>ตัวเลือกและแผนสมัครจะบันทึกไว้กับบัญชีของคุณ</p>
      <button onClick={onClick}>
        เข้าสู่ระบบ <ArrowRight size={15} />
      </button>
    </div>
  );
}
