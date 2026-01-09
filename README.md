# 🎓 Intelligent Study Timetable & Planner Agent

An AI-powered study planning application that helps you organize your schedule and uses Ollama for personalized study plans.

## ✨ Features

- 🤖 **AI Study Plans** - Powered by Ollama (llama3)
- 📅 **Visual Calendar** - Monthly and yearly views with event tracking
- 🎯 **Smart Prioritization** - Automatic priority calculation based on deadlines
- 💾 **Local Profile** - Personalize your experience with a simple Name/Age profile
- 🎨 **Premium UI** - Glassmorphism dark mode design
- 🚀 **Zero External Dependencies** - Pure Python server (standard library only)

## 📁 Project Structure

```
ai/
├── server.py                    # Main Python server (port 8081)
├── requirements.txt             # Python dependencies (optional for AI)
├── static/                      # Frontend files
│   ├── index.html              # Main UI
│   ├── script.js               # Frontend logic
│   └── style.css               # Styling
├── core/                        # Core modules
│   ├── agent.py                # Planning engine
│   └── models.py               # Data models
├── .gitignore                  # Git ignore rules
├── Dockerfile                  # Docker configuration
├── app.yaml                    # App Engine config
├── cloudbuild.yaml             # Cloud Build config
└── docs/                       # Documentation
    ├── OLLAMA_GUIDE.md
    ├── OLLAMA_TROUBLESHOOTING.md
    └── DEPLOYMENT_GUIDE.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Ollama (optional, for AI features)

### Run Locally

```bash
# 1. Navigate to project folder
cd c:\Users\albin\Desktop\ai

# 2. Start the server
python server.py

# 3. Open in browser
http://localhost:8081
```

### With Ollama AI (Optional)

```bash
# 1. Install Ollama
# Download from: https://ollama.com

# 2. Start Ollama server
ollama serve

# 3. Pull model
ollama pull llama3

# 4. Start your app
python server.py
```

## 📖 Usage

### First Time Setup
1. Visit `http://localhost:8081`
2. Enter your **Name** and **Age** in the welcome screen.
3. Click "Start Planning 🚀".

### Main Features
1. **Add Subjects**: Go to "Subjects" tab and add your courses (e.g., Math, History).
2. **Add Assignments**: Go to "Assignments" tab and add tasks with deadlines.
3. **Calendar**: View your schedule in Month or Year view.
4. **AI Plan**: Click "Generate Plan ⚡" to get a daily schedule for your tasks.

## 🔧 Configuration

### Change Port
Edit `server.py` line 9:
```python
PORT = 8081  # Change to your preferred port
```

### Change AI Model
Edit `server.py` line 95:
```python
"model": "llama3",  # Try: mistral, gemma, etc.
```

## 🌐 Deployment

### Google Cloud Run
```bash
gcloud run deploy study-agent --source . --region us-central1
```

### Docker
```bash
docker build -t study-agent .
docker run -p 8081:8081 study-agent
```

See `DEPLOYMENT_GUIDE.md` for complete instructions.

## 📚 Documentation

- **OLLAMA_GUIDE.md** - Ollama integration guide
- **OLLAMA_TROUBLESHOOTING.md** - Fix Ollama issues
- **DEPLOYMENT_GUIDE.md** - Deploy to cloud

## 🐛 Troubleshooting

### 404 Error
- Make sure server is running on port 8081
- Check terminal for errors
- Restart: `Ctrl+C` then `python server.py`

### Ollama Not Working
- Start Ollama: `ollama serve`
- Pull model: `ollama pull llama3`
- See: `OLLAMA_TROUBLESHOOTING.md`

## 📊 Tech Stack

- **Backend**: Python (http.server, urllib)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI**: Ollama (llama3)
- **Styling**: Custom CSS (Glassmorphism)

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is a personal study tool. Feel free to fork and customize!

---

**Made with ❤️ for students**

**Current Version**: 1.1.0  
**Server Port**: 8081  
**Status**: ✅ Running
