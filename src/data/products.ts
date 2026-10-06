import type { Product } from '@/types';
import { unsplash } from './images';
import { sellers } from './sellers';
import { makeRng } from '@/utils/random';
import { slugify } from '@/utils/format';

type Tag = Product['tags'][number];
// [title, brand, category, subcategory, price, originalPrice, sellerSlug, icon, unsplashId, tags, variants?]
type Row = [string, string, string, string, number, number, string, string, string, Tag[], Partial<Pick<Product, 'colors' | 'sizes' | 'storage'>>?];

const rows: Row[] = [
  // ---------- Electronics ----------
  ['Wireless Earbuds Pro X', 'SoundCore', 'electronics', 'Audio', 4999, 7999, 'techzone', 'Headphones', '1590658268037-6bf12165a8df', ['flash', 'bestseller', 'trending'], { colors: ['Midnight Black', 'Pearl White', 'Ocean Blue'] }],
  ['Smart Watch Series 8', 'Zentra', 'electronics', 'Wearables', 12999, 18999, 'techzone', 'Watch', '1546868871-7041f2a55e12', ['flash', 'trending', 'top'], { colors: ['Graphite', 'Silver', 'Rose Gold'], sizes: ['41mm', '45mm'] }],
  ['Bluetooth Speaker Max', 'BoomBox', 'electronics', 'Audio', 6499, 8999, 'techzone', 'Speaker', '1608043152269-423dbba4e7e1', ['trending', 'bestseller'], { colors: ['Black', 'Teal', 'Red'] }],
  ['65W GaN Fast Charger', 'VoltEdge', 'electronics', 'Chargers & Power', 2499, 3999, 'smart-gadgets-hub', 'Zap', '1583863788434-e58a36330cf0', ['flash', 'bestseller']],
  ['Mechanical Gaming Keyboard RGB', 'KeyForge', 'electronics', 'Gaming', 8999, 12499, 'smart-gadgets-hub', 'Keyboard', '1587829741301-dc798b83add3', ['trending'], { colors: ['Red Switch', 'Blue Switch', 'Brown Switch'] }],
  ['Wireless Silent Mouse', 'Logix', 'electronics', 'Accessories', 1499, 2299, 'smart-gadgets-hub', 'Mouse', '1527864550417-7fd91fc51a46', ['bestseller'], { colors: ['Black', 'Grey', 'Pink'] }],
  ['Power Bank 20,000mAh PD', 'VoltEdge', 'electronics', 'Chargers & Power', 3999, 5999, 'techzone', 'BatteryCharging', '1609091839311-d5365f9ff1c5', ['flash', 'bestseller', 'top']],
  ['55" 4K UHD Smart TV', 'Orion', 'electronics', 'TV & Video', 89999, 119999, 'prime-electronics', 'Tv', '1593359677879-a4bb92f829d1', ['trending', 'top']],
  ['Noise Cancelling Headphones ANC 700', 'SoundCore', 'electronics', 'Audio', 14999, 21999, 'techzone', 'Headphones', '1505740420928-5e560c06d30e', ['top', 'trending'], { colors: ['Black', 'Sand'] }],
  ['Action Camera 4K Waterproof', 'GoView', 'electronics', 'Cameras', 18999, 24999, 'smart-gadgets-hub', 'Camera', '1526170375885-4d8ecf77b99f', ['new']],
  ['Wireless Gaming Controller', 'PlayCore', 'electronics', 'Gaming', 5499, 6999, 'techzone', 'Gamepad2', '1592840496694-26d035b52b48', ['new']],
  ['Smart Fitness Band 6', 'Zentra', 'electronics', 'Wearables', 3499, 4999, 'smart-gadgets-hub', 'Activity', '1575311373937-040b8e1fd5b6', ['flash', 'bestseller']],
  // ---------- Mobiles & Tablets ----------
  ['B-Bazar Smartphone X1 (8/256GB)', 'B-Bazar', 'mobiles-tablets', 'Smartphones', 49999, 59999, 'bbazar-official', 'Smartphone', '1511707171634-5f897ff02aa9', ['new', 'trending', 'top'], { colors: ['Cosmic Indigo', 'Glacier White'], storage: ['128GB', '256GB'] }],
  ['Samsung Galaxy A55 5G', 'Samsung', 'mobiles-tablets', 'Smartphones', 104999, 114999, 'mobile-mart', 'Smartphone', '1610945265064-0e34e5519bbf', ['bestseller', 'top'], { colors: ['Awesome Navy', 'Awesome Lilac'], storage: ['128GB', '256GB'] }],
  ['Xiaomi Redmi Note 13', 'Xiaomi', 'mobiles-tablets', 'Smartphones', 54999, 62999, 'mobile-mart', 'Smartphone', '1598327105666-5b89351aff97', ['bestseller', 'trending'], { colors: ['Midnight Black', 'Ice Blue'], storage: ['128GB', '256GB'] }],
  ['Oppo Reno 11 F', 'Oppo', 'mobiles-tablets', 'Smartphones', 79999, 89999, 'mobile-mart', 'Smartphone', '1574944985070-8f3ebc6b79d2', ['new'], { colors: ['Palm Green', 'Ocean Blue'] }],
  ['Realme C67', 'Realme', 'mobiles-tablets', 'Smartphones', 39999, 44999, 'bbazar-official', 'Smartphone', '1567581935884-3349723552ca', ['flash'], { colors: ['Sunny Oasis', 'Black Rock'] }],
  ['B-Bazar Tab S 11" Wi-Fi', 'B-Bazar', 'mobiles-tablets', 'Tablets', 44999, 54999, 'bbazar-official', 'Tablet', '1544244015-0df4b3ffc6b0', ['new'], { storage: ['64GB', '128GB'] }],
  ['Shockproof Clear Phone Case', 'ArmorShell', 'mobiles-tablets', 'Cases & Covers', 499, 999, 'mobile-mart', 'Smartphone', '1601784551446-20c9e07cdbdb', ['flash', 'bestseller']],
  ['Tempered Glass Screen Protector (2-Pack)', 'ArmorShell', 'mobiles-tablets', 'Screen Protectors', 599, 999, 'mobile-mart', 'ShieldCheck', '1592899677977-9c10ca588bbd', ['bestseller']],
  // ---------- Computers ----------
  ['Ultrabook 14" Core i5 16GB/512GB', 'Nimbus', 'computers-laptops', 'Laptops', 189999, 214999, 'laptop-lounge', 'Laptop', '1496181133206-80ce9b88a853', ['top', 'trending'], { storage: ['512GB', '1TB'] }],
  ['Gaming Laptop RTX 4060 15.6"', 'Raptor', 'computers-laptops', 'Laptops', 329999, 369999, 'laptop-lounge', 'Laptop', '1603302576837-37561b2e2302', ['new']],
  ['27" IPS QHD Monitor 165Hz', 'ViewMax', 'computers-laptops', 'Monitors', 64999, 79999, 'laptop-lounge', 'Monitor', '1527443224154-c4a3942d3acf', ['trending']],
  ['1TB Portable SSD USB-C', 'DataVault', 'computers-laptops', 'Storage', 21999, 27999, 'laptop-lounge', 'HardDrive', '1597872200969-2b65d56bd16b', ['bestseller']],
  ['Dual-Band Wi-Fi 6 Router', 'NetLink', 'computers-laptops', 'Networking', 11999, 15999, 'smart-gadgets-hub', 'Router', '1606904825846-647eb07f5be2', ['flash']],
  ['Wireless Keyboard & Mouse Combo', 'Logix', 'computers-laptops', 'Keyboards & Mice', 4499, 5999, 'laptop-lounge', 'Keyboard', '1587829741301-dc798b83add3', []],
  // ---------- Fashion ----------
  ["Men's Premium Cotton Shirt", 'Urban Cart', 'fashion', 'Men', 2499, 3999, 'urban-cart', 'Shirt', '1596755094514-f87e34085b2c', ['flash', 'bestseller'], { colors: ['White', 'Sky Blue', 'Olive'], sizes: ['S', 'M', 'L', 'XL'] }],
  ["Women's Embroidered Lawn Suit 3-Pc", 'Style Avenue', 'fashion', 'Women', 6999, 9999, 'style-avenue', 'Shirt', '1583391733956-6c78276477e2', ['trending', 'bestseller', 'top'], { colors: ['Mint', 'Peach', 'Lilac'], sizes: ['S', 'M', 'L'] }],
  ["Men's Casual Sneakers", 'StrideOn', 'fashion', 'Shoes', 4999, 7499, 'urban-cart', 'Footprints', '1542291026-7eec264c27ff', ['flash', 'trending'], { colors: ['Red', 'White', 'Black'], sizes: ['40', '41', '42', '43', '44'] }],
  ["Women's Leather Handbag", 'Luxe Line', 'fashion', 'Bags', 5999, 8999, 'style-avenue', 'ShoppingBag', '1584917865442-de89df76afd3', ['trending'], { colors: ['Tan', 'Black', 'Maroon'] }],
  ['Classic Denim Jacket', 'Urban Cart', 'fashion', 'Men', 5499, 7999, 'urban-cart', 'Shirt', '1551537482-f2075a1d41f2', ['new'], { sizes: ['S', 'M', 'L', 'XL'] }],
  ["Men's Shalwar Kameez Wash & Wear", 'Urban Cart', 'fashion', 'Men', 3999, 5499, 'urban-cart', 'Shirt', '1622470953794-aa9c70b0fb9d', ['bestseller'], { colors: ['Charcoal', 'Off White', 'Navy'], sizes: ['M', 'L', 'XL'] }],
  ["Women's Printed Kurti", 'Style Avenue', 'fashion', 'Women', 1999, 2999, 'style-avenue', 'Shirt', '1610030469983-98e550d6193c', ['new', 'flash'], { sizes: ['S', 'M', 'L'] }],
  ['Analog Steel Wrist Watch', 'Tempo', 'fashion', 'Watches', 7999, 11999, 'urban-cart', 'Watch', '1523275335684-37898b6baf30', ['top']],
  ["Kids' Graphic T-Shirt Pack (3)", 'Little Steps', 'fashion', 'Kids', 1799, 2499, 'baby-world', 'Shirt', '1519238263530-99bdd11df2ea', [], { sizes: ['4-5Y', '6-7Y', '8-9Y'] }],
  ['Peshawari Chappal Handmade', 'Khyber Craft', 'fashion', 'Shoes', 3499, 4499, 'urban-cart', 'Footprints', '1543163521-1bf539c55dd2', ['new'], { sizes: ['40', '41', '42', '43'] }],
  // ---------- Beauty ----------
  ['Vitamin C Brightening Serum 30ml', 'GlowLab', 'beauty', 'Skincare', 1899, 2999, 'glow-care', 'Droplet', '1620916566398-39f1143ab7be', ['flash', 'bestseller', 'trending']],
  ['Hydrating Face Wash 150ml', 'PureSkin', 'beauty', 'Skincare', 899, 1299, 'glow-care', 'Droplets', '1556228578-8c89e6adf883', ['bestseller']],
  ['Matte Liquid Lipstick', 'Velvet Rose', 'beauty', 'Makeup', 999, 1499, 'glow-care', 'Sparkles', '1586495777744-4413f21062fa', ['trending'], { colors: ['Ruby', 'Nude', 'Mauve', 'Brick'] }],
  ['Hair Repair Shampoo 400ml', 'SilkStrand', 'beauty', 'Haircare', 1199, 1599, 'glow-care', 'Droplets', '1535585209827-a15fcdbc4c2d', []],
  ['Oud Intense Perfume for Men 100ml', 'Arabesque', 'beauty', 'Fragrances', 4499, 6999, 'glow-care', 'SprayCan', '1585386959984-a4155224a1ad', ['top', 'bestseller']],
  ['Sunscreen SPF 50 Gel 50ml', 'PureSkin', 'beauty', 'Skincare', 1299, 1799, 'glow-care', 'Droplet', '1556229010-6c3f2c9ca5f8', ['new']],
  ['Beard Grooming Kit', 'Gentleman Co.', 'beauty', 'Grooming', 2299, 3499, 'glow-care', 'Sparkles', '1621607512214-68297480165e', []],
  ['Rose Water Facial Toner', 'Herbal Bloom', 'beauty', 'Skincare', 599, 899, 'glow-care', 'Flower2', '1608248597279-f99d160bfcbc', ['flash']],
  // ---------- Home & Living ----------
  ['Modern Table Lamp with Linen Shade', 'Lumen', 'home-living', 'Lighting', 3499, 4999, 'modern-living', 'Lamp', '1507473885765-e6ed057f782c', ['trending']],
  ['Non-Stick Cookware Set 7-Pc', 'ChefMate', 'home-living', 'Kitchen', 12999, 17999, 'homenest', 'CookingPot', '1556909114-f6e7ad7d3136', ['bestseller', 'top', 'flash']],
  ['Cotton Bedsheet Set King', 'Dreamweave', 'home-living', 'Bedding', 4499, 6499, 'homenest', 'BedDouble', '1522771739844-6a9f6d5f14af', ['bestseller'], { colors: ['Ivory', 'Grey', 'Sage'] }],
  ['Stackable Storage Organizer (3)', 'Tidy', 'home-living', 'Storage', 1999, 2999, 'homenest', 'Archive', '1595428774223-ef52624120d2', []],
  ['Decorative Wall Clock 12"', 'Tempo Home', 'home-living', 'Decor', 2299, 3299, 'modern-living', 'Clock', '1563861826100-9cb868fdbe1c', ['new']],
  ['Ceramic Dinner Set 32-Pc', 'Sufra', 'home-living', 'Kitchen', 15999, 21999, 'homenest', 'Soup', '1603199506016-b9a594b593c0', []],
  ['Velvet Cushion Covers (Set of 4)', 'Dreamweave', 'home-living', 'Decor', 1499, 2299, 'modern-living', 'Sofa', '1584100936595-c0654b55a2e2', ['flash']],
  ['Solid Wood Coffee Table', 'Woodcraft', 'home-living', 'Furniture', 24999, 32999, 'modern-living', 'Sofa', '1555041469-a586c61ea9bc', ['new']],
  // ---------- Grocery ----------
  ['Super Kernel Basmati Rice 5kg', 'Guard', 'grocery', 'Rice & Atta', 2499, 2799, 'daily-essentials', 'Wheat', '1586201375761-83865001e31c', ['bestseller', 'flash']],
  ['Canola Cooking Oil 1L', 'Dalda', 'grocery', 'Cooking Oil', 699, 749, 'daily-essentials', 'Droplet', '1474979266404-7eaacbcd87c5', ['bestseller']],
  ['Premium Black Tea 950g', 'Tapal', 'grocery', 'Beverages', 1599, 1749, 'daily-essentials', 'Coffee', '1544787219-7f47ccb76574', ['bestseller', 'top']],
  ['Assorted Chocolate Box 400g', 'Cocoa Delight', 'grocery', 'Snacks', 1899, 2499, 'daily-essentials', 'Candy', '1549007994-cb92caebd54b', ['new']],
  ['Honey Crunch Breakfast Cereal 500g', 'Morning Star', 'grocery', 'Breakfast', 899, 1099, 'daily-essentials', 'Wheat', '1521483451569-e33803c0330c', []],
  ['Chakki Atta 10kg', 'Sunridge', 'grocery', 'Rice & Atta', 1499, 1599, 'daily-essentials', 'Wheat', '1509440159596-0249088772ff', []],
  ['Laundry Detergent 2kg', 'Brite', 'grocery', 'Household', 1199, 1399, 'daily-essentials', 'Droplets', '1610557892470-55d9e80c0bce', ['flash']],
  // ---------- Health ----------
  ['Digital Blood Pressure Monitor', 'Omron', 'health-wellness', 'Medical Devices', 7999, 9999, 'health-plus', 'HeartPulse', '1631815588090-d4bfec5b1ccb', ['top']],
  ['Multivitamin Daily 60 Tablets', 'Nature’s Way', 'health-wellness', 'Vitamins', 1799, 2299, 'health-plus', 'Pill', '1584308666744-24d5c474f2ae', ['bestseller']],
  ['Infrared Digital Thermometer', 'CareTemp', 'health-wellness', 'Medical Devices', 2499, 3499, 'health-plus', 'Thermometer', '1584515933487-779824d29309', []],
  ['Whey Protein 2lb Chocolate', 'MuscleCore', 'health-wellness', 'Nutrition', 8499, 9999, 'fitnation', 'Dumbbell', '1593095948071-474c5cc2989d', ['trending']],
  ['Smart Body Weight Scale', 'FitScale', 'health-wellness', 'Medical Devices', 3999, 5499, 'health-plus', 'Scale', '1576678927484-cc907957088c', ['new']],
  // ---------- Sports ----------
  ['Yoga Mat 6mm Anti-Slip', 'FitNation', 'sports-fitness', 'Yoga', 1999, 2999, 'fitnation', 'Activity', '1601925260368-ae2f83cf8b7f', ['flash', 'bestseller'], { colors: ['Purple', 'Teal', 'Black'] }],
  ['Resistance Bands Set (5 Levels)', 'FitNation', 'sports-fitness', 'Gym Equipment', 1499, 2299, 'fitnation', 'Dumbbell', '1598289431512-b97b0917affc', ['bestseller']],
  ['Running Shoes AirFlex', 'StrideOn', 'sports-fitness', 'Running', 6999, 9999, 'fitnation', 'Footprints', '1542291026-7eec264c27ff', ['trending'], { sizes: ['40', '41', '42', '43', '44'] }],
  ['Match Football Size 5', 'Sialkot Pro', 'sports-fitness', 'Football', 2499, 3299, 'fitnation', 'Trophy', '1614632537190-23e4146777db', ['top']],
  ['Adjustable Dumbbell Set 20kg', 'IronGrip', 'sports-fitness', 'Gym Equipment', 11999, 15999, 'fitnation', 'Dumbbell', '1638536532686-d610adfc8e5c', ['new']],
  ['English Willow Cricket Bat', 'Sialkot Pro', 'sports-fitness', 'Cricket', 14999, 18999, 'fitnation', 'Trophy', '1531415074968-036ba1b575da', ['bestseller', 'trending']],
  ['Hard Tennis Cricket Ball (Pack of 6)', 'Sialkot Pro', 'sports-fitness', 'Cricket', 999, 1399, 'fitnation', 'Trophy', '1624526267942-ab0ff8a3e972', ['flash']],
  // ---------- Kids ----------
  ['Educational Building Blocks 250 Pcs', 'BrickBuddy', 'toys-kids', 'Learning Toys', 2999, 4499, 'baby-world', 'ToyBrick', '1587654780291-39c9404d746b', ['bestseller', 'flash']],
  ['Remote Control Racing Car', 'TurboKids', 'toys-kids', 'Remote Control', 3999, 5999, 'baby-world', 'Car', '1594787318286-3d835c1d207f', ['trending']],
  ['Kids School Backpack', 'Little Steps', 'toys-kids', 'School Supplies', 2499, 3499, 'baby-world', 'Backpack', '1553062407-98eeb64c6a62', ['new'], { colors: ['Blue', 'Pink'] }],
  ['Coloring Set 68 Pieces', 'ArtSmart', 'toys-kids', 'School Supplies', 1299, 1999, 'baby-world', 'Palette', '1513364776144-60967b0f800f', []],
  ['Baby Feeding Set BPA-Free', 'TinyNest', 'toys-kids', 'Baby Care', 1799, 2599, 'baby-world', 'Baby', '1515488042361-ee00e0ddd4e4', ['top']],
  ['Plush Teddy Bear 60cm', 'CuddleCo', 'toys-kids', 'Learning Toys', 1999, 2799, 'baby-world', 'Baby', '1559454403-b8fb88521f11', ['flash']],
  // ---------- Automotive ----------
  ['Magnetic Car Phone Holder', 'AutoGear', 'automotive', 'Car Accessories', 999, 1699, 'autogear-pk', 'Smartphone', '1606577924006-27d39b132ae2', ['bestseller', 'flash']],
  ['Car Air Freshener Gel (Pack of 3)', 'FreshDrive', 'automotive', 'Car Care', 799, 1199, 'autogear-pk', 'SprayCan', '1607860108855-64acf2078ed9', []],
  ['LED Headlights H4 (Pair)', 'BrightRide', 'automotive', 'Lighting', 4499, 6499, 'autogear-pk', 'Lightbulb', '1489824904134-891ab64532f1', ['trending']],
  ['Car Cleaning Kit 9-in-1', 'ShineMax', 'automotive', 'Car Care', 2999, 3999, 'autogear-pk', 'Wrench', '1607860108855-64acf2078ed9', ['new']],
  ['Motorcycle Riding Gloves', 'RideSafe', 'automotive', 'Bike Gear', 1499, 2199, 'autogear-pk', 'Bike', '1558981806-ec527fa84c39', [], { sizes: ['M', 'L', 'XL'] }],
  ['Digital Tyre Inflator Portable', 'AutoGear', 'automotive', 'Car Accessories', 6999, 8999, 'autogear-pk', 'Wrench', '1486262715619-67b85e0b08d3', ['top']],
  // ---------- Books ----------
  ['Business Strategy Essentials', 'Readers Hub Press', 'books-stationery', 'Business', 1499, 1999, 'readers-hub', 'BookOpen', '1544947950-fa07a98d237f', ['bestseller']],
  ['English Grammar in Practice', 'Oxford Learning', 'books-stationery', 'Education', 1199, 1499, 'readers-hub', 'GraduationCap', '1497633762265-9d179a990aa6', ['top']],
  ["Children's Bedtime Story Book", 'Little Readers', 'books-stationery', 'Children', 799, 999, 'readers-hub', 'Book', '1512820790803-83ca734da794', ['flash']],
  ['Learn Programming with Python', 'CodePress', 'books-stationery', 'Technology', 2299, 2999, 'readers-hub', 'BookOpen', '1515879218367-8466d910aaa4', ['new', 'trending']],
  ['Islamic History: The Golden Age', 'Dar-ul-Ilm', 'books-stationery', 'History', 1899, 2499, 'readers-hub', 'Library', '1481627834876-b7833e8f5570', ['bestseller']],
  ['Premium Notebook A5 (Pack of 3)', 'PaperCo', 'books-stationery', 'Stationery', 899, 1299, 'readers-hub', 'PenTool', '1531346878377-a5be20888e57', []],
  // ---------- Appliances ----------
  ['Air Fryer 5.5L Digital', 'ChefMate', 'appliances', 'Kitchen Appliances', 17999, 24999, 'prime-electronics', 'CookingPot', '1648203298767-1b1e0a2a8db4', ['flash', 'trending', 'bestseller']],
  ['Microwave Oven 25L', 'Orion', 'appliances', 'Kitchen Appliances', 29999, 36999, 'prime-electronics', 'Microwave', '1574269909862-7e1d70bb8078', []],
  ['Inverter AC 1.5 Ton', 'CoolBreeze', 'appliances', 'Cooling', 164999, 189999, 'prime-electronics', 'Fan', '1631545806609-8e8f0e6a8d7d', ['top']],
  ['Automatic Washing Machine 8kg', 'Orion', 'appliances', 'Laundry', 94999, 109999, 'prime-electronics', 'WashingMachine', '1626806787461-102c1bfaaea1', ['new']],
  ['Steam Iron 2400W', 'Philtech', 'appliances', 'Irons & Steamers', 4999, 6499, 'prime-electronics', 'Zap', '1489274495757-95c7c837b101', ['bestseller']],
  ['Blender & Grinder 3-in-1', 'ChefMate', 'appliances', 'Kitchen Appliances', 8999, 11999, 'prime-electronics', 'CookingPot', '1570222094114-d054a817e56b', ['flash']],
  ['Pedestal Fan 18" Energy Saver', 'CoolBreeze', 'appliances', 'Cooling', 11999, 14499, 'prime-electronics', 'Fan', '1617375407633-acd67aba7864', []],
  // ---------- Jewelry ----------
  ['Sterling Silver Pendant Necklace', 'Jewel Box', 'jewelry-accessories', 'Jewelry', 3999, 5999, 'jewel-box', 'Gem', '1515562141207-7a88fb7ce338', ['trending']],
  ['Polarized Aviator Sunglasses', 'Shade Co.', 'jewelry-accessories', 'Sunglasses', 2499, 3999, 'jewel-box', 'Glasses', '1572635196237-14b3f281503f', ['flash', 'bestseller']],
  ["Men's Leather Wallet RFID", 'Craftline', 'jewelry-accessories', 'Wallets', 1999, 2999, 'jewel-box', 'Wallet', '1627123424574-724758594e93', ['bestseller']],
  ['Kundan Bridal Jewelry Set', 'Jewel Box', 'jewelry-accessories', 'Jewelry', 12999, 17999, 'jewel-box', 'Gem', '1599643478518-a784e5dc4c8f', ['new']],
  ['Reversible Leather Belt', 'Craftline', 'jewelry-accessories', 'Belts', 1799, 2499, 'jewel-box', 'Wallet', '1624222247344-550fb60583dc', []],
  // ---------- Pets ----------
  ['Premium Cat Food Ocean Fish 1.2kg', 'Purrfect', 'pet-supplies', 'Cat Food', 2299, 2699, 'pet-paradise', 'Fish', '1583337130417-3346a1be7dee', ['bestseller']],
  ['Adult Dog Food Chicken 3kg', 'Doggo', 'pet-supplies', 'Dog Food', 4999, 5799, 'pet-paradise', 'Bone', '1589924691995-400dc9ecc119', ['top']],
  ['Interactive Cat Toy Set', 'PlayPaws', 'pet-supplies', 'Pet Toys', 999, 1499, 'pet-paradise', 'Cat', '1545249390-6bdfa286032f', ['new', 'flash']],
  ['Pet Grooming Brush', 'PlayPaws', 'pet-supplies', 'Pet Care', 799, 1199, 'pet-paradise', 'Dog', '1516734212186-a967f81ad0d7', []],
];

