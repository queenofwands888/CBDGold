from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from ..models.models import Product
from ..utils.logger import get_logger

logger = get_logger(__name__)

class ProductService:
    def __init__(self):
        self.products = self._initialize_products()

    def _initialize_products(self) -> List[Product]:
        """Initialize with mock CBD Gold products"""
        return [
            Product(
                id=1,
                name="Green Crack",
                strain="Sativa Dominant",
                type="Vape Cartridge",
                flavor="Sweet, Citrus, Earthy",
                effects="Energizing, Creative, Uplifting",
                price_algo=25.0,
                price_usdc=5.50,
                price_hemp=44000,
                hemp_earned=2200,
                potency="85% CBD, 0.3% THC",
                terpenes=["Myrcene", "Limonene", "Caryophyllene"],
                color="from-green-400 to-green-600",
                emoji="💚",
                description="Premium sativa-dominant CBD vape for daytime use",
                category="vape",
                in_stock=True
            ),
            Product(
                id=2,
                name="Purple Haze",
                strain="Indica Dominant",
                type="Vape Cartridge",
                flavor="Berry, Sweet, Floral",
                effects="Relaxing, Calming, Euphoric",
                price_algo=28.0,
                price_usdc=6.25,
                price_hemp=50000,
                hemp_earned=2500,
                potency="90% CBD, 0.2% THC",
                terpenes=["Linalool", "Myrcene", "Pinene"],
                color="from-purple-400 to-purple-600",
                emoji="💜",
                description="Relaxing indica-dominant CBD vape for evening use",
                category="vape",
                in_stock=True
            ),
            Product(
                id=3,
                name="Blue Dream",
                strain="Hybrid",
                type="Vape Cartridge",
                flavor="Blueberry, Sweet, Vanilla",
                effects="Balanced, Creative, Relaxed",
                price_algo=30.0,
                price_usdc=7.00,
                price_hemp=56000,
                hemp_earned=2800,
                potency="88% CBD, 0.25% THC",
                terpenes=["Myrcene", "Pinene", "Caryophyllene"],
                color="from-blue-400 to-blue-600",
                emoji="💙",
                description="Balanced hybrid CBD vape perfect for any time",
                category="vape",
                in_stock=True
            ),
            Product(
                id=4,
                name="OG Kush",
                strain="Hybrid",
                type="Vape Cartridge",
                flavor="Pine, Lemon, Earthy",
                effects="Euphoric, Happy, Relaxed",
                price_algo=32.0,
                price_usdc=7.50,
                price_hemp=60000,
                hemp_earned=3000,
                potency="92% CBD, 0.1% THC",
                terpenes=["Limonene", "Myrcene", "Caryophyllene"],
                color="from-orange-400 to-orange-600",
                emoji="🧡",
                description="Classic OG Kush CBD vape with premium quality",
                category="vape",
                in_stock=True
            ),
            Product(
                id=5,
                name="Sour Diesel",
                strain="Sativa Dominant",
                type="Vape Cartridge",
                flavor="Diesel, Citrus, Pungent",
                effects="Energizing, Focus, Creative",
                price_algo=27.0,
                price_usdc=6.00,
                price_hemp=48000,
                hemp_earned=2400,
                potency="87% CBD, 0.3% THC",
                terpenes=["Limonene", "Caryophyllene", "Myrcene"],
                color="from-yellow-400 to-yellow-600",
                emoji="💛",
                description="Energizing sativa CBD vape for productivity",
                category="vape",
                in_stock=True
            ),
            Product(
                id=6,
                name="Northern Lights",
                strain="Indica Dominant",
                type="Vape Cartridge",
                flavor="Sweet, Spicy, Earthy",
                effects="Deeply Relaxing, Sleepy, Peaceful",
                price_algo=29.0,
                price_usdc=6.75,
                price_hemp=54000,
                hemp_earned=2700,
                potency="89% CBD, 0.2% THC",
                terpenes=["Myrcene", "Caryophyllene", "Linalool"],
                color="from-indigo-400 to-indigo-600",
                emoji="💙",
                description="Premium indica CBD vape for deep relaxation",
                category="vape",
                in_stock=True
            )
        ]

    async def health_check(self) -> Dict[str, Any]:
        """Check product service health"""
        return {
            "status": "healthy",
            "products_loaded": len(self.products),
            "categories": list(set(p.category for p in self.products))
        }

    async def get_all_products(self) -> List[Product]:
        """Get all products"""
        return [p for p in self.products if p.in_stock]

    async def get_product_by_id(self, product_id: int) -> Optional[Product]:
        """Get a specific product by ID"""
        return next((p for p in self.products if p.id == product_id), None)

    async def get_products_by_category(self, category: str) -> List[Product]:
        """Get products by category"""
        return [p for p in self.products if p.category == category and p.in_stock]

    async def search_products(self, query: str) -> List[Product]:
        """Search products by name, strain, or effects"""
        query = query.lower()
        return [
            p for p in self.products
            if p.in_stock and (
                query in p.name.lower() or
                query in p.strain.lower() or
                query in p.effects.lower() or
                query in p.flavor.lower()
            )
        ]
