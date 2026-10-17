"use client";

import { useState } from "react";
import { emptyProfile, profileSchema, type Profile } from "@/lib/domain";
import type { Preferences } from "@/lib/discovery";

type Props = {
  profile: Profile;
  preferences: Preferences;
  cities: string[];
  subjects: string[];
  busy?: boolean;
  signedIn?: boolean;
  onSubmit: (profile: Profile, preferences: Preferences) => void;
  onSkip: () => void;
};
export function ProfileIntro({
  profile,
  preferences,
  cities,
  subjects,
  busy,
  signedIn,
  onSubmit,
  onSkip,
}: Props) {
  const [draft, setDraft] = useState(profile);
  const [filters, setFilters] = useState(preferences);
  const [error, setError] = useState("");
  return (
    <section className="intro-panel" aria-labelledby="intro-title">
      <div className="eyebrow">เริ่มจากสิ่งที่คุณต้องการ</div>
      <h1 id="intro-title">เส้นทางเรียนต่อจีนของคุณ</h1>
      <p>
        กรอกเท่าที่ทราบ เราจะเรียงตัวเลือกพร้อมเหตุผลให้คุณ
        ข้ามไปค้นหาเองได้เสมอ
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const result = profileSchema.safeParse({
            ...emptyProfile,
            ...draft,
            name: draft.name.trim() || "ผู้สมัคร",
          });
          if (!result.success) {
            setError("กรุณาตรวจปีเข้าเรียน เกรด และงบประมาณ");
            return;
          }
          onSubmit(result.data, filters);
        }}
      >
        <div className="form-grid">
          <label>
            ชื่อที่ใช้เรียก (เว้นได้)
            <input
              maxLength={80}
              value={draft.name === "ผู้สมัคร" ? "" : draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
              autoComplete="nickname"
            />
          </label>
          <label>
            วุฒิการศึกษา
            <select
              value={draft.qualification}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  qualification: event.target.value as Profile["qualification"],
                })
              }
            >
              <option value="m6">มัธยมศึกษาปีที่ 6</option>
              <option value="ib">IB Diploma</option>
              <option value="alevel">A-Level</option>
              <option value="foundation">Foundation</option>
              <option value="other">อื่น ๆ / ยังไม่แน่ใจ</option>
            </select>
          </label>
          <label>
            เกรดเฉลี่ยเต็ม 4.0 (เว้นได้)
            <input
              type="number"
              min={0}
              max={4}
              step="0.01"
              value={draft.gpa ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  gpa:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            ปีที่ต้องการเข้าเรียน
            <input
              required
              pattern="20[0-9]{2}(-[0-9]{2})?"
              placeholder="เช่น 2027"
              value={draft.intake}
              onChange={(event) =>
                setDraft({ ...draft, intake: event.target.value })
              }
            />
          </label>
          <label>
            สาขาที่สนใจ
            <select
              value={draft.subject}
              onChange={(event) =>
                setDraft({ ...draft, subject: event.target.value })
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
            งบค่าเรียนต่อปี (CNY, เว้นได้)
            <input
              type="number"
              min={0}
              max={20000000}
              value={draft.budget ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  budget:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            เมืองที่สนใจ
            <select
              value={filters.city}
              onChange={(event) =>
                setFilters({ ...filters, city: event.target.value })
              }
            >
              {cities.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={filters.scholarshipInterest}
            onChange={(event) =>
              setFilters({
                ...filters,
                scholarshipInterest: event.target.checked,
              })
            }
          />
          แสดงเฉพาะรายการที่มีข้อมูลทุนอ้างอิง (ต้องตรวจสิทธิอีกครั้ง)
        </label>
        <p className="section-hint">
          งบนี้เทียบเฉพาะค่าเรียนที่มีหลักฐาน ไม่รวมที่พักและค่าครองชีพ
          คะแนนภาษาและความสนใจทุนเพิ่มได้ในหน้าโปรไฟล์
        </p>
        <p className="section-hint">
          {signedIn
            ? "โปรไฟล์บันทึกในบัญชี ส่วนเมืองและตัวกรองเก็บบนอุปกรณ์นี้"
            : "ข้อมูลนี้เก็บบนอุปกรณ์นี้ คุณแก้ไขหรือลบได้ในหน้าโปรไฟล์"}
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="intro-actions">
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "กำลังบันทึก…" : "ดูตัวเลือกของฉัน"}
          </button>
          <button type="button" className="outline-button" onClick={onSkip}>
            ข้ามไปค้นหา
          </button>
        </div>
      </form>
    </section>
  );
}
