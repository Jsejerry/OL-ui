"""User-approved sample brand expansions for OneCity."""
from catalog_data import image, product

CITY_BRANDS = [
    {'id': 'amul', 'name': 'Amul', 'department': 'grocery', 'logo': image('amul-logo'), 'image': image('amul-cheese'), 'tagline': 'A little goodness in every day'},
    {'id': 'nike', 'name': 'Nike', 'department': 'shops', 'logo': image('nike-logo'), 'image': image('sneakers'), 'tagline': 'Find your next everyday favourite'},
    {'id': 'boat', 'name': 'boAt', 'department': 'shops', 'logo': image('boat-logo'), 'image': image('headphones'), 'tagline': 'Turn the everyday up'},
    {'id': 'home-edit', 'name': 'The Home Edit', 'department': 'shops', 'logo': '', 'image': image('lamp'), 'tagline': 'Little things. Lovely spaces.'},
]
CITY_PRODUCTS = [
    product('a1', 'Amul Pure Milk Cheese', '1 kg · sample pack', 550, 580, 'amul-cheese', 'grocery', 'amul', 'c2'),
    product('a2', 'Amul Pasteurised Butter', '100 g · illustrative pack', 60, 65, 'amul-butter-pack', 'grocery', 'amul', 'c2'),
    product('a3', 'Amul Taaza Milk', '1 litre', 72, 78, 'amul-milk', 'grocery', 'amul', 'c2'),
    product('a4', 'Amul Cheese Cubes', '200 g · 8 cubes', 145, 160, 'amul-cream', 'grocery', 'amul', 'c2'),
    product('sneak1', 'Nike Everyday Sneakers', 'Red · sample size UK 8', 3499, 4499, 'sneakers', 'shops', 'nike', 'c18'),
    product('sneak2', 'Nike Essential Tee', 'Cotton · sample size M', 899, 1299, 'tshirt', 'shops', 'nike', 'c18'),
    product('audio1', 'boAt Wireless Headphones', 'Over-ear · sample model', 1499, 2499, 'headphones', 'shops', 'boat', 'c19'),
    product('home1', 'The Home Edit Table Lamp', 'Warm white · 1 piece', 1199, 1599, 'lamp', 'shops', 'home-edit', 'c20'),
]
CITY_CATEGORIES = [('c18', 'Fashion', 'shops', 'sneakers'), ('c19', 'Electronics', 'shops', 'headphones'), ('c20', 'Homeware', 'shops', 'lamp')]
CITY_REELS = [
    {'id': 'r-amul', 'product_id': 'a1', 'video': image('reel-amul-v2'), 'caption': 'A little slice of happiness. Make every bite a little more Amul.', 'creator': 'Amul', 'likes': 243, 'tag': 'THE DAILY GOODNESS EDIT', 'brand_id': 'amul'},
    {'id': 'r1', 'product_id': 'f1', 'video': image('reel-burger'), 'caption': 'Big cravings, golden moments. Explore the McDonald’s collection.', 'creator': 'McDonald’s', 'likes': 128, 'tag': 'YOUR NEXT CRAVING', 'brand_id': 'mcdonalds'},
    {'id': 'r-beauty', 'product_id': 'b1', 'video': image('reel-nivea'), 'caption': 'A little care, a little glow. Discover your NIVEA essentials.', 'creator': 'NIVEA', 'likes': 186, 'tag': 'THE CARE EDIT', 'brand_id': 'nivea'},
]