const sellerBySlug = Object.fromEntries(sellers.map((s) => [s.slug, s]));
const rng = makeRng(20261005);

const SPEC_TEMPLATES: Record<string, (r: Row) => Record<string, string>> = {
  electronics: () => ({ Connectivity: 'Bluetooth 5.3 / USB-C', Battery: `${rng.int(10, 40)} hours`, 'In the box': 'Device, USB-C cable, manual', 'Water resistance': rng.pick(['IPX4', 'IPX5', 'IP67', 'N/A']) }),
  'mobiles-tablets': () => ({ Display: `${rng.pick(['6.5', '6.67', '6.7', '11'])}" AMOLED 120Hz`, Processor: rng.pick(['Octa-core 2.4GHz', 'Snapdragon 7 Gen 1', 'Dimensity 7050']), RAM: rng.pick(['6GB', '8GB']), Battery: `${rng.pick(['5000', '5100', '8000'])} mAh`, 'PTA Approved': 'Yes' }),
  'computers-laptops': () => ({ Processor: rng.pick(['Intel Core i5-13420H', 'Intel Core i7-13700H', 'AMD Ryzen 7 7840HS']), Memory: '16GB DDR5', Storage: '512GB NVMe SSD', OS: 'Windows 11 Home' }),
  fashion: () => ({ Fabric: rng.pick(['100% Cotton', 'Premium Lawn', 'Wash & Wear', 'Denim', 'Genuine Leather', 'Mesh / Rubber']), Fit: rng.pick(['Regular', 'Slim', 'Relaxed']), Care: 'Machine wash cold, do not bleach', Origin: 'Made in Pakistan' }),
  beauty: () => ({ 'Skin type': rng.pick(['All skin types', 'Oily & combination', 'Dry & sensitive']), Volume: rng.pick(['30ml', '50ml', '150ml', '400ml', '100ml']), 'Cruelty free': 'Yes', 'Shelf life': '24 months' }),
  'home-living': () => ({ Material: rng.pick(['Ceramic', 'Solid wood', 'Cotton 300TC', 'Aluminium', 'Polypropylene']), Dimensions: `${rng.int(20, 120)} x ${rng.int(20, 80)} cm`, Assembly: rng.pick(['Not required', 'Easy self-assembly']) }),
  grocery: () => ({ 'Net weight': rng.pick(['500g', '1kg', '5kg', '1L', '950g']), 'Shelf life': `${rng.int(6, 18)} months`, Storage: 'Store in a cool, dry place', Halal: 'Certified' }),
  'health-wellness': () => ({ Usage: 'As directed', Certification: 'DRAP registered', Warranty: '1 year' }),
  'sports-fitness': () => ({ Material: rng.pick(['TPE', 'Natural latex', 'English willow', 'PU leather', 'Cast iron']), Level: rng.pick(['Beginner', 'Intermediate', 'Pro']), Origin: 'Sialkot, Pakistan' }),
  'toys-kids': () => ({ 'Age group': rng.pick(['3+ years', '5+ years', '0–24 months', '6+ years']), Material: 'Non-toxic ABS', Safety: 'EN71 tested' }),
  automotive: () => ({ Compatibility: 'Universal', Material: rng.pick(['ABS + Silicone', 'Aluminium', 'Microfibre']), Warranty: '6 months' }),
  'books-stationery': () => ({ Pages: String(rng.int(120, 480)), Language: 'English', Binding: rng.pick(['Paperback', 'Hardcover']), Publisher: 'Local edition' }),
  appliances: () => ({ Power: rng.pick(['1500W', '2400W', '900W', 'Inverter']), Voltage: '220–240V', 'Energy rating': rng.pick(['A+', 'A++', 'A']), Warranty: rng.pick(['1 year', '2 years', '10 years compressor']) }),
  'jewelry-accessories': () => ({ Material: rng.pick(['925 Sterling Silver', 'Genuine Leather', 'Metal frame, polarized lens', 'Kundan & Zircon']), Packaging: 'Gift box included' }),
  'pet-supplies': () => ({ 'Pet type': rng.pick(['Cat', 'Dog', 'Cats & Dogs']), Weight: rng.pick(['1.2kg', '3kg', '250g']), Origin: 'Imported' }),
};

