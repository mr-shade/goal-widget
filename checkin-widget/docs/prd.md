Here’s the information available about the **Etsy listing you asked for** (Check-In Counter Widget ⟢ Channel Reward, Command or Keyword | Twitch and Youtube • StreamElements OBS):

**Product Overview**
This is a **digital stream widget** sold on Etsy, designed for **Twitch and YouTube streamers**. It integrates as a **StreamElements/OBS browser source** to track and display viewer check-ins or actions during a live stream. ([Etsy][1])

**Key Features (from the listing):**

* Digital download (no physical item). ([Etsy][1])
* Works with **StreamElements and OBS (Classic/Studio)**. ([Etsy][1])
* Counts how many times viewers checked in, lurked, etc. ([Etsy][1])
* Can connect to any **channel reward, chat command, or keyword**. ([Etsy][1])
* Multiple count modes (continuous, streak). ([Etsy][1])
* Configurable reset settings (daily/weekly/monthly/never). ([Etsy][1])
* Options for custom stamps, colors, fonts, Google fonts. ([Etsy][1])
* Includes widget install link, setup instructions (PDF). ([Etsy][1])
* Sound effects on widget (no native sound files included). ([Etsy][1])
* Nanitabs chatbot messages supported (Twitch only). ([Etsy][1])
* One-channel license; no resale/edit allowed. ([Etsy][1])

**Seller Details:**

* Sold by **Sayonani** (Portugal). ([Etsy][1])
* Star Seller with high ratings (~4.9). ([Etsy][1])
* Instant download after purchase. ([Etsy][1])

**Price & Availability:**

* Price around **₹1,943** (INR), subject to Etsy pricing and currency. ([Etsy][1])
* Listing shows favorites and recent listing date. ([Etsy][1])

**Use Case:**
Intended for streamers who want an interactive visual counter on stream overlays that tracks viewer interactions (check-ins, commands, keywords) in real time.

If you want specific text from the seller or screenshots of the item section (like pricing, variations), I can try to extract those next.

[1]: https://www.etsy.com/in-en/listing/4437799652/check-in-counter-widget-channel-reward?content_source=f4e7e51d-9257-40f5-a37c-2efe6c87bfc9%253ALT2cbb73a8fd0fe869bf9bffb396699aae6366fc20&dd=1&ga_order=most_relevant&ga_search_query=check+in+counter&ga_search_type=all&ga_view_type=gallery&logging_key=f4e7e51d-9257-40f5-a37c-2efe6c87bfc9%3ALT2cbb73a8fd0fe869bf9bffb396699aae6366fc20&ls=s&organic_search_click=1&ref=sr_gallery-1-1&sts=1 "Buy Check-in Counter Widget ⟢ Channel Reward, Command or Keyword | Twitch and Youtube • Streamelements OBS Online in India - Etsy"

----



Below is a **clear, execution-ready PRD** for building a **Check-In Counter Stream Widget** similar to the Etsy product you referenced.

---

# Product Requirements Document (PRD)

## Product: Check-In Counter Widget for Streamers

### 1. Overview

A browser-based stream widget that tracks and displays viewer “check-ins” triggered by **channel rewards, chat commands, or keywords**, designed for **OBS / StreamElements** integration on **Twitch and YouTube**.

The widget increases viewer engagement by visually counting participation in real time during live streams.

---

### 2. Goals & Success Metrics

**Goals**

* Enable streamers to easily create interactive counters
* Real-time, reliable tracking during live streams
* Highly customizable visual design
* Simple setup (non-technical users)

**Success Metrics**

* < 5 min average setup time
* < 1s update latency
* Zero data loss during stream session
* 95%+ widget uptime during streams

---

### 3. Target Users

**Primary**

* Twitch streamers
* YouTube live streamers

**Secondary**

* VTubers
* Event streamers (marathons, giveaways, study streams)

---

### 4. Core Use Cases

