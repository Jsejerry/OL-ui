from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class Category(BaseModel):
    id: str
    name: str
    emoji: str
    color: str  # pastel token name


class Product(BaseModel):
    id: str
    name: str
    weight: str
    price: float
    mrp: float
    image: str
    category_id: str
    store_id: str
    delivery_min: int = 10
    discount_pct: Optional[int] = None
    rating: float = 4.5


class StoreMedia(BaseModel):
    type: str  # "video" | "image"
    url: str
    thumbnail: Optional[str] = None


class Store(BaseModel):
    id: str
    name: str
    logo: str
    tagline: str
    delivery_time: str
    rating: float
    tags: List[str]
    media: List[StoreMedia]


class Banner(BaseModel):
    id: str
    title: str
    subtitle: str
    image: str
    bg: str  # pastel token name


# ---------- Seed data ----------
CATEGORIES: List[Category] = [
    Category(id="c1", name="Fruits & Veggies", emoji="🥦", color="pastelGreen"),
    Category(id="c2", name="Dairy & Eggs", emoji="🥛", color="pastelYellow"),
    Category(id="c3", name="Snacks", emoji="🍿", color="pastelRed"),
    Category(id="c4", name="Cold Drinks", emoji="🥤", color="pastelBlue"),
    Category(id="c5", name="Bakery", emoji="🍞", color="pastelOrange"),
    Category(id="c6", name="Instant Food", emoji="🍜", color="pastelPurple"),
    Category(id="c7", name="Personal Care", emoji="🧴", color="pastelPink"),
    Category(id="c8", name="Home Needs", emoji="🧺", color="pastelMint"),
]

DISCOVER_CHIPS = [
    {"id": "d1", "label": "Trending", "emoji": "🔥", "color": "pastelRed"},
    {"id": "d2", "label": "New", "emoji": "✨", "color": "pastelYellow"},
    {"id": "d3", "label": "Fresh", "emoji": "🥬", "color": "pastelGreen"},
    {"id": "d4", "label": "Bestseller", "emoji": "⭐", "color": "pastelOrange"},
    {"id": "d5", "label": "Under ₹99", "emoji": "💸", "color": "pastelBlue"},
    {"id": "d6", "label": "Local", "emoji": "📍", "color": "pastelMint"},
    {"id": "d7", "label": "Organic", "emoji": "🌿", "color": "pastelPurple"},
    {"id": "d8", "label": "Combo", "emoji": "🎁", "color": "pastelPink"},
]

BANNERS: List[Banner] = [
    Banner(id="b1", title="10 min grocery", subtitle="Fresh at your door",
           image="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
           bg="pastelGreen"),
    Banner(id="b2", title="Snacks Sale", subtitle="Up to 40% off",
           image="https://images.unsplash.com/photo-1739065883242-92659253f7a6?w=800",
           bg="pastelYellow"),
    Banner(id="b3", title="Fresh Delivery", subtitle="Rider on the way",
           image="https://images.unsplash.com/photo-1733565823567-ca12618dec46?w=800",
           bg="pastelRed"),
]

STORES: List[Store] = [
    Store(
        id="s1",
        name="Latur Fresh Mart",
        logo="https://images.unsplash.com/photo-1580913428023-02c695666d61?w=400",
        tagline="Farm to home in 10 mins",
        delivery_time="10 min",
        rating=4.7,
        tags=["Grocery", "Fresh", "Organic"],
        media=[
            StoreMedia(type="video",
                       url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                       thumbnail="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"),
            StoreMedia(type="video",
                       url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                       thumbnail="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600"),
            StoreMedia(type="image",
                       url="https://images.unsplash.com/photo-1543168256-418811576931?w=800"),
            StoreMedia(type="image",
                       url="https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=800"),
        ],
    ),
    Store(
        id="s2",
        name="Green Basket",
        logo="https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=400",
        tagline="Handpicked veggies daily",
        delivery_time="12 min",
        rating=4.6,
        tags=["Vegetables", "Fruits"],
        media=[
            StoreMedia(type="video",
                       url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                       thumbnail="https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=600"),
            StoreMedia(type="video",
                       url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                       thumbnail="https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600"),
            StoreMedia(type="image",
                       url="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800"),
            StoreMedia(type="image",
                       url="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800"),
        ],
    ),
    Store(
        id="s3",
        name="Snack Junction",
        logo="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400",
        tagline="Chips, biscuits & more",
        delivery_time="15 min",
        rating=4.5,
        tags=["Snacks", "Chocolates"],
        media=[
            StoreMedia(type="video",
                       url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                       thumbnail="https://images.unsplash.com/photo-1739065883242-92659253f7a6?w=600"),
            StoreMedia(type="video",
                       url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                       thumbnail="https://images.unsplash.com/photo-1600359746654-780cf3d2c73a?w=600"),
            StoreMedia(type="image",
                       url="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800"),
            StoreMedia(type="image",
                       url="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800"),
        ],
    ),
]

