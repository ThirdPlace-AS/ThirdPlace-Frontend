import { TitleBlock } from "@/components/ui/Header";

// Large title + subtitle with an optional back button — the design-system
// <TitleBlock>. Kept for existing call sites (auth screens).
export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  return <TitleBlock title={title} subtitle={subtitle} back={showBack} />;
}
