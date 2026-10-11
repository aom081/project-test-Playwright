# Test Dashboard for Playwright

โปรเจกต์นี้เป็นแดชบอร์ด React + Vite ที่ออกแบบมาเพื่อใช้ทดสอบด้วย Playwright โดยเฉพาะ มีองค์ประกอบที่โต้ตอบได้หลายแบบ เช่น ฟิลเตอร์ช่วงเวลา, ช่องค้นหา, ปุ่มสลับมุมมอง, ตารางที่เลือกแถวได้ และแผง inspector สำหรับดูรายละเอียดรายการที่เลือก

## สิ่งที่อยู่ในแดชบอร์ด

- สรุป KPI 4 ตัว เช่น รายได้, ผู้ใช้, latency, และ incident
- กราฟแท่งแสดงแนวโน้มตามช่วงเวลา 7 วัน, 30 วัน, และ 90 วัน
- ฟีดกิจกรรมล่าสุดสำหรับจำลองข้อมูลแบบ live
- ตารางรายการคำสั่งซื้อที่กรองด้วย segment และคำค้นหาได้
- แผง inspector ที่แสดงรายละเอียดรายการที่เลือก พร้อมปุ่ม action สำหรับทดลอง interaction

## โครงสร้างโฟลเดอร์

- [src/dashboard/Dashboard.tsx](src/dashboard/Dashboard.tsx) คือคอมโพเนนต์แดชบอร์ดหลัก
- [src/dashboard/Dashboard.css](src/dashboard/Dashboard.css) คือสไตล์ของแดชบอร์ด
- [tests/dashboard.spec.ts](tests/dashboard.spec.ts) คือ Playwright e2e test
- [playwright.config.ts](playwright.config.ts) คือการตั้งค่า Playwright

## เทสต์ที่มีอยู่

- `tests/dashboard.spec.ts` — 11 เทสต์เดิม (TC-01 ถึง TC-22 ใน SPRS-Test-Cases)
- `tests/dashboard-extended.spec.ts` — 15 test case ใหม่ (TC-23 ถึง TC-37) แยกกลุ่มด้วย tag
- รายละเอียดทั้งหมดดูที่ [docs/TEST-PLAN.md](docs/TEST-PLAN.md)

## คำสั่งรัน

- ติดตั้ง dependency: `npm install`
- เปิดโหมดพัฒนา: `npm run dev`
- build โปรเจกต์: `npm run build`
- รัน Playwright tests: `npm run test:e2e`
- รัน Playwright แบบเห็น browser: `npm run test:e2e:headed`
 - รันเทสต์เฉพาะไฟล์แดชบอร์ด (ตัวอย่าง): `npm run test:e2e -- tests/dashboard.spec.ts --project chromium`

## หมายเหตุ

- Playwright รัน dev server อัตโนมัติผ่าน `webServer` ใน `playwright.config.ts` (ข้ามเมื่อกำหนด `BASE_URL`)
- หากยังไม่ได้ติดตั้ง browser ของ Playwright ให้รัน `npx playwright install chromium` ก่อน

## การจับภาพหน้าจอ / วิดีโอ / trace

ตั้งค่าใน `playwright.config.ts` แล้ว: screenshot และ video เก็บเฉพาะเมื่อเทสต์ล้มเหลว, trace เก็บเมื่อ retry ครั้งแรก
ผลลัพธ์อยู่ใน `test-results/` และรายงาน HTML อยู่ใน `playwright-report/` (เปิดด้วย `npm run test:e2e:report`)

## Test run options

| Goal | Command |
| --- | --- |
| Everything, all browsers | `npm run test:e2e` |
| Chromium only (fast) | `npm run test:e2e:chromium` |
| By area | `npm run test:e2e:functional` / `:chart` / `:a11y` / `:responsive` |
| Against the deployed site | PowerShell: `$env:BASE_URL="https://project-test-playwright.vercel.app"; npm run test:e2e` |
| Install browsers (first time) | `npm run test:e2e:install` |

When `BASE_URL` is not set, Playwright starts the Vite dev server itself on `http://127.0.0.1:4173`.
