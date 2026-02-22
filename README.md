# GreatRichard Crazy Eights - Deployment Guide

This project is a high-performance, responsive card game built with React, Vite, and Tailwind CSS.

## 🚀 How to Deploy to GitHub & Vercel

As an AI agent, I cannot directly access your GitHub account to push code. Please follow these steps to sync and deploy:

### 1. Sync to GitHub

1.  **Create a new repository** on [GitHub](https://github.com/new).
2.  **Initialize Git** in your local project folder (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit: GreatRichard Crazy Eights"
    ```
3.  **Link to GitHub and Push**:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

### 2. Deploy to Vercel

1.  Go to [Vercel](https://vercel.com/new).
2.  **Import your GitHub repository**.
3.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables** (Optional):
    *   If you plan to use Gemini AI features, add `GEMINI_API_KEY` to the Environment Variables section in Vercel settings.
5.  Click **Deploy**.

## 🛠 Project Structure

*   `src/App.tsx`: Main game logic and UI.
*   `src/components/`: Reusable UI components (Card, SuitSelector).
*   `src/constants.ts`: Game constants and utility functions.
*   `src/types.ts`: TypeScript definitions.
*   `vercel.json`: Configuration for Vercel to handle Single Page Application (SPA) routing.

## 🃏 Game Features

*   **Fancy Cover**: Cinematic entry screen with floating animations.
*   **Interactive Tutorial**: Guided first round for new players.
*   **Responsive Design**: Optimized for both mobile and desktop.
*   **Smart AI**: A challenging opponent with strategic play.
