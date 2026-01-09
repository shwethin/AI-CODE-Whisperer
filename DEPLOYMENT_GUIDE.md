# Google Cloud Deployment Guide - Study Agent (Agentic AI)

## 🎯 Deployment Options

### Option 1: Cloud Run + Vertex AI (Recommended - Serverless)
**Pros**: Fully managed, auto-scaling, pay-per-use  
**Cons**: Need to replace Ollama with Vertex AI

### Option 2: Compute Engine VM with Ollama (Full Control)
**Pros**: Run Ollama directly, complete control  
**Cons**: Must manage VM, costs more

### Option 3: Cloud Run + External Ollama
**Pros**: Keep Ollama, Cloud Run benefits  
**Cons**: Need to set up Ollama separately

---

## 📦 Option 1: Cloud Run + Vertex AI (Easiest)

### Step 1: Modify for Vertex AI
Replace Ollama with Google's Vertex AI in `server.py`:

```python
# Add at top
from google.cloud import aiplatform
from vertexai.preview.generative_models import GenerativeModel

# Replace handle_generate_plan function (lines 70-96):
def handle_generate_plan(self):
    if not assignments_db:
        self.send_json({"plan": "No assignments to plan for! Add some first."})
        return

    tasks_text = ""
    for a in assignments_db:
        tasks_text += f"- {a['title']} (Due: {a['deadline']}, Take {a['hours']}h)\n"

    prompt = f"Today is {datetime.now().date()}. Create a study plan for these tasks:\n{tasks_text}\nKeep it concise."

    try:
        # Initialize Vertex AI
        model = GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        self.send_json({"plan": response.text})
    except Exception as e:
        self.send_json({"plan": f"Error: {str(e)}"})
```

### Step 2: Update Requirements
Create `requirements.txt`:
```txt
google-cloud-aiplatform
```

### Step 3: Deploy to Cloud Run
```bash
# 1. Initialize gcloud
gcloud init

# 2. Set project
gcloud config set project YOUR_PROJECT_ID

# 3. Build and deploy
gcloud run deploy study-agent \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi
```

### Step 4: Enable Vertex AI
```bash
gcloud services enable aiplatform.googleapis.com
```

---

## 🖥️ Option 2: Compute Engine VM with Ollama

### Step 1: Create VM with GPU (Optional but Recommended)
```bash
gcloud compute instances create study-agent-vm \
  --zone=us-central1-a \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --tags=http-server,https-server
```

### Step 2: SSH into VM
```bash
gcloud compute ssh study-agent-vm --zone=us-central1-a
```

### Step 3: Install Dependencies on VM
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve &

# Pull model
ollama pull llama3
```

### Step 4: Deploy Your App
```bash
# Clone or upload your code
git clone YOUR_REPO_URL
cd ai

# Run server
python3 server.py &
```

### Step 5: Configure Firewall
```bash
gcloud compute firewall-rules create allow-http-8000 \
  --allow tcp:8000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```

### Step 6: Access Your App
```
http://[VM_EXTERNAL_IP]:8000
```

---

## 🔗 Option 3: Cloud Run + External Ollama

### Deploy App to Cloud Run
```bash
gcloud run deploy study-agent \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Set Up Ollama on Separate VM
Follow Option 2's Ollama setup, then:

### Update server.py
```python
# Line 83: Change Ollama URL to VM's external IP
ollama_url = "http://[OLLAMA_VM_IP]:11434/api/generate"
```

---

## 💾 Adding Database (Recommended for Production)

Your app currently uses in-memory storage. For production:

### Option A: Cloud Firestore (NoSQL, Serverless)
```python
from google.cloud import firestore

db = firestore.Client()

# Replace subjects_db list with:
def get_subjects():
    return [doc.to_dict() for doc in db.collection('subjects').stream()]

def add_subject(subject):
    db.collection('subjects').add(subject)
```

### Option B: Cloud SQL (PostgreSQL/MySQL)
```bash
gcloud sql instances create study-agent-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1
```

---

## 🔐 Security Best Practices

### 1. Add Authentication
```bash
# Deploy with IAM
gcloud run deploy study-agent \
  --no-allow-unauthenticated
```

### 2. Use Secret Manager for API Keys
```bash
echo -n "your-api-key" | gcloud secrets create ollama-key --data-file=-
```

### 3. Enable HTTPS
Cloud Run provides HTTPS automatically.

---

## 📊 Monitoring

### Enable Cloud Monitoring
```bash
gcloud services enable monitoring.googleapis.com logging.googleapis.com
```

### View Logs
```bash
gcloud run logs read study-agent --limit=50
```

---

## 💰 Cost Estimation

### Cloud Run + Vertex AI
- **Cloud Run**: $0 (free tier: 2M requests/month)
- **Vertex AI**: ~$0.0025 per 1K characters
- **Estimated**: $5-20/month (low usage)

### Compute Engine + Ollama
- **VM (n1-standard-4)**: ~$120/month
- **GPU (T4)**: ~$116/month
- **Storage**: ~$5/month
- **Estimated**: $240+/month

---

## 🚀 Quick Start (Recommended Path)

```bash
# 1. Install gcloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# 2. Authenticate
gcloud auth login

# 3. Create project
gcloud projects create study-agent-ai --name="Study Agent"
gcloud config set project study-agent-ai

# 4. Enable billing
# Visit: https://console.cloud.google.com/billing

# 5. Deploy!
cd c:\Users\albin\Desktop\ai
gcloud run deploy study-agent --source . --region us-central1 --allow-unauthenticated
```

---

## 🎓 Making It "Agentic"

Your app is already agentic! It:
- ✅ Observes: Tracks subjects, assignments, deadlines
- ✅ Decides: Prioritizes based on difficulty and urgency
- ✅ Acts: Generates adaptive study plans via LLM
- ✅ Learns: Can be extended with user feedback loops

### To Enhance Agentic Capabilities:
1. **Add Memory**: Use Firestore to store past plans
2. **Add Feedback Loop**: Let users rate plans, improve prompts
3. **Add Proactive Reminders**: Schedule Cloud Functions to send notifications
4. **Add Multi-Agent System**: Separate agents for prioritization, scheduling, reminders

---

## 📞 Get Your Live URL

After deployment, Cloud Run gives you a URL like:
```
https://study-agent-abc123-uc.a.run.app
```

Share this URL and your AI is live! 🎉

---

## 🐛 Troubleshooting

### "Permission denied"
```bash
gcloud auth application-default login
```

### "Port already in use"
Modify `server.py` line 8:
```python
PORT = int(os.environ.get('PORT', 8000))
```

### "Ollama connection failed"
Check firewall rules and Ollama VM is running:
```bash
curl http://OLLAMA_VM_IP:11434/api/tags
```
