# Study-Buddy

A full-stack web application that helps students manage their study sessions with features like flashcards, study timer, agenda planning, and a virtual study buddy.

## Features

- 📝 Flashcard system for studying
- ⏲️ Study timer with Pomodoro mode
- 📅 Agenda planning
- 📚 Digital notebook
- 🐾 Virtual study buddy that responds to study habits
- 🔒 User authentication system

## Tech Stack

### Frontend
- React + Vite
- React Router DOM
- Axios for API calls
- CSS for styling

### Backend
- Django
- Django REST Framework
- SQLite3
- JWT Authentication

## Prerequisites

- Python 3.x
- Node.js and npm
- Git

## Installation

1. Clone the repository:
```sh
git clone https://github.com/yourusername/Study-Buddy.git
cd Study-Buddy
```

2. Set up the backend:
```sh
cd backend

# Create and activate virtual environment
python -m venv env
env\Scripts\activate  # Windows
env/bin/activate     # Unix/macOS

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the Django server
python manage.py runserver
```

3. Set up the frontend:
```sh
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Running the Application

1. Start the backend server:
```sh
cd backend
source env/Scripts/activate  # Windows
source env/bin/activate     # Unix/macOS
python manage.py runserver
```

2. Start the frontend development server:
```sh
cd frontend
npm run dev
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## API Endpoints

### Authentication
- POST `/api/user/register/` - Register new user
- POST `/api/token/` - Get JWT token
- POST `/api/token/refresh/` - Refresh JWT token

### Notes/Flashcards
- GET/POST `/api/note/` - List or create notes
- GET/PUT/DELETE `/api/note/<id>/` - Retrieve, update or delete note

### Study Buddy
- GET/PUT `/api/buddy/<id>/` - Get or update buddy
- GET/POST `/api/buddy/` - List or create buddies

## Project Structure

```
Study-Buddy/
├── backend/
│   ├── api/              # Django app
│   ├── backend/          # Django project settings
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
