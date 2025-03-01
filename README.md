# Xen AI Assistant

A modern AI-powered code assistant integrated into your development environment, featuring real-time code analysis, suggestions, and interactive chat capabilities.

## Features

- 💡 Real-time AI Code Assistant
- 💬 Interactive Chat Interface
- 🎨 Syntax Highlighted Code Blocks
- 📋 Code Actions (Copy, Apply, Download)
- 🔄 Smooth Loading States
- 🎯 Context-Aware Responses
- 🌓 Dark Theme Optimized


## Technical Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: CSS with Tailwind CSS
- **Markdown Processing**: react-markdown
- **Syntax Highlighting**: rehype-highlight
- **State Management**: Custom store implementation
- **HTTP Client**: Native fetch API
- **Backend**: FastAPI
- **Authentication**: Firebase Authentication

## Key Components

### AIPanel
The main component that handles:
- User input processing
- AI response rendering
- Code block management
- Message history
- Loading states

### Code Block Features
- Syntax highlighting for multiple languages
- Copy to clipboard functionality
- Code application capability
- File download option
- Responsive design

## Setup and Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Mdzub7/Xen.ai
cd Xen-ai
```

### 2. Install Dependencies
#### Backend
```
pip install -r requirements.txt
```

#### Frontend
```
cd frontend
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root directory and add:
```
GEMINI_API_KEY=your_google_gemini_api_key
DEEPSEEK_API_KEY=from www.openrouter.ai
GROQ_API_KEY=from www.groq.com
FIREBASE_CREDENTIALS=path/to/firebase-adminsdk.json
```

Replace `your_google_gemini_api_key` with your actual API key.

### 4. Start Backend Server
```
uvicorn app.main:app --reload
```
By default, the server runs at:
➡️ http://127.0.0.1:8000

### 5. Start Frontend Server
```
cd frontend
npm run dev
```

## Firebase Authentication Setup

### 1. Create a Firebase Project & Get Credentials
- Go to **[Firebase Console](https://console.firebase.google.com)**
- Create a new project (or use an existing one)
- Navigate to **Project Settings** → **Service Accounts**
- Click **Generate new private key**
- Move the downloaded `firebase-adminsdk.json` file to the backend directory
- Update the `.env` file with the correct path to `FIREBASE_CREDENTIALS`

### 2. Verify Firebase Authentication in FastAPI
```python
import firebase_admin
from firebase_admin import credentials, auth
import os
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Load Firebase credentials
firebase_json = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_json)
    firebase_admin.initialize_app(cred)

security = HTTPBearer()

def verify_firebase_token(auth_credentials: HTTPAuthorizationCredentials = Security(security)):
    token = auth_credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
```

### 3. Protect FastAPI Routes
```python
from fastapi import APIRouter, Depends

router = APIRouter()

@router.get("/protected-route")
async def protected(user_data: dict = Depends(verify_firebase_token)):
    return {"message": "Access granted!", "user": user_data}
```

## Running Judge0 Locally with Docker
### 1. Install Docker
[Get Docker](https://docs.docker.com/get-docker/)

### 2. Setup judge0.conf

Set up PostgreSQL and Redis Password and DB inside judge0.conf file

### 3. Configure PostgreSQL and Redis in `judge0.conf`
Convert file to Unix format if needed:
```
dos2unix judge0.conf
```

### 4. Start Judge0
```
docker-compose up -d
```

## Usage
1. Open the AI Assistant panel using the designated button
2. Type your query or paste code for analysis
3. Receive AI-powered responses with formatted code blocks
4. Use the code action buttons to:
   - Copy code snippets
   - Apply suggested changes
   - Download code as files

## Development Guidelines

### Adding New Features
1. Create new components in `src/components/`
2. Add styles in `src/styles/`
3. Update types in `src/types/`
4. Implement utilities in `src/utils/`

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Maintain consistent styling with Tailwind CSS

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License

## Contact
📧 mdzub7@gmail.com

