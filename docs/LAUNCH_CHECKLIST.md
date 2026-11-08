# Launch checklist

What ThirdPlace needs before a store release beyond the code in this repo (founder request, 2026-11-07). Each item names who acts. Store rules change, so check the current Google Play and App Store policy text before submitting. Contract-blocked app surfaces are listed in [surfaces/SPEC_SURFACE_GAPS.md](surfaces/SPEC_SURFACE_GAPS.md).

## Texts (founder and lawyer)

The master spec asks for these before production (LIB L33736–33747, FG L10606–10615, BP L337). The app links none of them yet, because no text exists; in-app pages get built when the texts arrive.

| Text                                                                    | Where the app will link it                                                |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Brukervilkår (terms of use)                                             | Register ("vilkår og personvernerklæring"), Innstillinger › Om            |
| Personvernerklæring (privacy policy; both stores ask for it)            | Register, Personvern (PDF p21 draws the link), Innstillinger › Om         |
| Retningslinjer for fellesskapet (community guidelines)                  | the suspended-account screen ("retningslinjene våre"), Innstillinger › Om |
| Skaper- og selgervilkår, payment and refund terms, business-claim terms | when those flows go live                                                  |
| A web page for account deletion requests and a support / contact page   | store listings (Google Play asks for a deletion link)                     |

## Store submission (founder and ops)

- **Google Play:** Data safety form; content rating questionnaire (the app is 18+, TP-D-001); the account-deletion link; target API level.
- **App Store:** privacy details; age rating; Sign in with Apple next to Google sign-in; in-app account deletion (Slett konto exists); for user content: report, block, filtering and published contact details.
- **Versions:** `app.json` is 0.0.0 (Om ThirdPlace shows it); set the release version and build numbers.
- **Listing:** store text and screenshots.

## Services and configuration (ops and backend)

- **Mapbox:** publish the four Studio styles (`src/components/map/mapStyles.ts` uses `/draft` revisions), saved with bearing 0 and pitch 0 (the drafts carry 13.6° and 14°; the app resets them on load, but the published styles should match); restrict the public token to the app; the secret `sk.` token stays out of bundles (CI checks it).
- **Sign-in:** real Google and Apple sign-in (client IDs, redirect URIs).
- **Push notifications:** `expo-notifications`, FCM / APNs keys, the permission flow, and the "push is off" state the spec asks for.
- **Crash reporting** (for example Sentry), with a consent decision: the crash screen ("Noe gikk galt") reports nowhere today.
- **App links:** the `thirdplace.app` domain with `assetlinks.json` and `apple-app-site-association`, intent filters and associated domains, and the PDF p26 web invite page for people without the app. Today only `thirdplace://` links open the app (`join/<slug>`, `i/<code>`).
- **Backend contract (V2.2):** everything marked contract-blocked in SPEC_SURFACE_GAPS.

## Safety and moderation (founder and backend)

- A safety page for meeting strangers (tips before meeting, how to report and block, emergency numbers 112 / 113). The spec does not require one; it needs founder text.
- Moderation of user photos and messages (backend).
- Report status and appeals (SPEC_SURFACE_GAPS A4).

## Product decisions still open (founder)

- FA-1 type sizes and motion values; FA-2 For deg / Venner as same-for-everyone lists; FA-3 mock filter bands; category pin colours; the pink active-tab label.
- Translations for English, Svenska and Dansk (Språk lists them; nothing is translated).
- "Logg inn" with Google or Apple skips onboarding and the 18+ check for a brand-new user: the backend has to tell new and returning users apart.

## Checks still to run (frontend)

- iOS build and test (not possible on this PC), including "Legg til i kalender" (write-only calendar text on iOS 17+; check what older iOS versions ask).
- Real phones: compass heading, haptics, real GPS, 60 fps, TalkBack and VoiceOver.
- Dependency alerts on the repo (Dependabot: 25 open, 4 high, at Phase 13; the npm audit task from Phase 13).
