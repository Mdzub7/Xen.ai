# Xen AI Assistant

A modern AI code assistant integrated into your development environment, featuring real-time code analysis, suggestions, and interactive chat capabilities.

## Features

- 💡 Real-time AI Code Assistant
- 💬 Interactive Chat Interface
- 🎨 Syntax Highlighted Code Blocks
- 📋 Code Actions (Copy, Apply, Download)
- 🔄 Smooth Loading States
- 🎯 Context-Aware Responses
- 🌓 Dark Theme Optimized

## Project Structure
Directory structure:
└── mdzub7-xen.ai/
    ├── BackEnd/
    │   ├── package.json
    │   ├── server.js
    │   ├── .gitignore
    │   └── src/
    │       ├── app.js
    │       ├── controllers/
    │       │   └── ai.controller.js
    │       ├── routes/
    │       │   └── ai.routes.js
    │       └── services/
    │           └── ai.service.js
    └── frontend/
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── postcss.config.js
        ├── tailwind.config.js
        ├── tsconfig.app.json
        ├── tsconfig.json
        ├── tsconfig.node.json
        ├── vite.config.ts
        ├── .gitignore
        └── src/
            ├── App.tsx
            ├── index.css
            ├── main.tsx
            ├── types.ts
            ├── vite-env.d.ts
            ├── components/
            │   ├── AIPanel.tsx
            │   ├── ActivityBar.tsx
            │   ├── CodeBlock.tsx
            │   ├── Editor.tsx
            │   ├── FileExplorer.tsx
            │   ├── Layout.tsx
            │   ├── LoadingSpinner.tsx
            │   ├── SidePanel.tsx
            │   ├── StatusBar.tsx
            │   ├── Terminal.tsx
            │   ├── Toolbar.tsx
            │   └── views/
            │       ├── ExtensionsView.tsx
            │       ├── ProfileView.tsx
            │       ├── SearchView.tsx
            │       ├── SettingsView.tsx
            │       └── SourceControlView.tsx
            ├── store/
            │   └── editorStore.ts
            ├── styles/
            │   ├── codeBlock.css
            │   └── loadingSpinner.css
            ├── types/
            │   └── index.ts
            └── utils/
                └── formatResponse.ts

## Technical Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: CSS with Tailwind CSS
- **Markdown Processing**: react-markdown
- **Syntax Highlighting**: rehype-highlight
- **State Management**: Custom store implementation
- **HTTP Client**: Native fetch API

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

1. Clone the repository:
```bash
git clone https://github.com/Mdzub7/Xen.ai
cd Xen-ai
```
2. Install dependencies:
```
cd frontend
npm install
```
3. Create a Virtual Environment
```
python -m venv venv
source venv/bin/activate  # For macOS/Linux
venv\Scripts\activate  # For Windows
```
4. Install Dependencies
```
pip install -r requirements.txt
```
Configuration

1. Set Up Environment Variables

Create a .env file in main file and add:
```
GEMINI_API_KEY=your_google_gemini_api_key
DEEPSEEK_API_KEY=from www.openrouter.ai #get DeepSeek:R1(free) and app name as'xen.ai' with unlimited tokens
GROQ_API_KEY=from www.groq.com
```
Replace your_google_gemini_api_key with your actual API key.
Running the Server

Start the FastAPI server with:
```
uvicorn app.main:app --reload
```
By default, the server runs at:
➡️ http://127.0.0.1:8000

```
4. Start Frontend server
```
cd frontend
npm run dev
```
### DOCKER USGAE ###
## How to Run Judge0 Locally
1. Install **Docker** if not already installed: [Get Docker](https://docs.docker.com/get-docker/)
2. set up PostgreSQL and Redis Password and DB inside judge0.conf file
3. Convert the file using
```
$ dos2unix judge0.conf
```
3. Run the following command to start Judge0:
   ```sh
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
  
## Development
### Adding New Features
1. Create new components in src/components/
2. Add styles in src/styles/
3. Update types in src/types/
4. Implement utilities in src/utils/
   
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
mdzub7@gmail.com
