/**
 * Barrel export de todos los componentes del design system.
 *
 * Uso:
 *   import { Button, Badge, Chip, Tabs, ... } from "@/components";
 *
 * Los componentes legacy (PrimaryButton, TextButton, etc.) siguen exportados
 * para compatibilidad, pero se recomienda migrar a los nuevos.
 */

// Atomos nuevos (design system Paleta A)
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { IconButton, type IconButtonProps, type IconButtonVariant, type IconButtonSize } from "./IconButton";
export { Badge, type BadgeProps, type BadgeVariant } from "./Badge";
export { Chip, type ChipProps } from "./Chip";
export { Tabs, type TabsProps, type TabItem } from "./Tabs";
export { ActionButton, ACTION_COLORS, type ActionButtonProps, type ActionButtonVariant } from "./ActionButton";
export { PageDots, type PageDotsProps } from "./PageDots";
export { SentimentBadge, type SentimentBadgeProps, type Sentiment } from "./SentimentBadge";
export { StatBlock, type StatBlockProps, type StatVariant } from "./StatBlock";

// Componentes existentes (legacy — mantener funcional)
export { PrimaryButton, type PrimaryButtonProps } from "./PrimaryButton";
export { TextButton } from "./TextButton";
export { SelectableButton } from "./SelectableButton";
export { FormInput } from "./FormInput";
export { ConfirmModal } from "./ConfirmModal";
export { PreguntaInfoModal } from "./PreguntaInfoModal";
export { RadarChart } from "./RadarChart";
export { ToastProvider, useToast, type ToastVariant } from "./Toast";
export { BookmarkActions } from "./BookmarkActions";
export { ErrorBoundary } from "./ErrorBoundary";
