# 🍾 p-zeh (P-Zeh)
### The Real-Time Digital Money-Spraying Wall for Nigerian Owambe Parties
**Built for the "Build with Pollar" Hackathon on Boundless (Stellar / Solana)**

> **Live Production URL:** [https://pee-zeh.web.app](https://pee-zeh.web.app)  
> **Local Dev Server:** `http://127.0.0.1:5173`

---

## 🌟 The Problem & Cultural Context
In Nigerian **Owambe** culture, spraying physical cash on the celebrants is the pinnacle of joy, prestige, and blessing. However:
1. **Cash Theft & Loss:** Physical bank notes get stolen on the dance floor by "area boys" or lost in the crowd.
2. **Post-Party Burden:** Celebrants spend 4+ hours counting dirty, torn notes late at night.
3. **Diaspora Isolation:** Relatives and friends in London, Atlanta, Houston, Toronto, or Abuja cannot participate live.
4. **No Record:** Nobody knows who sprayed what, making personalized gratitude impossible.

**The Solution:**
**p-zeh** digitizes the Owambe dance floor. Guests scan the table QR code, sign in seamlessly with Google via **Pollar** (zero gas friction, zero seed phrases), pick a spray tier, add a personal shoutout, and hit **"SPRAY NOW"**.

Instantly, the big TV projector wall explodes with Afrobeats brass fanfares, cash-register chimes, a cascade of falling Nigerian ₦1000 notes and $100 bills, and the **"Top Ballers Tonight"** live leaderboard shifts in real time!

---

## 🚀 Live Routes & Architecture

| Route | Environment | Description |
| :--- | :--- | :--- |
| **`/` or `/host`** | Desktop / System | **Host Dashboard**: Event setup, total sprayed ticker, audit ledger, CSV download, QR tent cards. |
| **`/spray/:id`** | Mobile-First Phone | **Guest Spray Pad**: Quick preset tiers ($2, $5, $20, $50), custom amounts, Pollar wallet with 1-click testnet faucet. |
| **`/wall/:id`** | Cinema 1080p/4K TV | **Venue Projector Wall**: Celebration zone, falling cash, Afrobeats sound engine, dynamic Top 5 leaderboard. |
| **`/demo`** | Split-Screen Studio | **90s Hackathon Video Studio**: TV Wall on the left + Interactive iPhone on the right side-by-side! |

---

## ⚡ Real-Time Zero-Latency Sync
p-zeh is engineered for zero-latency communication across venue screens:
- **`BroadcastChannel('p-zeh-live')`**: 0ms peer-to-peer sync across browser tabs/windows without server roundtrip latency.
- **`localStorage` Cross-Tab Fallback**: Ensures rock-solid reliability across all browser engines.
- **Supabase Realtime Database**: Multi-device cloud sync with Postgres Change streams.
- **Procedural Web Audio API Sound Engine**: Multi-harmonic cash-register chime + Afrobeats brass fanfare synthesized directly via browser audio with zero external audio 404s.

---

## 🛠 Tech Stack
- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons + Framer Motion
- **Web3 & Wallets:** `@pollar/react` and `@pollar/core` (Stellar Testnet)
- **Database:** Supabase (PostgreSQL with Realtime Replication)
- **Hosting:** Firebase Hosting (`pee-zeh.web.app`)
- **FX:** `canvas-confetti` + Physics-based CSS Banknote Falling Engine

---

## 📦 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-repo/p-zeh.git
cd p-zeh
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### 3. Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 🗄 Supabase Setup (Optional)
To connect your own Supabase project:
1. Run the SQL script in [`supabase_schema.sql`](./supabase_schema.sql) in your **Supabase SQL Editor**.
2. Copy your Project URL and Anon Key into `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🎬 90-Second Demo Video Recording Script
1. **[0:00 - 0:20] The Problem:** 
   *"At Nigerian weddings, billions of Naira are sprayed on dance floors, but notes get stolen, guests abroad in London or Atlanta can't join, and counting takes hours. Meet p-zeh."*
2. **[0:20 - 0:40] The Setup:** 
   Navigate to `https://pee-zeh.web.app/demo`. Explain the two views: Projector Wall on the left for the venue hall, and Guest Mobile Phone on the right for table guests.
3. **[0:40 - 1:10] The Live Spray:** 
   On the mobile phone, tap **"$50 (Otunba Baller)"**, keep or type the shoutout *"Soft life forever! 🥂"*, and hit **"SPRAY NOW 💸"**. Watch the TV wall instantly explode with Afrobeats sound, falling money, the celebration card, and the leaderboard shift!
4. **[1:10 - 1:30] The Host Audit:** 
   Switch to `/` to show the Host Dashboard with total funds received ($2,500+ USDC), top baller metrics, and CSV export. *"Real-world African culture, powered frictionlessly by Pollar."*
