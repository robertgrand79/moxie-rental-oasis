-- Clean up Airbnb sync metadata records
DELETE FROM sync_metadata WHERE sync_type = 'airbnb_reviews';