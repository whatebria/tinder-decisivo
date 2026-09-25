import os
import sys

manifest_path = r"c:\Users\jenni\OneDrive\Desktop\Proyectos\tinder-decisivo\frontend_architecture_manifest.txt"

def main():
    print(f"Generating exhaustive, fully expanded manifest at {manifest_path}...")
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(HEADER + "\n\n")
        f.write(SEC_1 + "\n\n")
        f.write(SEC_2 + "\n\n")
        f.write(SEC_3 + "\n\n")
        f.write(SEC_4 + "\n\n")
        f.write(SEC_5 + "\n\n")
        f.write(SEC_6 + "\n\n")
        f.write(SEC_7 + "\n\n")
        f.write(SEC_8 + "\n\n")
        f.write(SEC_9 + "\n\n")
        f.write(SEC_10 + "\n\n")
        f.write(SEC_11 + "\n\n")
        f.write(SEC_12 + "\n")
    print("Full manifest generation complete!")

HEADER = """================================================================================
FRONTEND ARCHITECTURE MANIFEST: VOTING ADVICE APPLICATION (VAA - VOTOAFIN)
SENIOR ARCHITECT & COMPILER SPECIALIST EXHAUSTIVE TECHNICAL DOCUMENTATION
TARGET PLATFORM: React / React Native / Expo / TypeScript / Native Design System
================================================================================"""

SEC_1 = """================================================================================
1. APP ENTRY & GLOBAL BOOTSTRAP CONFIGURATION
================================================================================

[frontend/App.tsx]
- Role & Layer: Application Core / Root Bootstrap Orchestrator.
- Architectural Purpose: Serves as the top-level React component tree root. Responsibilities include initializing runtime web accessibility guards, injecting dynamic theme CSS styles into the document head (web), wrapping the application in ErrorBoundary, QueryClientProvider, SafeAreaProvider, and ToastProvider, executing parallel store hydration gates (auth, onboarding, elections, theme, coach marks), and providing the outer NavigationContainer with a dynamic theme palette.
- Public Contracts & Types:
  * Exported component: `default function App(): React.JSX.Element`
- Functional Interface & Invariants:
  * Input parameters / Props contract: Zero props (root entry point).
  * State lifecycle and side-effects:
    - On mount: Calls `hydrateAuth()`, `hydrateOnboarding()`, `hydrateElections()`, `hydrateTheme()`, and `hydrateCoachMarks(null)` in parallel.
    - Reacts to `authHydrated` change: Re-hydrates coach marks with real `authToken ? authUserId : null` identity once auth storage resolution finishes.
    - Reacts to `effective` theme ("light" | "dark"): On Web platform, mutates `document.documentElement.style.backgroundColor`, `document.body.style.backgroundColor`, and injects `<style id="__votoafin_theme_bg__">` to prevent white background flashes on short scroll containers.
    - Hydration gate `ready`: Computed as `authHydrated && onboardingHydrated && themeHydrated`. Displays `<Spinner size="large" />` inside full-screen `<View>` until `ready` is true.
  * Edge cases handled: Non-blocking CoachMarks hydration (prevents LCP element render delay), Web WCAG 2.4.3 aria-hidden focus guard interception via `installAriaHiddenFocusGuard()`, web favicon initialization via `installWebFavicon()`, React Navigation dark mode background bleed override via `navTheme`.
  * Inward & Outward dependencies:
    - Inward: `index.ts` (imports App).
    - Outward: `@react-navigation/native`, `@tanstack/react-query`, `expo-status-bar`, `react-native-safe-area-context`, `src/api/queryClient`, `src/components`, `src/navigation/AppNavigator`, `src/store/*` (`auth`, `coachMarks`, `electionsPrefs`, `onboarding`, `theme`), `src/theme/colors`, `src/utils/installAriaHiddenFocusGuard`, `src/utils/installWebFavicon`.

[frontend/index.ts]
- Role & Layer: Entrypoint / Native & Web App Registry Register.
- Architectural Purpose: Serves as the binary/web application registration script invoked by Expo runtime CLI (`expo-cli` / `metro`). Registers the root component `App` with `AppRegistry.registerComponent('main', () => App)`.
- Public Contracts & Types:
  * Side-effect execution: Calls `registerRootComponent(App)`.
- Functional Interface & Invariants:
  * Input parameters / Props contract: None.
  * State lifecycle and side-effects: Executes immediately upon module bundle evaluation. Registers `App` component into Expo's root component registry.
  * Edge cases handled: Cross-platform environment setup normalization between Expo Go, native standalone builds (iOS/Android), and Expo Web.
  * Inward & Outward dependencies:
    - Inward: Expo CLI runtime loader.
    - Outward: `expo` (`registerRootComponent`), `./App`.

[frontend/app.json]
- Role & Layer: Configuration / Native & Web Expo Application Manifest.
- Architectural Purpose: Declarative JSON manifest consumed by Expo CLI, EAS Build, and Metro bundler. Configures application identity (`name: VotoAFin`, `slug: votoafin`), versioning (`1.0.0`), display orientation (`portrait`), asset pointers (`icon.png`, `favicon.svg`), system UI style (`automatic`), Android adaptive icons, and native plugin declarations.
- Public Contracts & Types:
  * Exported schema: `ExpoConfig` JSON object under key `"expo"`.
- Functional Interface & Invariants:
  * Input parameters / Props contract: Static JSON configuration file.
  * State lifecycle and side-effects: Read at build-time and bundler startup; configures native Android `AndroidManifest.xml` and iOS `Info.plist` generation.
  * Edge cases handled: Android predictive back gesture disable (`predictiveBackGestureEnabled: false`), native plugin registration for `expo-secure-store` and `expo-status-bar`.
  * Inward & Outward dependencies:
    - Inward: Expo CLI, Metro Bundler, EAS Build.
    - Outward: Native asset paths `./assets/*`.

[frontend/babel.config.js]
- Role & Layer: Configuration / Transpiler & Compiler Preset.
- Architectural Purpose: Configures Babel transpilation pipeline for React Native, TypeScript, and Expo web compatibility. Uses `babel-preset-expo` to enable JSX transformation, TS compilation, and environment-aware code optimizations.
- Public Contracts & Types:
  * Exported function: `module.exports = function(api: BabelAPI): BabelConfig`
- Functional Interface & Invariants:
  * Input parameters / Props contract: Accepts Babel API object (`api.cache(true)` enabled for persistent build caching).
  * State lifecycle and side-effects: Runs during Metro bundler compilation phase.
  * Edge cases handled: Automatic tree-shaking of `__DEV__` code branches in production builds.
  * Inward & Outward dependencies:
    - Inward: Metro bundler, Babel CLI.
    - Outward: `babel-preset-expo`.

[frontend/tsconfig.json]
- Role & Layer: Configuration / TypeScript Compiler Options & Path Aliasing.
- Architectural Purpose: Defines TypeScript static type-checking behavior, target standards, strictness flags, and module path aliases (`@/*` -> `./src/*`). Extends standard `expo/tsconfig.base`.
- Public Contracts & Types:
  * Exported schema: JSON compiler configuration options (`compilerOptions`, `include`, `exclude`).
- Functional Interface & Invariants:
  * Input parameters / Props contract: Static JSON configuration file.
  * State lifecycle and side-effects: Enforces strict type compliance (`strict: true`) across IDE and build pipeline.
  * Edge cases handled: Excludes `node_modules`, build configs, Metro configs, and test fixtures from type check compilation unit.
  * Inward & Outward dependencies:
    - Inward: TypeScript compiler (`tsc`), VS Code / Antigravity IDE language server.
    - Outward: `expo/tsconfig.base`.

[frontend/package.json]
- Role & Layer: Configuration / Node Package & Dependency Manifest.
- Architectural Purpose: Declares runtime project dependencies (React 18, React Native, Expo 51, @tanstack/react-query, Zustand, Axios, Lucide icons), development toolchain, scripts for dev server (`npm run dev`), build, type-checking, linting, and automated design system catalog generation.
- Public Contracts & Types:
  * Exported schema: npm package JSON manifest.
- Functional Interface & Invariants:
  * Input parameters / Props contract: Static JSON configuration file.
  * State lifecycle and side-effects: Manages dependency version resolution and CLI script commands.
  * Edge cases handled: Defines peer dependencies and lockfile constraints.
  * Inward & Outward dependencies:
    - Inward: npm CLI, Expo CLI.
    - Outward: All third-party npm packages.

[frontend/serve.json]
- Role & Layer: Configuration / Web Production Routing & SPA Hosting Descriptor.
- Architectural Purpose: Configures static web server hosting (e.g., `serve` / Vercel / Netlify) for Single Page Application (SPA) routing, ensuring all non-asset requests fall back to `index.html`.
- Public Contracts & Types:
  * Exported schema: `serve` configuration JSON object (`rewrites: [ { source: "**", destination: "/index.html" } ]`).
- Functional Interface & Invariants:
  * Input parameters / Props contract: Static JSON file.
  * State lifecycle and side-effects: Applied by HTTP server hosting frontend static build.
  * Edge cases handled: Handles browser direct URL navigation to deep client routes (`/candidatos`, `/resultados`, `/perfil`) without 404 error.
  * Inward & Outward dependencies:
    - Inward: Production static web server environment.
    - Outward: `dist/index.html`."""

