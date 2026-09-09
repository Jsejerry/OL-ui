"""Explicit sample catalogue for One Latur's five departments."""
def image(key):
    return f'/api/media/{key}'


BRANDS = [
    {'id': 'mcdonalds', 'name': "McDonald's", 'department': 'food', 'logo': image('mcdonalds'), 'image': image('burger'), 'tagline': 'A little bite of happiness'},
    {'id': 'kfc', 'name': 'KFC', 'department': 'food', 'logo': image('kfc'), 'image': image('chicken'), 'tagline': 'Crispy. Juicy. Irresistible.'},
    {'id': 'starbucks', 'name': 'Starbucks', 'department': 'food', 'logo': image('starbucks'), 'image': image('coffee'), 'tagline': 'Your daily coffee ritual'},
    {'id': 'burgerking', 'name': 'Burger King', 'department': 'food', 'logo': image('burgerking'), 'image': image('burger'), 'tagline': 'Big on flavour'},
    {'id': 'dominos', 'name': "Domino's", 'department': 'food', 'logo': image('dominos'), 'image': image('pizza'), 'tagline': 'Good times, great pizza'},
    {'id': 'himalaya', 'name': 'Himalaya', 'department': 'pharmacy', 'logo': '', 'image': image('wellness'), 'tagline': 'Everyday wellness essentials'},
    {'id': 'dettol', 'name': 'Dettol', 'department': 'pharmacy', 'logo': '', 'image': image('skincare'), 'tagline': 'Care for the whole family'},
    {'id': 'volini', 'name': 'Volini', 'department': 'pharmacy', 'logo': '', 'image': image('wellness'), 'tagline': 'Your everyday care cabinet'},
    {'id': 'nivea', 'name': 'NIVEA', 'department': 'beauty', 'logo': '', 'image': image('skincare'), 'tagline': 'A little care goes a long way'},
    {'id': 'lakme', 'name': 'Lakmé', 'department': 'beauty', 'logo': '', 'image': image('beauty'), 'tagline': 'Find your everyday glow'},
    {'id': 'loreal', 'name': "L’Oréal", 'department': 'beauty', 'logo': '', 'image': image('beauty'), 'tagline': 'Because you are worth it'},
    {'id': 'maybelline', 'name': 'Maybelline', 'department': 'beauty', 'logo': '', 'image': image('beauty'), 'tagline': 'Make it your own'},
]


def product(pid, name, weight, price, mrp, asset, department, brand, category):
    return {'id': pid, 'name': name, 'weight': weight, 'price': price, 'mrp': mrp, 'image': image(asset), 'department': department, 'brand_id': brand, 'store_id': brand, 'category_id': category, 'delivery_min': 25 if department == 'food' else 15, 'rating': 4.6, 'discount_pct': round((mrp-price)/mrp*100) if mrp > price else None}


EXTRA_PRODUCTS = [
    product('f1', 'Classic Cheeseburger', 'McDonald’s · 1 burger', 129, 159, 'burger', 'food', 'mcdonalds', 'c9'),
    product('f2', 'Crispy Chicken Bucket', 'KFC · 6 pieces', 399, 499, 'chicken', 'food', 'kfc', 'c10'),
    product('f3', 'Iced Caramel Latte', 'Starbucks · 350 ml', 249, 295, 'coffee', 'food', 'starbucks', 'c11'),
    product('f4', 'Whopper Meal', 'Burger King · burger + fries', 199, 259, 'burger', 'food', 'burgerking', 'c9'),
    product('f5', 'Farmhouse Pizza', 'Domino’s · regular', 249, 329, 'pizza', 'food', 'dominos', 'c12'),
    product('f6', 'Loaded Cheese Fries', 'McDonald’s · 1 portion', 119, 149, 'fries', 'food', 'mcdonalds', 'c10'),
    product('h1', 'Himalaya Wellness Tablets', '60 tablets · sample listing', 180, 220, 'wellness', 'pharmacy', 'himalaya', 'c13'),
    product('h2', 'Dettol Hand Sanitizer', '200 ml', 95, 120, 'skincare', 'pharmacy', 'dettol', 'c14'),
    product('h3', 'Volini Relief Gel', '30 g · sample listing', 115, 145, 'wellness', 'pharmacy', 'volini', 'c13'),
    product('b1', 'NIVEA Soft Moisturiser', '100 ml', 189, 249, 'skincare', 'beauty', 'nivea', 'c15'),
    product('b2', 'Lakmé Matte Lipstick', 'Rose crush · 3.6 g', 299, 399, 'beauty', 'beauty', 'lakme', 'c16'),
    product('b3', 'L’Oréal Hyaluron Shampoo', '180 ml', 199, 259, 'skincare', 'beauty', 'loreal', 'c17'),
    product('b4', 'Maybelline Fit Me', 'Natural buff · 30 ml', 449, 599, 'beauty', 'beauty', 'maybelline', 'c16'),
    product('g1', 'Italian Spaghetti', '500 g', 99, 130, 'pasta', 'grocery', 's1', 'c6'),
]

