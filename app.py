from flask import Flask, render_template, request, jsonify
from core.models import Subject, Assignment
from core.agent import PlanningEngine
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'super_secret_key_for_dev'

# In-memory storage for MVP
subjects_db = []
assignments_db = []
planner = PlanningEngine()

# Validating routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/subjects', methods=['POST'])
def add_subject():
    data = request.json
    new_sub = Subject(
        id=len(subjects_db) + 1,
        name=data['name'],
        exam_date=data['exam_date'],
        difficulty=int(data.get('difficulty', 3))
    )
    subjects_db.append(new_sub)
    return jsonify(new_sub.to_dict())

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    return jsonify([s.to_dict() for s in subjects_db])

@app.route('/api/assignments', methods=['POST'])
def add_assignment():
    data = request.json
    new_ass = Assignment(
        id=len(assignments_db) + 1,
        title=data['title'],
        subject_id=int(data['subject_id']),
        deadline=data['deadline'],
        est_hours=float(data['hours'])
    )
    assignments_db.append(new_ass)
    return jsonify(new_ass.to_dict())

@app.route('/api/plan', methods=['GET'])
def get_daily_plan():
    # Pass all assignments to the planner
    result = planner.generate_daily_plan(assignments_db)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
