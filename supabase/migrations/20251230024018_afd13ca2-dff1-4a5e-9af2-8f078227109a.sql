-- Drop the existing check constraint and add a new one with all avatar types
ALTER TABLE public.assistant_settings DROP CONSTRAINT IF EXISTS valid_avatar_type;

ALTER TABLE public.assistant_settings ADD CONSTRAINT valid_avatar_type CHECK (
  avatar_type IS NULL OR avatar_type IN (
    'moxie-fox',
    'hoot-owl',
    'brutus-buckeye',
    'sparty',
    'herky-hawk',
    'bucky-badger',
    'goldy-gopher',
    'nittany-lion',
    'purdue-pete',
    'wolverine',
    'herbie-husker',
    'willie-wildcat',
    'testudo',
    'scarlet-knight',
    'oregon-duck',
    'joe-bruin',
    'tommy-trojan',
    'harry-husky',
    'illini',
    'hoosiers'
  )
);