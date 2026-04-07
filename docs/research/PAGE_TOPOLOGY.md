# TrueFire Browse Page Topology

URL: https://truefire.com/browse (redirected from truefire.com)
Framework: Nuxt.js (Vue)
Total page height: ~6905px

## Sections (top to bottom)

### 1. Promo Banner (HubSpot/Intercom overlay)
- **Position:** fixed, z-index: 9999
- **Height:** ~50px
- **Background:** purple/violet gradient
- **Content:** "🎸 All Access FREE Trial! Start Now >" with close (X) button
- **Interaction:** static, dismissable via X button

### 2. Sticky Navigation
- **Position:** sticky, top: 0, z-index: 1020
- **Height:** 71px
- **Background:** white (#fff) with border-bottom
- **Content:**
  - Left: TrueFire logo (SVG)
  - Center-left: Learn, Play, Explore dropdown menus
  - Center-right: Search bar ("Search by genre, instrument, or style...")
  - Right: Cart icon, Notifications bell, User avatar dropdown
- **Interaction:** sticky on scroll, dropdowns on click

### 3. Hero Section
- **Top:** 121px, Height: 431px
- **Background:** dark (#222) with background-image (joshua-ellish-splash.jpg)
- **Content:**
  - H1: "Master Guitar Faster: Interactive Courses, Tools, and World-Class Instructors"
  - 3 bullet points with emoji icons (🎸, 🎬, ⚡)
  - Large search bar: "Search by genre, instrument, or style..."
- **Interaction:** static

### 4. Find The Perfect Course (Tabbed Section)
- **Top:** 551px, Height: ~599px
- **Background:** #fafafa
- **Content:**
  - H2: "Find The Perfect Course For You"
  - Subtitle: "Whether you're just starting out..."
  - 4 tab buttons: Skill Level (default), By Genre, By Instrument, Learning Paths
  - Tab content changes on click
- **Interaction model:** CLICK-DRIVEN tab switching
- **Tab states:**
  - **Skill Level:** 3 cards (Beginner, Intermediate, Advanced) with icons, description, "Explore Courses" button
  - **By Genre:** 8 cards in 4x2 grid (Rock, Blues, Jazz, Country, Fingerstyle, Acoustic, Bluegrass, Funk) with chevron
  - **By Instrument:** 6 image cards in 3x2 grid (Electric Guitar, Acoustic Guitar, Bass, Banjo, Ukulele, Mandolin) with bg images and text overlay
  - **Learning Paths:** 6 cards in 3x2 grid (Blues, Jazz, Acoustic, Country, Rock, Bass Path) with description

### 5. Hot & New (Course Cards)
- **Top:** 1150px, Height: ~800px
- **Background:** white
- **Content:**
  - H2: "Hot & New" with "VIEW ALL" button right-aligned
  - 6 course cards in 3-column grid (col-12 col-md-4)
  - Cards: Phrasing The Blues (Mike Zito), Back to Basics: Scales (Ariel Posen), RAW (Eric Gales), Guitar Zen: Fingerstyle (Eric Haugen), Fit Fingers (Rob Swift), 30 Blues Jam Rhythms (Mike Zito)
- **Card structure:** Image (16:9), Title, Author (italic), Rating stars, optional "New Course!" badge

### 6. Most Popular (Course Cards)
- **Top:** ~1950px, Height: ~800px
- **Background:** white, border-top separator
- **Content:**
  - H2: "Most Popular" with "VIEW ALL" button
  - 6 course cards same layout
  - Cards: Guitar Zen: CAGED, Tone Melody & Truth, Fingerstyle Milestones, Blue Highways, Melodic Muse, + 1 more

### 7. Song Lessons (Course Cards)
- **Top:** ~2700px, Height: ~800px
- **Background:** white, border-top separator
- **Content:**
  - H2: "Song Lessons" with "VIEW ALL" button
  - 6 course cards
  - Cards: Blue Sky, The Thrill is Gone, Maggie May, Layla, You Should Probably Leave, Sex on Fire

### 8. Meet Our Featured Artists
- **Top:** 3624px, Height: ~1700px
- **Background:** white
- **Content:**
  - H2: "Meet Our Featured Artists" (centered)
  - 12 circular portrait photos in 3-column grid (4 rows)
  - Artists: Eric Gales, Eric Johnson, Guthrie Trapp, Yngwie Malmsteen, Marty Friedman, Eric Haugen, Tim Lerch, Tommy Emmanuel, Andy Wood, Robben Ford, Lindsay Ell, Keb' Mo'
  - Names below each portrait
- **Images:** Circular crop, ~300px diameter, from cloudfront CDN

### 9. Download The App
- **Top:** ~5300px, Height: ~400px
- **Background:** white, border-top/bottom separators
- **Content:**
  - Left: Device mockup image (laptop, tablet, phone showing TrueFire app)
  - Right:
    - H2: "Download The App"
    - Description text
    - "Download for Mobile Devices & Tablets:" - App Store + Google Play buttons (dark)
    - "Download for Desktop Computers & Laptops:" - Windows + Mac buttons (dark)

### 10. Guitar Method CTA Banner
- **Top:** ~5800px, Height: ~310px
- **Background:** Image banner (guitar-method-banner.jpg)
- **Content:** "TRUEFIRE PRESENTS" + "GUITAR METHOD" logo + "STOP GUESSING. START PROGRESSING."
- **Interaction:** Clickable link

### 11. Footer
- **Top:** 6455px, Height: 426px
- **Background:** white with border-top
- **Content:**
  - 4 link columns: (blank heading), Tools, Company, More
  - Social icons: Facebook, Twitter, YouTube, Instagram
  - App Store + Play Store buttons
  - "PRACTICE SMART. PLAY HARD.™" tagline
  - Copyright: "© 1998-2025 TrueFire, Inc."
  - Bottom bar: Terms, Privacy, Help, Guides, FAQ, Rescue + phone number

## Design Tokens Summary
- **Font:** Roboto (400, 700)
- **Body font-size:** 14.4px
- **Body bg:** rgb(245, 245, 245) / #f5f5f5
- **Body text:** rgb(34, 34, 34) / #222
- **White:** #fff / #fafafa
- **Purple (accent):** rgb(68, 41, 87) / rgb(109, 65, 138)
- **Orange (CTA):** rgb(204, 91, 36)
- **Red (ratings):** rgb(231, 34, 8)
- **Dark bg:** rgb(37, 7, 51) / rgb(34, 34, 34)
