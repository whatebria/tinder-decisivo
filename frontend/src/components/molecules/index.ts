/**
 * Molecules — composiciones de atoms con una unica responsabilidad.
 * Ver: design-exploration/design-system.html section "Moleculas".
 */

// Existentes (Fase 0)
export { ToastProvider, useToast, type ToastVariant } from "./Toast";
export { ConfirmModal } from "./ConfirmModal";
export { PreguntaInfoModal } from "./PreguntaInfoModal";
export { ShareModal } from "./ShareModal";
export { CambiarPasswordModal } from "./CambiarPasswordModal";
export { EliminarCuentaModal } from "./EliminarCuentaModal";
export { EditarRespuestaModal } from "./EditarRespuestaModal";
export { BookmarkActions } from "./BookmarkActions";

// Nuevas (Fase 2)
export { Modal, type ModalProps } from "./Modal";
export { BottomSheet, type BottomSheetProps } from "./BottomSheet";
export { FormField, type FormFieldProps } from "./FormField";
export { RadioGroup, type RadioGroupProps, type RadioOption } from "./RadioGroup";
export { WeightSelector, type WeightSelectorProps, type Weight } from "./WeightSelector";
export { ProgressStepper, type ProgressStepperProps, type StepperStep } from "./ProgressStepper";
export { MatchTier, type MatchTierProps, type MatchTierKind } from "./MatchTier";
export { SwipeCard, type SwipeCardProps } from "./SwipeCard";
export { NewsCard, type NewsCardProps } from "./NewsCard";
export {
  NoticiaDetailSheet,
  type NoticiaDetailSheetProps,
  type NoticiaDetail,
  type NoticiaCandidatoMencion,
} from "./NoticiaDetailSheet";
export { PosturaItem, type PosturaItemProps, type PosturaMatch } from "./PosturaItem";

// Nuevas (Fase 5 — Home HUB wireframe)
export { HomeGreeting, type HomeGreetingProps } from "./HomeGreeting";
export { SectionTitle, type SectionTitleProps } from "./SectionTitle";
export { NovedadItem, type NovedadItemProps, type NovedadKind } from "./NovedadItem";

// Nuevas (Fase 5 — Cuestionario wireframe)
export { ScreenTopBar, type ScreenTopBarProps } from "./ScreenTopBar";
export { ProgressSplit, type ProgressSplitProps } from "./ProgressSplit";

// Nuevas (Fase 5 — Config wireframe)
export { NavRow, type NavRowProps, type NavRowVariant } from "./NavRow";

// Nuevas (Perfil territorial)
export { ListPickerModal, type ListPickerItem } from "./ListPickerModal";
export { UbicacionPicker } from "./UbicacionPicker";

// Nuevas (filtros — usadas por NoticiasScreen y CandidatosScreen)
export { ChipActivo, type ChipActivoProps } from "./ChipActivo";
export {
  CollapsibleFilterSection,
  type CollapsibleFilterSectionProps,
} from "./CollapsibleFilterSection";
