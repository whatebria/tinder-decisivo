/**
 * useBlurringPress: envuelve un handler de Pressable para blurear el elemento
 * activo antes de invocarlo.
 *
 * Uso: en cualquier atomo clickeable (Button, Link, IconButton, NavRow,
 * TabBarItem). Cuando el usuario aprieta el boton en web, el foco pasa al
 * <body> ANTES de que el consumer haga su accion (tipicamente navigate() o
 * setState que dispara aria-hidden en algun ancestor).
 *
 * Sin esto: cualquier press que dispare navigation.navigate() o cierre un
 * modal via setState en el padre desencadena el warning WCAG 2.4.3
 * "Blocked aria-hidden on an element because its descendant retained focus".
 *
 * En native (iOS/Android) es no-op porque no existe `document`. El
 * comportamiento nativo del foco lo maneja el SO.
 *
 * @param onPress handler del consumer (puede ser null/undefined para botones
 *   inertes, en cuyo caso el hook devuelve el mismo valor para no romper la
 *   deteccion de "boton sin accion" del Pressable).
 * @returns handler envuelto, o `undefined` si onPress era null/undefined.
 *
 * @example
 *   export function MyButton({ onPress, ...rest }: Props) {
 *     const handlePress = useBlurringPress(onPress);
 *     return <Pressable {...rest} onPress={handlePress} />;
 *   }
 */
import { useCallback } from "react";
import type { GestureResponderEvent } from "react-native";

import { blurActiveElement } from "./blurActiveElement";

type PressHandler = (event: GestureResponderEvent) => void;

export function useBlurringPress(
  onPress: PressHandler | null | undefined,
): PressHandler | undefined {
  const wrapped = useCallback(
    (event: GestureResponderEvent) => {
      blurActiveElement();
      onPress?.(event);
    },
    [onPress],
  );
  // Preserva la semantica de "boton sin onPress": devolviendo undefined,
  // Pressable no queda tabeable ni interactivo, igual que sin el hook.
  return onPress ? wrapped : undefined;
}
