-- Clean up bleed-over threads from wrong phone number (541-931-8805)
-- These 9 "Unknown" threads are from a different OpenPhone number

-- Step 1: Delete communications for affected threads
DELETE FROM guest_communications 
WHERE thread_id IN (
  '21cdaeeb-cc19-4dd5-81f1-17ed7c4349ed',
  'aa771bdb-ddbd-487f-8ff9-e82147fe8a34',
  '78bf0485-3481-4163-975f-de1b9650abd5',
  '4bf7eb86-b808-420e-978a-ff7ad2978d1b',
  '92d1f3c9-60ab-4642-8576-e72ddf697d4a',
  'ab048d7a-750d-4938-9af1-c103df657e8c',
  '806f5018-f236-4188-bf69-a70537637ebc',
  '89eed772-7540-40a6-934b-710341afd346',
  '4b9808ee-11e3-496b-8315-95c6f507d9c5'
);

-- Step 2: Delete notifications for affected threads
DELETE FROM admin_notifications 
WHERE metadata->>'thread_id' IN (
  '21cdaeeb-cc19-4dd5-81f1-17ed7c4349ed',
  'aa771bdb-ddbd-487f-8ff9-e82147fe8a34',
  '78bf0485-3481-4163-975f-de1b9650abd5',
  '4bf7eb86-b808-420e-978a-ff7ad2978d1b',
  '92d1f3c9-60ab-4642-8576-e72ddf697d4a',
  'ab048d7a-750d-4938-9af1-c103df657e8c',
  '806f5018-f236-4188-bf69-a70537637ebc',
  '89eed772-7540-40a6-934b-710341afd346',
  '4b9808ee-11e3-496b-8315-95c6f507d9c5'
);

-- Step 3: Delete the threads themselves
DELETE FROM guest_inbox_threads 
WHERE id IN (
  '21cdaeeb-cc19-4dd5-81f1-17ed7c4349ed',
  'aa771bdb-ddbd-487f-8ff9-e82147fe8a34',
  '78bf0485-3481-4163-975f-de1b9650abd5',
  '4bf7eb86-b808-420e-978a-ff7ad2978d1b',
  '92d1f3c9-60ab-4642-8576-e72ddf697d4a',
  'ab048d7a-750d-4938-9af1-c103df657e8c',
  '806f5018-f236-4188-bf69-a70537637ebc',
  '89eed772-7540-40a6-934b-710341afd346',
  '4b9808ee-11e3-496b-8315-95c6f507d9c5'
);