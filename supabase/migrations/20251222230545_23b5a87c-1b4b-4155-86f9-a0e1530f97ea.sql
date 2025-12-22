-- Drop the existing constraint first
ALTER TABLE assistant_settings DROP CONSTRAINT IF EXISTS valid_avatar_type;

-- Update existing records with old avatar types to the new default
UPDATE assistant_settings 
SET avatar_type = 'captain-moxie' 
WHERE avatar_type IS NOT NULL 
AND avatar_type NOT IN (
  'captain-moxie', 'pop-art-moxie', 'action-moxie', 
  'retro-comic-host', 'moxie-mascot', 'ink-style-moxie',
  'berry-mascot', 'blaze-mascot', 'cool-mascot', 
  'mint-mascot', 'rose-mascot', 'spark-mascot', 'sunny-mascot'
);

-- Add the new constraint with all valid avatar types
ALTER TABLE assistant_settings ADD CONSTRAINT valid_avatar_type CHECK (
  avatar_type IS NULL OR avatar_type IN (
    'captain-moxie', 'pop-art-moxie', 'action-moxie', 
    'retro-comic-host', 'moxie-mascot', 'ink-style-moxie',
    'berry-mascot', 'blaze-mascot', 'cool-mascot', 
    'mint-mascot', 'rose-mascot', 'spark-mascot', 'sunny-mascot'
  )
);