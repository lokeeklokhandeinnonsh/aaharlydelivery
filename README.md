# Aaharly Delivery App

## Setup & Run

The project is fully configured with React Native CLI, TypeScript, and the requested Tech Stack.

### Prerequisites
- Node.js (v18+)
- JDK 17 or 21
- Android Studio with SDK 35
- Android Emulator or Physical Device connected

### Steps

1. **Install Dependencies** (Already done, but good to ensure)
   ```bash
   cd AaharlyDelivery
   npm install
   ```

2. **Start Metro Bundler**
   ```bash
   npx react-native start
   ```

3. **Run on Android**
   Open a new terminal and run:
   ```bash
   npx react-native run-android
   ```

### Troubleshooting
- If you see "SDK location not found", create a `local.properties` file in `android/` with:
  ```
  sdk.dir=C:\\Users\\<your-user>\\AppData\\Local\\Android\\Sdk
  ```
- If build fails, try cleaning:
  ```bash
  cd android && ./gradlew clean && cd ..
  ```
