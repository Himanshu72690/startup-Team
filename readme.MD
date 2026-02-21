# StartupTeam Platform 🚀

> Connect startup founders with talented team members to build the next big thing

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**StartupTeam** is a lightweight, modern web platform that bridges the gap between visionary startup founders and talented professionals looking to join innovative ventures. Whether you're a founder seeking your next co-founder, developer, designer, or marketer—or a talented individual looking for exciting startup opportunities—StartupTeam makes the connection seamless.

---

## ✨ Features

### For Founders
- **Startup Profile Management** - Create and showcase your startup with vision, mission, and detailed information
- **Role Posting** - Post open positions for developers, designers, marketers, co-founders, and more
- **Application Management** - Review and manage join requests from interested members
- **Team Dashboard** - Track your startup's growth, applications, and team metrics
- **Member Discovery** - Browse and filter through talented professionals

### For Members
- **Explore Opportunities** - Discover startups across various industries with advanced filtering
- **Application Tracking** - Monitor the status of your applications in one place
- **Profile Showcase** - Build your professional profile to attract founders
- **Request Management** - Track pending, accepted, and rejected applications
- **Save Favorites** - Bookmark startups you're interested in for later

### General Features
- ✅ Clean, modern UI with glassmorphism design
- ✅ Fully responsive layout for all devices
- ✅ Role-based access (Founder/Member)
- ✅ Secure authentication system
- ✅ Password recovery
- ✅ Real-time activity notifications
- ✅ Search and filter capabilities
- ✅ No backend required - runs entirely in the browser

---

## 🎯 Why StartupTeam?

Traditional job boards don't capture the unique dynamics of startup team building. StartupTeam is purpose-built for:
- **Rapid team formation** - Founders can quickly find and onboard team members
- **Equity-focused roles** - Connect people willing to work for equity and long-term vision
- **Cultural fit** - Emphasize vision, mission, and startup culture alongside skills
- **Low barrier to entry** - No complex backend setup or databases required

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional but recommended for best experience)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/startup-team.git
   cd startup-team
   ```

2. **Navigate to the Frontend directory**
   ```bash
   cd Frontend
   ```

3. **Launch the application**

   **Option A: Using Python's built-in server**
   ```bash
   # Python 3
   python -m http.server 8000
   ```

   **Option B: Using Node.js http-server**
   ```bash
   # Install http-server globally (if not already installed)
   npm install -g http-server
   
   # Start the server
   http-server -p 8000
   ```

   **Option C: Using VS Code Live Server**
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

4. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

---

## 📖 Usage Guide

### Quick Start Demo

To explore the platform without signing up, use the demo account:

```
Email: d@emo.com
Password: (any password)
Role: Founder
```

### Creating an Account

1. Click **"Sign Up"** from the homepage
2. Fill in your details:
   - Name
   - Email
   - Whatsapp No.
   - Choose role (Founder or Member)
   - Create password
3. Submit and you'll be redirected to login

### For Founders

**Creating Your Startup Profile:**
1. Login and navigate to your dashboard
2. Click on **"Create Startup"** or **"Edit Startup Profile"**
3. Fill in:
   - Startup name and logo
   - Industry/category
   - Vision and mission
   - Team size
   - Funding stage
4. Save your profile

**Posting a Role:**
1. From the dashboard, click **"Post Role"**
2. Specify:
   - Position title (e.g., "Full-Stack Developer", "Marketing Co-founder")
   - Required skills
   - Role description
   - Compensation type (equity, salary, hybrid)
3. Publish to attract members

**Managing Applications:**
1. Go to **"Join Requests"** or **"Member Requests"**
2. Review applications
3. Accept or reject candidates

### For Members

**Exploring Startups:**
1. Login to your member dashboard
2. Click **"Explore Startups"**
3. Use filters:
   - Industry (FinTech, HealthTech, EdTech, etc.)
   - Stage (Idea, MVP, Growth)
   - Search by keyword
4. Save interesting startups

**Applying to Roles:**
1. Click on a startup card
2. View details and open roles
3. Click **"Apply"** or **"Join Team"**
4. Track your application status in **"My Requests"**

**Managing Your Profile:**
1. Navigate to **"My Profile"**
2. Update:
   - Skills and experience
   - Bio and portfolio links
   - Preferred roles
   - Availability

---

## 🗂️ Project Structure

```
startup-Team/
│
├── Frontend/
│   ├── index.html              # Landing page
│   │
│   ├── assets/
│   │   ├── css/                # Stylesheets
│   │   │   ├── base.css
│   │   │   ├── header.css
│   │   │   ├── home.css
│   │   │   ├── login.css
│   │   │   ├── signup.css
│   │   │   ├── founder.css
│   │   │   ├── member.css
│   │   │   └── responsive.css
│   │   │
│   │   └── js/                 # JavaScript modules
│   │       ├── main.js
│   │       ├── auth.js
│   │       ├── header.js
│   │       ├── founder.js
│   │       ├── member.js
│   │       └── home.js
│   │
│   ├── components/
│   │   └── header.html         # Reusable header component
│   │
│   └── pages/                  # Application pages
│       ├── about.html
│       ├── contact.html
│       ├── login.html
│       ├── signup.html
│       ├── forgot-password.html
│       ├── founder-dashboard.html
│       ├── founder-profile.html
│       ├── member-dashboard.html
│       ├── member-profile-view.html
│       ├── startup-details.html
│       ├── posted-roles.html
│       ├── post-role.html
│       ├── roles-list.html
│       ├── join-requests.html
│       └── my-profile.html
│
└── README.md
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantic markup |
| **CSS3** | Styling, animations, and responsive design |
| **JavaScript (ES6+)** | Application logic and interactivity |
| **localStorage** | Client-side data persistence |
| **Google Fonts (Poppins)** | Typography |
| **Material Icons / Lucide Icons** | UI icons |

