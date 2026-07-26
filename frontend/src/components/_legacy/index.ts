/**
 * Componentes legacy — pendientes de migracion al design system atomico.
 *
 * NO agregar componentes nuevos aqui. Estos se borran en la Fase 4 del
 * refactor cuando todos los usos se hayan migrado a los atoms/molecules
 * equivalentes:
 *
 *   PrimaryButton     -> atoms/Button variant="primary"
 *   TextButton        -> atoms/Button variant="ghost" o atoms/Link
 *   SelectableButton  -> molecules/RadioGroup o atoms/Chip
 *   FormInput         -> atoms/Input (o molecules/FormField)
 */

export { PrimaryButton, type PrimaryButtonProps } from "./PrimaryButton";
export { TextButton } from "./TextButton";
export { SelectableButton } from "./SelectableButton";
export { FormInput } from "./FormInput";
