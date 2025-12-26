from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import time

app = FastAPI(title="FastAPI POC")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

JWT_SECRET = "test-secret"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

users_db = []
user_id_counter = 1

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user(credentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = next((u for u in users_db if u["id"] == user_id), None)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def home():
    return {
        "message": "FastAPI POC",
        "timestamp": int(time.time() * 1000),
        "version": "1.0.0"
    }

@app.post("/register")
def register(user_data: UserCreate):
    global user_id_counter
    
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password too short")
    
    if any(u["email"] == user_data.email for u in users_db):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    password_hash = hash_password(user_data.password)
    
    new_user = {
        "id": user_id_counter,
        "email": user_data.email,
        "username": user_data.username,
        "password_hash": password_hash,
        "created_at": datetime.now().isoformat()
    }
    
    users_db.append(new_user)
    user_id_counter += 1
    
    access_token = create_access_token(data={"user_id": new_user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "username": new_user["username"]
        }
    }

@app.post("/login")
def login(login_data: UserLogin):
    user = next((u for u in users_db if u["email"] == login_data.email), None)
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"user_id": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"]
        }
    }

@app.get("/profile")
def get_profile(current_user = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "username": current_user["username"],
        "created_at": current_user["created_at"]
    }

@app.get("/about.json")
def about():
    return {
        "client": {"host": "127.0.0.1"},
        "server": {
            "current_time": int(time.time()),
            "services": [
                {
                    "name": "gmail",
                    "actions": [{"name": "new_email", "description": "New email received"}],
                    "reactions": [{"name": "send_email", "description": "Send an email"}]
                }
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🐍 FastAPI server starting on http://localhost:8081")
    uvicorn.run("main:app", host="0.0.0.0", port=8081, reload=False)
