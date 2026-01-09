# Ollama Troubleshooting Guide

## Issue: Ollama Not Working

### Quick Checks:

1. **Is Ollama installed?**
   ```bash
   ollama --version
   ```
   If not: Download from https://ollama.com/download

2. **Is Ollama server running?**
   ```bash
   # Start Ollama server
   ollama serve
   ```
   Keep this terminal window open!

3. **Is the model downloaded?**
   ```bash
   ollama pull llama3
   ```

4. **Can you reach Ollama?**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   Should return JSON with model list.

---

## Common Errors & Fixes:

### Error: "Cannot connect to Ollama"
**Cause**: Ollama server not running  
**Fix**: 
```bash
ollama serve
```

### Error: "Model not found"
**Cause**: llama3 not downloaded  
**Fix**:
```bash
ollama pull llama3
```

### Error: "Connection refused"
**Cause**: Ollama on wrong port  
**Fix**: Check Ollama is on port 11434
```bash
netstat -an | findstr 11434
```

### Error: "Timeout"
**Cause**: Model loading slowly  
**Fix**: Wait for model to load (first time is slow)

---

## Testing Ollama Directly:

```bash
# Test via CLI
ollama run llama3 "Create a study plan for tomorrow"

# Test via API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Hello world",
  "stream": false
}'
```

---

## Debugging in Study Agent:

1. **Start server with verbose output:**
   ```bash
   python server.py
   ```

2. **Watch the console** - look for:
   - `📡 Calling Ollama at ...`
   - `✅ Ollama responded: ...`
   - `❌ Cannot connect...`

3. **Test in app:**
   - Add an assignment
   - Click "Generate Plan ⚡"
   - Check browser console (F12) for errors

---

## Still Not Working?

### Use a different model:
Edit `server.py` line 113:
```python
"model": "llama3",  # Try: "mistral", "gemma", etc.
```

### Check Ollama logs:
```bash
# Windows
%LOCALAPPDATA%\Ollama\logs

# Check what models you have
ollama list
```

---

## Expected Behavior:

✅ Server console shows:
```
📡 Calling Ollama at http://localhost:11434/api/generate
✅ Ollama responded: Here's your study plan...
```

✅ App shows:
```
Recommended Plan
---
Day 1: Study Math (2 hours)
Day 2: Complete assignment...
```
