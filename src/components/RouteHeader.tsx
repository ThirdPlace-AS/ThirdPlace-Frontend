import { Header } from "@/components/ui/Header";

// Back + title header for pushed (non-tab) route screens — the design-system
// <Header>. Kept for existing call sites.
export function RouteHeader({ title }: { title: string }) {
  return <Header title={title} />;
}
