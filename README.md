# Smart Packing List (เว็บจัดกระเป๋าตามสภาพอากาศอัจฉริยะ) ✈️🎒🌤️

> **Created By Panusbodee** ([@panusbodee-owen](https://github.com/panusbodee-owen))

เว็บแอปพลิเคชันสำหรับนักเดินทางที่ช่วยวิเคราะห์สภาพอากาศของเมืองปลายทาง สร้างรายการจัดกระเป๋าอัตโนมัติ คำนวณงบประมาณทริป และจำลองชั่งน้ำหนักสัมภาระเทียบกับโควตาสายการบิน พร้อมระบบสลับธีมสีและโหมดมืด (Dark Mode)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. 🌤️ Weather Forecast & Geocoding API
- เชื่อมต่อ **Open-Meteo API** ฟรี 100% ไม่ต้องใช้ API Key
- ค้นหาเมืองได้ทั่วโลก (รวมถึงภาษาไทย เช่น "โตเกียว", "โซล", "เชียงใหม่", "ปารีส") มีระบบ Auto-complete
- ดึงพยากรณ์อากาศล่วงหน้ารายวันแบบตรงกับช่วงวันที่เดินทาง (Start Date - End Date)
- แสดงอุณหภูมิต่ำสุด/สูงสุด, โอกาสเกิดฝน (%), ปริมาณน้ำฝน และไอคอนสภาพอากาศ

### 2. 🎒 Smart Packing Checklist (คำนวณอัตโนมัติตามอากาศ)
- **ปรับตามสภาพอากาศ**: หนาวจัด (<4°C แนะนำเสื้อขนเป็ด/Heattech/รองเท้าลุยหิมะ), หนาวเย็น (เสื้อกันหนาว/ผ้าพันคอ), ร้อน (เสื้อผ้าระบายอากาศ/ครีมกันแดด/แว่นกันแดด), ฝนตก (ร่มพับ/เสื้อกันฝน/ซองกันน้ำ)
- **ปรับตามจำนวนวัน**: สเกลจำนวนเสื้อ กางเกง ชุดชั้นใน และถุงเท้าตามจำนวนวัน
- **Dynamic UX**: ติ๊กเลือกของพร้อมขีดฆ่า, แถบ Progress Bar คำนวณ % การจัดเสร็จแบบ Real-time, เพิ่มของเอง, ลบรายการ

### 3. ⚖️ Luggage Weight Scale (จำลองและชั่งน้ำหนักกระเป๋า)
- โควตาสายการบินยอดนิยม: ถือขึ้นเครื่อง (Carry-on 7 kg), โหลดใต้เครื่อง (15 kg, 20 kg, 23 kg, 30 kg)
- คิดน้ำหนักสัมภาระแต่ละชิ้นและน้ำหนักกระเป๋าเปล่า
- แถบ Gauge แสดงน้ำหนักปัจจุบันเทียบกับโควตา และคำนวณ **"พื้นที่เหลือน้ำหนักสำหรับช้อปปิ้งของฝาก"** 🛍️
- ระบบแจ้งเตือนสีแดงทันทีเมื่อน้ำหนักเกินโควตาสายการบิน

### 4. 💰 Trip Budget & Live Currency Rates (คำนวณงบประมาณ & จองตั๋ว)
- เชื่อมต่ออัตราแลกเปลี่ยนเงินตราระหว่างประเทศแบบสดใหม่ (Live Interbank Exchange Rates)
- คำนวณค่าเครื่องบิน, โรงแรม, ค่ากิน, กิจกรรม, ช้อปปิ้ง และเงินสำรอง
- แสดงยอดรวมเป็นเงินบาท (THB) และแปลงเป็นสกุลเงินท้องถิ่น (JPY, KRW, EUR, USD, SGD ฯลฯ)
- ทางลัดเปิดค้นหาตั๋วเครื่องบิน (Google Flights) และโรงแรม (Agoda) แบบระบุวันเดินทางอัตโนมัติ

### 5. 🎨 Theme Customization & Dark Mode (ปรับแต่งธีม)
- **Dark Mode / Light Mode**: สลับโหมดมืด-สว่างได้ง่ายดายด้วยปุ่มเดียว ถนอมสายตาเวลากลางคืน
- **Accent Color Themes**: เลือกโทนสีที่ชอบได้ 4 สไตล์:
  - 🌊 **Ocean Blue** (ค่าเริ่มต้น)
  - 🌅 **Sunset Orange**
  - 🌲 **Forest Green**
  - 🍇 **Royal Purple**

### 6. 🔍 Search Engine Optimization (SEO & Social Sharing)
- **Meta Tags & Open Graph**: ตั้งค่า Title, Description, Canonical URL, Keywords และ Open Graph / Twitter Card ครบถ้วน
- **Schema.org Structured Data**: ใส่ JSON-LD WebApplication และ TravelApplication เพื่อรองรับ Google Rich Snippets
- **Crawlers Support**: มี `sitemap.xml` และ `robots.txt` พร้อม Favicon (SVG) และภาพปก Social Share Image (1200x630)

---

## 🔗 ช่องทางการเข้าใช้งาน

- **🌐 ใช้งานออนไลน์ (GitHub Pages)**: [https://panusbodee-owen.github.io/smart-packing-list/](https://panusbodee-owen.github.io/smart-packing-list/)
- **💻 รันบนเครื่อง Local**: `http://localhost:3000`
- **🐙 Source Code**: [https://github.com/panusbodee-owen/smart-packing-list](https://github.com/panusbodee-owen/smart-packing-list)

---

## 👨‍💻 ผู้พัฒนา (Author)
**Created By Panusbodee**  
GitHub: [@panusbodee-owen](https://github.com/panusbodee-owen)
