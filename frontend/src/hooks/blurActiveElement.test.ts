/**
 * @jest-environment jsdom
 *
 * Tests del helper puro blurActiveElement.
 *
 * Los tests del hook useBlurBeforeClose (useBlurBeforeClose.test.ts) ya cubren
 * la mecanica end-to-end a traves del hook. Aca cubrimos el helper directo,
 * que se usa inline en handlers de modal que reciben argumentos (ej: submit
 * con state capturado) donde el hook no aplica.
 */
import { blurActiveElement } from "./blurActiveElement";

describe("blurActiveElement", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    // Reset `activeElement` back to its default getter (algunos tests lo
    // override via defineProperty y sin este reset se filtra a los
    // tests siguientes).
    delete (document as unknown as { activeElement?: unknown }).activeElement;
  });

  test("hace blur al elemento con foco", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();
    expect(document.activeElement).toBe(button);

    const blurSpy = jest.spyOn(button, "blur");
    blurActiveElement();

    expect(blurSpy).toHaveBeenCalledTimes(1);
    expect(document.activeElement).not.toBe(button);
  });

  test("no-op cuando el foco esta en <body>", () => {
    // Sin nadie focuseado, activeElement es body. No debe intentar blur.
    (document.body as HTMLElement).blur = jest.fn();
    const bodyBlurSpy = document.body.blur as jest.Mock;

    blurActiveElement();

    expect(bodyBlurSpy).not.toHaveBeenCalled();
  });

  test("no crashea si activeElement no expone .blur()", () => {
    const fakeActive = document.createElement("div");
    document.body.appendChild(fakeActive);
    Object.defineProperty(document, "activeElement", {
      configurable: true,
      get: () => fakeActive,
    });
    // @ts-expect-error — deliberadamente sin blur
    fakeActive.blur = undefined;

    expect(() => blurActiveElement()).not.toThrow();
  });

  test("patron real: handler que llama blur ANTES de la callback destructiva", () => {
    // Este es el patron que aplicamos en ConfirmModal, EditarRespuestaModal,
    // CambiarPasswordModal, EliminarCuentaModal:
    //   function handleConfirm() {
    //     blurActiveElement();
    //     onConfirm();   // el padre hara setState(false) — sin foco atrapado.
    //   }
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();

    const callOrder: string[] = [];
    jest.spyOn(button, "blur").mockImplementation(() => {
      callOrder.push("blur");
    });
    const onConfirm = jest.fn(() => {
      callOrder.push("onConfirm");
    });

    function handleConfirm() {
      blurActiveElement();
      onConfirm();
    }
    handleConfirm();

    // El orden garantiza que cuando el padre invoque setState(false) desde
    // onConfirm, el foco ya se movio — no queda un descendiente focused
    // cuando RNW aplica aria-hidden al Modal escondido.
    expect(callOrder).toEqual(["blur", "onConfirm"]);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