SEC_2 = """================================================================================
2. ROUTING, NAVIGATION & CODE SPLITTING
================================================================================

[frontend/src/navigation/AppNavigator.tsx]
- Role & Layer: Routing / Declarative Stack Navigator & Lazy Code-Splitting Core.
- Architectural Purpose: Orchestrates dynamic route stack switching between Auth Stack, Main Stack, and pre-auth Onboarding Stack. Implements web code-splitting using `React.lazy` and custom typed helper `lazyScreen` to reduce initial bundle size from ~1.5 MB to ~300-400 KB. Wraps navigation stack in a React `Suspense` boundary displaying `LazyFallback` spinner during chunk fetch.
- Public Contracts & Types:
  * Exported component: `export function AppNavigator(): React.JSX.Element`
  * Internal helper: `function lazyScreen<T>(factory: () => Promise<Record<string, T>>, name: string): React.LazyExoticComponent<T>`
- Functional Interface & Invariants:
  * Input parameters / Props contract: Zero props (consumes global Zustand stores).
  * State lifecycle and side-effects:
    - Reads `isAuthenticated` and `isGuest` from `useAuthStore`.
    - Reads `hasSeenOnboarding` and `pendingAuthTarget` from `useOnboardingStore`.
    - Computes `showMainStack = isAuthenticated || isGuest`.
    - Computes `showOnboarding = !hasSeenOnboarding && !showMainStack`.
    - Dynamically chooses initial Auth stack screen (`Register` vs `Login`) based on `pendingAuthTarget`.
  * Edge cases handled: Prevents onboarding lockouts for existing sessions, guards `DesignSystem` and `OnboardingPreview` routes behind `__DEV__` compile flag for automated production tree-shaking, handles async lazy screen chunk downloads without unmounting root navigator.
  * Inward & Outward dependencies:
    - Inward: `App.tsx`.
    - Outward: `@react-navigation/native-stack`, `src/screens/*` (Eager: HomeScreen, LoginScreen, OnboardingScreen; Lazy: Cuestionario, SubmitDone, Resultados, DetalleCandidato, MisGuardados, MisRespuestas, Candidatos, Comparar, Perfil, Configuracion, GestionElecciones, Register, PasswordResetRequest, PasswordResetConfirm, DesignSystem), `src/store/auth`, `src/store/onboarding`, `src/navigation/types`.

[frontend/src/navigation/types.ts]
- Role & Layer: Routing / Navigation Parameter Schema & Screen Props Types.
- Architectural Purpose: Centralizes strictly typed route parameters for all screens in `RootStackParamList` and exports `RootStackScreenProps<T>` type helper. Ensures compile-time route contract validation across navigation actions.
- Public Contracts & Types:
  * Exported type: `export type RootStackParamList = { Onboarding: undefined; Login: undefined; Register: undefined; PasswordResetRequest: undefined; PasswordResetConfirm: { token: string } | undefined; Home: undefined; Cuestionario: undefined; SubmitDone: { mode?: "base" | "eleccion" } | undefined; Resultados: undefined; DetalleCandidato: { candidatoId: number; breakdown: BreakdownPorEje | null; matchPct: number | null; confianza: string | null }; MisGuardados: undefined; MisRespuestas: undefined; Comparar: undefined; Candidatos: undefined; Perfil: undefined; Configuracion: undefined; GestionElecciones: undefined; DesignSystem: undefined; OnboardingPreview: undefined; }`
  * Exported type helper: `export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>`
- Functional Interface & Invariants:
  * Input parameters / Props contract: TypeScript type definitions (zero runtime footprint).
  * State lifecycle and side-effects: Compile-time contract checking for `useNavigation()` and `useRoute()` hooks.
  * Edge cases handled: Strictly types optional parameter objects, handles nullable match breakdowns and confidence scores when navigating to `DetalleCandidato` before questionnaire completion.
  * Inward & Outward dependencies:
    - Inward: `AppNavigator.tsx`, all screen components in `src/screens/*`.
    - Outward: `@react-navigation/native-stack`, `src/api/endpoints` (`BreakdownPorEje`).

[frontend/src/navigation/tabs.ts]
- Role & Layer: Routing / Main Navigation Tabs & Accessibility Registry.
- Architectural Purpose: Defines shared single-source-of-truth configuration for the 4 core navigation tabs (`AppTab`: home, candidatos, comparar, config). Shared between `BottomNav` (mobile viewport) and `Sidebar` (desktop/tablet viewport >= 900px).
- Public Contracts & Types:
  * Exported type: `export type AppTab = "home" | "candidatos" | "comparar" | "config"`
  * Exported interface: `export interface AppTabDef { key: AppTab; route: string; icon: IconName; label: string; a11yLabel?: string; }`
  * Exported constant: `export const APP_TABS: readonly AppTabDef[]`
  * Exported interface: `export interface AppTabNavigator { navigate: (routeName: string) => void; }`
- Functional Interface & Invariants:
  * Input parameters / Props contract: Pure constant definitions and interfaces.
  * State lifecycle and side-effects: Read by navigation organism components to render tab bars and handle route switches.
  * Edge cases handled: Provides explicit `a11yLabel` override for VoiceOver/TalkBack screen readers on abbreviated tab labels (e.g. `Config` -> `Configuración`, UX-037 compliance).
  * Inward & Outward dependencies:
    - Inward: `src/components/organisms/BottomNav.tsx`, `src/components/organisms/Sidebar.tsx`.
    - Outward: `src/components/atoms/Icon` (`IconName`)."""