EXTRA_CATEGORIES = [
    ('c9', 'Burgers', 'food', 'burger'), ('c10', 'Chicken & Sides', 'food', 'chicken'),
    ('c11', 'Coffee & Drinks', 'food', 'coffee'), ('c12', 'Pizza', 'food', 'pizza'),
    ('c13', 'Wellness', 'pharmacy', 'wellness'), ('c14', 'Hygiene', 'pharmacy', 'skincare'),
    ('c15', 'Skincare', 'beauty', 'skincare'), ('c16', 'Makeup', 'beauty', 'beauty'), ('c17', 'Haircare', 'beauty', 'skincare'),
]

EVENTS = [
    {'id': 'e1', 'title': 'The Last Orbit', 'kind': 'movies', 'subtitle': 'Sci-fi adventure · Hindi · 2h 15m', 'venue': 'Sample cinema, Latur', 'price': 180, 'image': image('cinema'), 'tag': 'ON THE BIG SCREEN', 'slots': ['11:00 AM', '2:30 PM', '7:00 PM']},
    {'id': 'e2', 'title': 'A Little More Love', 'kind': 'movies', 'subtitle': 'Romance · Marathi · 2h 05m', 'venue': 'Sample cinema, Latur', 'price': 150, 'image': image('cinema'), 'tag': 'A STORY TO FALL FOR', 'slots': ['12:30 PM', '4:00 PM', '8:30 PM']},
    {'id': 'e3', 'title': 'Latur After Hours', 'kind': 'events', 'subtitle': 'Live music · Acoustic evening', 'venue': 'Sample open-air venue, Latur', 'price': 499, 'image': image('concert'), 'tag': 'FEEL IT LIVE', 'slots': ['6:00 PM', '8:00 PM']},
    {'id': 'e4', 'title': 'Weekend Trail Club', 'kind': 'activities', 'subtitle': 'Outdoor adventure · Guided walk', 'venue': 'Sample trail, Latur outskirts', 'price': 299, 'image': image('adventure'), 'tag': 'MAKE A DAY OF IT', 'slots': ['6:30 AM', '8:00 AM']},
]

REELS = [
    {'id': 'r1', 'product_id': 'f1', 'video': image('reel-burger'), 'caption': 'That first bite feeling. Your next craving is one tap away.', 'creator': 'The food edit', 'likes': 128, 'tag': 'FOOD FINDS'},
    {'id': 'r2', 'product_id': 'p1', 'video': image('reel-tomato'), 'caption': 'A little freshness for your everyday. From basket to kitchen.', 'creator': 'Fresh from Latur', 'likes': 86, 'tag': 'FRESH PICKS'},
    {'id': 'r3', 'product_id': 'g1', 'video': image('reel-pasta'), 'caption': 'Tonight’s dinner, sorted. Make something delicious.', 'creator': 'The pantry edit', 'likes': 204, 'tag': 'KITCHEN STORIES'},
]