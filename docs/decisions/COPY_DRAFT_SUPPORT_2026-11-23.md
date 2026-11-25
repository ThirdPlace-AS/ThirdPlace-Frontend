# Copy draft for founder review: Hjelp, suspension, accessibility, 2FA (2026-11-23)

Founder answer Q25 (`FOUNDER_ANSWERS_2026-11-19.md`) says these texts are drafted for review before they ship. **Nothing here is in the app.** The screens keep what they show today until the founder approves a section.

How to read this:

- Text in a code block is the proposed in-app copy, in Norwegian.
- `[[ … ]]` is a fact or rule the product has not decided yet. The CLAUDE.md governance rule forbids inventing one, so each is a question for the founder. A section ships only when every `[[ … ]]` in it is answered or the sentence is cut.
- "Based on" lists the founder answers or spec decisions the text relies on.

`BLOCKED_NOT_V22_CERTIFIED` still applies. The V2.2 contract may override any of this.

---

## 1. Hjelp og støtte: answers to Vanlige spørsmål

Today (`HelpScreen`, `src/features/settings/SettingsPages.tsx`) the four questions are plain rows with no answers. Draft answers follow. A fifth and sixth question are proposed from founder answers that already exist.

### 1.1 Hvordan fungerer GPS-verifisering?

```
Når du er med på en opplevelse, kan du sjekke inn når du er på stedet.
Appen bruker posisjonen din bare i det øyeblikket du sjekker inn, for å se
at du er [[innenfor hvor mange meter?]] fra møtepunktet. Posisjonen lagres
[[lagres den? hvor lenge?]].

Du kan slå av posisjon når som helst i telefonens innstillinger. Da kan du
fortsatt bruke kartet, men ikke sjekke inn.
```

Questions: Q8 (check-in) had no preference. Before this ships we need the radius, whether a check-in is stored and for how long, and what a check-in is for. Check-in is not wired in the app today (`CheckinContent` is unreachable), so this question could be **left out** until it is.

### 1.2 Hva skjer når en opplevelse avlyses?

```
Hvis verten avlyser, får alle som er med beskjed i appen [[og på e-post?]].
Opplevelsen forsvinner fra planene dine, og samtalen for opplevelsen
[[blir værende / stenges]].

Hadde du betalt, [[refusjonsregel – ikke bestemt]].
```

Questions:

- How are people told: in the app, by push, by e-mail?
- What happens to the experience chat?
- The refund rule. Q12 says money is structure only, so until a payment contract exists the last line should be **cut**, not guessed.

### 1.3 Hvordan blir jeg Skaper?

```
Alle kan lage opplevelser som Utforsker. Som Skaper får du
[[hva Skaper gir – ikke bestemt]].

Du søker fra Profil → Bli Skaper. [[Kriterier – ikke bestemt.]]
```

Based on: Q15 ("decide later; keep the flow; remove the criteria card until criteria exist"); TP-D-004 (four roles). This answer **cannot ship** until the criteria and the benefits exist. The draft suggests replacing the row for now with:

```
Vil du bli Skaper? Gå til Profil → Bli Skaper, så forteller vi deg mer.
```

### 1.4 Refusjon og avbestilling

```
Du kan melde deg av en opplevelse fra Mine planer.
[[Frist for avmelding – ikke bestemt.]]
[[Refusjon – ikke bestemt.]]
```

Q12 says nothing is charged until a payment contract exists. The draft suggests **renaming the row to "Avmelding"** and shipping only the first sentence until the refund rules exist.

### 1.5 (new) Hvorfor må jeg logge inn?

```
Du kan se kartet, steder og opplevelser uten konto. For å lagre, bli med,
skrive i en samtale, anmelde, rapportere eller sveipe sammen med venner
trenger du en konto. Når du har logget inn, kommer du tilbake dit du var.
```

Based on: Q1 and Q2 (guests browse only; sign-in returns to the same spot, built in ledger 0504). No open questions, so this could ship as is.

### 1.6 (new) Hva skjer når jeg blokkerer noen?

```
Når du blokkerer noen, ser dere ikke hverandre lenger: ikke profilen, ikke
meldinger og ikke hvem som skal på en opplevelse. Personen får ikke beskjed.
Du kan oppheve blokkeringen i Innstillinger → Blokkerte brukere.
```

