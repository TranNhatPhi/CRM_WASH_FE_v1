-- Cleanup Services Database Script
-- This script removes duplicate and inconsistent service records
-- and ensures we only have the proper English service structure
-- First, let's see what we have
SELECT COUNT(*) as total_services
FROM services;
SELECT category,
    COUNT(*) as count
FROM services
GROUP BY category
ORDER BY category;
-- Remove duplicate Vietnamese services (IDs 49-53 and 59-63)
-- These are duplicates of the main service structure
DELETE FROM services
WHERE id IN (49, 50, 51, 52, 53, 59, 60, 61, 62, 63);
-- Verify the cleanup
SELECT COUNT(*) as remaining_services
FROM services;
SELECT category,
    COUNT(*) as count
FROM services
GROUP BY category
ORDER BY category;
-- Optional: Reset the sequence to continue from ID 48
SELECT setval('services_id_seq', 48, true);
-- Display final service structure
SELECT id,
    name,
    price,
    category
FROM services
ORDER BY category,
    id;