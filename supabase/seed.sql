-- Mental exercises seed data
insert into public.mental_exercises (title, category, difficulty, duration_minutes, description, steps, min_distress_level, max_distress_level, tags) values

-- BREATHING EXERCISES
(
  '4-7-8 Breathing',
  'breathing',
  'easy',
  5,
  'A calming breathing technique that activates your parasympathetic nervous system to reduce anxiety and stress.',
  '[
    {"step": 1, "instruction": "Find a comfortable position and place one hand on your chest.", "duration_seconds": 5, "display_type": "text"},
    {"step": 2, "instruction": "Inhale through your nose", "duration_seconds": 4, "display_type": "timer", "animation": "expand"},
    {"step": 3, "instruction": "Hold your breath", "duration_seconds": 7, "display_type": "timer", "animation": "hold"},
    {"step": 4, "instruction": "Exhale completely through your mouth", "duration_seconds": 8, "display_type": "timer", "animation": "contract"},
    {"step": 5, "instruction": "Repeat this cycle 3 more times.", "duration_seconds": 5, "display_type": "text"}
  ]',
  4, 9, ARRAY['anxiety', 'stress', 'sleep']
),

(
  'Box Breathing',
  'breathing',
  'easy',
  4,
  'Used by Navy SEALs to stay calm under pressure. Equal counts for each phase create a steady rhythm.',
  '[
    {"step": 1, "instruction": "Sit upright and relax your shoulders.", "duration_seconds": 5, "display_type": "text"},
    {"step": 2, "instruction": "Inhale slowly through your nose", "duration_seconds": 4, "display_type": "timer", "animation": "expand"},
    {"step": 3, "instruction": "Hold at the top", "duration_seconds": 4, "display_type": "timer", "animation": "hold"},
    {"step": 4, "instruction": "Exhale through your mouth", "duration_seconds": 4, "display_type": "timer", "animation": "contract"},
    {"step": 5, "instruction": "Hold at the bottom", "duration_seconds": 4, "display_type": "timer", "animation": "hold"},
    {"step": 6, "instruction": "Repeat 4 times. You''re doing great.", "duration_seconds": 5, "display_type": "text"}
  ]',
  4, 8, ARRAY['anxiety', 'focus', 'panic']
),

(
  'Belly Breathing',
  'breathing',
  'easy',
  3,
  'Diaphragmatic breathing that helps switch your body out of fight-or-flight mode.',
  '[
    {"step": 1, "instruction": "Place one hand on your belly, one on your chest.", "duration_seconds": 5, "display_type": "text"},
    {"step": 2, "instruction": "Breathe in slowly — feel your belly rise, chest stays still", "duration_seconds": 5, "display_type": "timer", "animation": "expand"},
    {"step": 3, "instruction": "Breathe out slowly — feel your belly fall", "duration_seconds": 5, "display_type": "timer", "animation": "contract"},
    {"step": 4, "instruction": "Repeat for 5 breaths. Notice the calm spreading through you.", "duration_seconds": 5, "display_type": "text"}
  ]',
  3, 7, ARRAY['anxiety', 'beginner', 'quick']
),

-- GROUNDING EXERCISES
(
  '5-4-3-2-1 Grounding',
  'grounding',
  'easy',
  5,
  'Engage all five senses to anchor yourself to the present moment and interrupt spiraling thoughts.',
  '[
    {"step": 1, "instruction": "Take one slow breath in and out.", "duration_seconds": 5, "display_type": "text"},
    {"step": 2, "instruction": "Name 5 things you can SEE right now. Look around — notice details like color, shape, texture.", "duration_seconds": 30, "display_type": "text"},
    {"step": 3, "instruction": "Name 4 things you can TOUCH. Feel the texture of your clothes, chair, floor.", "duration_seconds": 25, "display_type": "text"},
    {"step": 4, "instruction": "Name 3 things you can HEAR. Listen for distant sounds, close sounds, subtle sounds.", "duration_seconds": 20, "display_type": "text"},
    {"step": 5, "instruction": "Name 2 things you can SMELL — or 2 scents you like.", "duration_seconds": 15, "display_type": "text"},
    {"step": 6, "instruction": "Name 1 thing you can TASTE — or 1 flavor you enjoy.", "duration_seconds": 10, "display_type": "text"},
    {"step": 7, "instruction": "Take another slow breath. You are here. You are safe.", "duration_seconds": 10, "display_type": "text"}
  ]',
  6, 10, ARRAY['dissociation', 'panic', 'grounding', 'crisis']
),

