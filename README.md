# Mini LMS Mobile App (React Native Expo)

Mini LMS app built with React Native Expo + TypeScript, focused on authentication, course browsing, WebView integration, native features, and resilient state management.

## 1. Tech Stack

- Framework: Expo SDK 55 + Expo Router
- Language: TypeScript (`strict: true`)
- State: Zustand stores
- Data persistence:
  - `expo-secure-store` for auth tokens
  - `@react-native-async-storage/async-storage` for course, preferences, media, download maps
- API: Axios with interceptors + retry
- Lists: `@legendapp/list` (LegendList)
- Web content: `react-native-webview`
- Native features: notifications, camera/image-picker, network status, file download

## 2. Setup Instructions

### Prerequisites

- Node.js 20+
- npm 10+
- Android Studio/Xcode (for emulator/simulator)
- Expo CLI (via `npx`)

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

### Platform Commands

```bash
npm run android
npm run ios
npm run web
```

### Tests

```bash
npm test
```

## 3. Environment Variables

No `.env` required for current setup.

- API base URL is set in:
  - `src/services/api/client.ts`
  - Current value: `https://api.freeapi.app/api/v1`

## 4. Implemented Features (Requirement Mapping)

### Authentication & User Management

- Login/Register using FreeAPI user endpoints
- Access + refresh token storage in SecureStore
- Auto-restore session on app launch
- Logout flow
- Basic refresh-token handling via interceptor retry on 401
- Profile:
  - user info
  - avatar update (camera + gallery)
  - learning stats
  - preferences toggles

### Course Catalog

- Courses list with:
  - course image
  - course name
  - description
  - bookmark action
- Pull-to-refresh
- Search filter
- Course details:
  - enroll
  - bookmark toggle
  - course snapshots (capture note photo)

### WebView Integration

- Embedded content viewer
- Local HTML template rendering
- Native -> Web headers (`X-Course-Id`)
- PostMessage communication back to native
- Error/retry handling for failed WebView load

### Native Features

- Local notifications:
  - milestone after 5 bookmarks
  - 24-hour re-engagement reminder
- Network monitoring with offline banner
- Camera capture flow for profile/course notes
- Lesson video download with:
  - progress display
  - local persistence
  - Wi-Fi-only enforcement based on preference

### State Management & Performance

- Global Zustand stores:
  - `authStore`
  - `courseStore`
  - `preferencesStore`
  - `courseMediaStore`
- List performance:
  - LegendList
  - memoized card rendering
  - stable key extractors

### Error Handling

- Axios timeout (`10s`)
- Retry mechanism with exponential backoff
- API error normalization
- Offline fallback behavior for course cache
- Global app error boundary

## 5. Key Architectural Decisions

1. Store split by domain
- Auth, courses, preferences, and media are isolated for clearer ownership and safer persistence.

2. Secure vs regular persistence
- SecureStore for sensitive auth tokens.
- AsyncStorage for non-sensitive app state.

3. Interceptor-based auth recovery
- Request interceptor injects access token.
- Response interceptor attempts token refresh on 401, retries original request once.

4. Data adaptation layer
- FreeAPI product/user payloads are transformed into LMS-oriented course presentation.

5. Native feature modularization
- Notifications and downloads are isolated in service modules for easier testing/replacement.

## 6. Folder Structure (High Level)

```text
app/                         Expo Router routes
src/components/              Shared UI components
src/features/                Screen-level feature modules
src/services/                API, notifications, downloads, auth storage
src/store/                   Zustand stores
src/types/                   TypeScript interfaces
```

## 7. Known Issues / Limitations

- Styling is mixed (`StyleSheet` + partial `NativeWind`), not fully NativeWind-only.
- Test coverage is baseline (not >70% yet).
- WebView content is template-driven (not remote LMS CMS).
- Downloaded lessons are tracked by URI map (no dedicated downloads management screen yet).

## 8. Screenshots

Add screenshots in this section before submission:

- Login
- Register
- Dashboard
- Courses list
- Course details
- Lesson details + download progress
- WebView content page
- Profile (preferences + avatar)

## 9. Demo Video Checklist (3-5 mins)

- Authentication flow
- Course list/search/bookmark
- Enroll + open details
- WebView content load
- Offline banner behavior
- Bookmark milestone notification
- Lesson download with Wi-Fi-only behavior

## 10. APK Build Instructions

### Option A: Local development APK (Android)

```bash
npx expo run:android
```

### Option B: EAS build (recommended for submission)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```
2. Login:
```bash
eas login
```
3. Configure project:
```bash
eas build:configure
```
4. Build Android APK:
```bash
eas build -p android --profile preview
```

Upload the generated APK to GitHub Releases as required.

## 11. Repository Deliverables Checklist

- [ ] Clean commit history
- [ ] Updated README (this file)
- [ ] Screenshots added
- [ ] Demo video link added
- [ ] APK attached in Releases
