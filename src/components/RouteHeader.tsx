import { Header } from "@/components/ui/Header";

// Header for pushed hub pages (Innstillinger, Personvern, Lagret, Mine
// planer, Marketplace, Arbeidsflate …): the back button, then the title large
// on its own line (Phase 12 H7, a calmer Airbnb-style page top).
export function RouteHeader({ title }: { title: string }) {
  return <Header title={title} size="page" />;
}
