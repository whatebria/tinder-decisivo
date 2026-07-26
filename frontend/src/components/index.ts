/**
 * Barrel principal del design system.
 *
 * Estructura Atomic Design:
 *   - atoms/       -> bloques indivisibles (Button, Input, Badge, ...)
 *   - molecules/   -> composiciones simples (FormField, Modal, Toast, ...)
 *   - organisms/   -> piezas complejas (CandidateCard, TopNav, ...)
 *   - templates/   -> layouts reusables (por ahora vacio)
 *
 * Uso recomendado (agnostico a la capa, ideal para consumidores):
 *   import { Button, Badge, ConfirmModal } from "@/components";
 *
 * Uso por capa (recomendado para tests y refactors internos):
 *   import { Button } from "@/components/atoms";
 *   import { ConfirmModal } from "@/components/molecules";
 */

export * from "./atoms";
export * from "./molecules";
export * from "./organisms";