SEC_3 = """================================================================================
3. SCREENS & PRESENTATION LAYER (PRIMARY & COMPONENT VISTAS)
================================================================================

[frontend/src/screens/HomeScreen.tsx]
- Role & Layer: UI Screen/Route / Main Application Hub.
- Architectural Purpose: Primary landing screen displaying active election status, top match rankings (`TopMatchSection`), election switcher strip (`ElectionsStrip`), news feed (`NovedadesFeed`), and trust/methodology section (`HomeTrustSection`).
- Public Contracts & Types:
  * Exported component: `export function HomeScreen({ navigation }: RootStackScreenProps<"Home">): React.JSX.Element`
- Functional Interface & Invariants:
  * Input parameters / Props contract: `RootStackScreenProps<"Home">`.
  * State lifecycle and side-effects:
    - Fetches user progress via `useMiProgreso()`.
    - Reads active elections from `useElectionsPrefsStore`.
    - Triggers coach mark tour `useCoachMarkTour("home")`.
  * Edge cases handled: Empty active elections fallback, guest user match lock banner display (`HomeMatchLocked`), pull-to-refresh query refetch.
  * Inward & Outward dependencies: `AppNavigator`, `src/components/*`, `src/api/hooks`, `src/store/*`.

[frontend/src/screens/Home/HomeElectionItem.tsx]
- Role & Layer: UI Sub-Component / Home Election Card Item.
- Architectural Purpose: Renders a single election card inside the Home election strip showing questionnaire completion progress badge and action button.
- Public Contracts & Types:
  * Exported component: `export function HomeElectionItem(props: HomeElectionItemProps): React.JSX.Element`
- Functional Interface & Invariants:
  * Props contract: `{ tipo: TipoEleccion; progreso?: MiProgresoItem; onSelect: (tipo: TipoEleccion) => void; }`
  * State lifecycle and side-effects: Pure presentation component.
  * Edge cases handled: Handles zero total questions gracefully, truncates long election titles.
  * Inward & Outward dependencies: `HomeScreen.tsx`, `src/api/endpoints`.

[frontend/src/screens/Home/HomeMatchLocked.tsx]
- Role & Layer: UI Sub-Component / Locked Rankings Banner.
- Architectural Purpose: Prompts unauthenticated or guest users to complete the initial questionnaire before revealing political alignment rankings.
- Public Contracts & Types:
  * Exported component: `export function HomeMatchLocked(props: HomeMatchLockedProps): React.JSX.Element`
- Functional Interface & Invariants:
  * Props contract: `{ onStartQuestionnaire: () => void; }`
  * State lifecycle and side-effects: Renders animated lock indicator CTA.
  * Edge cases handled: Supports guest user instant questionnaire launch.
  * Inward & Outward dependencies: `HomeScreen.tsx`, `src/components/atoms/*`.

[frontend/src/screens/Home/HomeTrustSection.tsx]
- Role & Layer: UI Sub-Component / Platform Methodology & Trust Banner.
- Architectural Purpose: Displays informational accordions explaining data privacy, non-partisan neutrality, open-source code auditability, and algorithm methodology.
- Public Contracts & Types:
  * Exported component: `export function HomeTrustSection(): React.JSX.Element`
- Functional Interface & Invariants:
  * Props contract: Zero props contract; static domain content layout.
  * State lifecycle and side-effects: Collapsible item toggles in local state.
  * Edge cases handled: Accessible screen-reader support on accordion headers.
  * Inward & Outward dependencies: `HomeScreen.tsx`, `src/components/molecules/*`.

[frontend/src/screens/CuestionarioScreen.tsx]
- Role & Layer: UI Screen/Route / Stepper Questionnaire Workflow.
- Architectural Purpose: Interactive step-by-step voting advice questionnaire view. Presents Likert scale option selectors (1-5), importance weight selector chips (No me importa, Poco, Medio, Mucho), progress header, and auto-saves user selections to Zustand store.
- Public Contracts & Types:
  * Exported component: `export function CuestionarioScreen({ navigation }: RootStackScreenProps<"Cuestionario">): React.JSX.Element`
- Functional Interface & Invariants:
  * Props contract: `RootStackScreenProps<"Cuestionario">`.
  * State lifecycle: Syncs with `useCuestionarioStore` state (`currentIndex`, `respuestas`, `preguntas`). Submits answers on final question or allows partial result exit when answers >= 10 (`MIN_RESPUESTAS_PARA_RESULTADO`).
  * Edge cases handled: Unanswered questions disable forward stepper CTA, "No sé" option skips weight selector automatically, network drop buffers responses locally.
  * Inward & Outward dependencies: `AppNavigator`, `src/store/cuestionario`, `src/services/cuestionario`, `src/components/*`.

[frontend/src/screens/SubmitDoneScreen.tsx]
- Role & Layer: UI Screen/Route / Questionnaire Completion Acknowledgment.
- Architectural Purpose: Post-submission summary view displaying completion celebration, total answered metrics, social share CTA, and navigation button to Results screen or Next Election.
- Public Contracts & Types:
  * Exported component: `export function SubmitDoneScreen({ navigation, route }: RootStackScreenProps<"SubmitDone">): React.JSX.Element`
- Functional Interface & Invariants:
  * Props contract: `RootStackScreenProps<"SubmitDone">`. Mode param distinguishes general base questionnaire vs election-specific questionnaire.
  * State lifecycle: Triggers confetti/celebration animation on mount.
  * Edge cases handled: Handles navigation to next pending election when base questionnaire completes.
  * Inward & Outward dependencies: `AppNavigator`, `src/services/share`, `src/components/*`.

[frontend/src/screens/ResultadosScreen.tsx]
- Role & Layer: UI Screen/Route / Real-Time Political Alignment Leaderboard.
- Architectural Purpose: Computes and presents candidate alignment results. Renders top match leaderboard, percentage affinity progress rings, candidate comparison links, political compass radar chart, and territorial filters.
- Public Contracts & Types:
  * Exported component: `export function ResultadosScreen({ navigation }: RootStackScreenProps<"Resultados">): React.JSX.Element`
- Functional Interface & Invariants:
  * Props contract: `RootStackScreenProps<"Resultados">`.
  * State lifecycle: Fetches matches via `useMatches(tipoEleccionId)`. Supports anonymous calculation fallback via `matchAnonimo` when guest.
  * Edge cases handled: Low confidence badge warnings (`TENTATIVA`), empty candidate list fallbacks, territorial scope mismatch warnings.
  * Inward & Outward dependencies: `AppNavigator`, `src/api/hooks`, `src/domain/affinity`, `src/components/*`.

[frontend/src/screens/DetalleCandidatoScreen.tsx]
- Role & Layer: UI Screen/Route / Candidate Profile & Stance Breakdown.
- Architectural Purpose: Deep-dive view of a single candidate. Features tabbed navigation (`AfinidadTab`, `ResumenTab`), political bio, direct stance responses per question, radar chart per axis, and bookmark/favorite toggle actions.
- Public Contracts & Types:
  * Exported component: `export function DetalleCandidatoScreen({ navigation, route }: RootStackScreenProps<"DetalleCandidato">): React.JSX.Element`
- Functional Interface & Invariants:
  * Props contract: `RootStackScreenProps<"DetalleCandidato">` (`candidatoId`, `breakdown`, `matchPct`, `confianza`).
  * State lifecycle: Queries candidate details via `useCandidato(candidatoId)` and posturas via `usePosturasCandidato()`.
  * Edge cases handled: Uncalculated match score fallback (displays neutral score), missing social links fallback.
  * Inward & Outward dependencies: `AppNavigator`, `src/api/hooks`, `src/components/*`.

[frontend/src/screens/DetalleCandidato/AfinidadTab.tsx]
- Role & Layer: UI Sub-Component / Question Stance Comparison Tab.
- Architectural Purpose: Renders question-by-question breakdown of candidate answers compared to user answers, highlighting exact agreement vs disagreement.
- Public Contracts & Types: `export function AfinidadTab(props: AfinidadTabProps): React.JSX.Element`
- Functional Interface & Invariants: Props contract: `{ posturas: PosturaCandidatoDetalle[]; respuestasUser?: Record<number, any>; }`

[frontend/src/screens/DetalleCandidato/ResumenTab.tsx]
- Role & Layer: UI Sub-Component / Candidate Biography Tab.
- Architectural Purpose: Displays candidate political trajectory, party metadata, pact, list number, and social web links.
- Public Contracts & Types: `export function ResumenTab(props: ResumenTabProps): React.JSX.Element`
- Functional Interface & Invariants: Props contract: `{ candidato: Candidato; }`

[frontend/src/screens/CandidatosScreen.tsx]
- Role & Layer: UI Screen/Route / Candidate Directory & Territory Filtering.
- Architectural Purpose: Comprehensive directory of all registered candidates. Supports text search, party filtering, and territorial scope filtering (Región, Distrito, Comuna).
- Public Contracts & Types: `export function CandidatosScreen({ navigation }: RootStackScreenProps<"Candidatos">): React.JSX.Element`
- Functional Interface & Invariants: Serves searchable candidate list with debounce text filtering.

[frontend/src/screens/CompararScreen.tsx]
- Role & Layer: UI Screen/Route / Multi-Candidate Comparative Matrix.
- Architectural Purpose: Allows users to select two candidate profiles side-by-side to cross-examine their stances, dimensional agreement rate, and posture diffs across all questions.
- Public Contracts & Types: `export function CompararScreen({ navigation }: RootStackScreenProps<"Comparar">): React.JSX.Element`
- Functional Interface & Invariants: Uses `compararPosturas` domain service to compute stance diffs.

[frontend/src/screens/MisGuardadosScreen.tsx]
- Role & Layer: UI Screen/Route / Bookmarked Content Management.
- Architectural Purpose: Tabbed screen organizing user's bookmarked candidates, saved posturas, and saved news articles for quick offline/online retrieval.
- Public Contracts & Types: `export function MisGuardadosScreen({ navigation }: RootStackScreenProps<"MisGuardados">): React.JSX.Element`

[frontend/src/screens/MisRespuestasScreen.tsx]
- Role & Layer: UI Screen/Route / Retroactive Questionnaire Answer Editor.
- Architectural Purpose: Allows users to review all previously submitted answers, modify individual choices or weights, and trigger background recalibration of candidate match scores.
- Public Contracts & Types: `export function MisRespuestasScreen({ navigation }: RootStackScreenProps<"MisRespuestas">): React.JSX.Element`

[frontend/src/screens/GestionEleccionesScreen.tsx]
- Role & Layer: UI Screen/Route / Multi-Election Scope Switcher.
- Architectural Purpose: Interface for enabling/disabling active election types (Presidencial, Parlamentaria, Gobernadores, Alcaldes) and configuring regional territorial context.
- Public Contracts & Types: `export function GestionEleccionesScreen({ navigation }: RootStackScreenProps<"GestionElecciones">): React.JSX.Element`

[frontend/src/screens/PerfilScreen.tsx]
- Role & Layer: UI Screen/Route / User Profile & Territory Binding.
- Architectural Purpose: Manages user account identity, display username, email address, and territorial location binding (Región / Comuna picker modal).
- Public Contracts & Types: `export function PerfilScreen({ navigation }: RootStackScreenProps<"Perfil">): React.JSX.Element`

[frontend/src/screens/ConfiguracionScreen.tsx]
- Role & Layer: UI Screen/Route / App Settings & Account Lifecycle.
- Architectural Purpose: Application settings view handling dark/light theme switching, accessibility text scaling, coach mark tour re-triggering, account deletion trigger, and debug options.
- Public Contracts & Types: `export function ConfiguracionScreen({ navigation }: RootStackScreenProps<"Configuracion">): React.JSX.Element`

[frontend/src/screens/OnboardingScreen.tsx]
- Role & Layer: UI Screen/Route / Multi-Slide Onboarding Tour.
- Architectural Purpose: Swipeable onboarding carousel presenting interactive product demos (`OnboardingEleccionesDemo`, `OnboardingPreguntaDemo`, `OnboardingResultadosDemo`) and direct transition CTAs to Register or Login.
- Public Contracts & Types: `export function OnboardingScreen({ navigation }: RootStackScreenProps<"Onboarding">): React.JSX.Element`

[frontend/src/screens/Onboarding/OnboardingEleccionesDemo.tsx]
- Role & Layer: UI Sub-Component / Onboarding Demo Slide 1.
- Architectural Purpose: Interactive demo component illustrating election switching mechanics.
- Public Contracts & Types: `export function OnboardingEleccionesDemo(): React.JSX.Element`

[frontend/src/screens/Onboarding/OnboardingPreguntaDemo.tsx]
- Role & Layer: UI Sub-Component / Onboarding Demo Slide 2.
- Architectural Purpose: Interactive demo component illustrating question answer and weight selection mechanics.
- Public Contracts & Types: `export function OnboardingPreguntaDemo(): React.JSX.Element`

[frontend/src/screens/Onboarding/OnboardingResultadosDemo.tsx]
- Role & Layer: UI Sub-Component / Onboarding Demo Slide 3.
- Architectural Purpose: Interactive demo component illustrating candidate matching results mechanics.
- Public Contracts & Types: `export function OnboardingResultadosDemo(): React.JSX.Element`

[frontend/src/screens/LoginScreen.tsx]
- Role & Layer: UI Screen/Route / Authentication Entry.
- Architectural Purpose: User login screen validating username/password credentials, offering guest mode access ("Continuar como invitado"), and navigating to account registration or password reset.
- Public Contracts & Types: `export function LoginScreen({ navigation }: RootStackScreenProps<"Login">): React.JSX.Element`

[frontend/src/screens/RegisterScreen.tsx]
- Role & Layer: UI Screen/Route / Account Registration Onboarding.
- Architectural Purpose: Account creation screen taking username, email, password, optional territorial selection (Región/Comuna), and privacy consent.
- Public Contracts & Types: `export function RegisterScreen({ navigation }: RootStackScreenProps<"Register">): React.JSX.Element`

[frontend/src/screens/PasswordResetRequestScreen.tsx]
- Role & Layer: UI Screen/Route / Password Reset Initial Step.
- Architectural Purpose: Password recovery form taking user email address and triggering backend email token dispatch.
- Public Contracts & Types: `export function PasswordResetRequestScreen({ navigation }: RootStackScreenProps<"PasswordResetRequest">): React.JSX.Element`

[frontend/src/screens/PasswordResetConfirmScreen.tsx]
- Role & Layer: UI Screen/Route / Password Reset Token Confirmation.
- Architectural Purpose: Final password recovery form validating recovery token from email deep link and setting new account password.
- Public Contracts & Types: `export function PasswordResetConfirmScreen({ navigation, route }: RootStackScreenProps<"PasswordResetConfirm">): React.JSX.Element`

[frontend/src/screens/design-system/DesignSystemScreen.tsx]
- Role & Layer: UI Screen/Route / Internal Developer Sandbox & Component Catalog.
- Architectural Purpose: Development-only component catalog screen (`__DEV__` guarded) rendering design system tokens, typography scales, atomic components, contrast matrices, and interactive component state controls.
- Public Contracts & Types: `export function DesignSystemScreen(): React.JSX.Element`

[frontend/src/screens/design-system/catalog/* & showcase/*]
- Role & Layer: Presentation Modules / Design System Token & Component Previews.
- Architectural Purpose: Modular catalog cataloging design tokens (`colors`, `dimensiones`, `motion`, `radii`, `shadows`, `spacing`, `typography`) and showcase controls (`CodeBlock`, `ComponentShowcase`, `DesignSystemToolbar`, `PropsTable`, `Sidebar`, `TokenPreviews`, `VariantGrid`)."""

