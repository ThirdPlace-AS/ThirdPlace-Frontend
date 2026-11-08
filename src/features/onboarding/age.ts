// 18+ launch gate (TP-D-001, founder-locked; master spec §1.2 / §4). The
// birthday is entered on onboarding step 2 "Dette er deg" (PDF p2) as
// dd.mm.åååå. This only decides what the demo UI shows — nothing is stored or
// sent, and no identity is verified (BLOCKED_CONTRACT_GAP).

export const MIN_AGE = 18;

export type BirthdayCheck =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "underage"; age: number }
  | { status: "ok"; age: number };

// Parses "dd.mm.åååå" and returns whole years on `today`. Rejects impossible
// dates (31.02), future dates and implausible ages.
export function checkBirthday(
  input: string,
  today = new Date(),
): BirthdayCheck {
  const raw = input.trim();
  if (!raw) return { status: "empty" };
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(raw);
  if (!m) return { status: "invalid" };
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 ||
    date.getDate() !== d ||
    date > today
  ) {
    return { status: "invalid" };
  }
  let age = today.getFullYear() - y;
  const beforeBirthday =
    today.getMonth() < mo - 1 ||
    (today.getMonth() === mo - 1 && today.getDate() < d);
  if (beforeBirthday) age -= 1;
  if (age > 120) return { status: "invalid" };
  return age < MIN_AGE ? { status: "underage", age } : { status: "ok", age };
}

// Inserts the dots as the user types digits: "01011990" → "01.01.1990".
export function formatBirthdayInput(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}
