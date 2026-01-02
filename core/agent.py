from datetime import date, timedelta
from .models import Assignment

class PlanningEngine:
    def __init__(self):
        pass

    def generate_daily_plan(self, assignments, available_hours=4.0):
        """
        Simple greedy algorithm to prioritize assignments due soon.
        """
        today = date.today()
        
        # Filter pending assignments
        pending = [a for a in assignments if not a.is_completed]
        
        # Sort by deadline (ascending), then by estimated hours (descending)
        # We want to tackle urgent stuff, but also big chunks if urgent.
        def priority_key(a):
            days_left = (a.deadline - today).days
            # Score: Lower is more urgent.
            # If overdue (negative days), extremely urgent.
            return days_left

        pending.sort(key=priority_key)

        plan = []
        hours_allocated = 0
        
        # Reserve some free time (e.g., 20% of available time is kept free or mandatory breaks)
        # But per user request: "Automatically reserves free time".
        # Let's say we schedule up to 80% of capacity.
        max_work_hours = available_hours * 0.8
        free_time_hours = available_hours - max_work_hours

        for task in pending:
            if hours_allocated >= max_work_hours:
                break
            
            # Allocate time to this task
            # Either finish it or work as much as possible
            hours_needed = task.est_hours
            hours_can_do = min(hours_needed, max_work_hours - hours_allocated)
            
            if hours_can_do > 0:
                plan.append({
                    'type': 'assignment',
                    'task': task.to_dict(),
                    'hours': round(hours_can_do, 1),
                    'note': f"Work on {task.title}"
                })
                hours_allocated += hours_can_do

        # Fill remaining with general study if we have no urgent assignments? 
        # For MVP, just show free time if under capacity.
        
        remaining_free = available_hours - hours_allocated
        
        return {
            'schedule': plan,
            'summary': {
                'study_hours': round(hours_allocated, 1),
                'free_hours': round(remaining_free, 1),
                'total_capacity': available_hours
            }
        }