SEC_4 = """================================================================================
4. DOMAIN KERNELS & ALGORITHMIC MATCHING SERVICES
================================================================================

[frontend/src/domain/affinity.ts]
- Role & Layer: Utility/Math Kernel / Affinity Tier & Color Resolver.
- Architectural Purpose: Pure domain logic for mapping candidate alignment percentages (0-100%) to 5 affinity tiers (`aff1`-`aff5`) and resolving theme-aware hex colors (`affinity`, `affinityDark`). Eliminates duplicate palette definitions by binding directly to `theme/colors.ts`.
- Public Contracts & Types:
  * Exported type: `export type AffinityTier = 1 | 2 | 3 | 4 | 5`
  * Exported function: `export function getAffinityTier(pct: number): AffinityTier`
  * Exported function: `export function getAffinityColor(pct: number, isDark?: boolean): string`
- Functional Interface & Invariants:
  * Input parameters / Props contract: Strictly typed numbers and booleans.
  * Invariants: Clamps percentage between 0 and 100 before computing tier thresholds (81-100% -> 5, 61-80% -> 4, 41-60% -> 3, 21-40% -> 2, 0-20% -> 1).
  * Inward & Outward dependencies: Inward: `matching.ts`, `ResultadosScreen`, `RankingCard`. Outward: `src/theme/colors`.

[frontend/src/domain/dimensiones.ts]
- Role & Layer: Utility/Math Kernel / Thematic Dimension Catalog & Theme Mapper.
- Architectural Purpose: Single-source-of-truth for the 7 semantic thematic dimensions (`economico`, `social`, `cultural`, `ambiental`, `institucional`, `pueblos_originarios`, `discapacidad`). Maps backend `EjeTematicoEnum` codes (ECONOMIA, SOCIEDAD, etc.) to design system dimension keys and resolves WCAG AA compliant text and border colors per theme.
- Public Contracts & Types:
  * Exported type: `export type DimensionKey = "economico" | "social" | "cultural" | "ambiental" | "institucional" | "pueblos_originarios" | "discapacidad"`
  * Exported interface: `export interface Dimension { key: DimensionKey; label: string; icon: string; badge: string; text: { light: string; dark: string }; border: { light: string; dark: string }; }`
  * Exported constant: `export const DIMENSIONES: readonly Dimension[]`
  * Exported function: `export function getDimension(key: DimensionKey): Dimension`
  * Exported function: `export function getDimensionColors(key: DimensionKey, isDark: boolean): DimensionColors`
  * Exported function: `export function getDimensionColorsForEje(ejeCode: string, isDark: boolean): DimensionColors | null`
- Functional Interface & Invariants: Guaranteed WCAG AA contrast ratio (>= 4.5:1) over light and dark surface colors.

[frontend/src/domain/eleccion.ts]
- Role & Layer: Utility/Math Kernel / Election Domain Helpers.
- Architectural Purpose: Domain logic for election scope classification, candidate count summary formatting, and base election filter predicates.
- Public Contracts & Types:
  * Exported function: `export function isElectionBase(tipo: { es_base?: boolean }): boolean`
  * Exported function: `export function formatElectionScope(tipo: TipoEleccion): string`

[frontend/src/services/matching.ts]
- Role & Layer: Utility/Math Kernel / Pure Matching Evaluation & Sorting Service.
- Architectural Purpose: Domain service for match tier classification, Likert stance color mapping (`getLikertColor`), confidence badge formatting (`getConfianzaBadge`), confidence tier conversion (`confianzaToTier`), and defensive score sorting (`sortByMatchDesc`).
- Public Contracts & Types:
  * Exported type: `export type MatchTier = "aff5" | "aff4" | "aff3" | "aff2" | "aff1"`
  * Exported function: `export function getMatchTier(pct: number): MatchTier`
  * Exported function: `export function getMatchColor(pct: number): string`
  * Exported function: `export function formatMatchPercentage(pct: number): string`
  * Exported function: `export function getLikertColor(valor: number, palette: LikertColorPalette, isDark: boolean): string`
  * Exported function: `export function sortByMatchDesc(results: MatchResult[]): MatchResult[]`

[frontend/src/services/cuestionario.ts]
- Role & Layer: Utility/Math Kernel / Questionnaire Business Logic & Rules Engine.
- Architectural Purpose: Pure domain service managing importance weights (`PESOS`, values 0-3), option classification (`separarOpciones` for "No sé"), weight prompt visibility rules (`debeMostrarPeso`), progress math (`calcularProgreso`), and submission readiness checks (`puedeEnviar`).
- Public Contracts & Types:
  * Exported type: `export type PesoValue = 0 | 1 | 2 | 3`
  * Exported constant: `export const PESOS: readonly PesoOption[]`
  * Exported constant: `export const MIN_RESPUESTAS_PARA_RESULTADO = 10`
  * Exported function: `export function separarOpciones(opciones?: OpcionRespuesta[]): OpcionesSeparadas`
  * Exported function: `export function debeMostrarPeso(opciones?: OpcionRespuesta[], opcionElegidaId?: number): boolean`
  * Exported function: `export function calcularProgreso(currentIndex: number, total: number): number`
  * Exported function: `export function puedeEnviar(preguntas: Pregunta[], respuestas: Record<number, RespuestaMinima | undefined>): boolean`

[frontend/src/services/comparar.ts]
- Role & Layer: Utility/Math Kernel / Multi-Candidate Comparison Engine.
- Architectural Purpose: Cruxes candidate stance lists by question ID to calculate agreement categories (`identica`, `cercana`, `opuesta`, `solo_uno`, `ninguno`), builds grouped comparison items per thematic axis, and computes aggregate percentage agreement stats (`calcularResumen`).
- Public Contracts & Types:
  * Exported type: `export type NivelCoincidencia = "identica" | "cercana" | "opuesta" | "solo_uno" | "ninguno"`
  * Exported interface: `export interface ItemComparacion { ... }`
  * Exported interface: `export interface ResumenComparacion { ... }`
  * Exported function: `export function compararPosturas(posturasA: PosturaCandidatoDetalle[], posturasB: PosturaCandidatoDetalle[]): GrupoComparacion[]`
  * Exported function: `export function calcularResumen(grupos: GrupoComparacion[]): ResumenComparacion`

[frontend/src/services/share.ts]
- Role & Layer: API Service/DTO / Results Sharing & Clipboard Service.
- Architectural Purpose: Generates structured plain-text match summaries formatted for WhatsApp, X, and email (`buildShareText`). Provides cross-platform native Web Share API wrappers (`shareNative`) with clipboard copy fallback (`copyToClipboard`).
- Public Contracts & Types:
  * Exported interface: `export interface ShareableMatch { match_percentage: string | number; candidato_data: { nombre?: string; apellido?: string; partido?: string | null }; }`
  * Exported function: `export function buildShareText(input: ShareTextInput): string`
  * Exported function: `export function shareNative(text: string, title?: string): Promise<boolean>`
  * Exported function: `export function copyToClipboard(text: string): Promise<boolean>`"""

