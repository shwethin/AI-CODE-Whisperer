class Subject:
    def __init__(self, id, name, exam_date, difficulty):
        self.id = id
        self.name = name
        self.exam_date = exam_date
        self.difficulty = difficulty

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "exam_date": self.exam_date,
            "difficulty": self.difficulty
        }


class Assignment:
    def __init__(self, id, title, subject_id, deadline, est_hours):
        self.id = id
        self.title = title
        self.subject_id = subject_id
        self.deadline = deadline
        self.est_hours = est_hours

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subject_id": self.subject_id,
            "deadline": self.deadline,
            "hours": self.est_hours
        }
