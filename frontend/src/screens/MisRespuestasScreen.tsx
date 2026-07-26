/**
 * MisRespuestasScreen: lista todas las respuestas del user para un tipo de
 * eleccion, agrupadas por eje tematico. Tap en una card abre modal de edicion.
 *
 * Recibe { tipoEleccionId } por route params. Si no hay respuestas todavia,
 * muestra empty state con CTA a completar el cuestionario.
 */

import React, { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import {
  Card,
  H1,
  H3,
  Paragraph,
  SizableText,
  Spinner,
  XStack,
  YStack,
} from "tamagui";

import { getErrorMessage } from "../api/client";
import type { MiRespuesta } from "../api/endpoints";
import { useMisRespuestas, useUpdateRespuesta } from "../api/hooks";
import { EditarRespuestaModal } from "../components";
import { Button } from "../components";
import { Link } from "../components";
import { useToast } from "../components";
import type { RootStackScreenProps } from "../navigation/types";

const PESO_LABELS: Record<number, string> = {
  0: "No me importa",
  1: "Poco importante",
  2: "Importante",
  3: "Muy importante",
};

export function MisRespuestasScreen({
  navigation,
  route,
}: RootStackScreenProps<"MisRespuestas">) {
  const { tipoEleccionId } = route.params;
  const respuestasQ = useMisRespuestas(tipoEleccionId);
  const update = useUpdateRespuesta(tipoEleccionId);
  const toast = useToast();
  const [editando, setEditando] = useState<MiRespuesta | null>(null);

  // Agrupamos por eje para la UI.
  const agrupadas = useMemo(() => {
    const items = respuestasQ.data ?? [];
    const map = new Map<string, { display: string; items: MiRespuesta[] }>();
    for (const r of items) {
      const key = r.eje_tematico;
      if (!map.has(key)) {
        map.set(key, { display: r.eje_tematico_display || key, items: [] });
      }
      map.get(key)!.items.push(r);
    }
    return Array.from(map.values());
  }, [respuestasQ.data]);

  async function handleSave(opcionId: number, peso: number) {
    if (!editando) return;
    try {
      await update.mutateAsync({
        respuestaId: editando.id,
        opcionId,
        peso,
      });
      toast.success(
        "Respuesta actualizada",
        "Tu ranking se va a recalcular la proxima vez que veas tus matches."
      );
      setEditando(null);
    } catch (err) {
      toast.error("No pudimos guardar", getErrorMessage(err));
    }
  }

  if (respuestasQ.isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" />
      </YStack>
    );
  }

  const total = respuestasQ.data?.length ?? 0;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background" paddingTop="$8">
        <H1 color="$text">Mis respuestas</H1>
        <Paragraph color="$textSecondary">
          {total > 0
            ? `Respondiste ${total} pregunta${total === 1 ? "" : "s"}. Toca cualquiera para modificarla.`
            : "Todavia no respondiste ninguna pregunta de esta eleccion."}
        </Paragraph>

        {total === 0 ? (
          <YStack gap="$3" marginTop="$4">
            <Button onPress={() => navigation.goBack()}>
              Volver al inicio
            </Button>
          </YStack>
        ) : (
          <YStack gap="$4">
            {agrupadas.map((grupo) => (
              <YStack key={grupo.display} gap="$2">
                <H3 color="$textSecondary" fontSize="$3" textTransform="uppercase">
                  {grupo.display}
                </H3>
                <YStack gap="$2">
                  {grupo.items.map((r) => {
                    const opActual = r.opciones.find((o) => o.id === r.opcion_elegida);
                    return (
                      <Card
                        key={r.id}
                        padding="$4"
                        borderWidth={1}
                        borderColor="$border"
                        pressStyle={{ opacity: 0.7 }}
                        onPress={() => setEditando(r)}
                        accessibilityLabel={`Editar respuesta: ${r.pregunta_texto}`}
                      >
                        <YStack gap="$2">
                          <SizableText size="$3" color="$text" fontWeight="600">
                            {r.pregunta_texto}
                          </SizableText>
                          <XStack gap="$2" alignItems="center" flexWrap="wrap">
                            <SizableText size="$2" color="$primary" fontWeight="700">
                              {opActual?.texto ?? "(opcion desconocida)"}
                            </SizableText>
                            <SizableText size="$2" color="$textTertiary">
                              -
                            </SizableText>
                            <SizableText size="$2" color="$textSecondary">
                              {PESO_LABELS[r.peso] ?? `peso ${r.peso}`}
                            </SizableText>
                          </XStack>
                          <SizableText size="$1" color="$textTertiary">
                            Toca para editar
                          </SizableText>
                        </YStack>
                      </Card>
                    );
                  })}
                </YStack>
              </YStack>
            ))}
          </YStack>
        )}

        <YStack flex={1} />
        <Link block onPress={() => navigation.goBack()}>Volver</Link>
      </YStack>

      <EditarRespuestaModal
        visible={editando !== null}
        respuesta={editando}
        loading={update.isPending}
        onCancel={() => setEditando(null)}
        onSubmit={handleSave}
      />
    </ScrollView>
  );
}
