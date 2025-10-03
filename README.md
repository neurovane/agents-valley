# 🏔️ AgentsValley

A Product Hunt-style platform for discovering and sharing AI agents, MCP servers, and tech events. Built with Next.js, Supabase, and modern web technologies.

![AgentsValley](https://img.shields.io/badge/AgentsValley-v0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-cyan)

## ✨ Features

### 🤖 AI Agents
- Discover and browse AI agents
- Publish your own AI agents
- Upvote and comment system
- Category-based filtering
- Search functionality

### ⚙️ MCP Servers
- Browse MCP (Model Context Protocol) servers
- Publish MCP server integrations
- Documentation and usage guides
- Community ratings

### 📅 Events
- Create and join tech events
- Online, in-person, and hybrid events
- Event registration and management
- Attendee tracking

### 🏆 Leaderboard
- Top-rated agents and MCP servers
- Trending content
- Community rankings

### 👤 User Management
- Secure authentication with Supabase
- User profiles and avatars
- Personal dashboards

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agents-valley.git
   cd agents-valley
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Run the SQL from `supabase-schema.sql` in the SQL editor

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking

## 🗄️ Database Schema

The application uses the following main tables:

- `profiles` - User profiles
- `agents` - AI agents
- `mcp_servers` - MCP servers
- `events` - Events
- `upvotes` - Agent upvotes
- `mcp_upvotes` - MCP server upvotes
- `event_attendees` - Event registrations
- `comments` - Agent comments
- `mcp_comments` - MCP server comments

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Set environment variables
   - Deploy!

3. **Environment Variables**
   Set these in your Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for deployment platform
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) for styling

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/your-username/agents-valley/issues) page
2. Create a new issue if your problem isn't already reported
3. Join our community discussions

---

**Made with ❤️ by the AgentsValley team**