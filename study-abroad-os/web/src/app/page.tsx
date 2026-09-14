const programs = [
  {
    name: "BSc Computer Science",
    university: "University of Manchester",
    country: "United Kingdom",
    scholarship: "Global Futures Scholarship",
    fit: "92%",
    deadline: "15 Jan 2027",
  },
  {
    name: "Bachelor of Business Analytics",
    university: "Monash University",
    country: "Australia",
    scholarship: "International Merit Award",
    fit: "87%",
    deadline: "30 Nov 2026",
  },
  {
    name: "BEng Software Engineering",
    university: "University of Waterloo",
    country: "Canada",
    scholarship: "Entrance Scholarship",
    fit: "81%",
    deadline: "1 Feb 2027",
  },
];

const checklist = [
  "สร้างโปรไฟล์นักเรียน",
  "เทียบคุณสมบัติกับหลักสูตร",
  "บันทึกมหาวิทยาลัยที่สนใจ",
  "เช็กทุนและ deadline",
  "เตรียมเอกสารสมัคร",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#1c1b18]">
      <section className="border-b border-[#ded7ca] bg-[#fffaf0]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f5d3f]">
              Study Abroad OS
            </p>
            <h1 className="text-xl font-bold">เส้นทางเรียนต่อต่างประเทศของคุณ</h1>
          </div>
          <a
            href="#matches"
            className="rounded-md bg-[#123b3a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f2f2e]"
          >
            ดูตัวเลือกที่เหมาะ
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="mb-4 w-fit rounded-full border border-[#d8c8a8] bg-white px-4 py-2 text-sm font-medium text-[#6f5d3f]">
            MVP สำหรับนักเรียนไทยที่อยากสมัครเองอย่างมั่นใจ
          </p>
          <h2 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            จากข้อมูลกระจัดกระจาย เป็นแผนสมัครเรียนที่ทำตามได้ทีละขั้น
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5d5850]">
            ค้นหามหาวิทยาลัย หลักสูตร และทุนที่เหมาะกับโปรไฟล์ของคุณ พร้อม checklist
            เอกสาร deadline และแหล่งข้อมูลทางการในที่เดียว
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Discover", "Decide", "Apply"].map((item) => (
              <div key={item} className="rounded-lg border border-[#ded7ca] bg-white p-4">
                <p className="text-sm text-[#6f5d3f]">Pillar</p>
                <p className="mt-1 text-lg font-bold">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#ded7ca] bg-white p-5 shadow-sm">
          <div className="rounded-md bg-[#123b3a] p-5 text-white">
            <p className="text-sm text-[#c4d8d2]">Student profile</p>
            <h3 className="mt-2 text-2xl font-bold">เด็กไทย ม.6 สาย STEM</h3>
            <p className="mt-3 text-sm leading-6 text-[#dce8e5]">
              สนใจ Computer Science ใน UK, Australia หรือ Canada ต้องการทุนบางส่วน
              และอยากรู้ว่าควรเริ่มสมัครที่ไหนก่อน
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-[#f7f4ee] p-4">
              <p className="text-sm text-[#6f5d3f]">Budget</p>
              <p className="mt-1 font-bold">1.2M THB / year</p>
            </div>
            <div className="rounded-md bg-[#f7f4ee] p-4">
              <p className="text-sm text-[#6f5d3f]">Target intake</p>
              <p className="mt-1 font-bold">Sep 2027</p>
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-3 font-semibold">Application checklist</p>
            <div className="space-y-3">
              {checklist.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 rounded-md border border-[#e7dfd3] p-3"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#123b3a]"
                    defaultChecked={item.length % 2 === 0}
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="matches" className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f5d3f]">
              Matching results
            </p>
            <h2 className="mt-2 text-3xl font-bold">หลักสูตรที่ควรเริ่มดูตอนนี้</h2>
          </div>
          <div className="rounded-md border border-[#ded7ca] bg-white px-4 py-3 text-sm text-[#5d5850]">
            กรองตามประเทศ ทุน งบประมาณ และ deadline
          </div>
        </div>

        <div className="grid gap-4">
          {programs.map((program) => (
            <article
              key={`${program.university}-${program.name}`}
              className="grid gap-4 rounded-lg border border-[#ded7ca] bg-white p-5 shadow-sm md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-sm font-medium text-[#6f5d3f]">{program.country}</p>
                <h3 className="mt-1 text-xl font-bold">{program.name}</h3>
                <p className="mt-1 text-[#5d5850]">{program.university}</p>
                <p className="mt-4 text-sm text-[#5d5850]">
                  ทุนที่เกี่ยวข้อง:{" "}
                  <span className="font-semibold text-[#1c1b18]">{program.scholarship}</span>
                </p>
              </div>
              <div className="flex min-w-44 flex-col justify-between rounded-md bg-[#f7f4ee] p-4">
                <div>
                  <p className="text-sm text-[#6f5d3f]">Profile fit</p>
                  <p className="mt-1 text-3xl font-bold">{program.fit}</p>
                </div>
                <p className="mt-4 text-sm text-[#5d5850]">Deadline: {program.deadline}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
