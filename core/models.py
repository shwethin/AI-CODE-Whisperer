from datetime import datetime, date

class Subject:
    def __init__(self, id, name, exam_date, difficulty=3):
        self.id = id
        self.name = name
        self.exam_date = exam_date if isinstance(exam_date, date) else datetime.strptime(exam_date, '%Y-%m-%d').date()
        self.difficulty = difficulty

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'exam_date': self.exam_date.strftime('%Y-%m-%d'),
            'difficulty': self.difficulty
        }

class Assignment:
    def __init__(self, id, title, subject_id, deadline, est_hours, is_completed=False):
        self.id = id
        self.title = title
        self.subject_id = subject_id
        self.deadline = deadline if isinstance(deadline, date) else datetime.strptime(deadline, '%Y-%m-%d').date()
        self.est_hours = float(est_hours)
        self.is_completed = is_completed

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'subject_id': self.subject_id,
            'deadline': self.deadline.strftime('%Y-%m-%d'),
            'est_hours': self.est_hours,
            'is_completed': self.is_completed
        }