(
  'Cold Water Grounding',
  'grounding',
  'easy',
  2,
  'Temperature shift rapidly activates your nervous system''s dive reflex, slowing heart rate almost instantly.',
  '[
    {"step": 1, "instruction": "Go to a sink or get a glass of cold water.", "duration_seconds": 10, "display_type": "text"},
    {"step": 2, "instruction": "Hold your wrists under cold water for 30 seconds. Focus entirely on the sensation.", "duration_seconds": 30, "display_type": "timer", "animation": "hold"},
    {"step": 3, "instruction": "Or splash cold water on your face 3 times.", "duration_seconds": 15, "display_type": "text"},
    {"step": 4, "instruction": "Take a slow breath. Notice your heart rate and tension have shifted.", "duration_seconds": 10, "display_type": "text"}
  ]',
  7, 10, ARRAY['panic', 'crisis', 'fast', 'physical']
),

-- COGNITIVE REFRAMING
(
  'Thought Defusion',
  'cognitive_reframe',
  'medium',
  7,
  'Create distance from distressing thoughts by observing them as passing events, not facts.',
  '[
    {"step": 1, "instruction": "Identify the thought that is causing you distress. Write it down or say it aloud.", "duration_seconds": 30, "display_type": "text"},
    {"step": 2, "instruction": "Now say: \"I am having the thought that...\" followed by the thought. Notice the subtle shift in how it feels.", "duration_seconds": 20, "display_type": "text"},
    {"step": 3, "instruction": "Now say: \"I notice I am having the thought that...\" Adding this layer creates even more distance.", "duration_seconds": 20, "display_type": "text"},
    {"step": 4, "instruction": "Imagine the thought written on a leaf floating down a river. Watch it drift away without chasing it.", "duration_seconds": 30, "display_type": "text"},
    {"step": 5, "instruction": "Take a breath. The thought is not you. It is just weather passing through your mind.", "duration_seconds": 15, "display_type": "text"}
  ]',
  3, 7, ARRAY['rumination', 'worry', 'anxiety', 'cbt']
),

(
  'What Evidence Do I Have?',
  'cognitive_reframe',
  'medium',
  8,
  'Challenge negative automatic thoughts by examining the actual evidence for and against them.',
  '[
    {"step": 1, "instruction": "Write down the distressing thought. Be specific. (e.g. \"I am a failure\")", "duration_seconds": 30, "display_type": "text"},
    {"step": 2, "instruction": "List every piece of evidence that supports this thought being 100% true.", "duration_seconds": 60, "display_type": "text"},
    {"step": 3, "instruction": "Now list every piece of evidence AGAINST it. What would a fair witness say?", "duration_seconds": 60, "display_type": "text"},
    {"step": 4, "instruction": "Write a more balanced version of the thought that accounts for all the evidence.", "duration_seconds": 30, "display_type": "text"},
    {"step": 5, "instruction": "Read your balanced thought aloud. How does it feel compared to the original?", "duration_seconds": 15, "display_type": "text"}
  ]',
  2, 6, ARRAY['depression', 'self-esteem', 'cbt', 'journaling']
),

