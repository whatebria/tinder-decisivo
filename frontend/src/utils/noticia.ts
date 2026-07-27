/**
 * Mapper compartido: Noticia (varios shapes del API) -> NoticiaDetail
 * (el shape que consume `NoticiaDetailSheet`).
 *
 * Existe para que HomeScreen, NoticiasScreen y DetalleCandidatoScreen no
 * dupliquen el mismo objeto literal 3 veces. `when` y `sentiment` se
 * calculan distinto en cada screen, asi que se pasan como opciones.
 *
 * `NoticiaMappable` esta definido para aceptar `Noticia` del API sin casts:
 * mismo shape (readonly id, campos opcionales sin `null`, mismo shape de
 * candidatos_mencionados_data). Cualquier response tipo Noticia se asigna
 * directo — si algo no calza, es un mismatch real que hay que resolver en
 * el consumer, no ocultarlo con `as unknown as`.
 */

import type { Sentiment } from "../components/atoms/SentimentBadge";
import type {
  NoticiaCandidatoMencion,
  NoticiaDetail,
} from "../components/molecules/NoticiaDetailSheet";
import { sanitizeSnippet } from "./text";

/**
 * Shape minimo que aceptamos como input.
 *
 * Matchea `Schemas["Noticia"]` del OpenAPI: `id` readonly, opcionales sin
 * `null`, y `candidatos_mencionados_data` puede venir requerido o ausente.
 * Compatible tambien con cualquier subtipo que agregue campos extra.
 */
export interface NoticiaMappable {
  readonly id: number;
  titulo?: string;
  descripcion?: string;
  url?: string;
  fuente?: string;
  imagen_url?: string;
  candidatos_mencionados_data?: ReadonlyArray<NoticiaCandidatoMencion>;
}

export interface NoticiaToDetailOpts {
  /** Fecha ya formateada (ej. "hace 2 dias", "12 nov 2025"). */
  when: string;
  sentiment: Sentiment;
}

export function noticiaToDetail(
  n: NoticiaMappable,
  opts: NoticiaToDetailOpts,
): NoticiaDetail {
  return {
    id: n.id,
    titulo: sanitizeSnippet(n.titulo ?? ""),
    descripcion: sanitizeSnippet(n.descripcion ?? ""),
    url: n.url ?? null,
    fuente: n.fuente ?? null,
    imagenUrl: n.imagen_url ?? null,
    fechaFormateada: opts.when,
    sentiment: opts.sentiment,
    candidatosMencionados: n.candidatos_mencionados_data,
  };
}
