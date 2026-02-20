# 🌍 AllTime Clock

A lightweight, offline-first Chrome / Microsoft Edge extension designed for professionals managing global time zones.

AllTime Clock functions as a compact world-time meeting planner directly in your browser.

No backend.  
No login.  
No data tracking.  
Fully client-side.

---

## 🚀 What It Does

AllTime Clock allows you to:

- 🌎 Add and manage multiple global business hubs  
- 🕒 View live local time (updates every second)  
- 🔁 Convert time instantly between countries  
- ✏️ Edit time in any country and auto-sync all others  
- 📅 Plan international meetings efficiently  
- 🌗 Switch between Light and Dark mode  

Built using native `Intl.DateTimeFormat` for accurate timezone handling and automatic daylight saving adjustments.

---

## 🧩 Core Features

### 🌎 Multi-Country Live Clock
- Searchable dropdown country selection  
- Displays country, city, current time, timezone abbreviation  
- Shows relative time difference (e.g., +4.5 hrs)  
- Optional drag-to-reorder country cards  

### 📅 Meeting Planner Mode
- Select a base country  
- Enter date and time (HH:MM)  
- Automatically recalculates all selected regions  
- No page reload required  

### ✏️ Smart Time Editing
- Click any clock to edit time manually  
- Recalculates all other countries instantly  
- Perfect for quick scheduling scenarios  

---

## 🛠 Technical Overview

- Manifest V3 compliant  
- Chrome & Edge compatible  
- Fully offline after installation  
- Uses `chrome.storage.local` for settings persistence  
- Minimal permission required: `storage`  
- No external APIs or heavy libraries  

---

## 🌍 Included Global Business Hubs

Supports 30+ major locations, including:

India (Asia/Kolkata)  
USA (New York, Los Angeles)  
UK (Europe/London)  
Germany (Europe/Berlin)  
UAE (Asia/Dubai)  
Singapore (Asia/Singapore)  
Australia (Sydney)  
Japan (Asia/Tokyo)  
Canada (Toronto)  
Brazil (São Paulo)  

Additional countries can be added inside `popup.js` by appending:

{
  label: "Country (City)",
  timezone: "Region/City"
}

---

## ⚡ Performance Goals

- Popup loads under 1 second  
- Zero network requests  
- Deterministic time calculations  
- Lightweight and modular code  
- No backend, ever  

---

## 📦 Installation (Unpacked)

1. Open browser Extensions page  
2. Enable Developer Mode  
3. Click “Load Unpacked”  
4. Select the AllTime Clock folder  
5. Pin to toolbar  

---

## 🎯 Designed For

- Global consulting teams  
- Cross-border operations  
- Recruiters scheduling internationally  
- Traders monitoring markets  
- Distributed leadership teams  

---

## 🔒 Privacy & Constraints

- No data collection  
- No analytics  
- No external communication  
- Fully local execution  
- Clean, maintainable code  

---

### 🌍 AllTime Clock  
Lightweight. Precise. Built for global professionals.
