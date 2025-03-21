from fastapi import APIRouter, Depends, HTTPException, Header, Request,Security
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import  auth
from ..services.firebase_auth import verify_role
from ..models.role_model import RoleUpdate
from ..firebase_client import db


auth_router = APIRouter()
security = HTTPBearer()
DEV_CODE = "DEV1234"

def get_current_user(cred: HTTPAuthorizationCredentials = Security(security)):
    """
    Extracts and verifies the Firebase ID token from the Authorization header.
    """
    token = cred.credentials  
    try:
        user_data = auth.verify_id_token(token)  
        return user_data  
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired. Please log in again.")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token. Please check your token.")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked. Please log in again.")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed.")

@auth_router.get("/protected")
async def protected_route(user=Depends(get_current_user),role:str=Depends(verify_role)):
    """
    A protected route that requires authentication.
    """
    if role == "pro":
        return {"message": "Welcome, Pro !","user":user}
    elif role == "dev":
        return {"message": "Hello, Dev user!","user":user}
    return {"message": "Welcome, Normal user!","user":user}



@auth_router.post("/update-role")
async def update_role(data: RoleUpdate, user=Depends(get_current_user)):
    try:
        if data.role not in ["dev", "pro", "normal"]:
            raise HTTPException(status_code=400,detail="invalid role")
       
        if data.role == "dev":
            if data.code != DEV_CODE:
                raise HTTPException(status_code=400, detail="Invalid dev code")
        uid=user.get("uid")
        user_ref = db.collection("users").document(uid)
        user_ref.update({"role": data.role})

        return JSONResponse(content={"message": f"Role updated to '{data.role}'"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update role: {str(e)}")
    
@auth_router.get("/get-role")
async def get_role(user=Depends(get_current_user)):
    try:
        uid=user.get("uid")
        user_ref=db.collection("users").document(uid)
        user_doc=user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found in Firestore")
        user_data=user_doc.to_dict()
        role=user_data.get("role")

        return JSONResponse(content={"messgae": f"Role of current user is {role}"},status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500,detail="Failed to get a role!")