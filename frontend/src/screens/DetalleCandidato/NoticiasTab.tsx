/**
 * NoticiasTab — tab "Noticias" del perfil de candidato.
 *
 * Lista las noticias del candidato como NewsCards. Tap en una card abre
 * un NoticiaDetailSheet con el contenido completo y link a la fuente.
 *
 * Sin sentiment del backend: todas las noticias se muestran como "neutral".
 *
 * Co-located con DetalleCandidatoScreen en screens/DetalleCandidato/.
 */

import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Noticia } from "../../api/endpoints";
import {
  NewsCard,
  NoticiaDetailSheet,
  type NoticiaDetail,
  type Sentiment,
} from "../../components";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useThemeColors } from "../../theme/useTheme";

// -- Helpers -----------------------------------------------------------------

/** Formatea la fecha de publicacion de una noticia para mostrar. */
function formatWhen(n: Noticia): string {
  const raw =
    (n as unknown as { fecha_publicacion?: string }).fecha_publicacion ??
    (n as unknown as { fecha?: string }).fecha ??
    (n as unknown as { created_at?: string }).created_at ??
    "";
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Mapea el modelo Noticia a las props que espera NewsCard. */
function noticiaToNewsCardProps(n: Noticia) {
  const when = formatWhen(n);
  const sentiment: Sentiment = "neutral";
  return {
    headline: n.titulo,
    snippet: n.descripcion ?? "",
    source: n.fuente ?? "Fuente",
    when,
    sentiment,
  };
}

// -- Componente --------------------------------------------------------------

export function NoticiasTab({ noticias }: { noticias: Noticia[] }) {
  const c = useThemeColors();
  const [selected, setSelected] = useState<NoticiaDetail | null>(null);

  if (noticias.length === 0) {
    return (
      <Text style={[styles.empty, { color: c.textSecondary }]}>
        Aun no hay noticias cargadas para este candidato.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {noticias.map((n) => {
        const cardProps = noticiaToNewsCardProps(n);
        return (
          <NewsCard
            key={n.id}
            {...cardProps}
            onPress={() =>
              setSelected({
                id: n.id,
                titulo: n.titulo,
                descripcion: n.descripcion ?? "",
                url: n.url,
                fuente: n.fuente,
                imagenUrl:
                  (n as unknown as { imagen_url?: string | null }).imagen_url ??
                  null,
                fechaFormateada: cardProps.when,
                sentiment: cardProps.sentiment,
              })
            }
          />
        );
      })}
      <NoticiaDetailSheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        noticia={selected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sp3, marginTop: spacing.sp1 },
  empty: {
    ...typography.small,
    padding: spacing.sp6,
    textAlign: "center",
    fontStyle: "italic",
  },
});