export const seedProducts: Product[] = rows.map((r, i) => {
  const [title, brand, category, subcategory, price, originalPrice, sellerSlug, icon, img, tags, variants] = r;
  const seller = sellerBySlug[sellerSlug];
  const n = i + 1;
  const rating = rng.float(3.9, 4.9, 1);
  const reviewCount = rng.int(18, 2400);
  const sold = tags.includes('bestseller') ? rng.int(1200, 9800) : rng.int(40, 1600);
  const stock = n % 17 === 0 ? 0 : n % 11 === 0 ? rng.int(2, 6) : rng.int(12, 420);
  const created = new Date('2026-10-05T09:00:00+05:00');
  created.setDate(created.getDate() - (tags.includes('new') ? rng.int(1, 14) : rng.int(20, 400)));
  const alt = [unsplash(img, 900), unsplash(img, 901).replace('fit=crop', 'fit=crop&crop=entropy'), unsplash(img, 902).replace('fit=crop', 'fit=crop&crop=top'), unsplash(img, 903).replace('fit=crop', 'fit=crop&crop=bottom')];
  return {
    id: `P${String(10000 + n)}`,
    slug: slugify(title),
    title, brand, category, subcategory,
    sellerId: seller.id,
    price, originalPrice, rating, reviewCount, sold, stock,
    reserved: stock ? rng.int(0, Math.min(8, stock)) : 0,
    lowStockThreshold: 10,
    images: alt,
    icon,
    description: `${title} by ${brand} brings dependable quality at a fair price. Sold by ${seller.name} and backed by B-Bazar Buyer Protection, it is a favourite with shoppers across Pakistan. Carefully packed and delivered to your doorstep, with cash on delivery available nationwide.`,
    highlights: [
      `Genuine ${brand} product with official warranty`,
      tags.includes('bestseller') ? 'Over 1,000 happy customers this month' : 'Quality-checked before dispatch',
      price >= 2999 ? 'Free delivery across Pakistan' : 'Free delivery on orders above Rs. 2,999',
      '7-day easy returns',
    ],
    specs: { Brand: brand, Model: `${brand.slice(0, 3).toUpperCase()}-${1000 + n}`, ...SPEC_TEMPLATES[category](r) },
    ...variants,
    tags,
    freeDelivery: price >= 2999 || n % 4 === 0,
    warranty: ['electronics', 'mobiles-tablets', 'computers-laptops', 'appliances'].includes(category) ? rng.pick(['1 Year Brand Warranty', '6 Months Seller Warranty', '2 Years Brand Warranty']) : 'No warranty',
    returnPolicy: '7 days easy return',
    sku: `${category.slice(0, 3).toUpperCase()}-${brand.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}-${String(n).padStart(4, '0')}`,
    status: 'approved',
    createdAt: created.toISOString(),
    installments: price >= 20000,
    weightKg: rng.float(0.1, 8, 1),
  };
});

