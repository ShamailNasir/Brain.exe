# Brain.exe

Brain.exe is a gamified productivity workspace and student planner designed to consolidate daily habits, task workflows, academic notes, and automated study insights in a unified visual dashboard.

The project features a responsive Next.js frontend, an asynchronous FastAPI backend service, and SQLite storage for relational persistence. It is designed to run locally for development and testing.

## Directory Structure

```text
Quantum-Task-Destroyer-3000/
├── backend/                  # FastAPI Backend Application
│   ├── config/               # App configuration settings
│   │   └── settings.py
│   ├── routes/               # API endpoint routers
│   │   ├── ai.py             # AI evaluation and coach routes
│   │   ├── auth_routes.py    # Session authorization and verification
│   │   └── db_routes.py      # Task syncing and metrics endpoints
│   ├── services/             # Core logic services
│   │   └── ai_service.py     # LLM integration client
│   ├── auth_utils.py         # Passcode encryption and token generation
│   ├── database.py           # SQLite connection and session initialization
│   ├── models.py             # Database schemas
│   ├── main.py               # Uvicorn webserver configuration
│   └── requirements.txt      # Python library requirements
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/              # Site layouts and page router components
│   │   │   ├── globals.css   # Tailored theme styles and variables
│   │   │   ├── layout.js     # Global shell and route logic
│   │   │   └── page.js       # Main visual dashboard
│   │   ├── components/       # Custom React UI components
│   │   │   ├── AI/           # Prompt evaluation and suggestion nodes
│   │   │   ├── DeepWorkOverlay/ # Interactive fullscreen focus overlay
│   │   │   ├── Header/       # Responsive navigation
│   │   │   ├── Sidebar/      # Sliding navigation panel
│   │   │   └── ThemePicker/  # Color system customization control
│   │   ├── features/         # Specialized features
│   │   └── lib/              # API request client
│   │       └── api.js
│   ├── package.json          # Node.js configurations and scripts
│   └── tailwind.config.js    # Utility style parameters
└── README.md                 # Project documentation
```

## Key Modules

- **Interactive Dashboard**: A daily tracking hub featuring habit checklists, date-wheel navigation, and a dynamic Daily Quest (Boss Task) carrying level-up experience points.
- **Secure Authentication**: Relies on a client-side state provider paired with custom FastAPI JWT token verification. Registration and login credentials are encrypted using bcrypt.
- **Deep Work Interface**: An integrated focus timer displaying a fullscreen layout overlay designed to isolate the work environment.
- **Multi-Theme System**: Supports five user-selectable styling options (Dark/Zen, Light/Daylight, Nord, Rose Pine, and Catppuccin) rendered via responsive CSS variables.
- **Academic Workspace**: A notebook directory allowing users to store and categorize study notes in Markdown format, connected to an automated review generator.

## Technical Architecture

### Frontend Layer
- **Framework**: Next.js 16 (App Router) built on React 19.
- **Animation**: Framer Motion for component transitions and drawer mechanics.
- **Styling**: Tailwind CSS and scoped CSS Modules matching custom theme tokens.

### Backend Layer
- **Framework**: FastAPI for handling async requests.
- **Persistence**: SQLite database accessed via SQLAlchemy ORM.
- **Security**: JWT validation via Python-Jose and hashing via bcrypt.
- **AI Processing**: Integration with Google Gemini for automated suggestions, task decompositions, and productivity coaching.

## Local Setup

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate.ps1
   # macOS/Linux
   source .venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory and configure the variables:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

5. Run the webserver:
   ```bash
   python main.py
   ```
   The backend service launches at http://localhost:8001.

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js packages:
   ```bash
   npm install
   ```

3. Run the development environment:
   ```bash
   npm run dev
   ```
   The user interface launches at http://localhost:3001.

4. Compile the project production bundle:
   ```bash
   npm run build
   ```

## REST API Specifications

### Authentication Routes
- `POST /api/auth/register`: Creates a new user profile. Returns a JWT access token.
- `POST /api/auth/login`: Verifies user credentials. Returns a JWT bearer token.
- `GET /api/auth/me`: Retrieves current session profile data.

### Task and State Routes
- `GET /api/tasks`: Returns tasks filtered by the logged-in user session.
- `POST /api/tasks`: Updates database records to sync with client task state.
- `GET /api/stats`: Returns active experience points and level info.
- `POST /api/stats`: Updates active level stats.

### AI Coach Routes
- `POST /ai/future-message`: Evaluates tasks to produce a brief motivational message.
- `POST /ai/enhance-task`: Rewrites task titles to look clearer.
- `POST /ai/breakdown`: Outlines three subtask checklist items.
- `POST /ai/smart-suggestions`: Predicts next task candidates.
- `POST /ai/suggestions`: Recommends revision workflows based on notebooks.
- `POST /ai/quote`: Delivers a context-appropriate quote.
- `POST /ai/help`: Answers productivity coaching queries.
- `POST /ai/boss-task`: Creates a daily gamified boss objective.
