/**
 * installAriaHiddenFocusGuard: intercepta globalmente la aplicacion de
 * `aria-hidden="true"` en el DOM y bluerea el elemento activo si es
 * descendiente del que esta por recibir el atributo.
 *
 * Motivacion:
 *   Chromium emite el warning
 *
 *     "Blocked aria-hidden on an element because its descendant retained
 *      focus. The focus must not be hidden from assistive technology users."
 *
 *   cada vez que `setAttribute('aria-hidden', 'true')` se aplica en un
 *   elemento que contiene al `activeElement`. Es violacion de WCAG 2.4.3.
 *
 *   En React Native Web esto pasa TODO EL TIEMPO:
 *     - React Navigation esconde screens con aria-hidden al navegar.
 *     - <Modal> esconde su portal con aria-hidden al cerrar.
 *     - BottomSheet, Toast, Tooltip, ListPicker hacen lo mismo.
 *
 *   Fixear componente por componente (blur en cada onPress) es Sisifo:
 *   siempre queda alguno afuera y cada Pressable nuevo agrega el bug.
 *
 * Solucion:
 *   Un unico patch a `Element.prototype.setAttribute` que:
 *     1. Cuando detecta que se va a aplicar `aria-hidden="true"`
 *     2. Chequea si el elemento contiene al `activeElement`
 *     3. Si si, hace `activeElement.blur()` ANTES de dejar pasar el
 *        setAttribute original.
 *
 *   Resultado: el foco se mueve a <body> ANTES de que Chromium vea el
 *   estado inconsistente, entonces no hay warning.
 *
 *   Complementa (no reemplaza) los useBlurringPress de los atomos: esos
 *   son best-practice React, esto es el safety net global. Defense in
 *   depth.
 *
 * Guards:
 *   - Se llama UNA sola vez (guardado con un flag en el propio prototype)
 *   - Solo en web (Platform.OS === "web" desde el caller)
 *   - Preserva la firma original de setAttribute
 *   - Si algo raro pasa (ej: `this.contains` no existe), cae al original
 *     sin blur en vez de crashear.
 */

const INSTALLED_FLAG = "__votoafin_aria_hidden_focus_guard__";

export function installAriaHiddenFocusGuard(): void {
  if (typeof Element === "undefined") return;
  const proto = Element.prototype as unknown as Record<string, unknown>;
  if (proto[INSTALLED_FLAG]) return;
  proto[INSTALLED_FLAG] = true;

  const originalSetAttribute = Element.prototype.setAttribute;

  Element.prototype.setAttribute = function patchedSetAttribute(
    name: string,
    value: string,
  ): void {
    if (name === "aria-hidden" && value === "true") {
      try {
        const active = document.activeElement as HTMLElement | null;
        if (
          active &&
          active !== document.body &&
          typeof this.contains === "function" &&
          this.contains(active) &&
          typeof active.blur === "function"
        ) {
          active.blur();
        }
      } catch {
        // Cualquier error del guard NO debe romper setAttribute. Silencioso
        // por diseno: mejor un warning WCAG que una app rota.
      }
    }
    return originalSetAttribute.call(this, name, value);
  };
}