// A few items awaiting admin moderation (demonstrates the approval workflow)
const pendingRows: [string, string, string, string, number, number, string, string, string][] = [
  ['Smart Doorbell Camera 1080p', 'HomeEye', 'electronics', 'Cameras', 9999, 13999, 'techzone', 'Camera', '1558002038-1055907df827'],
  ['Wireless Charging Pad 15W', 'VoltEdge', 'electronics', 'Chargers & Power', 1999, 2999, 'techzone', 'BatteryCharging', '1586816879360-004f5b0c51e3'],
  ['Hand-Stitched Leather Cricket Gloves', 'Sialkot Pro', 'sports-fitness', 'Cricket', 3499, 4499, 'fitnation', 'Trophy', '1531415074968-036ba1b575da'],
  ['Embroidered Chiffon Dupatta', 'Style Avenue', 'fashion', 'Women', 2499, 3499, 'style-avenue', 'Shirt', '1610030469983-98e550d6193c'],
  ['Organic Desi Ghee 1kg', 'Village Fresh', 'grocery', 'Cooking Oil', 2999, 3299, 'daily-essentials', 'Droplet', '1474979266404-7eaacbcd87c5'],
];
pendingRows.forEach((r, j) => {
  const base = seedProducts[0];
  const seller = sellerBySlug[r[6]];
  const submitted = new Date('2026-10-05T10:00:00+05:00');
  submitted.setHours(submitted.getHours() - (j + 1) * 9);
  seedProducts.push({
    ...base,
    id: `P${String(20001 + j)}`, slug: slugify(r[0]), title: r[0], brand: r[1], category: r[2], subcategory: r[3], price: r[4], originalPrice: r[5],
    sellerId: seller.id, icon: r[7], images: [unsplash(r[8], 900)], rating: 0, reviewCount: 0, sold: 0, stock: 50 + j * 10, reserved: 0,
    tags: ['new'], status: j === 4 ? 'rejected' : 'pending', createdAt: submitted.toISOString(), submittedAt: submitted.toISOString(),
    sku: `NEW-${String(j + 1).padStart(4, '0')}`, colors: undefined, sizes: undefined, storage: undefined,
    specs: { Brand: r[1] }, description: `${r[0]} from ${r[1]}. Submitted by ${seller.name} for marketplace approval.`,
  });
});
