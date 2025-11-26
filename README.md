<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Uk9EXmZ4f0n0Wpv7wQjMmNwuq9YPhjDC

## AI Features

This application uses **Claude 4.5 Sonnet** (claude-sonnet-4-20250514) from Anthropic for all AI-powered features:
- AI-generated product/course reviews
- AI-powered blog post generation
- AI search recommendations

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `CLAUDE_API_KEY` in [.env.local](.env.local) to your Claude API key from Anthropic
3. Run the app:
   `npm run dev`
