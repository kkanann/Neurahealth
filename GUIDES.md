# NueraHealth Development Guides

## 1. Linking Your GitHub Repository

Since you are starting with a new local project, follow these steps to upload it to GitHub:

1.  **Create a blank repository** on GitHub (do not initialize with README/license).
2.  **Open your terminal** in the `nuerahealth` directory.
3.  **Initialize Git**:
    ```bash
    git init
    ```
4.  **Stage your files**:
    ```bash
    git add .
    ```
5.  **Commit your changes**:
    ```bash
    git commit -m "Initial commit: Setup NueraHealth project structure"
    ```
6.  **Link to your remote repository**:
    Replace `<your-repo-url>` with the URL you got from GitHub (e.g., `https://github.com/yourusername/nuerahealth.git`).
    ```bash
    git remote add origin <your-repo-url>
    git branch -M main
    ```
7.  **Push the code**:
    ```bash
    git push -u origin main
    ```

---

## 2. Deployment Strategy

### Web Landing Page (Firebase Hosting)
The "common nuerahealth page" will serve as the landing portal.

1.  **Install Firebase CLI** (if not done):
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login**:
    ```bash
    firebase login
    ```
3.  **Initialize**:
    Run this in the root or `web` folder:
    ```bash
    firebase init hosting
    ```
    - Select your Firebase project.
    - Set `dist` (for Vite) or `build` (for React/standard) as your public directory.
    - Configure as a single-page app (Yes).
4.  **Deploy**:
    ```bash
    npm run build
    firebase deploy --only hosting
    ```

### Mobile App (Flutter)
For the mobile application:

1.  **Android (APK/Bundle)**:
    ```bash
    cd mobile
    flutter build apk --release
    # Or for Play Store
    flutter build appbundle
    ```
    - Output location: `build/app/outputs/flutter-apk/app-release.apk`

2.  **iOS (IPA)** (Requires MacOS):
    ```bash
    cd mobile
    flutter build ios --release
    ```
    - Open `ios/Runner.xcworkspace` in Xcode to archive and upload to App Store Connect.

---

## 3. Project Structure Overview

- **/web**: The landing page website code.
- **/mobile**: The Flutter application code.
- **/functions** (Optional): Firebase Cloud Functions for backend logic/chatbot API.
