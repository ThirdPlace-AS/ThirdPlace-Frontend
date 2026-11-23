# Founder answers, 2026-11-19/20

Answers to the 26 themed questions in `docs/reviews/FULL_REVIEW_2026-11-18.md` §9, asked in chat on 2026-11-19 and 2026-11-20 (ledger 0503).

These are product decisions for the front-end demo. They do not import the V2.2 contract: `BLOCKED_NOT_V22_CERTIFIED` stays. Where an answer needs a backend rule (sign-in providers, import, block, DM requests, reminders), the front end builds only what fixtures can show and invents no endpoint, count or policy.

| #   | Theme                | Review ids                            | Decision                                                                                                                                                                         |
| --- | -------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Guests               | PR-01                                 | Browse only. Anything personal, and any action (save, join, chat, review, report, group swipe), opens sign-in, then returns to the same spot.                                    |
| 2   | After sign-out       | IJ                                    | Land on the map as a guest. Deep links open as a guest; personal steps ask to sign in.                                                                                           |
| 3   | 18+ gate             | A                                     | Checked at account creation (part of Lag kontoen din). Guests browse ungated.                                                                                                    |
| 4   | Onboarding answers   | PR-02                                 | Kept. They order For deg and Sveip by matching interest; nothing is hidden.                                                                                                      |
| 5   | New accounts         | PR-06                                 | Honest empty states with one next step; Profil shows Kom i gang.                                                                                                                 |
| 6   | Permissions          |                                       | Asked in context: location when the map needs it, notifications after the first join or message, with the reason. Reminders a day before and an hour before a joined experience. |
| 7   | Photos               | O-Q4, E-Q3, G-Q7, CT-Q2               | Hosts and businesses upload their own; stock photos only as a placeholder until they do.                                                                                         |
| 8   | Check-in             |                                       | No preference given.                                                                                                                                                             |
| 9   | Lukket group         |                                       | Non-members see name, photo, description and member count; no members, chat or meetings until accepted.                                                                          |
| 10  | Waitlist             |                                       | Waitlist with position (for example "Nr. 3").                                                                                                                                    |
| 11  | Block and report     |                                       | Block hides both ways everywhere (profiles, chats, who's going). Rapporter on profiles, DMs, chat messages, experiences, places and reviews.                                     |
| 12  | Money                |                                       | Structure only, as now. Nothing is charged until a payment contract exists.                                                                                                      |
| 13  | Reviews              |                                       | Only people who joined, after the session ended.                                                                                                                                 |
| 14  | Links                |                                       | Open the item's page (the app if installed, else a web page with an install button). A closed-group invite joins on accept.                                                      |
| 15  | Roles                | G-Q1, H-Q5                            | Decide later. Keep the flow; remove the criteria card from Profil until criteria exist.                                                                                          |
| 16  | Social               |                                       | Friends, two-way (request and accept). Venner means friends.                                                                                                                     |
| 17  | Chats                |                                       | Anyone can send a DM request the other accepts. An experience chat is the host plus joiners.                                                                                     |
| 18  | Group swipe          |                                       | Real friends on their own phones; a match needs everyone's like; readiness shows who joined.                                                                                     |
| 19  | Discovery modes      |                                       | Keep the PDF tabs, non-personalised until a ranking contract exists.                                                                                                             |
| 20  | Business             | O-Q6, O-Q7, H-Q7, H-Q9 to H-Q11, G-Q8 | A business is hidden from the map until verified; the owner sees it is waiting in Arbeidsflate.                                                                                  |
| 21  | Moderation           | E-Q4, E-Q5, E-Q7, H-Q12               | Published items go live at once and stay editable; reports go to moderation.                                                                                                     |
| 22  | Import               | E-Q6, G-Q5                            | Both: find friends from phone contacts (opt-in) and import events.                                                                                                               |
| 23  | Groups               | C-Q12, CT-Q1                          | Neste møte is the group's next scheduled experience, at that meeting's own venue; the home place is where the group usually meets.                                               |
| 24  | Content              | B-Q6, CT-Q1 to CT-Q9                  | A multi-day event says "Arrangement", not "Festival", unless it is one. The catalogue's location and times stay as they are.                                                     |
| 25  | Settings and support | IJ-Q4 to IJ-Q10                       | Språk offers Norwegian and English. Hjelp answers, suspension copy, the accessibility statement and 2FA backup codes are drafted as text for founder review before they ship.    |
| 26  | Sign-in              | A-Q4 to A-Q7                          | E-mail with code, plus Google and Sign in with Apple.                                                                                                                            |

## Follow-up slices

1. Remove the Skaper criteria card from Profil (Q15); "Festival" to "Arrangement" in `src/components/map/services/itemType.ts` (Q24).
2. Guest lock on every personal action, returning to the same spot (Q1, Q2).
3. Hide unverified businesses from the map (Q20); Lukket group view for non-members (Q9); waitlist position (Q10).
4. Draft Hjelp, suspension, accessibility and 2FA text as a review doc, not shipped (Q25).
5. Sign-in providers, import, block and DM requests (Q26, Q22, Q11, Q17) need a backend contract: record as blocked, invent no UI beyond fixtures.
