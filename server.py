import http.server
import socketserver
import json
import urllib.request
import os
from datetime import datetime
from urllib.parse import parse_qs, urlparse

PORT = 8081

# In-memory DB
subjects_db = []
assignments_db = []

class StudyAgentHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(__file__), **kwargs)
    
    def do_GET(self):
        print(f"[GET] {self.path}")
        
        # Serve Static Files
        if self.path == '/':
            self.path = '/static/index.html'
        elif self.path.startswith('/static/'):
            # Default behavior handles this
            pass
        elif self.path == '/api/subjects':
            self.send_json([s for s in subjects_db])
            return
        elif self.path == '/api/assignments':
            self.send_json([a for a in assignments_db])
            return
        elif self.path.startswith('/api/plan'):
            self.handle_generate_plan()
            return
        else:
            # Try to find in static folder if not explicit
            if not self.path.startswith('/api'):
                self.path = '/static' + self.path
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        if self.path == '/api/subjects':
            new_sub = {
                'id': len(subjects_db) + 1,
                'name': data['name'],
                'exam': data['exam_date'],
                'diff': data.get('difficulty')
            }
            subjects_db.append(new_sub)
            self.send_json(new_sub)
        
        elif self.path == '/api/assignments':
            new_ass = {
                'id': len(assignments_db) + 1,
                'title': data['title'],
                'subject_id': data['subject_id'],
                'deadline': data['deadline'],
                'hours': data['hours']
            }
            assignments_db.append(new_ass)
            self.send_json(new_ass)

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def handle_generate_plan(self):
        """Generate study plan using Ollama"""
        # Parse query params for user context
        query = parse_qs(urlparse(self.path).query)
        user_name = query.get('name', ['Student'])[0]
        user_age = query.get('age', ['unknown'])[0]

        # Check if we have assignments
        if not assignments_db:
            self.send_json({"plan": f"Hi {user_name}! You haven't added any assignments yet. Add some tasks first so I can help you plan!"})
            return

        # Build task list
        tasks_text = ""
        for a in assignments_db:
            tasks_text += f"- {a['title']} (Due: {a['deadline']}, Estimated: {a['hours']}h)\n"

        # Create personalized prompt
        prompt = (
            f"You are a helpful study assistant planning for a student named {user_name}, who is {user_age} years old. "
            f"Today is {datetime.now().date()}.\n\n"
            f"Create a supportive and clear study plan for these tasks:\n{tasks_text}\n"
            f"Provide a daily schedule prioritizing urgent tasks first. "
            f"Address the student by name and keep the tone encouraging and appropriate for a {user_age} year old."
        )

        # Call Ollama API
        ollama_url = "http://localhost:11434/api/generate"
        payload = {
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
        
        print(f"[OLLAMA] Calling Ollama at {ollama_url}")
        print(f"[PROMPT] {prompt[:100]}...")
        
        try:
            req = urllib.request.Request(
                ollama_url, 
                data=json.dumps(payload).encode('utf-8'), 
                headers={'Content-Type': 'application/json'}
            )
            
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode('utf-8'))
                plan_text = result.get('response', 'No response from Ollama')
                
                print(f"[SUCCESS] Ollama responded: {plan_text[:100]}...")
                self.send_json({"plan": plan_text})
                
        except urllib.error.URLError as e:
            error_msg = f"[ERROR] Cannot connect to Ollama. Is it running?\n\nError: {str(e)}\n\nTo fix:\n1. Run 'ollama serve' in terminal\n2. Make sure llama3 is installed: 'ollama pull llama3'"
            print(error_msg)
            self.send_json({"plan": error_msg})
        except Exception as e:
            error_msg = f"[ERROR] {str(e)}\n\nMake sure Ollama is running on port 11434"
            print(error_msg)
            self.send_json({"plan": error_msg})

print(f"Server starting on http://localhost:{PORT}")

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("", PORT), StudyAgentHandler) as httpd:
    httpd.serve_forever()