PRODUCTS: List[Product] = [
    Product(id="p1", name="Fresh Tomatoes", weight="500 g", price=25, mrp=40,
            image="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
            category_id="c1", store_id="s1", discount_pct=37),
    Product(id="p2", name="Onions", weight="1 kg", price=32, mrp=45,
            image="https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400",
            category_id="c1", store_id="s2", discount_pct=28),
    Product(id="p3", name="Bananas", weight="1 dozen", price=48, mrp=60,
            image="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
            category_id="c1", store_id="s2", discount_pct=20),
    Product(id="p4", name="Amul Milk", weight="500 ml", price=28, mrp=30,
            image="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
            category_id="c2", store_id="s1"),
    Product(id="p5", name="Farm Eggs", weight="6 pcs", price=55, mrp=72,
            image="https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400",
            category_id="c2", store_id="s1", discount_pct=23),
    Product(id="p6", name="Lays Classic", weight="52 g", price=20, mrp=20,
            image="https://images.unsplash.com/photo-1621447504864-d8686f215021?w=400",
            category_id="c3", store_id="s3"),
    Product(id="p7", name="Kurkure Masala", weight="80 g", price=20, mrp=20,
            image="https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
            category_id="c3", store_id="s3"),
    Product(id="p8", name="Coca Cola", weight="750 ml", price=40, mrp=45,
            image="https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
            category_id="c4", store_id="s3", discount_pct=11),
    Product(id="p9", name="Sprite", weight="750 ml", price=40, mrp=45,
            image="https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400",
            category_id="c4", store_id="s3"),
    Product(id="p10", name="Brown Bread", weight="400 g", price=45, mrp=50,
            image="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
            category_id="c5", store_id="s1"),
    Product(id="p11", name="Maggi Noodles", weight="4 pack", price=56, mrp=60,
            image="https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400",
            category_id="c6", store_id="s1"),
    Product(id="p12", name="Dettol Handwash", weight="200 ml", price=99, mrp=125,
            image="https://images.unsplash.com/photo-1585237017125-24baf8d7406f?w=400",
            category_id="c7", store_id="s1", discount_pct=20),
    Product(id="p13", name="Apples", weight="1 kg", price=180, mrp=220,
            image="https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400",
            category_id="c1", store_id="s2", discount_pct=18),
    Product(id="p14", name="Paneer", weight="200 g", price=95, mrp=110,
            image="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
            category_id="c2", store_id="s1", discount_pct=13),
    Product(id="p15", name="Dark Chocolate", weight="80 g", price=180, mrp=220,
            image="https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400",
            category_id="c3", store_id="s3", discount_pct=18),
    Product(id="p16", name="Butter", weight="100 g", price=52, mrp=58,
            image="https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400",
            category_id="c2", store_id="s1"),
]


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "One Latur API"}


@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    return CATEGORIES


@api_router.get("/discover")
async def get_discover_chips():
    return DISCOVER_CHIPS


@api_router.get("/banners", response_model=List[Banner])
async def get_banners():
    return BANNERS


@api_router.get("/stores", response_model=List[Store])
async def get_stores():
    return STORES


@api_router.get("/stores/{store_id}", response_model=Store)
async def get_store(store_id: str):
    for s in STORES:
        if s.id == store_id:
            return s
    raise HTTPException(status_code=404, detail="Store not found")


@api_router.get("/stores/{store_id}/products", response_model=List[Product])
async def get_store_products(store_id: str):
    return [p for p in PRODUCTS if p.store_id == store_id]


@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = None, chip: Optional[str] = None):
    items = PRODUCTS
    if category_id:
        items = [p for p in items if p.category_id == category_id]
    return items


@api_router.get("/products/buy-again", response_model=List[Product])
async def buy_again():
    # simulated repeat purchases
    ids = {"p4", "p6", "p8", "p11", "p16"}
    return [p for p in PRODUCTS if p.id in ids]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    for p in PRODUCTS:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


# ---------- App wiring ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
