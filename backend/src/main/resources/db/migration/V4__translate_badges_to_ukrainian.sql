-- Translate badges to Ukrainian
UPDATE badges SET name = 'Перший крок', description = 'Завершив першу робочу сесію' WHERE key = 'first_session';
UPDATE badges SET name = 'У розпалі', description = 'Працював 3 дні поспіль' WHERE key = 'streak_3';
UPDATE badges SET name = 'Воїн тижня', description = 'Працював 7 днів поспіль' WHERE key = 'streak_7';
UPDATE badges SET name = 'Залізна бджола', description = 'Працював 30 днів поспіль' WHERE key = 'streak_30';
UPDATE badges SET name = 'Марафон', description = 'Накопив 4+ години роботи за один день' WHERE key = 'marathon';
UPDATE badges SET name = 'Клуб століття', description = 'Завершив 100 сесій Pomodoro всього' WHERE key = 'century';
UPDATE badges SET name = 'Соціальна бджола', description = 'Приєднався до 10 різних кімнат' WHERE key = 'social_10';
UPDATE badges SET name = 'Ранньостартуючий', description = 'Почав сесію до 7:00 ранку' WHERE key = 'early_bird';
