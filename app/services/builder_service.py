import os
import subprocess
import json
from fastapi import HTTPException
from typing import Dict, List, Optional, Any, Union
from app.services.firebase_auth import verify_firebase_token

class BuilderService:
    """Service for handling Builder feature operations including code generation and file manipulation."""
    
    def __init__(self):
        """Initialize the Builder service."""
        # Set the base project directory
        self.base_dir = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        # Set maximum allowed file size for modifications (in bytes)
        self.max_file_size = 10 * 1024 * 1024  # 10MB limit
    
    async def generate_code(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate code based on user prompt and optional context.
        
        Args:
            prompt: The user's request for code generation
            context: Optional context information like file contents, project structure, etc.
            
        Returns:
            Dictionary containing the generated code and status
        """
        try:
            from app.services.ai_service import (
                gemini_generate_review,
                qwen_generate_review,
                deepseek_generate_review,
                qwq_generate_review
            )
            
            # Determine which AI model to use based on context
            model = context.get('model', 'gemini').lower() if context else 'gemini'
            
            # Format the prompt with context information if available
            enhanced_prompt = prompt
            if context and context.get('currentFile'):
                file_info = context['currentFile']
                enhanced_prompt += f"\n\nCurrent file: {file_info['name']}\nLanguage: {file_info['language']}\nContent:\n```{file_info['language']}\n{file_info['content']}\n```"
            
            # Call the appropriate AI service based on the model
            if model == 'qwen-2.5':
                response = await qwen_generate_review(enhanced_prompt)
            elif model == 'deepseek':
                response = await deepseek_generate_review(enhanced_prompt)
            elif model == 'qwq-32b':
                response = await qwq_generate_review(enhanced_prompt)
            else:  # Default to Gemini
                response = await gemini_generate_review(enhanced_prompt)
            
            if not response:
                raise ValueError("Empty response from AI service")
                
            if response.startswith("Failed to generate"):
                raise ValueError(f"AI service error: {response}")
            
            # Extract code from the response with improved parsing
            code_content = ""
            lines = response.split('\n')
            in_code_block = False
            language = ""
            code_blocks = []
            current_block = []
            
            for line in lines:
                # Check for code block start with optional language
                if line.startswith('```'):
                    if not in_code_block:
                        if len(line) > 3:
                            language = line[3:].strip()
                        in_code_block = True
                    else:
                        if current_block:  # Only add non-empty blocks
                            code_blocks.append('\n'.join(current_block))
                        current_block = []
                        in_code_block = False
                    continue
                if in_code_block:
                    current_block.append(line)
            
            # Handle case where code block wasn't properly closed
            if current_block:
                code_blocks.append('\n'.join(current_block))
            
            # If we found code blocks, use the longest one
            if code_blocks:
                code_content = max(code_blocks, key=len).strip()
            
            # If no code block found, try to detect code content
            if not code_content:
                # Look for common code patterns
                code_patterns = ['def ', 'class ', 'function', 'import ', 'const ', 'var ', 'let ', 'public ', 'private ', '@', '#', 'package ', 'using ']
                if any(pattern in response for pattern in code_patterns):
                    # Extract the most likely code segment
                    potential_code_lines = []
                    for line in lines:
                        line = line.strip()
                        if line and any(pattern in line for pattern in code_patterns):
                            potential_code_lines.append(line)
                    if potential_code_lines:
                        code_content = '\n'.join(potential_code_lines)
                    else:
                        code_content = response.strip()
                else:
                    # Try to extract any content between brackets or indented blocks
                    code_lines = [line for line in lines if line.strip()]
                    if any(line.strip().startswith(('    ', '\t')) for line in code_lines):
                        # Keep only indented lines and their context
                        indented_blocks = []
                        current_block = []
                        for line in code_lines:
                            if line.strip().startswith(('    ', '\t')) or (current_block and line.strip()):
                                current_block.append(line)
                            elif current_block:
                                indented_blocks.append('\n'.join(current_block))
                                current_block = []
                        if current_block:
                            indented_blocks.append('\n'.join(current_block))
                        code_content = max(indented_blocks, key=len) if indented_blocks else response.strip()
                    else:
                        code_content = response.strip()
            
            if not code_content.strip():
                raise ValueError("No code content could be extracted from the response")
            
            return {
                "status": "success",
                "code": code_content,
                "model": model,
                "language": language
            }
            
        except Exception as e:
            print(f"Error in generate_code: {str(e)}")  # Log the error
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to generate code: {str(e)}",
                    "model": context.get('model', 'gemini') if context else 'gemini'
                }
            )
    
    async def modify_file(self, file_path: str, changes: Dict[str, Any]) -> Dict[str, Any]:
        """Modify a file in the project or create it if it doesn't exist.
        
        Args:
            file_path: Path to the file to modify
            changes: Dictionary containing the changes to make
            
        Returns:
            Result of the operation
        """
        try:
            # Validate file path to prevent directory traversal
            abs_path = os.path.abspath(file_path)
            
            # Ensure the file is within the project directory
            if not abs_path.startswith(self.base_dir):
                return {"status": "error", "message": "File path is outside the project directory"}
            
            # Check if file exists, create it if it doesn't
            if not os.path.isfile(abs_path):
                # Create directory structure if needed
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                
                # If content is provided in changes, create the file with that content
                if 'content' in changes:
                    with open(abs_path, 'w') as file:
                        file.write(changes['content'])
                    return {"status": "success", "message": f"File {file_path} created successfully"}
                else:
                    # Create an empty file
                    with open(abs_path, 'w') as file:
                        pass
                    return {"status": "success", "message": f"Empty file {file_path} created successfully"}
                
            # Check file size
            if os.path.getsize(abs_path) > self.max_file_size:
                return {"status": "error", "message": f"File {file_path} exceeds maximum allowed size"}
                
            # Read the current file content
            with open(abs_path, 'r') as file:
                content = file.read()
                
            # Apply changes based on the changes dictionary
            # The changes dictionary should contain operations like:
            # - replace: {start_line, end_line, new_content}
            # - insert: {line, content}
            # - delete: {start_line, end_line}
            
            if 'operation' not in changes:
                return {"status": "error", "message": "No operation specified in changes"}
                
            lines = content.split('\n')
            
            if changes['operation'] == 'replace' and all(k in changes for k in ['start_line', 'end_line', 'new_content']):
                start = max(0, changes['start_line'])
                end = min(len(lines), changes['end_line'])
                new_lines = changes['new_content'].split('\n')
                lines[start:end] = new_lines
                
            elif changes['operation'] == 'insert' and all(k in changes for k in ['line', 'content']):
                line_num = min(len(lines), max(0, changes['line']))
                new_lines = changes['content'].split('\n')
                lines[line_num:line_num] = new_lines
                
            elif changes['operation'] == 'delete' and all(k in changes for k in ['start_line', 'end_line']):
                start = max(0, changes['start_line'])
                end = min(len(lines), changes['end_line'])
                lines[start:end] = []
            else:
                return {"status": "error", "message": "Invalid operation or missing parameters"}
                
            # Write the modified content back to the file
            with open(abs_path, 'w') as file:
                file.write('\n'.join(lines))
                
            return {"status": "success", "message": f"File {file_path} modified successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to modify file: {str(e)}")
    
    async def execute_command(self, command: str) -> Dict[str, Any]:
        """Execute a terminal command.
        
        Args:
            command: The command to execute
            
        Returns:
            Result of the command execution
        """
        try:
            # Validate command for security
            if not command:
                raise ValueError("Empty command")
                
            # List of disallowed commands or patterns
            disallowed = ['rm -rf', 'sudo', 'chmod', 'chown', ';', '&&', '||', '>', '>>', '|']
            if any(pattern in command for pattern in disallowed):
                raise ValueError(f"Command contains disallowed patterns: {command}")
                
            # Execute the command in a subprocess with a timeout
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=self.base_dir  # Run commands in the project directory
            )
            
            try:
                stdout, stderr = process.communicate(timeout=30)  # 30 second timeout
            except subprocess.TimeoutExpired:
                process.kill()
                raise ValueError("Command execution timed out")
                
            if process.returncode != 0:
                return {
                    "status": "error",
                    "output": stderr,
                    "return_code": process.returncode
                }
                
            return {
                "status": "success",
                "output": stdout,
                "return_code": process.returncode
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to execute command: {str(e)}")
    
    async def get_file_structure(self, base_dir: Optional[str] = None) -> Dict[str, Any]:
        """Get the structure of the project files.
        
        Args:
            base_dir: Optional base directory to start from. If None, uses current directory.
            
        Returns:
            Dictionary representing the file structure
        """
        try:
            if base_dir is None:
                base_dir = os.getcwd()
                
            # Validate the base directory
            if not os.path.isdir(base_dir):
                return {"status": "error", "message": f"Directory {base_dir} does not exist"}
                
            # Recursively scan the directory structure
            def scan_directory(directory):
                result = {
                    "type": "directory",
                    "name": os.path.basename(directory),
                    "children": []
                }
                
                try:
                    for item in os.listdir(directory):
                        # Skip hidden files and directories
                        if item.startswith('.'):
                            continue
                            
                        full_path = os.path.join(directory, item)
                        
                        if os.path.isdir(full_path):
                            result["children"].append(scan_directory(full_path))
                        else:
                            result["children"].append({
                                "type": "file",
                                "name": item,
                                "extension": os.path.splitext(item)[1][1:] if os.path.splitext(item)[1] else ""
                            })
                except PermissionError:
                    # Handle permission errors gracefully
                    pass
                    
                return result
                
            structure = scan_directory(base_dir)
            return {"status": "success", "structure": structure}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get file structure: {str(e)}")

# Create a singleton instance
builder_service = BuilderService()