**No frameworks or libraries required!** This is a pure vanilla JavaScript application.

---

## 🎨 Design Highlights

- **Modern Glassmorphism UI** - Frosted glass effects with backdrop blur
- **Smooth Animations** - Subtle transitions and interactions
- **Responsive Design** - Mobile-first approach, works on all screen sizes
- **Dark Sidebar Navigation** - Clean, professional interface
- **Color Palette:**
  - Primary: `#6366f1` (Indigo)
  - Dark: `#0f172a` (Slate)
  - Background: `#f8fafc` (Light Gray)
  - Accent: `#3b82f6` (Blue)

---

## 🔒 Data Storage

The application uses **browser localStorage** for data persistence:

```javascript
// User data structure
{
  name: "John Doe",
  email: "john@example.com",
  role: "founder" // or "member"
}

// Authentication state
localStorage.setItem("isLoggedIn", "true");
localStorage.setItem("loggedInUser", JSON.stringify(user));
```

**Note:** Since data is stored locally, clearing browser data will reset the application. For production use, integrate with a backend API and database.

---

## 🚧 Roadmap & Future Enhancements

- [ ] Backend integration (Node.js/Express + MongoDB/PostgreSQL)
- [ ] Real-time messaging between founders and members
- [ ] Advanced search with AI-powered matching
- [ ] Email notifications for applications and updates
- [ ] Social auth integration (Google, LinkedIn, GitHub)
- [ ] Video profiles and pitch decks
- [ ] In-app video calls for interviews
- [ ] Payment integration for premium features
- [ ] Mobile app (React Native/Flutter)
- [ ] Analytics dashboard for founders

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, your help is appreciated.

### How to Contribute

1. **Fork the repository**
   ```bash
   git fork https://github.com/yourusername/startup-team.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add some amazing feature"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Keep CSS modular and organized
- Use semantic HTML5 elements
- Write clear, concise commit messages
- Test across multiple browsers
- Ensure responsive design works on mobile devices

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Help

### Documentation
- [HTML5 Documentation](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS3 Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

### Getting Help
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/yourusername/startup-team/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/yourusername/startup-team/discussions)
- **Email**: For direct inquiries, contact [support@example.com](mailto:support@example.com)

### Common Issues

**Q: The page won't load properly**  
A: Ensure you're running the application through a web server, not directly opening the HTML file.

**Q: Login doesn't persist after refresh**  
A: Check if your browser has localStorage enabled and not in private/incognito mode.

**Q: Styles not loading**  
A: Verify that all CSS files are in the correct path and the web server is serving static files.

---

## 👥 Maintainers

This project is maintained by:

- **Your Name** - [@yourusername](https://github.com/yourusername)

Interested in becoming a maintainer? Reach out via [GitHub Discussions](https://github.com/yourusername/startup-team/discussions).

---

## 🌟 Acknowledgments

- Icons by [Material Icons](https://fonts.google.com/icons) and [Lucide](https://lucide.dev/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Inspiration from modern SaaS platforms and startup ecosystems

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/startup-team?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/startup-team?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/startup-team)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/startup-team)

---

<div align="center">

**[⬆ Back to Top](#startupteam-platform-)**

Made with ❤️ for the startup community

</div>
