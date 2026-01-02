# Hosting Guide - Intelligent Study Agent

Here are the easiest ways to host your application so you can access it from your phone or share it.

## Option 1: Deploy to Render (Free Cloud Hosting)
Render is a cloud provider that allows you to host Python web apps for free.

### Prerequisites
1.  **Gunicorn**: We need to add a production server.
    - Open `requirements.txt` and ensure it includes `gunicorn`.
2.  **GitHub**: You need to upload your project to a GitHub repository.

### Steps
1.  **Push to GitHub**:
    - Initialize git: `git init`
    - Add files: `git add .`
    - Commit: `git commit -m "Initial commit"`
    - Create a repo on GitHub and push.
2.  **Create Service on Render**:
    - Go to [dashboard.render.com](https://dashboard.render.com).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.
3.  **Configure**:
    - **Name**: `study-agent` (or similar)
    - **Runtime**: `Python 3`
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `gunicorn app:app`
4.  **Deploy**: Click "Create Web Service".
    - Once finished, you will get a URL like `https://study-agent.onrender.com`.

## Option 2: Local Network (Host from PC)
If you just want to use it on your phone while at home:

1.  **Find your PC's IP Address**:
    - Open Command Prompt and type `ipconfig`.
    - Look for `IPv4 Address` (e.g., `192.168.1.5`).
2.  **Modify app.py**:
    - Change the bottom line to:
      ```python
      if __name__ == '__main__':
          app.run(host='0.0.0.0', port=5000)
      ```
3.  **Run the App**:
    - `python app.py`
4.  **Access on Phone**:
    - Open your phone's browser and type: `http://192.168.1.5:5000` (replace with your IP).
