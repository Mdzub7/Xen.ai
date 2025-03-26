import os
import logging
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Detect environment (Docker or Local)
is_docker = os.getenv("DOCKER_ENV") == "1"

# Possible Firebase credential file locations
FIREBASE_JSON_LOCATIONS = [
    "/app/firebase.json",  # Docker default path
    os.path.join(os.getcwd(), "firebase.json"),  # Current working directory
    os.path.join(os.path.dirname(__file__), "firebase.json"),  # Script directory
    os.path.expanduser("~/firebase.json"),  # User home directory
    os.getenv("FIREBASE_CREDENTIALS")  # Environment variable path
]

def find_firebase_credentials():
    """
    Find Firebase credentials JSON file by checking multiple potential locations.
    
    Returns:
        str: Path to the Firebase credentials file, or None if not found
    """
    for path in filter(None, FIREBASE_JSON_LOCATIONS):
        try:
            # Expand any user path and convert to absolute path
            full_path = os.path.abspath(os.path.expanduser(path))
            
            # Check if file exists
            if os.path.exists(full_path):
                logger.info(f"Found Firebase credentials at: {full_path}")
                return full_path
        except Exception as e:
            logger.debug(f"Error checking path {path}: {e}")
    
    return None

# Find Firebase credentials
firebase_json = find_firebase_credentials()

# Verify the JSON file exists
if not firebase_json:
    logger.error("Firebase JSON credentials not found")
    logger.info("Searched locations:")
    for loc in filter(None, FIREBASE_JSON_LOCATIONS):
        logger.info(f"- {loc}")
    raise FileNotFoundError("Could not locate Firebase JSON credentials")

# Initialize Firebase
try:
    cred = credentials.Certificate(firebase_json)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Firebase: {e}")
    raise