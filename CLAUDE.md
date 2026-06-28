# Project Brief — "Cohort" (working title)

> Paste this into your project folder as `CLAUDE.md`. Claude Code reads it at the
> start of every session, so it always knows what we're building and why.

## What we're building

A community app **by creatives, for creatives** — a place where filmmakers,
musicians, photographers, and other artists find **peers** to help each other
build their portfolios and make work together. The emotional core is *find your
people*, not *hire a crew* or *follow the famous*.

## The core ideas (these are the soul of the app — protect them)

1. **Swipe on the work, not the face.** Discovery uses a swipeable card deck, but
   the front of each card is the person's *work* — a short reel clip, a set of
   stills, a track snippet. Their name, stage, and what they're after live small
   at the bottom or on the back of the card. We are NOT building a dating app;
   people swipe on creative energy, not on looks.

2. **Give / Get profiles.** Every profile has two halves: what I can **give**
   ("I color-grade, I edit fast") and what I **need** ("I need a DP for a 3-min
   test, someone to score it"). Matching is about whether my give covers your get
   and vice versa — reciprocal by design, like the old "TFP" (time-for-prints)
   tradition where both people walk away with something for their reel.

3. **Match peers, not pros.** Match on **stage and taste**, not just discipline.
   A second-year filmmaker who loves the same five directors as you is a better
   match than a famous DP who'll never reply. The whole reciprocity model only
   works between people roughly in the same boat.

4. **No match graveyard.** A match is the *start*, not the trophy. After two
   people match, hand them an obvious next step tied to something concrete (a
   "what I'm working on right now" line, a project callout), never a blank chat box.

5. **Lightweight trust, not heavy ratings.** After a collaboration, both people tap
   a simple "worked with" confirmation. A profile then quietly shows "made 5 things
   with 8 people here." No star ratings. Flakes simply never accumulate this.

6. **The portfolio grows through use.** The work you make *through* the app becomes
   new portfolio. A profile should visibly grow the more someone gives and gets —
   status that rewards building, not clout-chasing.

## Audience & launch strategy

Launch for **one scene first** (e.g., LA filmmakers) and get it dense enough that
opening the app always surfaces fresh, relevant cards. Expand city by city. A swipe
deck is dead the moment it's empty or irrelevant — density beats breadth.

## Tech preferences

- **React Native + Expo** from day one. This is a real mobile app that runs on
  **iPhone, Android, and the web** from one codebase — so we get an iOS app without
  building everything twice.
- Use the **Expo managed workflow** with **Expo Router** for navigation. Scaffold
  with `npx create-expo-app`.
- **Test on a real iPhone via Expo Go**: run `npx expo start`, the founder scans the
  QR code with their iPhone camera, and the app loads live with hot reload. No Mac
  or Xcode needed for development.
- For the swipe deck, use the standard gesture/animation stack:
  **react-native-gesture-handler** + **react-native-reanimated**. Make swipes feel
  springy and physical, not stiff.
- When we add a backend (Phase 3), use **Supabase** for auth, database, and storage —
  it works cleanly with Expo/React Native.
- Ship to the App Store (Phase 4) with **EAS Build** + **EAS Submit** (cloud builds,
  no Mac required). An Apple Developer Program account ($99/yr) is only needed at the
  ship step, not before. `expo export` also gives us a web build to share a link.
- Keep the code approachable and well-commented — the founder is a creative, not an
  engineer, and will be reading along.

## Build phases (build in this order; don't jump ahead)

- **Phase 1 — Clickable prototype.** Scaffold the Expo app, then a swipeable deck of
  creator cards with realistic fake data. Work-forward cards. No backend, no real
  accounts. Get it running on the founder's iPhone via Expo Go. Goal: see and feel it
  on a real phone.
- **Phase 2 — The real model.** Give/Get profile structure, a "create your profile"
  flow, and matching logic (stage + taste + give/get overlap). Local data is fine.
- **Phase 3 — Multiplayer.** Supabase backend so people can really sign up; messaging
  that opens after a match, anchored to a concrete next step.
- **Phase 4 — Ship.** Build with EAS and submit to the App Store (and optionally
  Android + web). Invite one scene, watch how real people use it.

## Working agreement (how to help the founder)

- Use **Plan Mode** for anything bigger than a small tweak. Show the plan, wait for
  a yes, then build.
- Build **one slice at a time** and **run it** at the end so it can be seen in the browser.
- **Commit to git** whenever something works, so we can always roll back.
- Explain choices in plain language. Assume no coding background.
