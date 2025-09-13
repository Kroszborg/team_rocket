# Adsim

A powerful marketing campaign simulation and optimization platform built with Next.js 15. Test, simulate, and optimize your marketing campaigns across multiple channels with AI-powered creative scoring and data-driven insights.

## ✨ Features

### 🎯 Campaign Lab
- **Multi-Channel Campaigns**: Create campaigns across 10+ marketing channels (Facebook, Instagram, Google Ads, TikTok, YouTube, LinkedIn, Twitter, Email, SEO, Influencer)
- **Advanced Targeting**: Precise demographic and interest-based targeting options
- **Budget Optimization**: Smart budget allocation across channels with ROI predictions
- **Real-Time Simulation**: Instant campaign performance predictions with detailed metrics

### 🧪 Creative Tester
- **AI-Powered Scoring**: Advanced algorithm evaluates ad copy across multiple dimensions
- **Performance Metrics**: Scores for clarity, urgency, relevance, and call-to-action effectiveness
- **Channel-Specific Optimization**: Tailored recommendations for each marketing channel
- **Actionable Insights**: Specific suggestions to improve creative performance

### 📊 Analytics & Insights
- **Comprehensive Metrics**: Track reach, engagement, conversions, ROI, and cost-per-conversion
- **Interactive Charts**: Beautiful visualizations with performance timeline and channel breakdowns
- **Optimization Suggestions**: AI-generated recommendations for campaign improvement
- **Export Capabilities**: Export results in JSON, CSV, and PDF formats

### 🔧 Technical Features
- **Modular Architecture**: Well-structured codebase with separated concerns
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Shadcn/ui components with dark/light theme support
- **Data Persistence**: Local storage with export/import capabilities

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.3 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Validation**: Zod
- **Charts**: Recharts
- **Package Manager**: pnpm

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── campaign/                 # Campaign pages
│   └── creative-tester/          # Creative testing page
├── components/                   # React components
│   ├── campaign/                 # Campaign-specific components
│   ├── creative-tester/          # Creative testing components
│   ├── layout/                   # Layout components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utilities and core logic
│   ├── validators/               # Zod validation schemas
│   └── errors/                   # Error handling classes
└── services/                     # Business logic services
    └── api/                      # API service layer
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd team_rocket
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

```bash
# Development
pnpm dev          # Start development server

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

## 🎨 Features Overview

### Campaign Creation Flow
1. **Product Setup**: Define your product details, category, and pricing
2. **Audience Targeting**: Set demographics, interests, and location targeting
3. **Budget Planning**: Allocate budget across channels and set campaign duration
4. **Channel Selection**: Choose preferred channels and avoid unwanted ones
5. **Creative Assets**: Add and score your creative content
6. **Simulation**: Get instant performance predictions and optimization tips

### Creative Scoring Algorithm
- **Clarity Score**: Evaluates message clarity and comprehension
- **Urgency Score**: Measures time-sensitive language effectiveness
- **Relevance Score**: Assesses audience alignment and interest match
- **CTA Score**: Analyzes call-to-action strength and conversion potential

### Simulation Engine
- **Industry-Based Metrics**: Real marketing data from multiple industries
- **Demographic Multipliers**: Age, income, and interest-based adjustments
- **Channel Performance**: Accurate reach, engagement, and conversion modeling
- **Timeline Predictions**: Day-by-day performance forecasting

## 📊 Performance Metrics

The platform tracks and optimizes across key metrics:
- **Reach**: Total audience exposure
- **Engagement**: Interaction rates and quality
- **Conversions**: Action completion and lead generation  
- **ROI**: Return on investment calculations
- **Cost Efficiency**: Cost-per-conversion optimization

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for local development:
```bash
# Add any environment-specific variables here
```

### Customization
- **Channel Metrics**: Modify `src/lib/simulation.ts` to adjust channel performance data
- **Scoring Algorithm**: Update `src/lib/creative-scorer.ts` for creative evaluation logic
- **UI Theme**: Customize colors and styling in `tailwind.config.js`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The app can be deployed to any Node.js hosting platform:
```bash
pnpm build
pnpm start
```

## 📈 Roadmap

- [ ] Real-time campaign monitoring
- [ ] A/B testing capabilities
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] API integrations with major ad platforms
- [ ] Machine learning model improvements

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js and modern web technologies.