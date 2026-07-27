/**
 * NoticiaDetailSheet: bottom sheet con el detalle completo de una noticia.
 *
 * Layout:
 *   - Imagen hero (si imagen_url existe)
 *   - Meta row: fuente + fecha + sentiment badge
 *   - Titulo completo (sin truncar)
 *   - Descripcion completa
 *   - Candidatos mencionados (badges)
 *   - Footer sticky: Guardar (si logged in) + Abrir noticia original
 */

import React, { useMemo } from "react";
import { Image, Linking, StyleSheet, Text, View } from "react-native";

import { Badge } from "../atoms/Badge";
import { BookmarkButton } from "../atoms/BookmarkButton";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { SentimentBadge, type Sentiment } from "../atoms/SentimentBadge";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useThemeColors } from "../../theme/useTheme";
import { BottomSheet } from "./BottomSheet";

export interface NoticiaCandidatoMencion {
  id: number;
  nombre: string;
  apellido?: string | null;
}

export interface NoticiaDetail {
  id: number;
  titulo: string;
  descripcion: string;
  url?: string | null;
  fuente?: string | null;
  imagenUrl?: string | null;
  fechaFormateada: string;
  sentiment: Sentiment;
  candidatosMencionados?: ReadonlyArray<NoticiaCandidatoMencion>;
}

export interface NoticiaDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  noticia: NoticiaDetail | null;
  /** Si se pasa, se muestra el toggle de bookmark. */
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  bookmarkLoading?: boolean;
}

export function NoticiaDetailSheet({
  visible,
  onClose,
  noticia,
  bookmarked,
  onToggleBookmark,
  bookmarkLoading = false,
}: NoticiaDetailSheetProps) {
  const c = useThemeColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        heroImage: {
          width: "100%",
          height: 200,
          borderRadius: radii.rMd,
          marginBottom: spacing.sp4,
          backgroundColor: c.border2,
        },
        meta: {
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: spacing.sp2,
          marginBottom: spacing.sp3,
        },
        source: { fontSize: 13, fontWeight: "700", color: c.text },
        dot: { fontSize: 13, color: c.textTertiary },
        when: { fontSize: 13, color: c.textSecondary },
        title: {
          fontSize: 20,
          fontWeight: "700",
          color: c.text,
          lineHeight: 28,
          marginBottom: spacing.sp3,
        },
        descripcion: {
          fontSize: 15,
          color: c.text,
          lineHeight: 24,
          marginBottom: spacing.sp5,
        },
        candidatosLabel: {
          fontSize: 11,
          fontWeight: "700",
          color: c.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginBottom: spacing.sp2,
        },
        candidatosRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.sp2,
          marginBottom: spacing.sp5,
        },
        bookmarkWrap: {
          marginBottom: spacing.sp3,
        },
      }),
    [c],
  );

  if (!noticia) return null;

  const hasUrl = !!noticia.url;
  const openLink = () => {
    if (noticia.url) Linking.openURL(noticia.url);
  };

  const footer = (
    <>
      {hasUrl ? (
        <Button
          onPress={openLink}
          fullWidth
          rightIcon={<Icon name="link" size={16} color={c.textOnPrimary} />}
        >
          Abrir noticia original
        </Button>
      ) : null}
    </>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={noticia.fuente ?? "Noticia"}
      footer={hasUrl ? footer : undefined}
    >
      {noticia.imagenUrl ? (
        <Image
          source={{ uri: noticia.imagenUrl }}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          accessible
          accessibilityLabel={`Imagen de ${noticia.titulo}`}
        />
      ) : null}

      <View style={styles.meta}>
        {noticia.fuente ? (
          <>
            <Text style={styles.source}>{noticia.fuente}</Text>
            <Text style={styles.dot}>{"·"}</Text>
          </>
        ) : null}
        <Text style={styles.when}>{noticia.fechaFormateada}</Text>
        <Text style={styles.dot}>{"·"}</Text>
        <SentimentBadge sentiment={noticia.sentiment} />
      </View>

      <Text style={styles.title}>{noticia.titulo}</Text>
      <Text style={styles.descripcion}>{noticia.descripcion}</Text>

      {noticia.candidatosMencionados && noticia.candidatosMencionados.length > 0 ? (
        <>
          <Text style={styles.candidatosLabel}>Candidatos mencionados</Text>
          <View style={styles.candidatosRow}>
            {noticia.candidatosMencionados.map((cand) => (
              <Badge key={cand.id} variant="neutral">
                {`${cand.nombre} ${cand.apellido ?? ""}`.trim()}
              </Badge>
            ))}
          </View>
        </>
      ) : null}

      {onToggleBookmark != null && bookmarked != null ? (
        <View style={styles.bookmarkWrap}>
          <BookmarkButton
            saved={bookmarked}
            onPress={onToggleBookmark}
            loading={bookmarkLoading}
            accessibilityLabel={
              bookmarked ? "Quitar de guardadas" : "Guardar noticia"
            }
          />
        </View>
      ) : null}
    </BottomSheet>
  );
}
