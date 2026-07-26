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
export { FavoriteCard, type FavoriteCardProps } from "./FavoriteCard";
export { DiscardedCard, type DiscardedCardProps } from "./DiscardedCard";
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
