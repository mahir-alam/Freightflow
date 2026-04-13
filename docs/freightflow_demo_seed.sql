-- FreightFlow demo seed reset
-- Keeps users table untouched
-- Resets trucks and shipments with stronger multi-month analytics data

BEGIN;

TRUNCATE TABLE shipments RESTART IDENTITY CASCADE;
TRUNCATE TABLE trucks RESTART IDENTITY CASCADE;

-- =========================
-- Trucks
-- =========================
INSERT INTO trucks (
  truck_number,
  driver_name,
  truck_type,
  current_location,
  availability_status,
  capacity_tons
)
VALUES
  ('CTG-TRK-1001', 'Md. Rahim Uddin', 'Covered Van', 'Chattogram', 'Available', 7.5),
  ('DAC-TRK-1002', 'Abdul Karim', 'Trailer', 'Dhaka', 'Assigned', 18.0),
  ('SYL-TRK-1003', 'Jamal Hossain', 'Flatbed', 'Sylhet', 'Available', 12.0),
  ('KHL-TRK-1004', 'Mizanur Rahman', 'Covered Van', 'Khulna', 'Assigned', 8.0),
  ('RAJ-TRK-1005', 'Sajid Ali', 'Trailer', 'Rajshahi', 'Available', 20.0),
  ('CTG-TRK-1006', 'Nur Alam', 'Mini Truck', 'Chattogram', 'Available', 3.5),
  ('DAC-TRK-1007', 'Habib Khan', 'Covered Van', 'Dhaka', 'Available', 9.0),
  ('SYL-TRK-1008', 'Tariqul Islam', 'Flatbed', 'Sylhet', 'Available', 10.0);

-- =========================
-- Shipments
-- Assumes these users already exist:
-- admin@freightflow.com
-- client@freightflow.com
-- demo@freightflow.com
-- =========================
INSERT INTO shipments (
  client_name,
  pickup_location,
  dropoff_location,
  shipment_date,
  truck_type,
  status,
  negotiated_price_bdt,
  commission_amount_bdt,
  assigned_truck_id,
  client_user_id
)
VALUES
  -- October 2025
  (
    'Square Pharmaceuticals',
    'Dhaka',
    'Khulna',
    '2025-10-08',
    'Flatbed',
    'Completed',
    36500,
    2500,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'PRAN-RFL Group',
    'Gazipur',
    'Sylhet',
    '2025-10-15',
    'Trailer',
    'Completed',
    51000,
    4200,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'ACI Logistics',
    'Chattogram',
    'Dhaka',
    '2025-10-27',
    'Covered Van',
    'Completed',
    42000,
    3000,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),

  -- November 2025
  (
    'Bashundhara Foods',
    'Dhaka',
    'Rajshahi',
    '2025-11-05',
    'Covered Van',
    'Completed',
    39500,
    2700,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),
  (
    'Akij Group',
    'Chattogram',
    'Dhaka',
    '2025-11-12',
    'Covered Van',
    'Completed',
    43000,
    3100,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Unilever BD',
    'Dhaka',
    'Khulna',
    '2025-11-24',
    'Flatbed',
    'Completed',
    37200,
    2400,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),

  -- December 2025
  (
    'Meghna Group',
    'Gazipur',
    'Sylhet',
    '2025-12-03',
    'Trailer',
    'Completed',
    52500,
    4100,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),
  (
    'City Group',
    'Chattogram',
    'Dhaka',
    '2025-12-11',
    'Covered Van',
    'Completed',
    41800,
    2900,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Renata PLC',
    'Dhaka',
    'Khulna',
    '2025-12-18',
    'Flatbed',
    'Completed',
    38100,
    2550,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Walton Logistics',
    'Dhaka',
    'Sylhet',
    '2025-12-28',
    'Covered Van',
    'Completed',
    44800,
    2850,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),

  -- January 2026
  (
    'PRAN-RFL Group',
    'Gazipur',
    'Sylhet',
    '2026-01-07',
    'Trailer',
    'Completed',
    53800,
    4300,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Akij Group',
    'Chattogram',
    'Dhaka',
    '2026-01-14',
    'Covered Van',
    'Completed',
    43500,
    3050,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Square Pharmaceuticals',
    'Dhaka',
    'Khulna',
    '2026-01-21',
    'Flatbed',
    'Completed',
    38800,
    2450,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'bKash Logistics',
    'Dhaka',
    'Rajshahi',
    '2026-01-29',
    'Covered Van',
    'Completed',
    40500,
    2600,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),

  -- February 2026
  (
    'Beximco Pharma',
    'Chattogram',
    'Dhaka',
    '2026-02-06',
    'Covered Van',
    'Completed',
    44600,
    3150,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'PRAN-RFL Group',
    'Gazipur',
    'Sylhet',
    '2026-02-13',
    'Trailer',
    'Completed',
    54800,
    4400,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Akij Group',
    'Chattogram',
    'Dhaka',
    '2026-02-20',
    'Covered Van',
    'Completed',
    45200,
    3200,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),
  (
    'Walton Logistics',
    'Dhaka',
    'Sylhet',
    '2026-02-25',
    'Covered Van',
    'Completed',
    46200,
    2950,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),

  -- March 2026
  (
    'Square Pharmaceuticals',
    'Dhaka',
    'Khulna',
    '2026-03-04',
    'Flatbed',
    'Completed',
    39200,
    2480,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'ACI Logistics',
    'Chattogram',
    'Dhaka',
    '2026-03-12',
    'Covered Van',
    'Completed',
    45900,
    3250,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),
  (
    'Meghna Group',
    'Gazipur',
    'Sylhet',
    '2026-03-18',
    'Trailer',
    'Completed',
    55500,
    4450,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Fresh Foods Ltd',
    'Dhaka',
    'Rajshahi',
    '2026-03-24',
    'Covered Van',
    'Completed',
    41500,
    2700,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),

  -- April 2026
  (
    'Akij Group',
    'Chattogram',
    'Dhaka',
    '2026-04-03',
    'Covered Van',
    'Completed',
    46200,
    3300,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'PRAN-RFL Group',
    'Gazipur',
    'Sylhet',
    '2026-04-05',
    'Trailer',
    'Completed',
    56500,
    4500,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Square Pharmaceuticals',
    'Dhaka',
    'Khulna',
    '2026-04-07',
    'Flatbed',
    'Completed',
    39800,
    2520,
    NULL,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'bKash Logistics',
    'Dhaka',
    'Sylhet',
    '2026-04-08',
    'Covered Van',
    'In Transit',
    47200,
    3100,
    4,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  ),
  (
    'Fresh Foods Ltd',
    'Chattogram',
    'Dhaka',
    '2026-04-09',
    'Covered Van',
    'Assigned',
    46800,
    3350,
    2,
    (SELECT id FROM users WHERE email = 'client@freightflow.com' LIMIT 1)
  ),
  (
    'Demo Retail BD',
    'Dhaka',
    'Rajshahi',
    '2026-04-11',
    'Covered Van',
    'Pending',
    42500,
    2600,
    NULL,
    (SELECT id FROM users WHERE email = 'demo@freightflow.com' LIMIT 1)
  );

COMMIT;