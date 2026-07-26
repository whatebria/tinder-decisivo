/**
 * Home: elige el tipo de eleccion sobre el que queres hacer el cuestionario.
 */

import React, { useState } from "react";
import { ScrollView } from "react-native";
import {
  H1,
  H3,
  Paragraph,
  Separator,
  SizableText,
  Spinner,
  YStack,
} from "tamagui";

import type { TipoEleccion } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { useTiposEleccion } from "../api/hooks";
import { useToast } from "../components/Toast";
import { useAuthStore } from "../store/auth";
import { useCuestionarioStore } from "../store/cuestionario";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextButton } from "../components/TextButton";
import type { RootStackScreenProps } from "../navigation/types";
import { colors } from "../theme/colors";

export function HomeScreen({ navigation }: RootStackScreenProps<"Home">) {
  const email = useAuthStore((s) => s.email);
  const logout = useAuthStore((s) => s.logout);
  const loadForTipoEleccion = useCuestionarioStore((s) => s.loadForTipoEleccion);
  const toast = useToast();
  const { data: tipos = [], isLoading, error } = useTiposEleccion();
  const [startingId, setStartingId] = useState<number | null>(null);

  // Muestro el error como toast una sola vez
  React.useEffect(() => {
    if (error) toast.error("Error cargando elecciones", getErrorMessage(error));
  }, [error, toast]);

  async function handleStart(tipo: TipoEleccion) {
    if (!tipo.id) return;
    setStartingId(tipo.id);
    try {
      await loadForTipoEleccion(tipo.id);
      navigation.navigate("Cuestionario");
    } catch (err) {
      toast.error("No pudimos cargar las preguntas", getErrorMessage(err));
    } finally {
      setStartingId(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} padding="$5" gap="$4" backgroundColor="$background">
        <YStack gap="$2" paddingTop="$8">
          <H1 color="$text">¡Hola!</H1>
          <Paragraph color="$textSecondary">
            Estás conectado como{" "}
            <SizableText fontWeight="700" color="$text">{email}</SizableText>
          </Paragraph>
        </YStack>

        <Separator />

        <H3 color="$text">Elige una elección</H3>
        <Paragraph color="$textSecondary">
          Responde algunas preguntas y encuentra a los candidatos más parecidos a ti.
        </Paragraph>

        {isLoading ? (
          <Spinner size="large" />
        ) : (
          <YStack gap="$3">
            {tipos.length === 0 && (
              <Paragraph color="$textSecondary">
                Aún no hay elecciones cargadas. Pídele al administrador que ejecute
                `manage.py import_preguntas`.
              </Paragraph>
            )}
            {tipos.map((tipo) => (
              <YStack
                key={tipo.id}
                padding="$4"
                borderWidth={1}
                borderColor="$border"
                borderRadius="$4"
                backgroundColor="$background"
                gap="$3"
              >
                <H3 color="$text">{tipo.nombre}</H3>
                {tipo.descripcion ? (
                  <Paragraph color="$textSecondary">{tipo.descripcion}</Paragraph>
                ) : null}
                <PrimaryButton
                  onPress={() => handleStart(tipo)}
                  disabled={startingId !== null}
                  loading={startingId === tipo.id}
                  accessibilityLabel={`Comenzar cuestionario ${tipo.nombre}`}
                >
                  {startingId === tipo.id ? "Cargando..." : "Comenzar"}
                </PrimaryButton>
              </YStack>
            ))}
          </YStack>
        )}

        <YStack flex={1} />
        <YStack gap="$2">
          <TextButton onPress={() => navigation.navigate("MiDecision")}>
            Ver mi voto final
          </TextButton>
          <TextButton onPress={() => navigation.navigate("MisDescartados")}>
            Ver mis descartados
          </TextButton>
          <TextButton onPress={logout} color={colors.danger}>
            Cerrar sesión
          </TextButton>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
