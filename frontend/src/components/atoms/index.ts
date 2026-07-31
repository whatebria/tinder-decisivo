/**
 * Atoms — bloques indivisibles del design system.
 * Ver: design-exploration/design-system.html section "Atomos".
 */

// Existentes (Fase 0)
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { IconButton, type IconButtonProps, type IconButtonVariant, type IconButtonSize } from "./IconButton";
export { Badge, type BadgeProps, type BadgeVariant } from "./Badge";
export { Chip, type ChipProps } from "./Chip";
export { Tabs, type TabsProps, type TabItem } from "./Tabs";
export { ActionButton, useActionColors, type ActionButtonProps, type ActionButtonVariant } from "./ActionButton";
export { SentimentBadge, type SentimentBadgeProps, type Sentiment } from "./SentimentBadge";
export { StatBlock, type StatBlockProps, type StatVariant } from "./StatBlock";
export { PageDots, type PageDotsProps } from "./PageDots";
export { ThemeToggle, type ThemeToggleProps } from "./ThemeToggle";
export { RadarChart } from "./RadarChart";
export { AppIcon, type AppIconProps } from "./AppIcon";

// Nuevos (Fase 1)
export { Input, type InputProps } from "./Input";
export { Radio, type RadioProps } from "./Radio";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { Toggle, type ToggleProps } from "./Toggle";
export { Progress, type ProgressProps } from "./Progress";
export { Spinner, type SpinnerProps } from "./Spinner";
export { Divider, type DividerProps } from "./Divider";
export { Avatar, type AvatarProps, type AvatarSize } from "./Avatar";
export { Link, type LinkProps } from "./Link";
export { Tooltip, type TooltipProps } from "./Tooltip";
export { Timeline, type TimelineProps, type TimelineItem } from "./Timeline";
export { Icon, type IconProps, type IconName } from "./Icon";
export { Heading, type HeadingProps, type HeadingLevel } from "./Heading";

// Nuevos (Fase 5 — Home HUB wireframe)
export { ElectionCard, type ElectionCardProps, type ElectionCardVariant } from "./ElectionCard";
export { ElectionCardAdd, type ElectionCardAddProps } from "./ElectionCardAdd";
export { BookmarkButton, type BookmarkButtonProps } from "./BookmarkButton";

// Nuevos (Fase 5 — BottomNav wireframe)
export { TabBarItem, type TabBarItemProps } from "./TabBarItem";

// Dimensiones tematicas de dominio
export {
  DimensionBadge,
  type DimensionBadgeProps,
  type DimensionBadgeSize,
} from "./DimensionBadge";
