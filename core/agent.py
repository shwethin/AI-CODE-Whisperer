import ollama
from datetime import datetime

class PlanningEngine:
    def __init__(self, model="llama3"):
        self.model = model

    def generate_daily_plan(self, assignments):
        if not assignments:
            return {"plan": "No assignments available."}

        assignment_text = ""
        for a in assignments:
            assignment_text += (
                f"- {a.title} | Deadline: {a.deadline} | "
                f"Estimated Hours: {a.est_hours}\n"
            )

        prompt = f"""
You are an intelligent study planner.

Today's date: {datetime.now().date()}

Assignments:
{assignment_text}

Create a clear and practical daily study plan.
Divide work into time blocks.
Keep it realistic for a student.
"""

        response = ollama.chat(
            model=self.model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return {
            "plan": response["message"]["content"]
        }
