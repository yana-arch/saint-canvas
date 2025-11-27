<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Saint Canvas - AI-Powered Catholic Art Generator

A beautiful AI-powered image generation tool specifically designed for creating Catholic religious artwork. Generate sacred art, religious illustrations, and holy imagery using cutting-edge AI models from multiple providers.

## Features

🎨 **Multiple AI Providers Support**
- Google Gemini (latest multimodal models)
- OpenAI DALL-E (2 & 3)
- Stability AI (Stable Diffusion)
- Replicate (Flux models)
- Together AI (affordable alternatives)

⛪ **Catholic Art Focused**
- Specialized prompts and styles for religious artwork
- Pre-configured Catholic art styles and templates
- Sacred art preservation and enhancement features

🔒 **Secure API Management**
- No hardcoded API keys - all configured through secure UI
- API keys stored safely in browser localStorage
- Easy provider switching and management

🎭 **Advanced Canvas Tools**
- Layer-based editing system
- Template library with Catholic themes
- Export in multiple formats
- Real-time preview and adjustments

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the application:**
   ```bash
   npm run dev
   ```

3. **Configure API Keys:**
   - Open the application in your browser (usually http://localhost:3000)
   - Click the **Settings** button (⚙️) in the top toolbar
   - Select **API Configuration** tab
   - Add your API keys for the providers you want to use:
     - **Google Gemini**: Get from [AI Studio](https://aistudio.google.com/app/apikey)
     - **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
     - **Stability AI**: Get from [Stability AI](https://platform.stability.ai/account/keys)
     - **Replicate**: Get from [Replicate](https://replicate.com/account/api-tokens)
     - **Together AI**: Get from [Together AI](https://api.together.xyz/settings/api-keys)

4. **Start Creating!**
   - Choose your provider and model
   - Enter your prompt (religious, Catholic themes work best)
   - Generate beautiful sacred art!

## API Keys Management

### Security Features
- **No .env files required**: API keys are never committed to version control
- **Browser storage**: Keys are securely stored in your browser's localStorage
- **Easy management**: Configure, validate, and remove keys through the UI
- **Validation**: Built-in API key validation before use

### Supported Providers
| Provider | Models | Best For | Cost |
|----------|---------|----------|------|
| Google Gemini | Gemini 2.5 Flash, Gemini 3 Pro | Fast generation, multimodal | Pay-per-use |
| OpenAI DALL-E | DALL-E 3, DALL-E 2 | High quality, detailed | $0.02-0.04/image |
| Stability AI | SD 3.5 Large, Ultra, Core | Control, customization | $0.03-0.08/image |
| Replicate | Flux Schnell/Dev | Open source models | $0.003-0.025/image |
| Together AI | Flux variants | Budget-friendly | $0.003-0.04/image |

## Project Structure

```
saint-canvas/
├── src/
│   ├── components/          # React components
│   │   ├── ai/             # AI provider components
│   │   └── ...
│   ├── services/           # AI service layer
│   │   └── ai/             # Provider implementations
│   ├── store/              # Zustand state management
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── dist/                   # Build output
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Tech Stack

- **Frontend**: React 19, TypeScript
- **Canvas**: Konva, React-Konva
- **State**: Zustand
- **AI Integration**: Multiple provider APIs
- **Build**: Vite
- **UI**: Tailwind CSS, Lucide Icons

## Deployment

The application is designed to be easily deployable to any static hosting platform:

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Configure your API keys through the web interface

## Contributing

This is a specialized tool for Catholic religious artwork. When contributing:

- Maintain focus on Catholic/religious themes
- Ensure all changes work across all supported AI providers
- Test with various religious art prompts and styles

## License

This project is open source. Please ensure you have appropriate API access for whichever providers you choose to use.

---

**Note**: This application uses AI models from multiple providers. Each provider has their own terms of service, pricing, and usage policies. Please review and comply with each provider's terms when using their services.
