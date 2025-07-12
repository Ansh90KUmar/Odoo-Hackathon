from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
import aiofiles
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Create the main app
app = FastAPI()

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Secret
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
security = HTTPBearer()

# Enums
class ItemCategory(str, Enum):
    tops = "tops"
    bottoms = "bottoms"
    dresses = "dresses"
    outerwear = "outerwear"
    shoes = "shoes"
    accessories = "accessories"

class ItemCondition(str, Enum):
    excellent = "excellent"
    good = "good"
    fair = "fair"
    poor = "poor"

class SwapStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    completed = "completed"
    cancelled = "cancelled"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    password_hash: str
    points: int = Field(default=100)  # Starting points
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_admin: bool = Field(default=False)

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    points: int
    created_at: datetime

class Item(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: ItemCategory
    size: str
    condition: ItemCondition
    tags: List[str] = []
    images: List[str] = []
    owner_id: str
    price_points: int = Field(default=50)  # Points required to redeem
    available: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_approved: bool = Field(default=True)  # Auto-approve for now

class ItemCreate(BaseModel):
    title: str
    description: str
    category: ItemCategory
    size: str
    condition: ItemCondition
    tags: List[str] = []
    price_points: int = Field(default=50)

class SwapRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requester_id: str
    item_id: str
    owner_id: str
    offered_item_id: Optional[str] = None  # None for points redemption
    is_points_request: bool = Field(default=False)
    status: SwapStatus = Field(default=SwapStatus.pending)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    message: Optional[str] = None

class SwapRequestCreate(BaseModel):
    item_id: str
    offered_item_id: Optional[str] = None
    is_points_request: bool = Field(default=False)
    message: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password
    )
    
    await db.users.insert_one(user.dict())
    token = create_jwt_token(user.id)
    
    return {
        "token": token,
        "user": UserProfile(**user.dict())
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["id"])
    return {
        "token": token,
        "user": UserProfile(**user)
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserProfile(**current_user)

# Item endpoints
@api_router.get("/items")
async def get_items(skip: int = 0, limit: int = 20):
    items = await db.items.find({"available": True, "is_approved": True}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    # Get owner info for each item
    for item in items:
        owner = await db.users.find_one({"id": item["owner_id"]}, {"_id": 0})
        item["owner_username"] = owner["username"] if owner else "Unknown"
    
    return items

@api_router.get("/items/{item_id}")
async def get_item(item_id: str):
    item = await db.items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Get owner info
    owner = await db.users.find_one({"id": item["owner_id"]}, {"_id": 0})
    item["owner_username"] = owner["username"] if owner else "Unknown"
    
    return item

@api_router.post("/items")
async def create_item(
    item_data: ItemCreate,
    current_user: dict = Depends(get_current_user)
):
    item = Item(
        **item_data.dict(),
        owner_id=current_user["id"]
    )
    
    await db.items.insert_one(item.dict())
    return item

@api_router.post("/items/{item_id}/upload-image")
async def upload_item_image(
    item_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Check if item exists and user owns it
    item = await db.items.find_one({"id": item_id, "owner_id": current_user["id"]})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or not owned by user")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save file
    file_extension = file.filename.split(".")[-1]
    filename = f"{item_id}_{uuid.uuid4()}.{file_extension}"
    file_path = uploads_dir / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Update item with image URL
    image_url = f"/uploads/{filename}"
    await db.items.update_one(
        {"id": item_id},
        {"$push": {"images": image_url}}
    )
    
    return {"image_url": image_url}

@api_router.get("/items/user/{user_id}")
async def get_user_items(user_id: str):
    items = await db.items.find({"owner_id": user_id}, {"_id": 0}).to_list(100)
    return items

@api_router.get("/my-items")
async def get_my_items(current_user: dict = Depends(get_current_user)):
    items = await db.items.find({"owner_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return items

# Swap endpoints
@api_router.post("/swaps")
async def create_swap_request(
    swap_data: SwapRequestCreate,
    current_user: dict = Depends(get_current_user)
):
    # Get the item
    item = await db.items.find_one({"id": swap_data.item_id})
    if not item or not item["available"]:
        raise HTTPException(status_code=404, detail="Item not available")
    
    if item["owner_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot request your own item")
    
    # If points request, check if user has enough points
    if swap_data.is_points_request:
        if current_user["points"] < item["price_points"]:
            raise HTTPException(status_code=400, detail="Insufficient points")
    
    # If item swap, verify offered item exists and is owned by requester
    if swap_data.offered_item_id:
        offered_item = await db.items.find_one({
            "id": swap_data.offered_item_id,
            "owner_id": current_user["id"],
            "available": True
        })
        if not offered_item:
            raise HTTPException(status_code=404, detail="Offered item not found or not available")
    
    swap_request = SwapRequest(
        **swap_data.dict(),
        requester_id=current_user["id"],
        owner_id=item["owner_id"]
    )
    
    await db.swap_requests.insert_one(swap_request.dict())
    return swap_request

@api_router.get("/swaps/received")
async def get_received_swaps(current_user: dict = Depends(get_current_user)):
    swaps = await db.swap_requests.find({"owner_id": current_user["id"]}, {"_id": 0}).to_list(100)
    
    # Enrich with item and requester info
    for swap in swaps:
        item = await db.items.find_one({"id": swap["item_id"]}, {"_id": 0})
        requester = await db.users.find_one({"id": swap["requester_id"]}, {"_id": 0})
        
        swap["item_title"] = item["title"] if item else "Unknown"
        swap["requester_username"] = requester["username"] if requester else "Unknown"
        
        if swap["offered_item_id"]:
            offered_item = await db.items.find_one({"id": swap["offered_item_id"]}, {"_id": 0})
            swap["offered_item_title"] = offered_item["title"] if offered_item else "Unknown"
    
    return swaps

@api_router.get("/swaps/sent")
async def get_sent_swaps(current_user: dict = Depends(get_current_user)):
    swaps = await db.swap_requests.find({"requester_id": current_user["id"]}, {"_id": 0}).to_list(100)
    
    # Enrich with item and owner info
    for swap in swaps:
        item = await db.items.find_one({"id": swap["item_id"]}, {"_id": 0})
        owner = await db.users.find_one({"id": swap["owner_id"]}, {"_id": 0})
        
        swap["item_title"] = item["title"] if item else "Unknown"
        swap["owner_username"] = owner["username"] if owner else "Unknown"
    
    return swaps

@api_router.put("/swaps/{swap_id}/accept")
async def accept_swap(swap_id: str, current_user: dict = Depends(get_current_user)):
    swap = await db.swap_requests.find_one({"id": swap_id, "owner_id": current_user["id"]})
    if not swap:
        raise HTTPException(status_code=404, detail="Swap request not found")
    
    if swap["status"] != "pending":
        raise HTTPException(status_code=400, detail="Swap request is not pending")
    
    # Update swap status
    await db.swap_requests.update_one(
        {"id": swap_id},
        {"$set": {"status": "accepted"}}
    )
    
    # Handle points or item exchange
    if swap["is_points_request"]:
        # Deduct points from requester and add to owner
        item = await db.items.find_one({"id": swap["item_id"]})
        points_to_transfer = item["price_points"]
        
        await db.users.update_one(
            {"id": swap["requester_id"]},
            {"$inc": {"points": -points_to_transfer}}
        )
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"points": points_to_transfer}}
        )
    
    # Mark item as unavailable
    await db.items.update_one(
        {"id": swap["item_id"]},
        {"$set": {"available": False}}
    )
    
    # If item swap, mark offered item as unavailable too
    if swap["offered_item_id"]:
        await db.items.update_one(
            {"id": swap["offered_item_id"]},
            {"$set": {"available": False}}
        )
    
    return {"message": "Swap accepted successfully"}

@api_router.put("/swaps/{swap_id}/reject")
async def reject_swap(swap_id: str, current_user: dict = Depends(get_current_user)):
    swap = await db.swap_requests.find_one({"id": swap_id, "owner_id": current_user["id"]})
    if not swap:
        raise HTTPException(status_code=404, detail="Swap request not found")
    
    await db.swap_requests.update_one(
        {"id": swap_id},
        {"$set": {"status": "cancelled"}}
    )
    
    return {"message": "Swap rejected"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()