Based on: Q11 ("block hides both ways everywhere"). Open question: does the blocked person get told? The draft says no, which is the common pattern, but it is **a rule, so the founder must confirm it**. The app today implements block only on the blocker's side (block across accounts needs the backend contract, follow-up slice 5).

---

## 2. Suspension (`thirdplace://state/suspended`)

Today the screen says: "Kontoen din er stengt midlertidig fordi du har brutt retningslinjene våre." and a Send klage button that only shows a toast.

Draft:

```
Kontoen er suspendert

Kontoen din er stengt [[midlertidig til <dato> / inntil videre]] fordi vi
mener du har brutt retningslinjene våre: [[grunn fra moderering]].

Mens kontoen er stengt, kan du ikke bli med på opplevelser, skrive
meldinger eller legge ut noe. [[Ser andre profilen din i mellomtiden?]]

Mener du at dette er feil, kan du klage. Vi leser alle klager.
[[Svartid – ikke bestemt.]]

[Send klage]   [Les retningslinjene]
```

Questions:

- Duration: is it a fixed end date or open-ended? Does the screen show the date?
- The reason shown: does moderation's reason reach the user (Q21 says reports go to moderation)?
- Visibility while suspended.
- Complaint response time. No SLA may be invented, so cut that line if there is none.
- "Retningslinjene" need a page. There is none today. Drop the button until there is one.

"Vi mener" is softer than the current "fordi du har brutt", which matters if the complaint flow can overturn it.

---

## 3. Tilgjengelighetserklæring (accessibility statement)

There is no statement page today. The Tilgjengelighet page has Større tekst, Reduser bevegelse and Vis kun rullestolvennlige. Norway's likestillings- og diskrimineringsloven requires an accessibility statement for apps under WCAG 2.1 AA, published through uustatus.no (Digdir). The statement itself is normally filed there, and the app links to it. Proposed in-app text for a short page under Innstillinger → Tilgjengelighet:

```
Tilgjengelighet i ThirdPlace

Vi vil at alle skal kunne bruke ThirdPlace. Appen følger telefonens
innstillinger for tekststørrelse, mørk modus og skjermleser (TalkBack og
VoiceOver), og du kan gjøre teksten større og dempe animasjoner her.

På kartet kan du vise bare steder som er merket rullestolvennlige.
Merkingen kommer fra [[stedet selv / ThirdPlace / ikke bestemt]].

Vi vet om disse manglene:
[[liste fra tilgjengelighetstesten – ikke laget ennå]]

Fant du noe som ikke fungerer? Si fra i Hjelp og støtte → Send
tilbakemelding, så ser vi på det.

Les hele tilgjengelighetserklæringen: [[lenke til uustatus.no]]
```

Questions:

- Who sets "rullestolvennlig" on a place?
- The known-issues list needs a real WCAG check of the app. The TalkBack pass so far (memory: TalkBack on emulator) is not a full audit.
- The uustatus.no statement must be filed by the company. That is the founder's or the legal owner's step, not the app's.

The legal duty is stated from general knowledge of Norwegian law and should be confirmed by whoever files the statement.

---

## 4. Totrinnsbekreftelse: backup codes

Today `app/two-factor.tsx` says only "Backupkoder lagres etter aktivering." No codes are shown, and `verify-code?mode=identity` mentions them under "Mistet tilgang?".

Draft for a step after Aktiver 2FA:

```
Lagre backupkodene dine

Hvis du mister telefonen eller ikke får koden, kan du logge inn med en av
disse kodene. Hver kode virker én gang.

  [[10]] koder vises her

Lagre dem et trygt sted, for eksempel i en passordbehandler. Vi viser dem
ikke igjen. [[Kan brukeren lage nye koder? Fra hvor?]]

[Kopier kodene]   [Jeg har lagret dem]
```

And under "Mistet tilgang?" on the code screen:

```
Mistet tilgang?
Skriv inn en av backupkodene du lagret da du skrudde på
totrinnsbekreftelse. Har du ikke dem, [[kontakt oss – hvordan?]].
```

Questions:

- How many codes, and their format.
- Can they be regenerated, and from where?
- The recovery path when the codes are lost as well.

All of this is auth policy and waits on the auth contract (Q26). The front end can build the screen with fixture codes once the founder approves the text. Even then, **no real codes are generated client-side**.

---

## What happens next

The founder marks each section as approved, approved with changes, or held. Approved text goes into the app as its own slice with a ledger line. Held text stays here.
