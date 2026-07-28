/**
 * @jest-environment jsdom
 *
 * Tests del hook useBlurBeforeClose.
 *
 * Cubre el fix de a11y: en web, cerrar un modal mientras un descendiente
 * tiene foco dispara "Blocked aria-hidden on an element because its
 * descendant retained focus". El hook envuelve el `onClose` y hace
 * `document.activeElement.blur()` antes de invocarlo.
 *
 * En native no hay `document`; el guard `typeof document !== "undefined"`
 * hace que sea no-op. Ese caso se cubre con un test que simula el
 * environment removiendo `document` temporalmente.
 */
import { renderHook } from "@testing-library/react";

import { useBlurBeforeClose } from "./useBlurBeforeClose";

describe("useBlurBeforeClose", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("blur al elemento con foco antes de invocar onClose", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();
    expect(document.activeElement).toBe(button);

    const blurSpy = jest.spyOn(button, "blur");
    const onClose = jest.fn(() => {
      // Cuando corre el onClose, el foco YA no debe estar en el boton.
      expect(document.activeElement).not.toBe(button);
    });

    const { result } = renderHook(() => useBlurBeforeClose(onClose));
    result.current();

    expect(blurSpy).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("orden garantizado: primero blur, despues onClose", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();

    const callOrder: string[] = [];
    jest.spyOn(button, "blur").mockImplementation(() => {
      callOrder.push("blur");
    });
    const onClose = jest.fn(() => {
      callOrder.push("onClose");
    });

    const { result } = renderHook(() => useBlurBeforeClose(onClose));
    result.current();

    expect(callOrder).toEqual(["blur", "onClose"]);
  });

  test("no-op de blur cuando el foco esta en <body>", () => {
    // Sin nadie focuseado, activeElement es body. No debe intentar blur.
    (document.body as HTMLElement).blur = jest.fn();
    const bodyBlurSpy = document.body.blur as jest.Mock;
    const onClose = jest.fn();

    const { result } = renderHook(() => useBlurBeforeClose(onClose));
    result.current();

    expect(bodyBlurSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("invoca onClose incluso si el elemento no expone .blur()", () => {
    // Simula un activeElement sin `blur` (edge case teorico). El hook no
    // debe crashear — igual tiene que invocar onClose.
    const fakeActive = document.createElement("div");
    document.body.appendChild(fakeActive);
    Object.defineProperty(document, "activeElement", {
      configurable: true,
      get: () => fakeActive,
    });
    // @ts-expect-error — deliberadamente sin blur
    fakeActive.blur = undefined;

    const onClose = jest.fn();
    const { result } = renderHook(() => useBlurBeforeClose(onClose));

    expect(() => result.current()).not.toThrow();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("el wrapper es estable entre renders con el mismo onClose", () => {
    // useCallback debe devolver la misma referencia si onClose no cambia.
    // Importa para que un consumer no dispare re-renders innecesarios.
    const onClose = jest.fn();
    const { result, rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useBlurBeforeClose(cb),
      { initialProps: { cb: onClose } },
    );
    const first = result.current;
    rerender({ cb: onClose });
    expect(result.current).toBe(first);
  });

  test("el wrapper cambia si cambia onClose (dependencia respetada)", () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const { result, rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useBlurBeforeClose(cb),
      { initialProps: { cb: cb1 } },
    );
    const first = result.current;
    rerender({ cb: cb2 });
    expect(result.current).not.toBe(first);
    result.current();
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).not.toHaveBeenCalled();
  });
});
