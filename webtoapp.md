# TASK: Convert Existing PKM Next.js Web App into a Real Android/iOS Mobile App using Capacitor

You are a senior fullstack/mobile engineer.

Your task is to transform the existing PKM web application (already built with Next.js) into a real downloadable mobile application using Capacitor.

The goal is:
- Android APK generation
- iOS app support
- Native app-like experience
- PWA support
- Mobile-first optimization
- Production-ready mobile architecture

DO NOT rebuild the app from scratch.
Reuse the existing web app and optimize it for mobile conversion.

---

# PRIMARY OBJECTIVES

1. Convert the existing Next.js web app into a Capacitor mobile app
2. Make the app feel like a real native application
3. Optimize all layouts for mobile devices
4. Add installable PWA support
5. Configure Android + iOS builds
6. Prepare APK generation pipeline
7. Improve mobile UX/animations/navigation
8. Ensure the app is usable daily as a productivity app

---

# TECH STACK

Frontend:
- Next.js App Router
- React
- TailwindCSS
- TypeScript

Mobile Wrapper:
- Capacitor

Deployment:
- Vercel

Database:
- Neon PostgreSQL

Backend:
- Next.js API routes / server actions

AI:
- Groq APIs

---

# STEP 1 — INSTALL AND CONFIGURE CAPACITOR

Install:

```bash
npm install @capacitor/core @capacitor/cli

Initialize Capacitor:

npx cap init

Configuration:

App Name: PKM
Package ID: com.anthony.pkm
STEP 2 — CONFIGURE CAPACITOR

Create/update:

capacitor.config.ts

Use production-ready configuration.

Requirements:

Support Android + iOS
Enable fullscreen app feel
Enable live reload during development
Proper app naming
Proper package ID
Splash screen support
Keyboard handling support

Use hosted Vercel deployment initially.

Example structure:

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anthony.pkm',
  appName: 'PKM',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    url: 'https://YOUR_VERCEL_URL.vercel.app',
    cleartext: true
  }
};

export default config;
STEP 3 — ADD MOBILE PLATFORMS

Add:

Android
iOS

Commands:

npx cap add android
npx cap add ios

Sync project properly.

STEP 4 — TRANSFORM THE UI INTO A REAL MOBILE APP EXPERIENCE

The current web app should no longer feel like a desktop website squeezed into mobile.

Convert the UX into:

app-like
touch-friendly
mobile-native inspired
MOBILE UX REQUIREMENTS
RESPONSIVE DESIGN

Ensure ALL pages are fully responsive.

Check:

dashboard
inbox
calendar
projects
knowledge graph
insights
settings

Fix:

overflow issues
broken flex layouts
viewport sizing problems
touch spacing
font scaling
SAFE AREA SUPPORT

Handle:

notches
status bars
gesture bars

Use:

padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
VIEWPORT HEIGHT FIX

Prevent mobile keyboard layout breaking.

Use:

100dvh
dynamic viewport units

Avoid:

old 100vh issues
STEP 5 — CREATE A MOBILE APP NAVIGATION SYSTEM

Replace desktop navigation patterns on mobile.

REQUIRED MOBILE NAVIGATION
Bottom Navigation Bar

Create modern bottom navigation with:

Dashboard
Inbox
Calendar
Projects
Profile

Requirements:

fixed bottom nav
smooth animations
active tab indicators
touch-friendly sizing
haptic-like interactions

Use mobile app inspiration:

Notion
Linear
Todoist
Spotify mobile navigation
MOBILE SIDEBAR

Desktop:

keep existing sidebar

Mobile:

use slide-out drawer
swipe support
overlay background
STEP 6 — PWA SUPPORT

Install and configure:

next-pwa

Requirements:

installable app
offline caching
app manifest
splash screen
standalone mode

Create:

/public/manifest.json

Include:

app icons
theme colors
standalone display
proper metadata

Generate:

192x192 icon
512x512 icon
STEP 7 — CREATE APP-LIKE ONBOARDING FLOW

First-time users should NOT land directly on homepage.

Create onboarding experience similar to modern mobile apps.

REQUIRED FLOW

First launch:

Welcome screen
AI Inbox feature intro
Knowledge graph intro
Productivity insights intro
Final CTA:
Sign up
Sign in

Returning users:

skip onboarding
go directly to dashboard
ONBOARDING REQUIREMENTS
Fullscreen mobile layout
Swipe animations
Progress indicators
Smooth transitions
Modern typography
Minimal UI
Mobile-first design

Track onboarding completion using:

localStorage
or user metadata
STEP 8 — CUSTOM INSTALL BUTTON

Implement:

custom "Install App" button

Requirements:

trigger PWA install prompt
support Android/Desktop
fallback instructions for iPhone

Use:

beforeinstallprompt event

If iPhone:
Show:

Tap Share
Tap "Add to Home Screen"
STEP 9 — MOBILE PERFORMANCE OPTIMIZATION

Optimize:

lazy loading
route transitions
skeleton loading
image optimization
animation performance

Ensure:

smooth scrolling
smooth transitions
no layout jank
STEP 10 — MOBILE INTERACTION IMPROVEMENTS

Add:

swipe gestures
pull-to-refresh where appropriate
touch feedback
animated page transitions

Use:

Framer Motion
STEP 11 — MOBILE KEYBOARD FIXES

Fix:

input fields hidden behind keyboard
viewport resizing bugs
scrolling issues while typing

Especially:

inbox
chat
notes
forms
STEP 12 — APP ICON + SPLASH SCREEN

Generate:

adaptive Android icons
iOS icons
splash screen assets

Requirements:

clean branding
dark mode compatible
minimal modern aesthetic
STEP 13 — OFFLINE SUPPORT

Implement basic offline support:

cached shell
cached assets
recently viewed pages
graceful offline UI

Show:

offline indicator
reconnect states
STEP 14 — APK BUILD PIPELINE

Configure Android build pipeline.

Requirements:

generate debug APK
generate release APK
proper signing config placeholders
production build instructions

Include commands for:

build
sync
open android studio
generate APK
STEP 15 — FUTURE NATIVE FEATURES ARCHITECTURE

Prepare architecture for future:

push notifications
biometrics
local storage sync
file uploads
camera support
haptics

Do NOT fully implement all.
Prepare scalable structure.

STEP 16 — CODE QUALITY

Requirements:

clean architecture
reusable components
modular mobile layouts
production-level TypeScript
scalable folder structure

Avoid:

duplicated code
desktop-only assumptions
hardcoded viewport logic
FINAL DELIVERABLES

Generate:

Capacitor setup
Mobile navigation system
Responsive mobile layouts
Onboarding flow
PWA configuration
Install prompt system
Splash screen setup
APK generation instructions
Android/iOS platform setup
Mobile optimization improvements
Offline support
Production-ready folder structure
IMPORTANT

The final result should feel like:

a real productivity mobile app
not a website inside a phone

Prioritize:

smooth UX
touch interactions
mobile ergonomics
speed
simplicity
daily usability

The app will be used daily as a personal productivity operating system.