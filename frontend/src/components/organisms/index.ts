/**
 * Organisms — piezas complejas de UI que resuelven un caso de uso completo.
 * Ver: design-exploration/design-system.html section "Organismos".
 */

// Existentes (Fase 0)
export { CandidatoPosturas } from "./CandidatoPosturas";
export { ErrorBoundary } from "./ErrorBoundary";

// Nuevos (Fase 3a)
export { QuestionCard, type QuestionCardProps } from "./QuestionCard";
export { CandidateCard, type CandidateCardProps } from "./CandidateCard";
export {
  ProfileHero,
  type ProfileHeroProps,
  type HeroStat,
  type HeroTilt,
} from "./ProfileHero";
export {
  Comparator,
  type ComparatorProps,
  type ComparatorSlot,
} from "./Comparator";
export {
  ShareOptions,
  type ShareOptionsProps,
  type ShareChannel,
} from "./ShareOptions";
export { TopNav, type TopNavProps } from "./TopNav";
export { EmptyState, type EmptyStateProps } from "./EmptyState";

// Nuevos (Fase 5 — Home HUB wireframe)
export { HomeTopBar, type HomeTopBarProps } from "./HomeTopBar";
export { ElectionsStrip, type ElectionsStripProps } from "./ElectionsStrip";
export { NovedadesFeed, type NovedadesFeedProps, type NovedadFeedItem } from "./NovedadesFeed";

// Nuevos (Fase 5 — Resultados wireframe)
export { ResultadoHero, type ResultadoHeroProps } from "./ResultadoHero";
export { RankingRow, type RankingRowProps } from "./RankingRow";
export { RankingCard, type RankingCardProps } from "./RankingCard";

// Nuevos (Fase 5 - BottomNav wireframe)
export { BottomNav, type BottomNavProps, type BottomNavTab } from "./BottomNav";
export { Sidebar, type SidebarProps } from "./Sidebar";

// Nuevos (Sprint post-swipe: explicacion del match)
export { MatchExplanation } from "./MatchExplanation";