SEC_5 = """================================================================================
5. STATE MANAGEMENT & PERSISTENCE STORES
================================================================================

[frontend/src/store/auth.ts]
- Role & Layer: State Management / User Authentication & Session Store.
- Architectural Purpose: Core Zustand store managing authentication state (`token`, `userId`, `isGuest`, `isHydrated`, `isAuthenticated`). Handles cross-platform storage hydration via `secureStorage`, automatic guest mode exit upon login, and token cleanup on logout.
- Public Contracts & Types:
  * Exported hook/store: `export const useAuthStore = create<AuthState>(...)`
- Functional Interface & Invariants:
  * State contracts: `token: string | null; userId: number | null; isGuest: boolean; isHydrated: boolean; isAuthenticated: boolean;`
  * Actions: `hydrate()`, `setSession(token, userId)`, `logout()`, `enterGuestMode()`, `exitGuestMode()`.
  * Invariants: On web, `isAuthenticated` relies on `userId !== null` proxy due to `httpOnly` cookie isolation. On native, uses SecureStore token string.

[frontend/src/store/cuestionario.ts]
- Role & Layer: State Management / Active Questionnaire Workflow Store.
- Architectural Purpose: Zustand store managing active questionnaire state (`tipoEleccionId`, `preguntas`, `currentIndex`, `respuestas` map, `loading`, `submitting`). Handles question page load, response recording, importance weighting, stepper navigation (`next`, `prev`), anonymous payload serialization (`getRespuestasParaAnonimo`), and server submission.
- Public Contracts & Types:
  * Exported hook/store: `export const useCuestionarioStore = create<CuestionarioState>(...)`
- Functional Interface & Invariants:
  * Actions: `loadForTipoEleccion(id, esBase)`, `setRespuesta(preguntaId, opcionId, peso)`, `setPeso(preguntaId, peso)`, `next()`, `prev()`, `reset()`, `submit(options)`.

[frontend/src/store/electionsPrefs.ts]
- Role & Layer: State Management / User Election Preferences Store.
- Architectural Purpose: Zustand store managing user-activated election types (`activeIds: number[] | null`). Persists preferences to local storage, initializes defaults upon onboarding completion, and exports `partitionTipos` helper for partitioning election lists.
- Public Contracts & Types:
  * Exported hook/store: `export const useElectionsPrefsStore = create<ElectionsPrefsState>(...)`
  * Exported function: `export function partitionTipos<T>(tipos: T[], activeIds: number[] | null): { activas: T[]; disponibles: T[] }`

[frontend/src/store/onboarding.ts]
- Role & Layer: State Management / Intro Onboarding Tour & Post-Auth Intent Store.
- Architectural Purpose: Zustand store tracking persistent intro completion flag (`hasSeen`) across device reboots and managing in-memory transient post-onboarding navigation targets (`pendingAuthTarget: "Login" | "Register"`).
- Public Contracts & Types:
  * Exported hook/store: `export const useOnboardingStore = create<OnboardingState>(...)`

[frontend/src/store/secureStorage.ts]
- Role & Layer: State Management / Cross-Platform Encrypted Storage Abstraction.
- Architectural Purpose: Universal secure storage wrapper. Uses `expo-secure-store` (Keychain / KeyStore) on iOS/Android and falls back to non-sensitive `sessionStorage` on Web (where authentication tokens live in isolated `httpOnly` cookies).
- Public Contracts & Types:
  * Exported constant: `export const AUTH_TOKEN_STORAGE_KEY = "votoafin_auth_token"`
  * Exported object: `export const secureStorage = { getItem(key), setItem(key, val), removeItem(key) }`

[frontend/src/store/theme.ts]
- Role & Layer: State Management / Theme Preference & Color Scheme Store.
- Architectural Purpose: Zustand store managing application theme mode (`"light" | "dark" | "system"`). Persists user preference and listens dynamically to OS color scheme changes via React Native `Appearance.addChangeListener`.
- Public Contracts & Types:
  * Exported type: `export type ThemeMode = "light" | "dark" | "system"`
  * Exported hook/store: `export const useThemeStore = create<ThemeState>(...)`

[frontend/src/store/coachMarks.ts]
- Role & Layer: State Management / Per-User Feature Tour Completion Store.
- Architectural Purpose: Zustand store tracking completed coach mark feature tours (`seen: Map<TourId, true>`). Persists completion state per user identity (`userId` or `guest`) in secure storage and supports full tour reset cycles for context help.
- Public Contracts & Types:
  * Exported hook/store: `export const useCoachMarksStore = create<CoachMarksState>(...)`"""

