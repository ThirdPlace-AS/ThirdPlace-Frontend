# Screen-pattern benchmark: the five best apps per screen type (7 November 2026)

The founder asked, for each screen type (the Mobbin taxonomy: onboarding, splash, guided tour, signup, verification … timeline and history) and for the other screens ThirdPlace has, which five apps do it best and what ThirdPlace can take or learn from them, using all apps and not only the ones used so far. Phase 16's `SECTION_BENCHMARK_2026-11-07.md` compared app sections with two or three apps each; this one goes per screen type and wider.

## Method and rules

- **Pool:** apps from every category, not only the earlier set (Airbnb, Instagram, Meetup, Tinder, Google Maps, Partiful, Hinge, WhatsApp, Bumble, Timeleft, Snap Map, TikTok). Earlier apps appear only where they are among the best for that screen. Of the 76 different apps named below, 64 were not in the earlier benchmark (system apps such as Settings and the share sheet count once as Apple iOS; Snap Map counts as Snapchat).
- **Picks:** the reviewer's choice among apps widely cited for that screen (pattern libraries, case studies, design awards), one line each on what they do best. App behaviour is described from the apps' public releases and help pages; no app was installed or signed into for this report, and where a line has no linked source it is general knowledge of the shipped app.
- **Pattern references:** each section links a public pattern article (ScreensDesign's recorded-screen articles, Mobbin, NN/g, Courier, Appcues GoodUX and others). Those articles show their own examples, which are often different apps; they back the pattern, not the pick.
- **ThirdPlace now:** the route or component that covers the screen today (`docs/SCREEN_INVENTORY.md`), as have / partial / missing.
- **Take:** what to borrow, tagged as in SECTION_BENCHMARK: **UI** (buildable on fixtures within the PDF and founder decisions), **Contract** (needs the V2.2 backend contract), **Policy** (needs a written rule: privacy, safety, moderation, payments), **Founder** (a product choice). Nothing here is built until the founder picks it.
- Benchmark only: no tracing, no lookalikes, no invented counts, rules or payment behaviour (CLAUDE.md governance).

## Start

### Splash

ThirdPlace now: `app/index.tsx`, logo and "Finn folk og steder i byen din", waits for fonts only (Phase 10). **Have.**

| App       | What it does best                                                                    |
| --------- | ------------------------------------------------------------------------------------ |
| Instagram | The logo for a moment, then the cached feed straight away.                           |
| Spotify   | Logo on black, then the cached home; no tagline to wait for.                         |
| Duolingo  | A short mascot moment in the brand colour that leads straight into the first choice. |
| Apple     | Its own apps launch on a screen that looks like the first screen, as its HIG asks.   |
| Airbnb    | The logo, then browsing as a guest: no sign-in wall.                                 |

Pattern reference: [Apple HIG, launching](https://developer.apple.com/design/human-interface-guidelines/launching), [Duolingo teardown (ScreensDesign)](https://screensdesign.com/articles/duolingo-onboarding-design/).

Take: **UI** a dark-mode splash background, so a phone in dark mode does not flash pink then dark (the app follows the system theme since Phase 5; the splash colour is one value in `app.json`, which needs a dev-client rebuild).

### Onboarding

ThirdPlace now: `app/onboarding.tsx` (role, "Dette er deg" with the 18+ birthday, interests, preferences, permissions) before "Lag kontoen din" (founder 2026-11-06); Bedrift has its own flow. **Have.**

| App       | What it does best                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| Duolingo  | You finish a first lesson before any account; signing up is framed as saving that progress.                       |
| Spotify   | "Pick three or more artists" in one bubble screen gives a personal home at once.                                  |
| Headspace | One question about your goal, then a first short session that fits it.                                            |
| Airbnb    | Hardly any onboarding: browse first, sign in at the moment it is needed (saving, booking).                        |
| Timeleft  | A short personality quiz decides which table of strangers you are seated with, so every answer has a visible use. |

Pattern reference: [UXCam, 16 onboarding examples](https://uxcam.com/blog/10-apps-with-great-user-onboarding/), [Duolingo (Appcues GoodUX)](https://goodux.appcues.com/blog/duolingo-user-onboarding), [personalized onboarding (ScreensDesign)](https://screensdesign.com/articles/personalized-app-onboarding/).

Take: **UI** a sentence under each optional step saying where the answer is used ("Brukes til å velge hva du ser i Sveip"), only where it is true today, and "Hopp over" on every optional step. **Contract** answers that actually change For deg (FA-2: For deg is a same-for-everyone shell until ranking exists).

### Guided tour and tutorial

ThirdPlace now: a one-time "Slik sveiper du" card on Sveip (Phase 16, `src/lib/hints.ts`). Other hidden gestures have no hint: long-press a message (reactions, "Svar"), long-press Profil (account switch, PDF p27). **Partial.**

| App      | What it does best                                                               |
| -------- | ------------------------------------------------------------------------------- |
| YouTube  | One coach mark for one unfamiliar gesture, at the moment it applies.            |
| Tinder   | The first cards teach tap-for-photos and swipe in place, not in a slideshow.    |
| Apple    | TipKit tips in its own apps: contextual, dismissible, shown once, rate-limited. |
| Duolingo | Teaches inside the first lesson instead of a tour.                              |
| Notion   | A "Getting started" page you learn by editing.                                  |

Pattern reference: [NN/g, instructional overlays and coach marks](https://www.nngroup.com/articles/mobile-instructional-overlay/), [tutorial carousels (ScreensDesign)](https://screensdesign.com/articles/mobile-app-tutorial-carousel-examples/), [coach marks (Mobbin)](https://mobbin.com/explore/mobile/ui-elements/coach-marks).

Take: **UI** two more one-time hints through the same `hints.ts` store, at most one per session: "Hold inne en melding for å reagere eller svare" the first time a chat opens, and "Hold inne Profil for å bytte konto" for people with more than one role.

### Feature info

ThirdPlace now: ⓘ sheets (Kartstil Auto, "Slik fungerer vurderinger", Ting å vite). No "what's new" after an update. **Partial.**

| App         | What it does best                                                           |
| ----------- | --------------------------------------------------------------------------- |
| Apple       | The "What's New" sheet: three rows of icon, title and line, then Continue.  |
| Airbnb      | Plain-language info sheets for trust features (how reviews work, AirCover). |
| Instagram   | A one-time bottom sheet the first time you meet a new feature.              |
| Google Maps | An intro card the first time a new layer or view is opened.                 |
| Duolingo    | New features are introduced with an illustration when you first reach them. |

Pattern reference: general knowledge (no single public article).

Take: **UI** a "Nytt i ThirdPlace" sheet shown once per app version (a hint key per version), three rows; **Founder** writes what goes in it.

## Account

### Signup

ThirdPlace now: `/register` "Lag kontoen din" after onboarding, e-post/passord plus Google and Apple, then `/verify-code`. **Have (no backend).**

| App           | What it does best                                                                           |
| ------------- | ------------------------------------------------------------------------------------------- |
| Airbnb        | One "Log in or sign up" field that branches by itself; social options under it.             |
| Duolingo      | Asks for the account only after value: "save your progress".                                |
| Slack         | Passwordless: a magic link or code by e-mail.                                               |
| Vipps (Login) | Norway: one tap in the Vipps app shares verified name, phone and, with consent, birth date. |
| Revolut       | One field per screen with visible progress; phone number first.                             |

Pattern reference: [signup flows (ScreensDesign)](https://screensdesign.com/articles/mobile-app-signup-flow-examples/), [login and signup UX (Authgear)](https://www.authgear.com/post/login-signup-ux-guide/).

Take: **Contract** one field that tells login from signup (the server knows whether the e-mail exists), magic link or passkeys. **Founder + Contract** Vipps Login as the Norwegian sign-in, which would also give a verified age for the 18+ gate (TP-D-001).

### Verification

ThirdPlace now: `/verify-code` (six boxes, one-time-code autofill), Aldersverifisering in Innstillinger; business verification is contract-blocked. **Have (no backend).**

| App      | What it does best                                                                    |
| -------- | ------------------------------------------------------------------------------------ |
| WhatsApp | SMS code read automatically on Android, "Call me" as the fallback, edit the number.  |
| Uber     | Code autofill on iOS and Android, a resend countdown, "I didn't get a code" options. |
| Bumble   | Photo verification (a selfie in a given pose) for a badge other people can see.      |
| Airbnb   | Identity check with a plain reason why, before the camera opens.                     |
| BankID   | Norway's strong ID: one recognised flow for age and identity.                        |

Pattern reference: [OTP verification (ScreensDesign)](https://screensdesign.com/articles/mobile-app-otp-verification-screen-examples/).

Take: **Contract** resend timing and a phone-call fallback. **Policy + Founder** a photo-verified badge on profiles: a trust signal for meeting strangers, which needs a moderation rule.

### Account setup

ThirdPlace now: the onboarding steps, `/profile/edit`, and "Veien til Skaper" requirement rows. **Have.**

| App        | What it does best                                                               |
| ---------- | ------------------------------------------------------------------------------- |
| Hinge      | A profile built from prompts you choose and answer, photos you drag to reorder. |
| LinkedIn   | A profile-strength meter that always names the next step.                       |
| Strava     | Setup ends with connecting a device and finding people to follow.               |
| Discord    | Creating a server starts from templates ("for a club", "for friends").          |
| Bumble BFF | Interest badges and prompts that give others something to open with.            |

Pattern reference: [profile screens (ScreensDesign)](https://screensdesign.com/articles/mobile-app-profile-screen-design-examples/).

Take: **UI** a "Fullfør profilen" card on Profil with the steps still open (bilde, om meg, interesser, "Vis meg som deltaker"), from the profile fixture, gone when done. **Founder** Hinge-style prompts on the profile ("Jeg blir gjerne med på …").

### Delete and deactivate account

ThirdPlace now: `/settings/delete`: confirming signs out like Logg ut; the line "Alle data slettes permanent" was removed because the spec contradicts it (Phase 15). **Have (no backend).**

| App       | What it does best                                                                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapchat  | Delete starts 30 days of deactivation; logging in again restores the account ([help page](https://help.snapchat.com/hc/en-us/articles/7012328360596-How-do-I-deactivate-or-delete-my-Snapchat-account)). |
| Instagram | "Deactivate" and "Delete" side by side, each with its consequence.                                                                                                                                       |
| Discord   | Blocks deletion while you own servers and says so: transfer them first.                                                                                                                                  |
| Spotify   | Handles the subscription first, then the account, with an e-mail confirmation.                                                                                                                           |
| Duolingo  | Data export sits next to account deletion in the privacy settings.                                                                                                                                       |

Pattern reference: [account deletion flows (ScreensDesign)](https://screensdesign.com/articles/mobile-app-account-deletion-flow-examples/).

Take: **UI** list what you host and own before the confirm (your groups, hosted experiences, listings), from the fixtures, without saying what happens to them. **Policy** what happens to them, a grace period, deactivate versus delete, data export.

### Login

ThirdPlace now: `/login` (fields take typing since Phase 13; Google and Apple), "Glemt passord" → reset. **Have (no backend).**

| App     | What it does best                                                     |
| ------- | --------------------------------------------------------------------- |
| Slack   | No password to remember: a link or code by e-mail.                    |
| Airbnb  | "Welcome back" with your account and the way you signed in last time. |
| Google  | Passkeys and a one-tap account chooser.                               |
| Vipps   | Log in by confirming in the Vipps app (Norway).                       |
| Revolut | After the first login, a passcode or Face ID for quick return.        |

Pattern reference: [login screens (ScreensDesign)](https://screensdesign.com/articles/mobile-app-login-screen-examples/), [password reset (ScreensDesign)](https://screensdesign.com/articles/mobile-app-password-reset-flow-examples/).

Take: **Contract** passkeys, magic link, Vipps. **Founder** whether the phone may remember the last login method (a device setting, but about the account).

## Profile and settings

### Profile (your own)

ThirdPlace now: Profil tab: photo, name, Følgere / Følger / Venner from the lists, Neste plan with a countdown, Veien til Skaper. **Have.**

| App        | What it does best                                                             |
| ---------- | ----------------------------------------------------------------------------- |
| Strava     | Recent activities and the week's numbers first, follow counts second.         |
| Duolingo   | The profile is achievements: streak, XP, friends, "Add friends".              |
| Airbnb     | "About me" prompts and places you have been, beside a verified-identity line. |
| Instagram  | "Edit profile" and "Share profile" side by side under the header.             |
| Letterboxd | Four favourite films pinned at the top: your taste in one glance.             |

Pattern reference: [profile screens (ScreensDesign)](https://screensdesign.com/articles/mobile-app-profile-screen-design-examples/).

Take: **UI** "Del profil" next to "Rediger profil" (the share sheet with the profile link, as Del does elsewhere). **Founder** four "Favorittsteder" pinned on the profile (Letterboxd), chosen from Lagret.

### User and group profile

ThirdPlace now: `/people/[id]` (Følg + Melding, shared interests, ••• Rapporter / Blokker), `/group/[id]`, the creator profile. **Have.**

| App             | What it does best                                                            |
| --------------- | ---------------------------------------------------------------------------- |
| Hinge           | You like one photo or one answer, with a comment: a reason to start talking. |
| Meetup          | A group page that leads with the next event, then members and organisers.    |
| Discord         | Preview a server (channels, people online) before joining.                   |
| Facebook Groups | Rules and membership questions on the group page, before "Join".             |
| Spond           | Norway: a group's next events with RSVP at the top, members below.           |

Pattern reference: general knowledge.

Take: **UI** the group page leads with "Neste møte" (the group's next experience from the fixtures) and gets a "Regler" field the creator writes in the Gruppe wizard (their words, not ours). **Founder** liking one part of a person's profile with a comment.

### Settings and preferences

ThirdPlace now: `/settings` (Konto, Personvern, Varsler, Tilgjengelighet, Språk, Om, Hjelp og støtte), `/settings/preferences`. **Have.**

| App          | What it does best                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| iOS Settings | A search field at the top; grouped rows with icons.                                                   |
| Instagram    | Grouped by question: how you use the app, who can see your content, how others can interact with you. |
| Telegram     | Fine privacy choices ("who can see …") with exceptions per person.                                    |
| WhatsApp     | "Privacy checkup": a short guided pass through the important switches.                                |
| Spotify      | Each switch has a one-line explanation under it.                                                      |

Pattern reference: [settings screens](https://screensdesign.com/articles/mobile-app-settings-screen-design-examples/), [privacy settings](https://screensdesign.com/articles/mobile-app-privacy-settings-examples/), [notification settings](https://screensdesign.com/articles/mobile-app-notification-settings-examples/) (ScreensDesign).

Take: **UI** a search field at the top of Innstillinger that filters the rows; Personvern grouped as "Hvem kan se deg" / "Hvem kan kontakte deg"; a "Personvernsjekk" walk through the existing switches.

### Edit

ThirdPlace now: `/profile/edit`, the listing editor, Kalender "Rediger". **Have.**

| App           | What it does best                                            |
| ------------- | ------------------------------------------------------------ |
| Hinge         | "Edit" and "View" tabs: see your profile as others will.     |
| Instagram     | Edit profile and captions in place, with clear Done.         |
| Notion        | Edit inline anywhere, saved as you type, undo.               |
| Google Docs   | Autosave with a quiet "Saved" status.                        |
| Airbnb (host) | A listing edited one section at a time, each with a preview. |

Pattern reference: general knowledge.

Take: **UI** "Forhåndsvis" on Rediger profil (the person page as others see it); asking before leaving with unsaved changes ("Forkaste endringene?").

## Feedback states

### Success

ThirdPlace now: "Opplevelsen er publisert", "Gruppen er opprettet", "Du er fremme!", confirmations in product voice (`confirmToast`). Joining an experience ends in a toast. **Have.**

| App      | What it does best                                                                       |
| -------- | --------------------------------------------------------------------------------------- |
| Airbnb   | A confirmed trip turns into a card with what to do next: message, directions, calendar. |
| Duolingo | Lesson complete: celebration, what you earned, one button on.                           |
| Cash App | Payment sent: a big tick, the amount and the person, done.                              |
| Uber     | "Request" turns straight into a live status card.                                       |
| Asana    | Rare, optional delight on completing work (and a switch to turn it off).                |

Pattern reference: [purchase success screens](https://screensdesign.com/articles/subscription-purchase-success-screen-examples/), [onboarding microinteractions](https://screensdesign.com/articles/onboarding-microinteractions/) (ScreensDesign).

Take: **UI** after "Bli med", a short "Du er med" sheet with the chosen time and place and "Legg til i kalender", "Veibeskrivelse" and "Til samtalen" (all exist; reduced motion respected; paid experiences stay structure only).

### Action option

ThirdPlace now: action sheets (Del, Rapporter, Blokker, Forlat, Venteliste), ••• menus, message long-press (Phase 16). **Have.**

| App           | What it does best                                                             |
| ------------- | ----------------------------------------------------------------------------- |
| iOS           | Long-press any item: a preview with its actions.                              |
| WhatsApp      | Long-press a message: reactions on top, actions under.                        |
| Google Photos | A bottom action bar for the selection; destructive actions move to the trash. |
| Instagram     | One "…" sheet, destructive items last and red.                                |
| Telegram      | Context menus that blur the background and show the item.                     |

Pattern reference: general knowledge.

Take: **UI** long-press on cards (browse card, Sveip card, place rows) for Lagre, Del, Vis på kartet.

### Confirmation

ThirdPlace now: confirm sheets (Forlat, Slett konto, Avlys), undo after unsave (Phase 10). **Have.**

| App           | What it does best                                              |
| ------------- | -------------------------------------------------------------- |
| Gmail         | "Undo send" instead of an "are you sure?" dialog.              |
| Google Photos | Delete goes to the trash, with undo.                           |
| GitHub        | Type the name to confirm something that cannot be undone.      |
| Airbnb        | A summary screen before "Confirm and pay".                     |
| Slack         | Leaving a private channel says you need an invite to get back. |

Pattern reference: general knowledge.

Take: **UI** undo instead of a question wherever the action can be reversed in the app (saving, following, leaving an open group). **Policy** the consequence lines ("du må inviteres på nytt"), which state rules.

### Cancel

ThirdPlace now: Avlys (host), Forlat, leaving a waitlist; payments are structure only and there are no subscriptions. **Partial.**

| App        | What it does best                                            |
| ---------- | ------------------------------------------------------------ |
| Airbnb     | Shows the refund breakdown before you cancel, then asks why. |
| Uber       | Says whether a fee applies and how close the driver is.      |
| Netflix    | A short cancel that keeps access until the period ends.      |
| Spotify    | Shows the date Premium ends and what changes.                |
| Eventbrite | A refund request with a clear status afterwards.             |

Pattern reference: [subscription cancellation and win-back (ScreensDesign)](https://screensdesign.com/articles/subscription-cancellation-win-back-examples/).

Take: **UI** the host's Avlys shows the experience card and who has joined (from the list) and asks for a reason. **Policy** what attendees are told and any refund (no "deltakerne varsles" until the spec says so).

### Empty state

ThirdPlace now: `EmptyState` across lists (Lagret → Sveip, Mine planer → Kart, Chat "Her starter praten", Varsler "Ingen varsler ennå", search and map "Nullstill"). **Have.**

| App           | What it does best                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Airbnb        | No results: names the filters and offers to remove them ([Mobbin](https://mobbin.com/glossary/empty-state)).                              |
| Slack         | A first empty channel that teaches by doing ([Eleken](https://www.eleken.co/blog-posts/empty-state-ux)).                                  |
| Google Gemini | First use: a greeting and suggestions to start from.                                                                                      |
| Spotify       | An empty library suggests things to follow.                                                                                               |
| Tiimo         | "All done" is a calm completion, not a blank list ([ScreensDesign](https://screensdesign.com/articles/mobile-app-empty-state-examples/)). |

Take: **UI** zero results name the filter to drop ("Fjern «I kveld»", one tap each) instead of only "Nullstill".

### Error

ThirdPlace now: `/state/[kind]` (offline, error, maintenance, suspended, update), "Fant ikke siden", the crash screen "Noe gikk galt". **Have.**

| App      | What it does best                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Spotify  | Offline is a banner, and what is downloaded still plays.                                                                               |
| WhatsApp | Unsent messages wait with a clock icon; "Waiting for network" in the title.                                                            |
| Slack    | A "Connecting…" banner that clears itself; status page linked on outages.                                                              |
| HEY      | Retry and back stay visible on a failed action ([ScreensDesign](https://screensdesign.com/articles/mobile-app-error-state-examples/)). |
| Airbnb   | The 404 page offers ways forward.                                                                                                      |

Take: **UI** a thin "Ingen nett" banner on the map and in chat for short drops, keeping the full offline screen for longer ones. **Policy** sending later (the "sendes automatisk" promise was removed in Phase 7).

### Loading

ThirdPlace now: skeletons for two seconds, then a loader (`useLoadPhase`); blurred image previews; local actions answer at once. **Have.**

| App       | What it does best                                                |
| --------- | ---------------------------------------------------------------- |
| Instagram | Skeletons in the exact layout of the content.                    |
| YouTube   | Skeleton thumbnails, then content as it comes.                   |
| Airbnb    | Card shimmer and blurred photo previews.                         |
| Linear    | Optimistic changes: instant on screen, synced behind.            |
| Uber      | Long waits say what is happening ("Connecting you to a driver"). |

Pattern reference: [loading states (ScreensDesign)](https://screensdesign.com/articles/mobile-app-loading-state-examples/).

Take: nothing new; ThirdPlace already does this. Keep the 2-second rule when real loading arrives (**Contract**).

### Progress

ThirdPlace now: wizard and onboarding steps, "Veien til Skaper" rows, countdown chips on plans. **Have.**

| App           | What it does best                                                |
| ------------- | ---------------------------------------------------------------- |
| Duolingo      | Streaks and a path: progress you can see every day.              |
| Apple Fitness | Rings: today's goal at a glance.                                 |
| LinkedIn      | Profile strength that names the next step.                       |
| Strava        | Weekly goal progress and monthly challenge badges.               |
| Headspace     | Gentle totals (minutes, run streak) without shame when you miss. |

Pattern reference: [streaks](https://screensdesign.com/articles/mobile-app-streak-design-examples/), [onboarding progress indicators](https://screensdesign.com/articles/onboarding-progress-indicator-examples/) (ScreensDesign).

Take: **UI** a progress bar on Veien til Skaper from the requirement rows that are already there. **Founder** streaks or monthly goals ("tre nye steder denne måneden"), which are engagement mechanics and need real data (**Contract**).

## Social and trust

### Notification

ThirdPlace now: `/notifications` grouped I dag / Denne uka / Tidligere, inline "Følg tilbake", read state, taps open the item, the bell badge. **Have.**

| App       | What it does best                                            |
| --------- | ------------------------------------------------------------ |
| Instagram | Similar events collapse ("Jonas and 2 others followed you"). |
| LinkedIn  | Filter chips over the list (All, My posts, Mentions).        |
| GitHub    | Inbox actions: done, save, mark read in bulk.                |
| Linear    | Snooze a notification until later.                           |
| Duolingo  | Push with personality and easy frequency control.            |

Pattern reference: [notification centers (ScreensDesign)](https://screensdesign.com/articles/mobile-app-notification-center-design-examples/), [Courier, notification center best practices](https://www.courier.com/guides/how-to-build-a-notification-center/chapter-3-best-practices-for-notification-centers), [NN/g, push notifications](https://www.nngroup.com/articles/push-notification/).

Take: **UI** collapse same-kind notifications in a group ("Jonas Berg og 2 andre begynte å følge deg", from the fixture list); filter chips (Alle, Invitasjoner, Følgere). **Contract** push.

### Reviews and rating

ThirdPlace now: reviews pages with sort and "Slik fungerer vurderinger", a write-review page, "Vurder opplevelsen" on past plans, one rating per place. **Have.**

| App         | What it does best                                                                  |
| ----------- | ---------------------------------------------------------------------------------- |
| Airbnb      | Category ratings, and two-sided reviews shown when both are in (or after 14 days). |
| Uber        | Stars plus one-tap compliments ("Great conversation") right after the trip.        |
| Booking.com | Category scores and reviews filtered by traveller type.                            |
| Letterboxd  | Half stars, and reviews you can like.                                              |
| Google Maps | Quick questions after a visit and an easy photo add.                               |

Pattern reference: general knowledge.

Take: **UI** one-tap compliment chips in "Vurder opplevelsen" ("Hyggelig vert", "Som beskrevet"), stored with the fixture review; filter reviews "Med bilder". **Policy** blind two-sided reviews between host and guest.

### Feedback

ThirdPlace now: "Hjelp og støtte" with a support form ("Supportsaken er opprettet"). No general "send tilbakemelding". **Partial.**

| App      | What it does best                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| Revolut  | Rates the support chat right after it ends ([Userpilot](https://userpilot.com/blog/app-onboarding-best-practices/)). |
| Uber     | Rating with tags and an optional note, in one sheet.                                                                 |
| Airbnb   | Public review, private note to the host, and a note to Airbnb kept apart.                                            |
| Google   | "Send feedback" with an optional screenshot and logs.                                                                |
| Duolingo | "Report a problem" inside the exercise, so the context comes along.                                                  |

Pattern reference: [in-app feedback surveys (ScreensDesign)](https://screensdesign.com/articles/in-app-feedback-survey-design-examples/).

Take: **UI** "Send tilbakemelding" in Hjelp og støtte with the screen it came from filled in, confirming "Takk for tilbakemeldingen" (sending is **Contract**).

### Help and support

ThirdPlace now: Hjelp og støtte (questions, contact form). **Have (no backend).**

| App     | What it does best                                                          |
| ------- | -------------------------------------------------------------------------- |
| Uber    | Help starts from the trip: the issues listed are about that trip.          |
| Airbnb  | Help Center search, suggested articles before "Contact us", a safety line. |
| Revolut | In-app chat from bot to person, with the case's status.                    |
| Amazon  | "Get help" on each order.                                                  |
| Monzo   | Help search and chat in the same place.                                    |

Pattern reference: general knowledge.

Take: **UI** "Få hjelp" on a plan row and on the experience page, opening the contact form with that experience filled in. **Policy + Founder** safety help (112 / 113 and how to report), already on `docs/LAUNCH_CHECKLIST.md`.

### Invite and refer friends

ThirdPlace now: `/invite` (code and share link), invite to a chat or group; Belønninger hidden (V1 non-goal). **Have.**

| App      | What it does best                                                            |
| -------- | ---------------------------------------------------------------------------- |
| Partiful | A link per event; guests see it and answer without the app.                  |
| Airbnb   | Invite friends to a trip or a wishlist: the invite is about something to do. |
| Dropbox  | The classic two-sided referral, with the reward spelled out.                 |
| Revolut  | A referral tracker: invited, joined, done.                                   |
| WhatsApp | Invite from contacts with a ready message.                                   |

Pattern reference: [referral programs (ScreensDesign)](https://screensdesign.com/articles/mobile-app-referral-program-examples/).

Take: **UI** "Inviter venner" on the experience page and in group info using the existing share sheet and links. **Contract** web pages for links opened without the app, invite status. **Policy** rewards stay hidden (V1 non-goal).

### Flag and report

ThirdPlace now: Rapporter sheet with reasons, Blokker, the blocked list (`src/lib/blocked.ts`), on people, places, experiences and chats. **Have.**

| App       | What it does best                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instagram | Restrict, Mute, Block and Report as separate, explained choices ([Instagram](https://about.instagram.com/blog/tips-and-tricks/restrict-mute-block-report-guide)). |
| Discord   | Report a single message by category; the message comes along.                                                                                                     |
| Bumble    | "Block & report" in one flow, with a safety centre.                                                                                                               |
| Tinder    | "Does this bother you?" asks the receiver about a hurtful message.                                                                                                |
| Reddit    | Report reasons that include the community's own rules.                                                                                                            |

Take: **UI** "Rapporter" on a single message (long-press) with that message attached; "Demp" (mute a chat) next to Blokker. **Policy** what mute and report do, and what the reporter is told.

## Discover and keep

### Search

ThirdPlace now: map search page with grouped results, recent searches and "Nylig sett". **Have.**

| App         | What it does best                                                     |
| ----------- | --------------------------------------------------------------------- |
| Airbnb      | Structured search: where, when, who.                                  |
| Spotify     | Instant results with a top result, and browse categories while empty. |
| Google Maps | Category chips (coffee, restaurants) under the search bar.            |
| Pinterest   | Guided refinements as chips under the query.                          |
| Apple Maps  | "Find nearby" categories when the field is empty.                     |

Pattern reference: [search screens (ScreensDesign)](https://screensdesign.com/articles/mobile-app-search-screen-examples/).

Take: **UI** browse categories (with the category art) when the query is empty, and a top-result card when one result clearly matches.

### Map

ThirdPlace now: Kart with category pins, clusters, the browse sheet, Kartlag (type × style), Posisjon, Filtre. "Søk i dette området" was removed again (founder, 0283). **Have.**

| App         | What it does best                                          |
| ----------- | ---------------------------------------------------------- |
| Google Maps | Category chips over the map; place sheets that snap.       |
| Apple Maps  | Clean place cards and editorial Guides.                    |
| Airbnb      | The list and the map stay in step; a "Map" pill to switch. |
| Citymapper  | What matters now (live times) right on the map.            |
| Snap Map    | Friends and activity on the map, with Ghost Mode.          |

Pattern reference: [map and location pickers (ScreensDesign)](https://screensdesign.com/articles/mobile-app-map-location-picker-examples/).

Take: **UI** category quick chips (Kafé, Bøker, Natur, …) as a row under the mode chips, using the existing Filtre categories. **Policy + Contract** friends on the map (open since §16).

### Location and address

ThirdPlace now: the Posisjon sheet (explainer, manual area), Hvor areas, "Hvor vi møtes", Veibeskrivelse, address rows. **Have.**

| App         | What it does best                                                  |
| ----------- | ------------------------------------------------------------------ |
| Uber        | A pickup pin with suggested spots and saved places.                |
| Wolt        | Address with a map pin, entrance, floor and notes for the courier. |
| Google Maps | The place sheet: address, copy, directions, share.                 |
| Airbnb      | An approximate area until you book, the exact address after.       |
| Snap Map    | Ghost Mode: you choose who sees where you are.                     |

Pattern reference: [address entry](https://screensdesign.com/articles/mobile-app-address-entry-screen-examples/), [map and location pickers](https://screensdesign.com/articles/mobile-app-map-location-picker-examples/) (ScreensDesign).

Take: **UI** a "Slik finner du frem" note the host writes for the meeting point (entrance, floor), and "Kopier adresse". **Policy** an approximate meeting point until you have joined (for experiences held at home).

### Favorite and pin

ThirdPlace now: hearts on cards and pages, Lagret, the map's Lagret mode. Chats cannot be pinned. **Have (chats: missing).**

| App         | What it does best                                       |
| ----------- | ------------------------------------------------------- |
| Airbnb      | Heart, then "Saved to …" with a way to change the list. |
| Google Maps | Saved lists shown as their own icons on the map.        |
| WhatsApp    | Pin up to three chats to the top.                       |
| Spotify     | Pin favourites to the top of the library.               |
| Pinterest   | One tap saves to the last board used.                   |

Pattern reference: [favorites and saved items (ScreensDesign)](https://screensdesign.com/articles/mobile-app-favorites-saved-items-examples/).

Take: **UI** pin chats in the chat list (long-press → "Fest"), in memory like the other demo stores.

### Collections

ThirdPlace now: one Lagret list; group swipe from Lagret. Collections were left out in Phase 10. **Missing (by choice).**

| App         | What it does best                                       |
| ----------- | ------------------------------------------------------- |
| Pinterest   | Boards with sections, shared with others.               |
| Airbnb      | Wishlists you plan with friends.                        |
| Spotify     | Playlists, collaborative ones, and Blend.               |
| Google Maps | Lists with an emoji, shared or followed.                |
| Instagram   | Private saved collections, or one shared with a friend. |

Take: **Founder** lists in Lagret ("Helgeplaner", "Med Ola"), shared with friends for planning (would revisit the Phase 10 choice; group swipe already covers choosing together).

### Dashboard

ThirdPlace now: the Bedrift / Skaper hub with "I dag" (Phase 16), Kalender, Analyse, Lokasjoner, Utbetalinger. **Have.**

| App                  | What it does best                                          |
| -------------------- | ---------------------------------------------------------- |
| Airbnb (host)        | "Today": who arrives, what is next, what needs an answer.  |
| Shopify              | The day's orders and a live view in a few cards.           |
| Stripe               | The key numbers, recent payments, a push for what matters. |
| Eventbrite Organizer | Event day: check people in and see sales by ticket type.   |
| Strava               | A weekly snapshot before the details.                      |

Pattern reference: [home screens (ScreensDesign)](https://screensdesign.com/articles/mobile-app-home-screen-design/).

Take: **UI** a "Venter på svar" block in the hub for join requests on approval-only experiences (from fixtures). **Contract** event-day check-in for hosts.

### Timeline and history

ThirdPlace now: Mine planer "Tidligere", Samarbeidshistorikk, "Nylig sett", an empty payout history. **Have.**

| App                  | What it does best                                 |
| -------------------- | ------------------------------------------------- |
| Google Maps Timeline | Places by day, kept on the phone, easy to delete. |
| Strava               | A training log as a calendar.                     |
| Spotify              | Recently played, and a yearly Wrapped story.      |
| Uber                 | Past trips with receipts and help for each.       |
| Airbnb               | Past trips, with the reviews still to write.      |

Pattern reference: [order tracking](https://screensdesign.com/articles/mobile-app-order-tracking-screen-examples/), [purchase history](https://screensdesign.com/articles/purchase-history-receipt-screen-examples/) (ScreensDesign).

Take: **Founder + Contract** a yearly recap ("Året ditt på ThirdPlace") from real history.

## Create and plan

### Add and create

ThirdPlace now: Legg til → Sted / Opplevelse / Gruppe wizards, "Start fra en tidligere", "Importer fra lenke". **Have.**

| App       | What it does best                                                       |
| --------- | ----------------------------------------------------------------------- |
| Partiful  | One screen: title, time, a playful cover, then share the link.          |
| Luma      | One page with sensible defaults (cover, time zone, capacity, approval). |
| Instagram | One create menu for every format, and drafts.                           |
| Notion    | Start from a template.                                                  |
| Meetup    | Guided event creation for organisers.                                   |

Pattern reference: general knowledge.

Take: **UI** "Utkast": a wizard left halfway is kept for the session and offered again; illustrated covers when there is no photo yet.

### Calendar

ThirdPlace now: the creator / business Kalender, "Legg til i kalender" (phone's calendar app), the Når calendar in Filtre. **Have.**

| App             | What it does best                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Fantastical     | Natural-language entry ("middag torsdag kl. 19") ([Flexibits](https://flexibits.com/fantastical)). |
| Google Calendar | A schedule view and quick add.                                                                     |
| Notion Calendar | A clean week and shareable availability.                                                           |
| Apple Calendar  | Year, month and day zoom; an inbox for invitations.                                                |
| Calendly        | Free slots grouped by day.                                                                         |

Pattern reference: [calendar and scheduling (ScreensDesign)](https://screensdesign.com/articles/mobile-app-calendar-scheduling-screen-examples/), [calendar UI examples (Eleken)](https://www.eleken.co/blog-posts/calendar-ui).

Take: **UI** a month view in Mine planer (dots on days with plans), switching with the list.

### Date and time

ThirdPlace now: Når quick tiles and range calendar, "Velg tidspunkt" by day with places left, wizard pickers. **Have.**

| App         | What it does best                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Airbnb      | Flexible dates (± days, a weekend, a week) next to the exact range ([Mobbin](https://mobbin.com/glossary/date-picker)).            |
| Things 3    | "When": Today, This Evening, Someday, or typed words ([Cultured Code](https://culturedcode.com/things/support/articles/9780167/)). |
| Calendly    | Times grouped by day with the time zone shown.                                                                                     |
| Fantastical | Typed dates and times parsed as you type.                                                                                          |
| Booking.com | Clear check-in and check-out labels on the range.                                                                                  |

Take: **UI** an "I kveld" tile in Når (the countdown chips already say "I kveld" from 17.00), and "± 1 dag" next to a chosen day.

### Camera and scanner

ThirdPlace now: none. Photos come from a fixed pool in the wizards; "Legg til profilbilde" uses a library portrait. **Missing.**

| App         | What it does best                                    |
| ----------- | ---------------------------------------------------- |
| Snapchat    | Opens on the camera: the fastest capture.            |
| BeReal      | Front and back at once, in a shared moment.          |
| Google Lens | Point at something, get results, with framing hints. |
| Adobe Scan  | Finds the edges and captures by itself.              |
| Instagram   | One camera with modes and the gallery a swipe away.  |

Pattern reference: [camera and scanner screens (ScreensDesign)](https://screensdesign.com/articles/mobile-app-camera-scanner-screen-examples/).

Take: **Founder + Contract** QR check-in at a venue as an alternative to GPS check-in; photos from the phone in Legg til (needs an image-picker dependency, a permission decision and uploads).

## Screens ThirdPlace has that the taxonomy does not name

### Chat list and thread

ThirdPlace now: sections Aktive samtaler / Opplevelser / Steder, an unread badge on the tab, reactions and replies (Phase 16), a pinned experience in a thread. **Have.**

| App      | What it does best                                        |
| -------- | -------------------------------------------------------- |
| WhatsApp | Reactions, replies and read states everyone understands. |
| Telegram | Folders and pinned chats.                                |
| iMessage | Tapbacks and inline reply threads.                       |
| Discord  | Threads, and "jump to first unread".                     |
| Slack    | A "new messages" line where you left off.                |

Take: **UI** a "Nye meldinger" line at the first unread message, and pinned chats (see Favorite and pin).

### Swipe deck (Sveip)

ThirdPlace now: one deck for experiences and places with the map's Filtre, undo, the one-time hint. **Have.**

| App                | What it does best                                              |
| ------------------ | -------------------------------------------------------------- |
| Tinder             | Gestures everyone knows; rewind; swipe up for a strong yes.    |
| Hinge              | Like a specific thing with a comment instead of a blind swipe. |
| Bumble BFF         | The same deck aimed at friendship, with interest badges.       |
| Coffee Meets Bagel | A small daily batch, so the deck ends.                         |
| Timeleft           | No deck at all: a set group of strangers at one table.         |

Pattern reference: [dating apps (ScreensDesign)](https://screensdesign.com/categories/dating-apps/).

Take: **Founder** "Dagens utvalg": a deck that ends each day.

### Detail page (experience and place)

ThirdPlace now: the experience and place pages in the layout of the founder's video (Phase 12). **Have.**

| App         | What it does best                                                          |
| ----------- | -------------------------------------------------------------------------- |
| Airbnb      | The listing page: photos, highlights, reviews, map, host, things to know.  |
| Google Maps | Popular times, photos by category, "know before you go".                   |
| Yelp        | Popular dishes and questions answered by the community.                    |
| Luma        | The guests' faces, and an address the host can keep for registered guests. |
| Eventbrite  | Organiser, refund policy and "add to calendar" on the page.                |

Take: **Policy** the meeting address shown only after joining (Luma, Partiful). **Contract** popular times.

### Filter and sort

ThirdPlace now: Filtre (the same sheet on Kart and Sveip), "Vis N resultater" counting the list. **Have.**

| App         | What it does best                                       |
| ----------- | ------------------------------------------------------- |
| Airbnb      | "Show N places" live as you choose; clear all.          |
| Booking.com | Popular filters first, with a count beside each option. |
| Zillow      | Filters as chips on the map screen.                     |
| Amazon      | Applied filters as chips you remove one by one.         |
| Etsy        | A short sheet with sort at the top.                     |

Pattern reference: [filter and sort UI (ScreensDesign)](https://screensdesign.com/articles/mobile-app-filter-sort-ui-examples/).

Take: **UI** applied filters as removable chips under the search bar on Kart (and the "Fjern «…»" from Empty state).

### Share

ThirdPlace now: Del sheets with the link. **Have.**

| App       | What it does best                                    |
| --------- | ---------------------------------------------------- |
| iOS       | The share sheet with recent people in the first row. |
| Instagram | Share to your story as a sticker.                    |
| Spotify   | A designed share card for each destination.          |
| TikTok    | A quick row of recent DMs in the share sheet.        |
| Airbnb    | Links that open with a rich preview.                 |

Pattern reference: [sharing and export screens (ScreensDesign)](https://screensdesign.com/articles/mobile-app-sharing-export-screen-examples/).

Take: **UI** "Send i ThirdPlace" with recent chats as the first row in Del. **Contract** link previews (the web page behind the link).

### Permissions

ThirdPlace now: the Posisjon explainer and onboarding's permission step; "Åpne innstillinger" when location is denied. **Have.**

| App         | What it does best                                                     |
| ----------- | --------------------------------------------------------------------- |
| Duolingo    | Asks you to pick a reminder time before the system prompt.            |
| Uber        | Explains location, and lets you set the pickup by hand if you say no. |
| Snapchat    | Asks who may see your location at the same time.                      |
| Google Maps | Explains precise versus approximate location.                         |
| Strava      | Privacy zones explained before you share activities.                  |

Pattern reference: [permission screens](https://screensdesign.com/articles/mobile-app-permission-screen-examples/), [push pre-permission](https://screensdesign.com/articles/push-notification-pre-permission-examples/) (ScreensDesign).

Take: **Contract** a notification ask at the moment it helps ("Påminnelse før opplevelsen starter?", after joining), when push exists.

### Pay sheet (structure only)

ThirdPlace now: a pay sheet that joins without card or bank fields; nothing is charged. **Structure only (by rule).**

| App       | What it does best                                        |
| --------- | -------------------------------------------------------- |
| Apple Pay | One sheet, total and confirm with Face ID.               |
| Vipps     | The payment Norwegians expect, confirmed in its own app. |
| Spond     | Payment requests inside a group (Norway).                |
| Uber      | The method shown before you confirm; split the fare.     |
| Stripe    | Saved details for one-tap checkout.                      |

Pattern reference: [checkout](https://screensdesign.com/articles/mobile-app-checkout-design-examples/), [payment methods](https://screensdesign.com/articles/mobile-app-payment-method-screen-examples/) (ScreensDesign).

Take: **Founder + Contract** Vipps as the payment method when payments come (split bill stays a V1 non-goal).

### Marketplace listing and waitlist

ThirdPlace now: Marketplace, Mine listings, the owner's Venteliste (p18), the experience waitlist sheet. **Have.**

| App    | What it does best                                          |
| ------ | ---------------------------------------------------------- |
| Fiverr | Packages (basic, standard, premium) compared side by side. |
| Etsy   | A listing page that leads with photos and the seller.      |
| Vinted | Make an offer from the listing.                            |
| Resy   | "Notify" for a full slot, with what happens next.          |
| Luma   | Approval and waitlist chosen by the host per event.        |

Take: **Policy** waitlist order and offers (who gets a free place, and how long they have).

### Group and chat info

ThirdPlace now: `/chat/[id]/info`, members, invite. **Have.**

| App      | What it does best                                                              |
| -------- | ------------------------------------------------------------------------------ |
| WhatsApp | Shared media, links and documents; admins; invite link; disappearing messages. |
| Telegram | Rich group settings without clutter.                                           |
| iMessage | Details with shared photos and links.                                          |
| Discord  | Channel settings with roles.                                                   |
| Slack    | Channel details: about, members, pinned, files.                                |

Take: **UI** a "Delt i chatten" section (photos and links from the fixture messages).

### About and licences

ThirdPlace now: Om ThirdPlace and Lisenser (Phase 15). **Have.**

| App      | What it does best                                 |
| -------- | ------------------------------------------------- |
| Signal   | Open-source licences one tap from About.          |
| Firefox  | About with version, what's new and licences.      |
| Telegram | Version and help in the same place.               |
| Spotify  | Third-party software listed plainly.              |
| Apple    | Legal and acknowledgements under General → About. |

Take: nothing new.

### System states (offline, maintenance, update, suspended, not found)

ThirdPlace now: `/state/[kind]` and the not-found page. **Have.**

| App       | What it does best                                         |
| --------- | --------------------------------------------------------- |
| WhatsApp  | "This version has expired" with a single update button.   |
| Instagram | A suspended account screen with "Disagree with decision". |
| Spotify   | Offline mode that keeps working.                          |
| Slack     | A link to the status page during outages.                 |
| Airbnb    | A 404 that offers ways forward.                           |

Take: **Policy** an appeal route on the suspended screen (`docs/surfaces/SPEC_SURFACE_GAPS.md` lists appeals).

## The fifteen strongest takeaways

Ranked by what they add for people meeting at ThirdPlace against the work; all **UI** unless tagged.

| #   | Take                                                                                            | From                     | Size   |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------ | ------ |
| 1   | "Du er med" sheet after Bli med: time, place, Legg til i kalender, Veibeskrivelse, Til samtalen | Airbnb, Uber             | Small  |
| 2   | One-time hints for hidden gestures (message long-press, Profil long-press)                      | YouTube, Apple TipKit    | Small  |
| 3   | Zero results name the filter to drop ("Fjern «I kveld»"); applied filters as removable chips    | Airbnb, Amazon           | Small  |
| 4   | "Fullfør profilen" card on Profil                                                               | LinkedIn, Hinge          | Small  |
| 5   | Pin chats; a "Nye meldinger" line at the first unread                                           | WhatsApp, Slack          | Small  |
| 6   | Browse categories on an empty search; category quick chips on the map                           | Spotify, Google Maps     | Medium |
| 7   | Settings search, Personvern grouped by question, a "Personvernsjekk"                            | iOS, Instagram, WhatsApp | Medium |
| 8   | Notifications: collapse same-kind items, filter chips                                           | Instagram, LinkedIn      | Small  |
| 9   | "Forhåndsvis" on Rediger profil; ask before discarding changes                                  | Hinge                    | Small  |
| 10  | Long-press menus on cards (Lagre, Del, Vis på kartet)                                           | iOS, WhatsApp            | Medium |
| 11  | "Få hjelp" from a plan or an experience, prefilled                                              | Uber, Amazon             | Small  |
| 12  | Group page leads with "Neste møte"; a "Regler" field the creator writes                         | Meetup, Facebook Groups  | Medium |
| 13  | "Send tilbakemelding" with context; compliment chips in "Vurder opplevelsen"                    | Google, Uber             | Small  |
| 14  | Month view in Mine planer; "I kveld" and "± 1 dag" in Når                                       | Google Calendar, Airbnb  | Medium |
| 15  | "Nytt i ThirdPlace" once per version (text from the founder)                                    | Apple, Instagram         | Small  |

## Decisions these raise (not UI-only)

| Topic                                                           | Tag                | From                   |
| --------------------------------------------------------------- | ------------------ | ---------------------- |
| Vipps Login (verified identity and age for the 18+ gate)        | Founder + Contract | Vipps                  |
| Photo-verified badge on profiles                                | Policy + Founder   | Bumble                 |
| Meeting address only after joining (experiences held at home)   | Policy             | Luma, Partiful, Airbnb |
| QR check-in at venues next to GPS check-in                      | Founder + Contract | Venue apps, Snapchat   |
| Blind two-sided reviews (host and guest)                        | Policy             | Airbnb                 |
| Deactivate versus delete, grace period, data export             | Policy             | Snapchat, Instagram    |
| Lists in Lagret shared with friends                             | Founder            | Pinterest, Airbnb      |
| Streaks or monthly goals                                        | Founder + Contract | Duolingo, Strava       |
| A daily batch in Sveip ("Dagens utvalg")                        | Founder            | Coffee Meets Bagel     |
| Vipps as the payment method when payments come                  | Founder + Contract | Vipps, Spond           |
| Photos from the phone in Legg til (picker, permission, uploads) | Founder + Contract | Instagram, Snapchat    |
| Notification ask after joining                                  | Contract           | Duolingo               |
