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

ตอนนี้มี Playwright e2e test 3 เคสใน [tests/dashboard.spec.ts](tests/dashboard.spec.ts)

1. ตรวจการแสดงผลเริ่มต้นและการสลับช่วงเวลา `30 days`, `90 days`, และ `7 days`
2. ตรวจการกรองตารางด้วย segment `SMB` / `Enterprise` / `All` และการค้นหาด้วยคำว่า `Orbital`
3. ตรวจการเลือกแถวในตาราง, การอัปเดต inspector, action ในแผงรายละเอียด, และการสลับ compact view

## คำสั่งรัน

- ติดตั้ง dependency: `npm install`
- เปิดโหมดพัฒนา: `npm run dev`
- build โปรเจกต์: `npm run build`
- รัน Playwright tests: `npm run test:e2e`
- รัน Playwright แบบเห็น browser: `npm run test:e2e:headed`
 - รันเทสต์เฉพาะไฟล์แดชบอร์ด (ตัวอย่าง): `npm run test:e2e -- tests/dashboard.spec.ts --project chromium`

## หมายเหตุ

- Playwright ถูกตั้งค่าให้รัน dev server อัตโนมัติผ่าน `playwright.config.ts`
- หากยังไม่ได้ติดตั้ง browser ของ Playwright ให้รัน `npx playwright install chromium` ก่อน

## การจับภาพหน้าจอขณะรันเทสต์

- ขณะนี้โค้ดเทสต์ถูกตั้งค่าให้บันทึกภาพหน้าจอเฉพาะเมื่อเทสต์ล้มเหลว (หลังทดสอบแต่ละเคสจะเรียก `afterEach` เพื่อตรวจสถานะ)
- ไฟล์ภาพจะถูกเก็บที่โฟลเดอร์ `tests/img` โดยตั้งชื่อตามรูปแบบ: `tests/img/<test-title>-<timestamp>.png` (เครื่องหมายไม่อนุญาตในชื่อเทสต์จะถูกแทนด้วย `_`)
- มีเทสต์ตัวอย่างที่ล้มเหลวตั้งใจไว้ชื่อ `intentional failure to trigger screenshot` เพื่อให้เห็นตัวอย่างไฟล์ภาพที่ถูกบันทึกหลังการรัน
- หากต้องการเปลี่ยนเป็นบันทึกภาพทุกเคส ให้ปรับตำแหน่งที่เรียก `page.screenshot()` ภายในเทสต์แต่ละเคส หรือตั้งค่า `afterEach` ให้ไม่เช็กสถานะก่อนบันทึก

ตัวอย่างคำสั่งรันเทสต์ (จะบันทึกภาพเฉพาะเมื่อเทสต์ล้มเหลว):

```bash
npm run test:e2e -- tests/dashboard.spec.ts --project chromium
```
npx playwright install