SEC_6 = """================================================================================
6. API CLIENT & NETWORK INTEGRATION LAYER
================================================================================

[frontend/src/api/client.ts]
- Role & Layer: API Service/DTO / Axios Client Instance & Network Interceptors.
- Architectural Purpose: Configures base HTTP client using Axios. Manages base URL resolution, 10s default timeouts, cross-origin `withCredentials: true` cookies on Web, mobile `Bearer` token request interceptor, and automated 401 logout response interceptors.
- Public Contracts & Types:
  * Exported instance: `export const apiClient: AxiosInstance`
  * Exported function: `export function getErrorMessage(error: unknown): string`

[frontend/src/api/config.ts]
- Role & Layer: Configuration / Network Base URL & Environment Config.
- Architectural Purpose: Dynamically resolves API base URL from `EXPO_PUBLIC_API_BASE` env var with platform fallback logic (Android emulator `http://10.0.2.2:8010/api/v1`, iOS `http://127.0.0.1:8010/api/v1`, Web `http://localhost:8010/api/v1`). Derives `ADMIN_URL` for Django administration access.
- Public Contracts & Types:
  * Exported constant: `export const API_BASE_URL: string`
  * Exported constant: `export const API_TIMEOUT_MS = 10000`
  * Exported constant: `export const ADMIN_URL: string`

[frontend/src/api/endpoints.ts]
- Role & Layer: API Service/DTO / Typed REST API Endpoint Callers.
- Architectural Purpose: Comprehensive catalog of typed async functions interfacing DRF backend endpoints for auth (`login`, `register`, `logoutApi`), candidate directory (`listCandidatos`), questionnaire (`preguntasPendientes`, `submitRespuestas`), matching (`matchCandidatos`, `matchAnonimo`, `getMatchDetalle`), bookmarks (`listFavoritos`, `addFavorito`, `deleteFavorito`), profile (`getPerfil`, `actualizarComuna`), and territory (`listRegiones`, `listComunas`).
- Public Contracts & Types:
  * Exported derived types: `Candidato`, `TipoEleccion`, `Pregunta`, `OpcionRespuesta`, `MatchResult`, `MiProgresoItem`, `EjeTematico`, `BreakdownPorEje`, `Perfil`, `Region`, `ComunaInline`.
  * Exported API callers: `register()`, `login()`, `logoutApi()`, `listTiposEleccion()`, `preguntasPendientes()`, `submitRespuestas()`, `matchCandidatos()`, `matchAnonimo()`, `getMatchDetalle()`, `getMiProgreso()`, `getPerfil()`, `actualizarComuna()`, `listRegiones()`, `listComunas()`, `listFavoritos()`, `addFavorito()`, `deleteFavorito()`, `listDescartados()`, `listPosturasBookmarks()`.

[frontend/src/api/hooks.ts]
- Role & Layer: Custom Hook / React Query Data Fetching & Mutation Hooks.
- Architectural Purpose: Encapsulates all data fetching, caching, deduplication, and cache invalidation logic for frontend presentation screens.
- Public Contracts & Types:
  * Exported hooks: `useTiposEleccion()`, `usePreguntas()`, `useCandidatos()`, `useCandidato()`, `useMatches()`, `useMatchDetalle()`, `useMiProgreso()`, `usePerfil()`, `useFavoritos()`, `useDescartados()`, `usePosturasBookmarks()`, `useRegiones()`, `useComunas()`, `useMisRespuestas()`, `useUpdateRespuesta()`, `useReiniciarCuestionario()`, `useAddFavorito()`, `useDeleteFavorito()`, `useAddDescartado()`, `useDeleteDescartado()`, `useAddPosturaBookmark()`, `useDeletePosturaBookmark()`, `useActualizarComuna()`, `useCambiarUsername()`, `useCambiarEmail()`, `useCambiarPassword()`, `useRequestPasswordReset()`, `useConfirmPasswordReset()`, `useEliminarCuenta()`.

[frontend/src/api/queryClient.ts]
- Role & Layer: API Service/DTO / React Query Instance & Query Key Factory.
- Architectural Purpose: Configures global `QueryClient` instance (60s `staleTime`, single retry, disabled window focus refetching) and defines central `queryKeys` factory for type-safe query cache invalidation.
- Public Contracts & Types:
  * Exported instance: `export const queryClient: QueryClient`
  * Exported factory: `export const queryKeys: { tiposEleccion, preguntas, candidatos, candidato, regiones, comunas, perfil, misRespuestas, matches, matchDetalle, miProgreso, posturas, favoritos, descartados, posturasBookmarks }`

[frontend/src/types/api.ts]
- Role & Layer: API Service/DTO / Auto-Generated OpenAPI v3 TypeScript Definitions.
- Architectural Purpose: Machine-generated OpenAPI schema types (`openapi-typescript`). Defines exact shape of all DRF REST v1 request inputs, response DTOs, query parameters, error responses, and database model representations.
- Public Contracts & Types:
  * Exported interface: `export interface paths { ... }`
  * Exported interface: `export interface components { schemas: { Candidato: ..., TipoEleccion: ..., Pregunta: ..., MatchCandidatoResult: ..., Perfil: ... } }`
  * Exported interface: `export interface operations { ... }`"""

SEC_7 = """================================================================================
7. THEME & NATIVE DESIGN SYSTEM ENGINE
================================================================================

[frontend/src/theme/colors.ts]
- Role & Layer: Configuration / Color Palette Tokens & Affinity Schemes.
- Architectural Purpose: Primary single-source-of-truth for light (`colors`) and dark (`colorsDark`) theme color palettes, 5 affinity tier tokens (`affinity`, `affinityDark`), semantic intent tints, and elevation background surface colors.
- Public Contracts & Types:
  * Exported constants: `colors`, `colorsDark`, `affinity`, `affinityDark`.

[frontend/src/theme/index.ts]
- Role & Layer: Configuration / Central Theme Barrel Export.
- Architectural Purpose: Aggregates and re-exports all design tokens (colors, typography, spacing, radii, shadows, layout, motion) and theme access hooks (`useTheme`, `useThemeColors`, `useIsDark`).

[frontend/src/theme/layout.ts]
- Role & Layer: Configuration / Layout Breakpoints & Grid Tokens.
- Architectural Purpose: Defines responsive layout parameters: mobile vs desktop breakpoint (900px), max content width (1200px), top/bottom bar heights, and Z-index scale layers.

[frontend/src/theme/motion.ts]
- Role & Layer: Configuration / Animation Timing & Easing Tokens.
- Architectural Purpose: Declares standard micro-interaction durations (fast: 150ms, normal: 250ms, slow: 400ms) and cubic-bezier easing curves.

[frontend/src/theme/radii.ts]
- Role & Layer: Configuration / Border Radius Design Tokens.
- Architectural Purpose: Declares corner radius scale (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 9999`).

[frontend/src/theme/shadows.ts]
- Role & Layer: Configuration / Elevation & Box Shadow Design Tokens.
- Architectural Purpose: Defines cross-platform elevation shadow objects for iOS (shadowColor, shadowOffset, shadowOpacity, shadowRadius) and Android (elevation).

[frontend/src/theme/spacing.ts]
- Role & Layer: Configuration / Layout Spacing Scale Tokens.
- Architectural Purpose: Standard 4px-grid spacing scale (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`).

[frontend/src/theme/typography.ts]
- Role & Layer: Configuration / Typographic Tokens & Scales.
- Architectural Purpose: Declares font families, font weights (`regular`, `medium`, `semibold`, `bold`), font sizes (h1: 28, h2: 22, body: 16, caption: 12), and line heights.

[frontend/src/theme/useTheme.ts]
- Role & Layer: Custom Hook / Reactive Theme Access Hooks.
- Architectural Purpose: Custom React hooks (`useTheme`, `useThemeColors`, `useIsDark`) providing components with dynamic theme palette objects and dark mode state.

[frontend/src/theme/utils.ts]
- Role & Layer: Utility/Math Kernel / Color Manipulation Helpers.
- Architectural Purpose: Pure utility functions for hex-to-rgba conversion, color alpha blending, and text contrast ratio validation."""

