/**
 * Cuestionario: una pregunta por vez con escala Likert + selector de peso.
 *
 * UX:
 * - Header: barra de progreso + eje tematico
 * - Enunciado
 * - Grupo de opciones Likert (5) + boton "No se"
 * - Grupo de pesos (4 chips) - solo visible si ya eligio opcion
 * - Footer: Anterior / Siguiente (o Enviar en la ultima)
 */

import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  H2,
  Paragraph,
  Progress,
  Separator,
  SizableText,
  XStack,
  YStack,
} from "tamagui";

import { getErrorMessage } from "../api/client";
import { PreguntaInfoModal } from "../components/PreguntaInfoModal";
import { PrimaryButton } from "../components/PrimaryButton";
import { SelectableButton } from "../components/SelectableButton";
import { TextButton } from "../components/TextButton";
import { useToast } from "../components/Toast";
import type { RootStackScreenProps } from "../navigation/types";
import {
  calcularProgreso,
  debeMostrarPeso,
  esPrimeraPregunta,
  esUltimaPregunta,
  PESOS,
  separarOpciones,
} from "../services/cuestionario";
import { useCuestionarioStore, type RespuestaLocal } from "../store/cuestionario";

export function CuestionarioScreen({
  navigation,
}: RootStackScreenProps<"Cuestionario">) {
  const toast = useToast();
  const [infoOpen, setInfoOpen] = useState(false);
  const {
    preguntas,
    currentIndex,
    respuestas,
    submitting,
    setRespuesta,
    setPeso,
    next,
    prev,
    submit,
  } = useCuestionarioStore();

  const pregunta = preguntas[currentIndex];
  const isLast = esUltimaPregunta(currentIndex, preguntas.length);
  const isFirst = esPrimeraPregunta(currentIndex);

  if (!pregunta) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background" padding="$5">
        <Paragraph color="$textSecondary">No hay preguntas cargadas.</Paragraph>
        <YStack marginTop="$4" width="100%" maxWidth={280}>
          <PrimaryButton onPress={() => navigation.goBack()}>Volver</PrimaryButton>
        </YStack>
      </YStack>
    );
  }

  const respuesta: RespuestaLocal | undefined = respuestas[pregunta.id];
  const progress = calcularProgreso(currentIndex, preguntas.length);
  const { regulares: opcionesRegulares, noSe: opcionNoSe } = separarOpciones(
    pregunta.opciones_respuesta
  );
  const mostrarPeso = debeMostrarPeso(
    pregunta.opciones_respuesta,
    respuesta?.opcionElegidaId
  );

  const canAdvance = Boolean(respuesta);

  async function handleSubmit() {
    try {
      await submit();
      navigation.replace("SubmitDone");
    } catch (err) {
      toast.error("No pudimos guardar tus respuestas", getErrorMessage(err));
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background" paddingTop="$8">
        {/* Header */}
        <YStack gap="$2">
          <XStack justifyContent="space-between">
            <SizableText size="$2" color="$textSecondary">
              Pregunta {currentIndex + 1} de {preguntas.length}
            </SizableText>
            {pregunta.eje_tematico_display ? (
              <SizableText size="$2" color="$primary" fontWeight="700">
                {pregunta.eje_tematico_display}
              </SizableText>
            ) : null}
          </XStack>
          <Progress value={progress} size="$1">
            <Progress.Indicator backgroundColor="$primary" />
          </Progress>
        </YStack>

        {/* Enunciado con boton de contexto */}
        <XStack alignItems="flex-start" gap="$2">
          <YStack flex={1}>
            <H2 color="$text">{pregunta.texto}</H2>
          </YStack>
          <Pressable
            onPress={() => setInfoOpen(true)}
            style={styles.infoBtn}
            accessibilityLabel="Ver contexto y repercusiones de la pregunta"
            hitSlop={8}
          >
            <Text style={styles.infoBtnText}>?</Text>
          </Pressable>
        </XStack>

        <Separator />

        {/* Escala Likert */}
        <YStack gap="$2">
          <SizableText color="$textSecondary" size="$3">
            Tu postura:
          </SizableText>
          <YStack gap="$2">
            {opcionesRegulares.map((op) => {
              const selected = respuesta?.opcionElegidaId === op.id;
              return (
                <SelectableButton
                  key={op.id}
                  selected={selected}
                  onPress={() => op.id && setRespuesta(pregunta.id, op.id)}
                  accessibilityLabel={`Opción: ${op.texto}`}
                >
                  {op.texto ?? ""}
                </SelectableButton>
              );
            })}
            {opcionNoSe && (
              <SelectableButton
                selected={respuesta?.opcionElegidaId === opcionNoSe.id}
                onPress={() => opcionNoSe.id && setRespuesta(pregunta.id, opcionNoSe.id)}
                accessibilityLabel="No sé, prefiero no responder"
              >
                {opcionNoSe.texto ?? "No sé"}
              </SelectableButton>
            )}
          </YStack>
        </YStack>

        {/* Peso (solo si ya hay opcion elegida y no es "No sé") */}
        {mostrarPeso && respuesta ? (
          <YStack gap="$2">
            <SizableText color="$textSecondary" size="$3">
              ¿Qué tan importante es para ti?
            </SizableText>
            <XStack gap="$2" flexWrap="wrap">
              {PESOS.map((p) => (
                <SelectableButton
                  key={p.value}
                  compact
                  align="center"
                  selected={respuesta.peso === p.value}
                  onPress={() => setPeso(pregunta.id, p.value)}
                  accessibilityLabel={`Peso: ${p.label}`}
                >
                  {p.label}
                </SelectableButton>
              ))}
            </XStack>
          </YStack>
        ) : null}

        {/* Footer */}
        <YStack flex={1} />
        <XStack gap="$3">
          <YStack flex={1}>
            <TextButton onPress={prev} disabled={isFirst}>
              Anterior
            </TextButton>
          </YStack>
          {isLast ? (
            <YStack flex={1}>
              <PrimaryButton
                variant="success"
                onPress={handleSubmit}
                disabled={!canAdvance || submitting}
                loading={submitting}
              >
                {submitting ? "Enviando..." : "Enviar"}
              </PrimaryButton>
            </YStack>
          ) : (
            <YStack flex={1}>
              <PrimaryButton onPress={next} disabled={!canAdvance}>
                Siguiente
              </PrimaryButton>
            </YStack>
          )}
        </XStack>
      </YStack>

      <PreguntaInfoModal
        visible={infoOpen}
        onClose={() => setInfoOpen(false)}
        pregunta={pregunta as any}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  infoBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4338CA",
  },
});
