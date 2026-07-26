/**
 * Post-submit: confirma y ofrece navegar a Resultados.
 */

import React from "react";
import { H1, Paragraph, YStack } from "tamagui";

import { useCuestionarioStore } from "../store/cuestionario";
import { Button } from "../components";
import { Link } from "../components";
import type { RootStackScreenProps } from "../navigation/types";

export function SubmitDoneScreen({
  navigation,
}: RootStackScreenProps<"SubmitDone">) {
  const reset = useCuestionarioStore((s) => s.reset);

  function handleVolver() {
    reset();
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  }

  function handleVerResultados() {
    navigation.replace("Resultados");
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      padding="$6"
      gap="$4"
      backgroundColor="$background"
    >
      <H1 color="$success">Listo!</H1>
      <Paragraph color="$text" size="$5">
        Guardamos tus respuestas.
      </Paragraph>
      <Paragraph color="$textSecondary">
        Ahora podes ver que candidatos coinciden mas con tu forma de pensar.
      </Paragraph>
      <Button onPress={handleVerResultados}>
        Ver mis matches
      </Button>
      <Link block onPress={handleVolver}>Volver al inicio</Link>
    </YStack>
  );
}
