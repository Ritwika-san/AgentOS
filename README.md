# AgentOS — Autonomous AI Agent Platform

An AI-powered agent platform that autonomously completes research goals using real-time web search and tool use.

## What it does

- Give the agent any research goal
- Agent autonomously decides which tools to use
- Web search and calculator tools available
- Watch the agent's thinking stream in real time via WebSockets
- Get a comprehensive final result

## Tech Stack

**Backend**
- Django + Django REST Framework
- Django Channels (WebSockets)
- Daphne ASGI server

**AI**
- Llama 3.1 via Groq API
- LangChain tool binding
- Tavily web search API

**Frontend**
- React + Vite
- Real time WebSocket connection
- CSS-in-JS styling

## Architecture

User submits goal via React
→ WebSocket sends goal to Django
→ Django consumer passes to AI agent
→ Agent decides which tools to use
→ Web search / calculator tools execute
→ Agent synthesizes final answer
→ Results stream back via WebSocket in real time
→ React displays live agent thoughts + final result

## Setup

### Backend

```bash
cd agentos
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:
SECRET_KEY=your_secret_key
DEBUG=True
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key

```bash
python manage.py migrate
python manage.py createsuperuser
```

Run server:
```bash
$env:DJANGO_SETTINGS_MODULE="core.settings"; daphne -p 8000 core.asgi:application
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## Key Concepts Implemented

- Autonomous AI agent with tool use (LangChain)
- Real time WebSocket streaming (Django Channels)
- React frontend with live state updates
- CORS configured for cross-origin development
- Custom Django auth with email login
- REST API endpoints for React integration