# Cohort (working title)

A community app **by creatives, for creatives** — filmmakers, musicians,
photographers, and other artists find **peers** to help each other build their
portfolios and make work together. Find your people, not a crew for hire.

## The idea in one breath

Swipe on the _work_, not the face. Every profile has a **give** ("I color-grade,
I edit fast") and a **get** ("need a DP for a 3-minute test"). You match with people
at your **stage and taste** whose give covers your get and vice versa — then you
actually make something, and that work becomes new portfolio for both of you.

The full product brief lives in [`CLAUDE.md`](./CLAUDE.md).

## Tech

- **React Native + Expo** — one codebase for iPhone, Android, and web
- **Expo Router** for navigation
- **Supabase** for accounts, data, and storage (added in Phase 3)
- Built with **Claude Code**

## Run it locally

You'll need [Node.js](https://nodejs.org) (18+) and the free **Expo Go** app on
your phone (from the App Store / Play Store).

```bash
npm install
npx expo start
```

Scan the QR code that appears with your iPhone camera (or the Expo Go app on
Android). The app opens on your phone and reloads live as the code changes.

## Roadmap

- [ ] **Phase 1** — Clickable prototype: swipeable deck of creator cards (fake data)
- [ ] **Phase 2** — Give/Get profiles, create-profile flow, and matching logic
- [ ] **Phase 3** — Supabase backend: real sign-ups + post-match messaging
- [ ] **Phase 4** — Ship to the App Store (EAS Build + Submit)

## A note on secrets

`.env` holds private keys and is **never** committed. See `.env.example` for the
keys you'll need (Phase 3 onward).
