# ViMore — Creator Platform

## Overview
ViMore is a Next.js 15 social networking and creator platform with a violet (#9940E5) brand theme. It features social feeds, music, reels, messaging, earnings/currency systems, and a full admin dashboard ("Command Core").

## Architecture
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React Context API (`PostContext`, `MusicContext`, `NotificationContext`, `LanguageContext`)
- **Data**: Mock data only (no real backend) — all data in `src/lib/mock-data.ts`
- **Auth**: localStorage-based session flag (`vimore_session`) gating `MOCK_CURRENT_USER`

## Key Routes
| Path | Description |
|------|-------------|
| `/login` | Light-mode login page (Email, Password, Forgot Password) |
| `/signup` | Light-mode signup page (Name, Email, DOB, Nationality, Password, auto-username) |
| `/` | Main social feed |
| `/dashboard` | Creator analytics hub |
| `/admin` | Admin "Command Core" dashboard (SUPER role only) |
| `/currency` | Currency hub (Gold, Diamonds, Stars) |
| `/earnings` | Creator earnings portal |
| `/reels` | Short video reels feed |
| `/music` | Music streaming |
| `/messages` | Direct messaging |
| `/profile` | Current user profile |
| `/settings` | App settings |
| `/auth/recovery` | Password recovery |

## Auth Flow
1. User arrives → `checkSession()` checks `localStorage.vimore_session`
2. If session exists → auto-login with `MOCK_CURRENT_USER`
3. If no session → `AppLoadingGate` redirects to `/login`
4. `/login` and `/signup` are public paths (no redirect, no splash screen)
5. On login/signup success → sets `vimore_session` in localStorage → navigates to `/`
6. On logout → removes `vimore_session` → redirects to `/login`

## Username Auto-Generation (Signup)
- Takes user's full name → lowercase, remove special chars, join words
- Appends 3-digit random number (e.g., "John Doe" → "johndoe847")
- Refresh button lets user regenerate
- Ensured unique against existing usernames

## Nationality Picker (Signup)
- Modal dialog with 169 countries (all 54 African countries + Asia, Europe, Americas, Oceania)
- Searchable by country name
- Shows emoji flags

## Admin Dashboard (Command Core)
- Tabs: Analytics, Users, Content, Economy (Inbound/Outbound), Logs, Staff
- Staff tab: SUPER role only — assign Moderator/Financial roles, remove staff
- Audit logs: show `performedBy` avatar + username
- Economy Inbound: shows payment receipt screenshots

## Design System
- Primary: `#9940E5` (violet)
- Font style: `font-black italic uppercase tracking-tighter` headings
- Cards: `rounded-[2.5rem]` with backdrop blur
- Light-mode pages (login/signup): forced white bg, no dark: variants
- Dark-mode app: `bg-[#020202]` / `bg-[#050505]`
