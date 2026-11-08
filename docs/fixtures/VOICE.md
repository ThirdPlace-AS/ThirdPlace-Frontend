# Writing catalogue content (Phase 19)

How the interest catalogue's fixtures are written (`src/fixtures/catalog/*.ts`, built by `build.ts`). Every interest has a Bedrift, an Organisasjon, a Byrom, an Opplevelse, an Arrangement (event or festival) and a Gruppe. It is MOCK content in a demo, but it should read as if real people in Oslo and Akershus wrote it. `tests/catalogCoverage.test.ts` checks the mechanical parts; the rest is on the writer.

## Voice

- Plain bokmål in du-form, short and concrete. Say what is there and what happens, not how wonderful it is.
- No hype words ("magisk", "sømløs", "skreddersydd", "uendelige muligheter"), no " — " constructions, no lists of three for rhythm.
- Abouts: two sentences, written by the place or the club about itself. Blurbs: one short line.
- Reviews vary in length and mood. Each item gets at least one 3–4 star review with a real reason (crowded after six, a steep path, slow to get to know people). Averages land between 4,0 and 4,8.
- Chat lines sound like a group chat: questions, plans, small updates. The place or club may post as itself.
- Event reviews are from earlier years ("1 år siden"); events run every year.

## Names

- Businesses, clubs, indoor spaces and events have fictional names. Before using one, make sure it doesn't name a real Oslo or Akershus business or organisation; the test keeps a short list of real institutions out.
- Outdoor city spaces (parks, lakes, crags, piers, squares) may use their public names. Keep claims modest and general: what kind of place it is, not opening hours, rules or facilities you can't stand behind.
- People: fictional, and mixed the way Oslo and Akershus are (ages, backgrounds, genders). Reviewers are a first name and an initial; hosts are people in `people` with a portrait. A new host goes in `src/fixtures/catalog/people.ts` (id `u<n>`, a `person-<name>` portrait credited like the other photos, interests named as in the catalogue); one host usually covers related interests (Henrik Aasen runs Badstue and Bading), and a host's times must not overlap.

## What not to state

- No rules as product behaviour: no membership fees, refund promises, entry or age rules, booking deadlines. Ticket prices are fine (payments are structure only).
- Safety-sensitive interests stay descriptive: no mushroom edibility advice (a "soppkontroll" stop is fine), no ice, water or bathing safety claims, no climbing or diving technique, no fishing-licence or other legal rules stated as fact, no fire rules.
- Seasons: write winter and water interests so they hold all year (rulleski, kunstis, vinterbading, tørrdrakt), or set the byrom's `season`. Never describe current snow, ice or water conditions.

## Places and spread

- Each interest's three places sit in at least three different towns (`town` must match the nearest area in `AREAS`). Spread the catalogue across Oslo, Asker and Bærum, Follo, Romerike and Hadeland.
- Coordinates on land: run `node scripts/check-land.js` after adding seeds (it updates `land-check.json`, which the test reads). Water interests sit on the shore or at the base of a pier.

## Photos

- Two or more photos per item, from `license=free` Unsplash searches (no Unsplash+), checked on a contact sheet for readable signs, logos and brands. Name them `<interest>-<n>` and credit each one in `assets/library/CREDITS.md`, then run `node scripts/build-image-manifest.js --convert`.
- A photo illustrates the kind of thing; it must never look like it shows the fictional business, club or person.