SEC_8 = """================================================================================
8. ATOMIC UI COMPONENTS (ATOMS)
================================================================================

[frontend/src/components/atoms/ActionButton.tsx]
- Role & Layer: Shared Component (Atom) / Action CTA Touch Button.
- Architectural Purpose: Atomic button component rendering touch CTAs with icon, text, and spinner states.
- Public Contracts & Types: `export function ActionButton(props: ActionButtonProps): React.JSX.Element`
- Functional Interface & Invariants: Props contract: `{ label: string; icon?: IconName; loading?: boolean; disabled?: boolean; onPress: () => void; }`

[frontend/src/components/atoms/AppIcon.tsx]
- Role & Layer: Shared Component (Atom) / Brand Symbol Component.
- Architectural Purpose: Renders the official VotoAFin brand vector emblem icon.
- Public Contracts & Types: `export function AppIcon(props: AppIconProps): React.JSX.Element`

[frontend/src/components/atoms/Avatar.tsx]
- Role & Layer: Shared Component (Atom) / Candidate & User Avatar Component.
- Architectural Purpose: Circular avatar image component with initials text fallback when candidate image fails to load.
- Public Contracts & Types: `export function Avatar(props: AvatarProps): React.JSX.Element`

[frontend/src/components/atoms/Badge.tsx]
- Role & Layer: Shared Component (Atom) / Status Tag Indicator.
- Architectural Purpose: Small status tag badge with semantic intent colors (success, warning, danger, info, neutral).
- Public Contracts & Types: `export function Badge(props: BadgeProps): React.JSX.Element`

[frontend/src/components/atoms/BookmarkButton.tsx]
- Role & Layer: Shared Component (Atom) / Bookmark & Favorite Heart Toggle.
- Architectural Purpose: Touch icon button toggling candidate or posture bookmark status with active state animation.
- Public Contracts & Types: `export function BookmarkButton(props: BookmarkButtonProps): React.JSX.Element`

[frontend/src/components/atoms/Button.tsx]
- Role & Layer: Shared Component (Atom) / Core Button Primitive.
- Architectural Purpose: Primary atomic button supporting variant styles (primary, secondary, ghost, danger), size scales (sm, md, lg), loading spinner, and disabled touch state.
- Public Contracts & Types: `export function Button(props: ButtonProps): React.JSX.Element`

[frontend/src/components/atoms/Checkbox.tsx] - Atom / Accessible boolean checkbox input element.
[frontend/src/components/atoms/Chip.tsx] - Atom / Interactive filter tag chip element.
[frontend/src/components/atoms/DimensionBadge.tsx] - Atom / Circular badge chip representing a thematic dimension with icon.
[frontend/src/components/atoms/Divider.tsx] - Atom / Visual content separator line component.
[frontend/src/components/atoms/Heading.tsx] - Atom / Typography heading component (h1-h4 scale).
[frontend/src/components/atoms/Icon.tsx] - Atom / Lucide vector icon wrapper component with typed icon names.
[frontend/src/components/atoms/IconButton.tsx] - Atom / Circular icon-only touch button.
[frontend/src/components/atoms/Input.tsx] - Atom / Single-line and multi-line text input field component with focus ring.
[frontend/src/components/atoms/Link.tsx] - Atom / Accessible text hyperlink component.
[frontend/src/components/atoms/PageDots.tsx] - Atom / Carousel page pagination dot indicator.
[frontend/src/components/atoms/Progress.tsx] - Atom / Horizontal linear progress bar component.
[frontend/src/components/atoms/ProgressRing.tsx] - Atom / SVG circular match affinity percentage progress ring.
[frontend/src/components/atoms/RadarChart.tsx] - Atom / SVG 5-axis political compass radar chart component for dimensional posture display.
[frontend/src/components/atoms/Radio.tsx] - Atom / Single-select radio button option element.
[frontend/src/components/atoms/SentimentBadge.tsx] - Atom / Visual stance sentiment indicator badge (Positivo, Neutral, Negativo).
[frontend/src/components/atoms/Spinner.tsx] - Atom / Animated activity loading indicator spinner.
[frontend/src/components/atoms/StatBlock.tsx] - Atom / Numerical metric display card block.
[frontend/src/components/atoms/TabBarItem.tsx] - Atom / Navigation bar tab button item with active icon and label states.
[frontend/src/components/atoms/Tabs.tsx] - Atom / Segmented tab selector control.
[frontend/src/components/atoms/ThemeToggle.tsx] - Atom / Quick light/dark theme switcher button.
[frontend/src/components/atoms/Timeline.tsx] - Atom / Vertical chronology node element.
[frontend/src/components/atoms/Toggle.tsx] - Atom / Boolean switch toggle control.
[frontend/src/components/atoms/Tooltip.tsx] - Atom / Hover/tap informational tooltip popup overlay.
[frontend/src/components/atoms/index.ts] - Atom Barrel / Exports all atomic components."""

SEC_9 = """================================================================================
9. MOLECULAR UI COMPONENTS (MOLECULES)
================================================================================

[frontend/src/components/molecules/CandidateCardHeader.tsx] - Molecule / Header block for candidate cards with photo, name, party, and list info.
[frontend/src/components/molecules/CandidateFilterBar.tsx] - Molecule / Search field and filter chips bar for candidate directory.
[frontend/src/components/molecules/CandidateMetaPills.tsx] - Molecule / Metadata pill group for region, pact, and election scope.
[frontend/src/components/molecules/CoachMark.tsx] - Molecule / Guided feature highlight spotlight box with step description and CTAs.
[frontend/src/components/molecules/CoachMarkTour.tsx] - Molecule / Feature onboarding tour sequence manager handling active step transitions.
[frontend/src/components/molecules/CollapsibleFilterSection.tsx] - Molecule / Expandable filter category section accordion.
[frontend/src/components/molecules/ConfirmModal.tsx] - Molecule / Modal dialog prompting confirmation for destructive actions.
[frontend/src/components/molecules/DimensionCard.tsx] - Molecule / Thematic dimension card with colored border, icon header, and text body.
[frontend/src/components/molecules/EditarRespuestaModal.tsx] - Molecule / Modal allowing retroactive editing of question answer and importance weight.
[frontend/src/components/molecules/ElectionCard.tsx] - Molecule / Election summary card displaying candidate count and questionnaire progress.
[frontend/src/components/molecules/ElectionCardAdd.tsx] - Molecule / Election selection card for activating additional election scopes.
[frontend/src/components/molecules/ElectionsStrip.tsx] - Molecule / Horizontal scroll strip of active elections in Home hub.
[frontend/src/components/molecules/EliminarCuentaModal.tsx] - Molecule / Account deletion confirmation modal with password re-entry validation.
[frontend/src/components/molecules/EmptyState.tsx] - Molecule / Placeholder component displayed when lists or search results return empty.
[frontend/src/components/molecules/FormField.tsx] - Molecule / Form input field wrapper with label, helper text, and error message.
[frontend/src/components/molecules/ListPickerModal.tsx] - Molecule / Modal selection list for picking options (e.g. Region / Comuna).
[frontend/src/components/molecules/MatchSummaryCard.tsx] - Molecule / Summary card highlighting top candidate match affinity and key alignment axes.
[frontend/src/components/molecules/MatchTier.tsx] - Molecule / Visual affinity tier indicator tag (Tier 1-5).
[frontend/src/components/molecules/Modal.tsx] - Molecule / Base accessible modal dialog overlay with backdrop and close actions.
[frontend/src/components/molecules/NavRow.tsx] - Molecule / Navigation row item with title, icon, and arrow indicator for settings menus.
[frontend/src/components/molecules/NewsCard.tsx] - Molecule / Informational news article preview card with image and bookmark button.
[frontend/src/components/molecules/NoticiaDetailSheet.tsx] - Molecule / Bottom sheet presenting full text content of news articles.
[frontend/src/components/molecules/NovedadesFeed.tsx] - Molecule / List feed component rendering latest political news and announcements.
[frontend/src/components/molecules/NovedadItem.tsx] - Molecule / News feed item layout component.
[frontend/src/components/molecules/PosturaItem.tsx] - Molecule / Single question posture item displaying candidate statement and Likert value.
[frontend/src/components/molecules/PreguntaInfoModal.tsx] - Molecule / Informational modal detailing question background and dimension impacts.
[frontend/src/components/molecules/ProgressSplit.tsx] - Molecule / Dual progress bar comparing user vs candidate stance distribution.
[frontend/src/components/molecules/ProgressStepper.tsx] - Molecule / Stepper bar showing questionnaire completion progress percentage.
[frontend/src/components/molecules/RadioGroup.tsx] - Molecule / Exclusive selection radio option group for Likert questionnaire options.
[frontend/src/components/molecules/ScreenTopBar.tsx] - Molecule / Standard top header bar for sub-screens with back navigation button.
[frontend/src/components/molecules/SectionTitle.tsx] - Molecule / Section heading title component with subtitle and optional action link.
[frontend/src/components/molecules/ShareModal.tsx] - Molecule / Modal presenting share options (Native Share API, Copy Link, WhatsApp).
[frontend/src/components/molecules/ShareOptions.tsx] - Molecule / Action button strip for sharing match results.
[frontend/src/components/molecules/Toast.tsx] - Molecule / Toast notification banner provider and component for temporary alerts.
[frontend/src/components/molecules/UbicacionPicker.tsx] - Molecule / Interactive region and comuna territory selector component.
[frontend/src/components/molecules/WeightSelector.tsx] - Molecule / Chip selector group for setting question importance weight (0-3).
[frontend/src/components/molecules/index.ts] - Molecule Barrel / Exports all molecular components."""

