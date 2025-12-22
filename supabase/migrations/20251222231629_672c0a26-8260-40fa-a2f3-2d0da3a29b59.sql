-- Drop existing constraint
ALTER TABLE public.assistant_settings DROP CONSTRAINT IF EXISTS valid_avatar_type;

-- Add updated constraint with all avatar types including new diverse characters
ALTER TABLE public.assistant_settings ADD CONSTRAINT valid_avatar_type CHECK (
  avatar_type IN (
    -- Original comic/mascot avatars
    'captain-moxie', 'pop-art-moxie', 'action-moxie', 
    'retro-comic-host', 'moxie-mascot', 'ink-style-moxie',
    'berry-mascot', 'blaze-mascot', 'cool-mascot', 
    'mint-mascot', 'rose-mascot', 'spark-mascot', 'sunny-mascot',
    -- New diverse character avatars
    'moxie-fox', 'hoot-owl', 'casita-house', 'genie-mo',
    'blobby', 'paw-dog', 'robo-host', 'tropico-drink'
  )
);