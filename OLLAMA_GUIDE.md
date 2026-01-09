# Ollama Integration Guide

## ✅ Current Status
Your Study Agent **already has Ollama connected**!

## 🔗 Where It's Connected

### Backend (`server.py` lines 70-96):
- **Endpoint**: `GET /api/plan`
- **Ollama URL**: `http://localhost:11434/api/generate`
- **Model**: `llama3`
- **Function**: Generates study plans based on your assignments

### Frontend:
- **Button**: "Generate Plan ⚡" (located in the right panel)
- **JavaScript**: Calls `/api/plan` when clicked

## 🧪 How to Test

### Step 1: Start Ollama
```bash
# Make sure Ollama is running
ollama serve

# In another terminal, verify you have llama3
ollama pull llama3
```

### Step 2: Start Your Server
```bash
cd c:\Users\albin\Desktop\ai
python server.py
```

### Step 3: Test in Browser
1. Open `http://localhost:8000`
2. Add a Subject (e.g., "Math", exam: tomorrow)
3. Add an Assignment (e.g., "Homework", deadline: tomorrow, 2 hours)
4. **Click "Generate Plan ⚡"** in the right panel
5. Watch the AI create your study plan!

## 📊 What It Does
When you click "Generate Plan", the system:
1. Gathers all your assignments
2. Sends a prompt to Ollama with:
   - Today's date
   - List of tasks with deadlines
   - Estimated hours
3. Ollama (llama3) generates a personalized study schedule
4. Result displays in the "Recommended Plan" section

## 🔧 Troubleshooting

### Error: "Error connecting to Ollama"
- **Fix**: Make sure Ollama is running (`ollama serve`)

### Error: "Model not found"
- **Fix**: Pull the model (`ollama pull llama3`)

### Want to use a different model?
Edit line 85 in `server.py`:
```python
"model": "llama3",  # Change to "mistral", "codellama", etc.
```

## 🎯 Current Integration Points
- ✅ `/api/plan` endpoint (working)
- ✅ Frontend "Generate Plan" button (working)
- 🔲 Could add: Chat with AI, Auto-reschedule, Calendar insights

Your Ollama is already wired up and ready to go!