SEC_10 = """================================================================================
10. ORGANIC & TEMPLATE COMPONENTS (ORGANISMS & TEMPLATES)
================================================================================

[frontend/src/components/organisms/BottomNav.tsx] - Organism / Mobile bottom navigation bar component rendering main tab buttons.
[frontend/src/components/organisms/CandidateCard.tsx] - Organism / Complete candidate card displaying bio, match percentage ring, and detail action.
[frontend/src/components/organisms/CandidatoPicker.tsx] - Organism / Selection modal/sheet for picking candidate profiles in side-by-side comparator.
[frontend/src/components/organisms/CandidatoPosturas.tsx] - Organism / Full stance breakdown list for a candidate grouped by thematic axis.
[frontend/src/components/organisms/Comparator.tsx] - Organism / Side-by-side candidate comparison matrix component with posture agreement diffs.
[frontend/src/components/organisms/CuestionarioHeader.tsx] - Organism / Top header block for questionnaire screen with stepper progress and exit actions.
[frontend/src/components/organisms/ErrorBoundary.tsx] - Organism / React error boundary capturing render exceptions and displaying fallback UI.
[frontend/src/components/organisms/FilterBottomSheet.tsx] - Organism / Bottom sheet container for complex directory filtering controls.
[frontend/src/components/organisms/HomeHeroSection.tsx] - Organism / Welcome hero section in Home hub with call-to-action to start questionnaire.
[frontend/src/components/organisms/HomeTopBar.tsx] - Organism / Header bar for Home hub displaying app logo, user profile avatar, and theme toggle.
[frontend/src/components/organisms/MatchExplanation.tsx] - Organism / Informational section breaking down why a candidate matched with the user.
[frontend/src/components/organisms/ProfileHero.tsx] - Organism / Header block for profile screen with user avatar, username, and territory metadata.
[frontend/src/components/organisms/RankingCard.tsx] - Organism / Candidate match leaderboard ranking card.
[frontend/src/components/organisms/RankingRow.tsx] - Organism / List item row representing candidate affinity score in results leaderboard.
[frontend/src/components/organisms/ResultadoHero.tsx] - Organism / Top banner in Results screen displaying top match affinity percentage.
[frontend/src/components/organisms/Sidebar.tsx] - Organism / Desktop navigation sidebar component (viewports >= 900px).
[frontend/src/components/organisms/TopMatchSection.tsx] - Organism / Hero section highlighting the user's #1 matching candidate.
[frontend/src/components/organisms/TopNav.tsx] - Organism / Desktop top navigation header component.
[frontend/src/components/organisms/index.ts] - Organism Barrel / Exports all organic components.
[frontend/src/components/templates/AppShell.tsx] - Template / Main application shell wrapper providing responsive navigation (Sidebar vs BottomNav).
[frontend/src/components/templates/ScreenChrome.tsx] - Template / Standard screen container template providing scroll handling and top bar integration.
[frontend/src/components/templates/index.ts] - Template Barrel / Exports template components.
[frontend/src/components/showcase/DemoText.tsx] - Showcase / Internal demo helper component for design system showcase views.
[frontend/src/components/README.md] - Documentation / Component architecture and atomic design guidelines."""

SEC_11 = """================================================================================
11. CUSTOM HOOKS, UTILITIES & VALIDATIONS
================================================================================

[frontend/src/hooks/blurActiveElement.ts] - Custom Hook / Web utility blurring active DOM element on navigation transitions.
[frontend/src/hooks/useBlurBeforeClose.ts] - Custom Hook / Modal utility clearing focus before unmounting overlays.
[frontend/src/hooks/useBlurringPress.ts] - Custom Hook / Touch press wrapper removing persistent focus outline on web clicks.
[frontend/src/hooks/useCoachMarkTour.ts] - Custom Hook / React hook managing step progression for coach mark onboarding tours.
[frontend/src/hooks/useDimensionColors.ts] - Custom Hook / React hook resolving active theme dimension colors.
[frontend/src/hooks/useModalDimensions.ts] - Custom Hook / Custom hook computing responsive modal overlay dimensions.
[frontend/src/utils/candidato.ts] - Utility / Helper functions for formatting candidate full names, pact names, and image URLs.
[frontend/src/utils/installAriaHiddenFocusGuard.ts] - Utility / Web WCAG 2.4.3 accessibility guard preventing aria-hidden focus warnings.
[frontend/src/utils/installWebFavicon.ts] - Utility / Web utility injecting dynamic SVG favicon into browser head.
[frontend/src/utils/text.ts] - Utility / String normalization, accent stripping, and fuzzy search text helpers.
[frontend/src/utils/user.ts] - Utility / User initials generator and display username formatting utilities.
[frontend/src/constants/validation.ts] - Validation / Form validation rules for email syntax, password min length, and username characters.
[frontend/src/content/coachMarks.ts] - Content / Single-source-of-truth text definitions for all coach mark feature tours.
[frontend/src/content/welcomeTour.ts] - Content / Text content definitions for initial welcome tour slides."""

SEC_12 = """================================================================================
12. BUILD, GENERATION & AUDIT TOOLING SCRIPTS
================================================================================

[frontend/scripts/audit_screenshots.py] - Script / Python script automating visual screenshot capture for UI auditing.
[frontend/scripts/capture_original.py] - Script / Python utility capturing baseline web screenshots.
[frontend/scripts/generate-catalog.js] - Script / Node.js build script parsing component files to generate design system catalog TS manifests.
[frontend/scripts/generate-icons.js] - Script / Node.js script processing Lucide vector icons into typed component catalog.
[frontend/scripts/lib/extract-component-props.js] - Script / AST parser library extracting TypeScript props interfaces from component source files.
[frontend/scripts/lib/extract-showcase-props.js] - Script / AST parser extracting showcase prop examples.
[frontend/scripts/lib/scan-components.js] - Script / File scanner identifying component files across atomic design folders.
[frontend/scripts/verify-props.js] - Script / CI verification script auditing prop contract completeness across design system components."""

if __name__ == "__main__":
    main()
