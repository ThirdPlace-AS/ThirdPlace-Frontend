// Settings search (Phase 18, screen benchmark: iOS Settings' search field).
// Innstillinger's rows are the results; each also lists what its page holds,
// so "større" finds "Større tekst" under Tilgjengelighet and opens that page.
// The labels are the rows and fields on those pages word for word:
// tests/settingsSearch.test.tsx renders each page and checks every one, so a
// renamed row cannot leave a stale result.
export const PAGE_ROWS = {
  Kontoinformasjon: [
    "E-post",
    "Telefon",
    "Passord",
    "Totrinnsbekreftelse",
    "Aldersverifisering",
    "Aktive økter",
    "Logg ut alle andre enheter",
  ],
  Preferanser: [
    "Sosial komfort",
    "Forbruksstil",
    "Energinivå",
    "Gruppestørrelse",
    "Alkohol",
  ],
  Varsler: [
    "Push",
    "Opplevelser",
    "Venteliste",
    "Venner",
    "Chat",
    "Anbefalinger",
    "Stille timer",
    "Ikke forstyrr 23–08",
  ],
  Personvern: [
    "Personvernsjekk",
    "Hvem kan se deg",
    "Synlig på kartet",
    "Offentlig profil",
    "Vis meg som deltaker",
    "Hvem kan finne og kontakte deg",
    "Vis i Utforsk folk",
    "Blokkerte brukere",
    "Datadeling",
    "Del aktivitet med venner",
    "Personalisert innhold",
    "Analytiske data",
    "GDPR: Last ned dine data",
    "Slett konto",
  ],
  "Språk og region": [
    "Norsk (bokmål)",
    "English",
    "Svenska",
    "Dansk",
    "Region",
    "Valuta",
    "Tidssone",
  ],
  Tilgjengelighet: [
    "Større tekst",
    "Reduser bevegelse",
    "Vis kun rullestolvennlige",
  ],
  "Hjelp og støtte": ["Opprett supportsak"],
  "Om ThirdPlace": ["Lisenser"],
} as const satisfies Record<string, readonly string[]>;

export type SearchableRow = { label: string; inside?: readonly string[] };

export type SettingsHit<R> = {
  key: string;
  /** The row or field that matched. */
  title: string;
  /** Where it is: the section for a row, the row for a field on its page. */
  where: string;
  /** The Innstillinger row to open. */
  row: R;
};

/** Rows whose label, or a label on their page, contains the query. */
export function searchSettings<R extends SearchableRow>(
  sections: readonly { title: string; rows: readonly R[] }[],
  query: string,
): SettingsHit<R>[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SettingsHit<R>[] = [];
  for (const s of sections) {
    for (const row of s.rows) {
      if (row.label.toLowerCase().includes(q)) {
        hits.push({ key: row.label, title: row.label, where: s.title, row });
      }
      for (const inside of row.inside ?? []) {
        if (inside.toLowerCase().includes(q)) {
          hits.push({
            key: `${row.label}/${inside}`,
            title: inside,
            where: row.label,
            row,
          });
        }
      }
    }
  }
  return hits;
}
