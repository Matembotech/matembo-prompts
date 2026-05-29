# Matembo Prompts

**Matembo Prompts** is a clean, professional web platform and vault containing highly curated AI prompts for image and video generation. Built for creators, designers, and storytellers to find the exact words needed to generate stunning visuals without spending hours experimenting.

## 🚀 Features

- **Modern & Responsive UI**: A premium dark-mode aesthetic with fluid typography, custom micro-animations, and a highly responsive design tailored for all devices.
- **Prompt Library**: Browse and interact with high-quality prompts categorized by Image or Video generation.
- **One-Click Copy**: Instantly copy complex prompts to your clipboard for use in tools like Midjourney, Kling, Sora, and Seedance.
- **Admin Dashboard**: A secure, hidden backend portal (`/admin`) allowing full CRUD operations to manage the prompt library dynamically.
- **Cloudinary Integration**: Seamless image uploading and hosting for prompt preview assets.
- **Supabase Backend**: Real-time database integration for fetching and updating prompts.

## 🛠️ Tech Stack

- **Frontend Core**: React 18, Vite, React Router v6
- **Styling**: Custom Vanilla CSS combined with Tailwind CSS for layout utilities
- **Database / BaaS**: Supabase
- **Asset Hosting**: Cloudinary
- **Icons**: [Tabler Icons](https://tabler-icons.io/) & custom SVGs

## 📂 Project Structure

```text
prompt-site/
├── index.html            # Main HTML entry point
├── vite.config.js        # Vite configuration
├── src/
│   ├── main.jsx          # React initialization
│   ├── App.jsx           # App routing (Home, Admin, About)
│   ├── supabaseClient.js # Supabase connection setup
│   ├── cloudinaryConfig.js # Cloudinary configurations
│   ├── index.css         # Global styles and Tailwind directives
│   ├── components/       # Reusable UI components
│   │   ├── AdminPanel.jsx  # Protected route for prompt management
│   │   ├── Footer.jsx      # Global footer with hidden admin link
│   │   ├── HeroSection.jsx # Homepage hero and navigation
│   │   ├── PromptCard.jsx  # Individual prompt display card
│   │   └── PromptsGrid.jsx # Main grid handling fetching and states
│   └── pages/
│       └── About.jsx     # The story behind Matembo Prompts
└── .env                  # Environment variables (not tracked)
```

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd prompt-site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *(Note: Ensure your `cloudinaryConfig.js` is also updated with your specific Cloudinary Upload URL and Preset).*

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will typically start on `http://localhost:5173`.

## 👨‍💻 About the Creator

Built by **Ibrahim Abdulrahman Maulid** (known as *Matembo*). Software engineer, system architect, and founder of Matembo Tech Software Company. 

*"Most people see AI as a tool. I see it as a language. Matembo Prompts was built on the conviction that mastering this language — knowing exactly what to say, how to say it, and in what order — is what separates forgettable content from visuals that stop people mid-scroll."*

## 📝 License

© 2026 Matembo Tech. All rights reserved.
