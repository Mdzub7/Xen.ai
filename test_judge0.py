import requests
import json

def test_judge0():
    url = "http://localhost:2358/submissions"
    payload = {
        "source_code": "print('Hello!')",
        "language_id": 71,  # Python 3.8.1
        "stdin": ""
    }
    
    response = requests.post(
        f"{url}?base64_encoded=false&wait=true",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    print("Response:")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_judge0() 