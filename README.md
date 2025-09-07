# 🎯 AI Interview Simulator

An intelligent interview practice platform powered by **LangGraph** and **Google Gemini 1.5 Flash**. Practice technical and behavioral interviews with AI-generated questions, real-time feedback, and comprehensive scoring.

![Interview Simulator](https://img.shields.io/badge/Status-Ready%20for%20Demo-brightgreen)
![LangGraph](https://img.shields.io/badge/LangGraph-0.0.26-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ Features

### 🤖 AI-Powered Intelligence

- **Smart Question Generation**: Role-specific and domain-aware questions
- **Intelligent Evaluation**: AI-powered answer scoring and feedback
- **LangGraph Workflow**: Sophisticated state management for interview flow
- **Gemini Integration**: Google's latest AI model for natural language processing

### 🎯 Interview Types

- **Technical Interviews**: Coding problems, system design, algorithms
- **Behavioral Interviews**: Situational questions, experience-based scenarios
- **Role-Specific**: Questions tailored to 15+ different positions
- **Domain-Specific**: Industry-focused questions across 15+ domains

### 📊 Advanced Scoring

- **1-10 Scale**: Comprehensive evaluation system
- **Multi-Criteria**: Clarity, accuracy, completeness, problem-solving
- **Real-time Feedback**: Instant scores and detailed analysis
- **Progress Tracking**: Visual progress indicators throughout

### 🎨 Modern Interface

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful UI**: Clean, professional design with smooth animations
- **Voice Features**: Optional speech-to-text and text-to-speech
- **Export Options**: PDF reports for sharing and review

## 🏗️ Architecture

### Backend (Node.js + LangGraph)

```
src/
├── index.js              # Main server entry point
├── server.js             # Express API with RESTful endpoints
└── simpleInterview.js  # implementation
```

### Frontend (React + Vite)

```
frontend/src/
├── components/           # React components
│   ├── HomePage.jsx     # Landing page with role selection
│   ├── InterviewPage.jsx # Main interview interface
│   ├── ResultsPage.jsx  # Results and summary display
│   └── VoiceControls.jsx # Voice input/output controls
├── hooks/
│   └── useVoice.js      # Custom hook for voice features
└── main.jsx             # Frontend entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Gemini API key
- Modern web browser

### 1. Clone and Setup

```bash
git clone <repository-url>
cd interview-simulator
cd backend
npm run setup
```

### 2. Configure API Key

```bash
# Edit .env file
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Start Development

```bash
# Option 1: Start both servers with one command
cd backend
npm run start-all

# Option 2: Start servers separately
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📖 How to Use

### 1. Start an Interview

- Select your target role (Software Engineer, Data Scientist, etc.)
- Choose your industry domain (Technology, Finance, etc.)
- Pick interview type (Technical or Behavioral)
- Click "Start Interview"

### 2. Answer Questions

- Read each AI-generated question carefully
- Type your answer in the text area
- Use voice input for hands-free answering (optional)
- Submit your answer to get instant feedback

### 3. Review Feedback

- Get detailed scores (1-10) for each answer
- Read strengths and areas for improvement
- See specific suggestions for enhancement
- Track your progress through the interview

### 4. View Results

- See your overall performance summary
- Review all questions and your answers
- Get comprehensive analysis with recommendations
- Download PDF report for future reference

## 🔧 API Endpoints

### Interview Management

- `POST /api/interview/start` - Start a new interview
- `POST /api/interview/:id/answer` - Submit an answer
- `GET /api/interview/:id/status` - Get interview status
- `GET /api/interview/:id/results` - Get complete results
- `GET /api/interview/:id/export/pdf` - Export PDF report

### Configuration

- `GET /api/roles` - Get available roles
- `GET /api/domains` - Get available domains
- `GET /api/health` - Health check

## 🧠 Workflow

The interview process is managed by a sophisticated machine:

```
[Initialize] → [Generate Question] → [Wait for Answer] → [Evaluate Answer] → [Generate Feedback] → [Check Completion] → [Generate Summary]
```

### State Management

- **Interview State**: Tracks questions, answers, evaluations, and progress
- **Question Generation**: AI-powered question creation based on role and domain
- **Answer Evaluation**: Comprehensive scoring and feedback generation
- **Progress Tracking**: Manages interview flow and completion status

## 🎯 Scoring System

Each answer is evaluated on a 1-10 scale based on:

| Criteria                     | Weight | Description                      |
| ---------------------------- | ------ | -------------------------------- |
| **Clarity & Communication**  | 20%    | How well the answer is expressed |
| **Technical Accuracy**       | 30%    | Correctness of technical content |
| **Relevant Experience**      | 30%    | Applicability to the role/domain |
| **Completeness**             | 20%    | Thoroughness of the response     |
| **Problem-solving Approach** | 20%    | Methodology and reasoning        |

## 🎨 Voice Features

### Speech-to-Text

- Real-time voice input for answers
- Browser-based speech recognition
- Clear transcript display
- Error handling and retry options

### Text-to-Speech

- Read questions aloud
- Adjustable speech rate and pitch
- Browser-based synthesis
- Optional voice output toggle

## 📊 Export Features

### PDF Reports

- Complete interview transcript
- All questions and answers
- Detailed evaluations and scores
- Summary analysis and recommendations
- Professional formatting for sharing

## 🔧 Configuration

### Environment Variables

```bash
GOOGLE_API_KEY=your_gemini_api_key_here  # Required
PORT=3001                                # Optional (default: 3001)
NODE_ENV=development                     # Optional
```

### Customization Options

- Modify question prompts in `src/interviewWorkflow.js`
- Adjust scoring criteria in evaluation prompts
- Customize UI themes in `frontend/src/index.css`
- Add new roles/domains in API endpoints

## 🚀 Deployment


```bash

### Vercel/Netlify

- Deploy frontend to Vercel/Netlify
- Deploy backend to Railway/Render
- Update API URLs in frontend configuration

## 🛠️ Development

### Project Structure

```
interview-simulator/
├── backend/                 # Node.js backend
│   ├── src/                # Source code
│   ├── package.json        # Backend dependencies
│   └── README.md          # Backend documentation
├── frontend/               # React frontend
│   ├── src/               # Source code
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── start-dev.sh           # Development startup script
└── README.md              # This file
```

### Available Scripts

```bash
# Backend
npm run dev          # Start development server
npm run start        # Start production server
npm run setup        # Initial setup
npm run test-setup   # Verify setup
npm run start-all    # Start both servers

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🐛 Troubleshooting

### Common Issues

**API Key Not Working**

- Verify your Google Gemini API key is correct
- Check if the API key has proper permissions
- Ensure billing is enabled for the API

**Frontend Not Loading**

- Check if the backend server is running
- Verify the proxy configuration in `vite.config.js`
- Check browser console for errors

**PDF Export Failing**

- Ensure the interview is complete
- Check server logs for PDF generation errors
- Verify PDFKit dependencies are installed

**Questions Not Generating**

- Check API key configuration
- Verify network connectivity
- Check server logs for Gemini API errors

### Getting Help

- Check console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed
- Check the API health endpoint: `http://localhost:3001/api/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **LangGraph** for sophisticated workflow management
- **Google Gemini** for powerful AI capabilities
- **React** and **Vite** for modern frontend development
- **Express** for robust backend API
- **PDFKit** for professional report generation

## 🔮 Future Enhancements

- [ ] Video interview simulation
- [ ] Multiple language support
- [ ] Advanced analytics dashboard
- [ ] Integration with job boards
- [ ] Mock interview scheduling
- [ ] Performance tracking over time
- [ ] Custom question sets
- [ ] Team collaboration features
- [ ] Mobile app development
- [ ] AI-powered resume analysis

---

**Built with ❤️ for the hackathon community**

_Ready to ace your next interview? Start practicing today!_ 🚀