-- BODY SCAN
(
  'Progressive Muscle Relaxation',
  'body_scan',
  'medium',
  10,
  'Systematically tense and release muscle groups to release physical tension stored from stress.',
  '[
    {"step": 1, "instruction": "Lie down or sit comfortably. Close your eyes if comfortable.", "duration_seconds": 10, "display_type": "text"},
    {"step": 2, "instruction": "Feet: Curl your toes tightly for 5 seconds, then release completely.", "duration_seconds": 10, "display_type": "timer", "animation": "hold"},
    {"step": 3, "instruction": "Feel the difference between tension and relaxation in your feet.", "duration_seconds": 8, "display_type": "timer", "animation": "expand"},
    {"step": 4, "instruction": "Calves: Flex your calf muscles for 5 seconds, then release.", "duration_seconds": 10, "display_type": "timer", "animation": "hold"},
    {"step": 5, "instruction": "Thighs: Squeeze tightly for 5 seconds, then release.", "duration_seconds": 10, "display_type": "timer", "animation": "hold"},
    {"step": 6, "instruction": "Stomach: Suck in and tighten your core for 5 seconds, then release.", "duration_seconds": 10, "display_type": "timer", "animation": "hold"},
    {"step": 7, "instruction": "Shoulders: Shrug up to your ears for 5 seconds, then drop and release.", "duration_seconds": 10, "display_type": "timer", "animation": "hold"},
    {"step": 8, "instruction": "Face: Scrunch all your facial muscles for 5 seconds, then release.", "duration_seconds": 10, "display_type": "timer", "animation": "hold"},
    {"step": 9, "instruction": "Take a full breath. Your body is now soft. Rest here for a moment.", "duration_seconds": 15, "display_type": "text"}
  ]',
  5, 9, ARRAY['tension', 'stress', 'anxiety', 'body']
),

(
  'Body Scan Meditation',
  'body_scan',
  'easy',
  8,
  'Move your awareness slowly through each part of your body, noticing without judgment.',
  '[
    {"step": 1, "instruction": "Find a comfortable position. Close your eyes. Take three slow breaths.", "duration_seconds": 20, "display_type": "text"},
    {"step": 2, "instruction": "Bring your attention to the top of your head. Just notice any sensations — warmth, tingling, tightness. No need to change anything.", "duration_seconds": 20, "display_type": "text"},
    {"step": 3, "instruction": "Move awareness to your face, jaw, neck. If you notice tension, breathe into it.", "duration_seconds": 20, "display_type": "text"},
    {"step": 4, "instruction": "Move to your shoulders, arms, hands. Notice weight, temperature, contact with surfaces.", "duration_seconds": 20, "display_type": "text"},
    {"step": 5, "instruction": "Move to your chest and belly. Feel the rise and fall of each breath.", "duration_seconds": 20, "display_type": "text"},
    {"step": 6, "instruction": "Move to your lower back, hips, thighs, knees.", "duration_seconds": 20, "display_type": "text"},
    {"step": 7, "instruction": "Move to your calves, feet, toes. Feel the ground beneath you.", "duration_seconds": 20, "display_type": "text"},
    {"step": 8, "instruction": "Now expand your awareness to your entire body at once. You are whole. You are here.", "duration_seconds": 15, "display_type": "text"}
  ]',
  3, 8, ARRAY['mindfulness', 'body', 'anxiety', 'sleep']
),

-- JOURNALING PROMPTS
(
  'Three Good Things',
  'journaling_prompt',
  'easy',
  5,
  'Research shows writing three positive events each day significantly increases wellbeing over time.',
  '[
    {"step": 1, "instruction": "Think of three things that went well today — any size. A kind word, coffee that tasted good, a moment of quiet.", "duration_seconds": 10, "display_type": "text"},
    {"step": 2, "instruction": "Write the first good thing. Then write WHY it happened — what role did you play?", "duration_seconds": 60, "display_type": "text"},
    {"step": 3, "instruction": "Write the second good thing and why it happened.", "duration_seconds": 60, "display_type": "text"},
    {"step": 4, "instruction": "Write the third good thing and why it happened.", "duration_seconds": 60, "display_type": "text"},
    {"step": 5, "instruction": "Read what you wrote. These were real. They happened. That matters.", "duration_seconds": 10, "display_type": "text"}
  ]',
  1, 5, ARRAY['gratitude', 'depression', 'positivity', 'daily']
),

