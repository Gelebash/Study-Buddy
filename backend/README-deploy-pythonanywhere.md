PythonAnywhere quick deploy

1. Push your repo to GitHub.
2. Sign up at https://www.pythonanywhere.com/ and create a free account.
3. In a Bash console on PythonAnywhere:

```
git clone https://github.com/<you>/Study-Buddy.git
cd Study-Buddy/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
```

4. In the PythonAnywhere "Web" tab:
- Point the source to `~/Study-Buddy/backend`.
- Set the WSGI file to `~/Study-Buddy/backend/backend/wsgi.py`.
- Configure the virtualenv path to `~/Study-Buddy/backend/venv`.
- Add environment variables: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, and `DJANGO_ALLOWED_HOSTS=yourusername.pythonanywhere.com`.

5. Reload the web app.

Notes:
- SQLite file `db.sqlite3` will live in your project folder and persist across reloads on PythonAnywhere.
- For static files we use WhiteNoise; collectstatic copies static into `staticfiles/` which PythonAnywhere will serve.