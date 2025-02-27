import requests

JUDGE0_URL = "http://localhost:2358"

def submit_code(source_code: str, language_id: int, stdin: str = ""):
    """
    Sends the source code to Judge0 for execution and returns the result.
    """
    payload = {
        "language_id": language_id,
        "source_code": source_code,
        "stdin": stdin,
        "cpu_time_limit": 2,
        "memory_limit": 128000,
    }

    response = requests.post(f"{JUDGE0_URL}/submissions/?base64_encoded=false&wait=true", json=payload)

    if response.status_code != 201:
        return {"error": "Failed to submit code", "status_code": response.status_code}

    return response.json()
