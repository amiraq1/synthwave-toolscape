-- Enable pgcrypto extension for digest() function
-- Required for hashing user_id in public_reviews VIEW
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
