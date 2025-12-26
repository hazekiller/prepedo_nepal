-- Migration: Add vehicle_type column to vehicles table
-- Execute this in your database

-- Add the vehicle_type column
ALTER TABLE vehicles ADD COLUMN vehicle_type ENUM('bike', 'car', 'taxi') NOT NULL AFTER driver_id;

-- Add an index for performance
ALTER TABLE vehicles ADD INDEX idx_vehicle_type (vehicle_type);

-- If you have existing vehicles without vehicle_type, update them based on driver's vehicle_type:
-- UPDATE vehicles v 
-- JOIN drivers d ON v.driver_id = d.id 
-- SET v.vehicle_type = d.vehicle_type;
