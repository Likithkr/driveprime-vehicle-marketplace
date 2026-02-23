/**
 * Seed script — populates the listings and pending_listings tables
 * with initial mock data so the app has something to show on first launch.
 * Run: node seed.js  (from the backend/ folder)
 */
require('dotenv').config();
const db = require('./db');

const mockListings = [
    {
        id: 'l1', brand: 'Maruti Suzuki', model: 'Swift', variant: 'VXi', type: 'Car',
        year: 2021, km: 28000, fuel: 'Petrol', transmission: 'Manual', ownership: '1st Owner',
        insurance: '2025-12-01', color: 'Pearl White', state: 'Kerala', city: 'Kochi',
        location: 'Kochi, Kerala', about: 'Well maintained, single owner, full service history.',
        price: 620000, images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800'],
        dealerName: 'Drive Prime Kochi', dealerPhone: '9876543210', dealerEmail: 'kochi@driveprime.in',
        dealerWhatsApp: '9876543210', status: 'live', featured: true,
    },
    {
        id: 'l2', brand: 'Hyundai', model: 'Creta', variant: 'SX', type: 'Car',
        year: 2022, km: 18500, fuel: 'Diesel', transmission: 'Automatic', ownership: '1st Owner',
        insurance: '2026-03-15', color: 'Typhoon Silver', state: 'Kerala', city: 'Thrissur',
        location: 'Thrissur, Kerala', about: 'Top variant with sunroof, warranty valid.',
        price: 1450000, images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
        dealerName: 'AutoKing Thrissur', dealerPhone: '9123456789', dealerEmail: 'autoking@email.com',
        dealerWhatsApp: '9123456789', status: 'live', featured: true,
    },
    {
        id: 'l3', brand: 'Royal Enfield', model: 'Classic', variant: '350', type: 'Bike',
        year: 2020, km: 22000, fuel: 'Petrol', transmission: 'Manual', ownership: '1st Owner',
        insurance: '2025-06-30', color: 'Signals Marsh Grey', state: 'Tamil Nadu', city: 'Chennai',
        location: 'Chennai, Tamil Nadu', about: 'Excellent condition, all accessories intact.',
        price: 145000, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
        dealerName: 'Bullet Bros Chennai', dealerPhone: '9988776655', dealerEmail: 'bulletbros@email.com',
        dealerWhatsApp: '9988776655', status: 'live', featured: false,
    },
    {
        id: 'l4', brand: 'Tata', model: 'Nexon', variant: 'XZ+ Electric', type: 'Car',
        year: 2023, km: 9000, fuel: 'Electric', transmission: 'Automatic', ownership: '1st Owner',
        insurance: '2026-11-20', color: 'Daytona Grey', state: 'Maharashtra', city: 'Pune',
        location: 'Pune, Maharashtra', about: 'EV in mint condition, all India warranty.',
        price: 1580000, images: ['https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800'],
        dealerName: 'EV World Pune', dealerPhone: '9876501234', dealerEmail: 'evworld@email.com',
        dealerWhatsApp: '9876501234', status: 'live', featured: true,
    },
    {
        id: 'l5', brand: 'Honda', model: 'City', variant: 'ZX CVT', type: 'Car',
        year: 2020, km: 47000, fuel: 'Petrol', transmission: 'Automatic', ownership: '2nd Owner',
        insurance: '2025-08-01', color: 'Lunar Silver', state: 'Delhi', city: 'Delhi',
        location: 'Delhi, Delhi', about: 'Regularly serviced at Honda authorised center.',
        price: 870000, images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800'],
        dealerName: 'Capital Cars Delhi', dealerPhone: '9911223344', dealerEmail: 'capital@email.com',
        dealerWhatsApp: '9911223344', status: 'live', featured: false,
    },
];

const mockPending = [
    {
        id: 'p1', brand: 'Toyota', model: 'Innova', variant: 'Crysta GX', type: 'Car',
        year: 2019, km: 64000, fuel: 'Diesel', transmission: 'Manual', ownership: '2nd Owner',
        insurance: '', color: 'White Pearl', state: 'Karnataka', city: 'Bengaluru',
        location: 'Bengaluru, Karnataka', about: 'Family-used, excellent condition.',
        price: 1450000, images: [],
        dealerName: 'Ravi Kumar', dealerPhone: '9812345678', dealerEmail: 'ravi@email.com',
        dealerWhatsApp: '9812345678', submittedAt: new Date().toISOString().split('T')[0],
    },
];

async function seed() {
    console.log('🌱  Seeding database...');

    for (const l of mockListings) {
        await db.query(
            `INSERT IGNORE INTO listings
             (id, brand, model, variant, type, year, km, fuel, transmission,
              ownership, insurance, color, state, city, location, about, price,
              images, dealer_name, dealer_phone, dealer_email, dealer_whatsapp,
              status, featured)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                l.id, l.brand, l.model, l.variant, l.type, l.year, l.km,
                l.fuel, l.transmission, l.ownership, l.insurance, l.color,
                l.state, l.city, l.location, l.about, l.price,
                JSON.stringify(l.images), l.dealerName, l.dealerPhone,
                l.dealerEmail, l.dealerWhatsApp, l.status, l.featured ? 1 : 0,
            ]
        );
    }

    for (const l of mockPending) {
        await db.query(
            `INSERT IGNORE INTO pending_listings
             (id, brand, model, variant, type, year, km, fuel, transmission,
              ownership, insurance, color, state, city, location, about, price,
              images, dealer_name, dealer_phone, dealer_email, dealer_whatsapp, submitted_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                l.id, l.brand, l.model, l.variant, l.type, l.year, l.km,
                l.fuel, l.transmission, l.ownership, l.insurance, l.color,
                l.state, l.city, l.location, l.about, l.price,
                JSON.stringify(l.images), l.dealerName, l.dealerPhone,
                l.dealerEmail, l.dealerWhatsApp, l.submittedAt,
            ]
        );
    }

    console.log(`✅  Seeded ${mockListings.length} listings + ${mockPending.length} pending.`);
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
