-- Add REGISTERING enum value to status_pengajuan
ALTER TYPE status_pengajuan ADD VALUE IF NOT EXISTS 'REGISTERING';

-- Verify enum values
SELECT 
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'status_pengajuan'
ORDER BY e.enumsortorder;
