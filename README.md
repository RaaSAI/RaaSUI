# Research as a Service AI Chatbot

A sophisticated multi-phase onboarding chatbot for research services with email verification and comprehensive lead qualification.

## 🚀 Features

- **6-Phase Onboarding Flow**: Comprehensive lead qualification
- **Email Verification**: Secure email validation with verification codes
- **Smart UI Components**: Single-select and multi-select interfaces
- **Real-time Progress Tracking**: Visual phase indicators
- **Professional Design**: Modern, responsive interface
- **Data Collection**: Rich client profiling and requirements gathering

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🛠️ Local Setup

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ChatInput.tsx
│   ├── ChatMessage.tsx
│   ├── EmailVerification.tsx
│   ├── MultiSelectComponent.tsx
│   ├── SingleSelectComponent.tsx
│   └── PhaseIndicator.tsx
├── hooks/               # Custom React hooks
│   └── useChatbot.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── anthropic.ts
│   ├── ipGeo.ts
│   ├── nlp.ts
│   └── validation.ts
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🔧 Configuration

### Webhook URLs
Update the webhook URLs in `src/hooks/useChatbot.ts`:

```typescript
const SEND_VERIFICATION_WEBHOOK = 'your-verification-webhook-url';
const VERIFY_CODE_WEBHOOK = 'your-verification-check-webhook-url';
const FINAL_WEBHOOK_URL = 'your-final-data-webhook-url';
```

### API Integration
Replace the mock Anthropic service in `src/utils/anthropic.ts` with actual API integration when ready.

## 📊 Data Flow

1. **Phase 1**: Email verification and company details
2. **Phase 2**: Business context and industry
3. **Phase 3**: Research objectives and drivers
4. **Phase 4**: Competitive landscape and market focus
5. **Phase 5**: Timeline and update preferences
6. **Phase 6**: Budget and additional requirements

## 🎨 Customization

- **Styling**: Modify Tailwind classes in components
- **Questions**: Update onboarding steps in `useChatbot.ts`
- **Validation**: Customize validation rules in `utils/validation.ts`
- **Branding**: Update colors, logos, and text throughout components

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables if needed

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

## 🔒 Security Notes

- Email verification uses secure webhook integration
- All user data is validated before processing
- IP geolocation data is captured for analytics
- No sensitive data is stored in localStorage

## 📝 License

This project is proprietary software for Research as a Service platform.

## 🤝 Support

For technical support or questions about the implementation, please contact the development team.