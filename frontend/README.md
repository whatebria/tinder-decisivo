# Frontend Servel (React Native + Expo + Tamagui)

App movil para el matching votante/candidato de Servel.

## Stack

- **Expo SDK 57** (React Native 0.86, React 19)
- **TypeScript** (strict mode)
- **Tamagui** (UI system con theme Walmart)
- **React Navigation 7** (native stack)
- **Zustand** (state management)
- **Axios** (HTTP)
- **Expo SecureStore** (persistencia del token)

## Setup

```bash
# 1. Instalar deps
npm install --legacy-peer-deps

# 2. Levantar el backend (en otra terminal, desde ../backend)
cd ../backend && uv run python manage.py runserver 0.0.0.0:8000

# 3. Generar tipos TS del backend (opcional, ya vienen commiteados)
npm run types:gen

# 4. Levantar Expo
npm start
```

Escanea el QR con la app **Expo Go** en tu telefono, o presiona `a` para Android emulator, `i` para iOS simulator, `w` para browser.

## Base URL del API

Por default:
- **Android emulator**: `http://10.0.2.2:8000/api/v1`
- **iOS simulator**: `http://127.0.0.1:8000/api/v1`
- **Device fisico via Expo Go**: setea la env var:
  ```bash
  EXPO_PUBLIC_API_BASE=http://192.168.1.42:8000/api/v1 npm start
  ```
  (reemplaza por la IP LAN de tu maquina)

## Comandos utiles

```bash
npm run typecheck    # tsc --noEmit
npm run types:gen    # regenera src/types/api.ts desde el backend OpenAPI
npm start            # expo start (interactivo)
npm run android      # abre en Android emulator
npm run ios          # abre en iOS simulator (solo macOS)
npm run web          # abre en el browser
```

## Estructura

```
frontend/
├── App.tsx                    Root: Tamagui + Navigation + hydrate auth
├── index.ts                   Entry point Expo
├── babel.config.js            Babel + tamagui plugin
├── tamagui.config.ts          Theme (colores Walmart)
├── schema.yml                 OpenAPI del backend (regenerable)
└── src/
    ├── api/
    │   ├── config.ts          Base URL, timeout
    │   ├── client.ts          Axios + auth interceptor
    │   └── endpoints.ts       Wrappers tipados de cada endpoint
    ├── components/
    │   └── RadarChart.tsx     SVG puro, muestra score por eje tematico
    ├── navigation/
    │   ├── types.ts           RootStackParamList
    │   └── AppNavigator.tsx   Stack (auth vs main)
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── HomeScreen.tsx           Elige tipo de eleccion
    │   ├── CuestionarioScreen.tsx   Preguntas con Likert + peso
    │   ├── SubmitDoneScreen.tsx     Confirma + link a resultados
    │   ├── ResultadosScreen.tsx     Ranking con radar mini
    │   └── DetalleCandidatoScreen   Info + radar + noticias
    ├── store/
    │   ├── auth.ts            Zustand + SecureStore
    │   └── cuestionario.ts    Estado del cuestionario en curso
    ├── theme/
    │   └── colors.ts          Colores Walmart WCAG AA
    └── types/
        └── api.ts             AUTOGENERADO desde OpenAPI - NO EDITAR
```

## Contrato con el backend

Los tipos en `src/types/api.ts` estan **autogenerados** desde `../backend`
via `drf-spectacular`. **Nunca edites ese archivo a mano.** Si cambias un
serializer en el backend, corre:

```bash
npm run types:gen
```

Y el frontend automaticamente refleja los tipos nuevos. Si algun uso queda
roto, TypeScript te avisa antes de que la app compile.

## Roadmap

- [x] **Fase 2A**: Scaffolding + Login/Register funcional
- [x] **Fase 2B**: Onboarding + cuestionario paso-a-paso + submit respuestas
- [x] **Fase 2C**: Resultados con radar chart por eje tematico + detalle candidato con noticias