1. Viewer types `!checkin` → counter increments
2. Viewer redeems a channel reward → counter increments
3. Streamer resets counter manually
4. Counter auto-resets daily/weekly
5. Stream overlay shows animated update

---

### 5. Functional Requirements

#### 5.1 Trigger System

The widget must support:

* **Chat Commands**

  * Example: `!checkin`
  * Per-user cooldown (configurable)
* **Keywords**

  * Any message containing a keyword increments counter
* **Channel Rewards (Twitch)**

  * Specific reward ID triggers increment
* **Manual Increment**

  * Button in dashboard

**Rules**

* One increment per user per stream (optional toggle)
* Ignore bots
* Optional minimum watch time

---

#### 5.2 Counter Logic

* Increment by 1 (default)
* Custom increment values (e.g., +5 for VIPs)
* Count modes:

  * Total count
  * Streak count
  * Session count
* Reset options:

  * Manual
  * Daily
  * Weekly
  * Monthly
  * Never

---

#### 5.3 Visual Widget (OBS Overlay)

* Browser source URL
* Real-time updates via WebSocket
* Display elements:

  * Title text (e.g., “Check-Ins”)
  * Counter number
  * Optional icon/stamp
* Animations:

  * Number pop
  * Scale / fade
* Optional sound trigger (external audio URL)

---

#### 5.4 Customization

* Fonts (Google Fonts)
* Font size & weight
* Colors (text, background, accent)
* Transparency
* Layout:

  * Horizontal / Vertical
* Custom labels

---

#### 5.5 Dashboard (Streamer Panel)

* Login (Twitch / Google OAuth)
* Widget configuration UI
* Live preview
* Copy OBS URL
* Reset controls
* Analytics:

  * Total check-ins
  * Unique users
  * Peak per stream

---

### 6. Non-Functional Requirements

**Performance**

* Handle 5,000+ chat messages/min
* Widget update latency < 500ms

**Reliability**

* Auto-reconnect on socket drop
* Graceful degradation if API fails

**Security**

* OAuth tokens encrypted
* No public API keys exposed
* Rate limiting on triggers

**Scalability**

* Stateless widget rendering
* Redis / KV store for counters

---

### 7. Tech Stack (Suggested)

**Frontend**

* HTML + CSS + JS (widget)
* React / Next.js (dashboard)

**Backend**

* Node.js / Cloudflare Workers
* WebSocket (or SSE)
* Redis / Cloudflare KV

**Integrations**

* Twitch IRC / EventSub
* YouTube Live Chat API

**Deployment**

* Cloudflare Workers / Vercel
* CDN-served widget assets

---

### 8. User Flow

1. Streamer logs in
2. Creates a new counter
3. Chooses trigger (command/reward)
4. Customizes appearance
5. Copies widget URL
6. Adds as OBS Browser Source
7. Goes live
8. Viewers interact → counter updates

---

### 9. MVP Scope

**Include**

* Chat command trigger
* Manual reset
* Basic styling
* OBS browser source
* Twitch support only

**Exclude (v1)**

* YouTube support
* Advanced analytics
* Sound hosting
* Marketplace themes

---

### 10. Future Enhancements

* Multi-counter widgets
* Leaderboard overlay
* Per-user stats
* Export CSV
* Mobile dashboard
* White-label mode
* Subscription tiers

---

### 11. Risks & Mitigations

| Risk               | Mitigation                    |
| ------------------ | ----------------------------- |
| Twitch API changes | EventSub abstraction          |
| Chat spam          | Cooldowns + rate limits       |
| OBS browser quirks | Strict HTML/CSS compatibility |
| Data loss          | Periodic state sync           |

---

### 12. Monetization (Optional)

* Free tier (watermark)
* Pro (₹499/month)
* Lifetime license
* White-label license
* Etsy-style one-time purchase

---

If you want, I can next:

* Convert this into a **technical architecture diagram**
* Write **API contracts**
* Create **database schema**
* Build a **clickable dashboard wireframe**
* Generate **MVP code structure (Next.js + Workers)**