(
  'Emotion Name & Tame',
  'journaling_prompt',
  'easy',
  6,
  'Labeling emotions reduces their intensity by engaging the prefrontal cortex. Name it to tame it.',
  '[
    {"step": 1, "instruction": "What are you feeling right now? Try to name it precisely — not just \"bad\" but: anxious, hollow, heavy, restless, numb, ashamed?", "duration_seconds": 30, "display_type": "text"},
    {"step": 2, "instruction": "Where do you feel it in your body? Chest? Throat? Stomach? Describe the physical sensation.", "duration_seconds": 30, "display_type": "text"},
    {"step": 3, "instruction": "What triggered this feeling? Was it a thought, an event, a memory?", "duration_seconds": 30, "display_type": "text"},
    {"step": 4, "instruction": "What does this feeling need from you right now? Rest? Validation? Movement? Company?", "duration_seconds": 30, "display_type": "text"},
    {"step": 5, "instruction": "Write one thing — small and doable — you could do in the next hour that honors what this feeling needs.", "duration_seconds": 30, "display_type": "text"}
  ]',
  2, 7, ARRAY['emotional-regulation', 'self-awareness', 'processing']
),

-- DISTRACTION
(
  'Counting Backwards',
  'distraction',
  'easy',
  2,
  'Engaging your working memory with a mild cognitive task interrupts the rumination cycle immediately.',
  '[
    {"step": 1, "instruction": "Take one breath in and out.", "duration_seconds": 5, "display_type": "text"},
    {"step": 2, "instruction": "Count backwards from 300 by 7s out loud or in your head: 300, 293, 286...", "duration_seconds": 60, "display_type": "text"},
    {"step": 3, "instruction": "If you lose count, just start from a different number. The point is the focus.", "duration_seconds": 5, "display_type": "text"},
    {"step": 4, "instruction": "Continue for one full minute. You just gave your nervous system a break.", "duration_seconds": 60, "display_type": "text"}
  ]',
  7, 10, ARRAY['distraction', 'crisis', 'quick', 'rumination']
),

(
  'Cold Water Face Dive',
  'distraction',
  'easy',
  1,
  'The mammalian dive reflex: cold water on your face triggers an immediate parasympathetic response in seconds.',
  '[
    {"step": 1, "instruction": "Fill a bowl or sink with cold water (add ice if available).", "duration_seconds": 15, "display_type": "text"},
    {"step": 2, "instruction": "Take a breath. Hold it. Dip your face into the cold water for 30 seconds.", "duration_seconds": 30, "display_type": "timer", "animation": "hold"},
    {"step": 3, "instruction": "Come up. Take a breath. Notice your heart rate has slowed. This is biology — not magic.", "duration_seconds": 10, "display_type": "text"},
    {"step": 4, "instruction": "If you can''t dip your face, hold a bag of ice over your eyes and cheeks.", "duration_seconds": 10, "display_type": "text"}
  ]',
  8, 10, ARRAY['crisis', 'panic', 'fast', 'physical', 'distraction']
),

(
  'Safe Place Visualization',
  'grounding',
  'easy',
  6,
  'Create a vivid mental retreat you can visit any time to find calm and safety.',
  '[
    {"step": 1, "instruction": "Close your eyes. Take three slow breaths.", "duration_seconds": 15, "display_type": "text"},
    {"step": 2, "instruction": "Imagine a place where you feel completely safe and at peace. Real or imaginary — your childhood bedroom, a beach, a forest, outer space.", "duration_seconds": 20, "display_type": "text"},
    {"step": 3, "instruction": "What do you SEE? Look around this place in detail — colors, light, shapes.", "duration_seconds": 20, "display_type": "text"},
    {"step": 4, "instruction": "What do you HEAR? Water? Wind? Silence? Music? Birds?", "duration_seconds": 15, "display_type": "text"},
    {"step": 5, "instruction": "What do you FEEL? Temperature, textures, ground under your feet?", "duration_seconds": 15, "display_type": "text"},
    {"step": 6, "instruction": "Spend a moment just being here. You can return to this place whenever you need it.", "duration_seconds": 30, "display_type": "text"},
    {"step": 7, "instruction": "Gently bring yourself back. Open your eyes slowly.", "duration_seconds": 10, "display_type": "text"}
  ]',
  3, 8, ARRAY['visualization', 'anxiety', 'safety', 'mindfulness']
);
