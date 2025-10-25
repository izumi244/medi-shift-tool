-- supabase/seed.sql
-- 配置場所の初期データのみ (60件 - 正しいデータ)

-- 月曜日 AM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000001-0001-0001-0001-000000000001', 'D', 'クリニック棟', 'AM', 'monday', 1, 1, 'PM、CF不可', true),
('00000001-0001-0001-0001-000000000002', '処', 'クリニック棟', 'AM', 'monday', 3, 2, NULL, true),
('00000001-0001-0001-0001-000000000003', 'CF外', 'クリニック棟', 'AM', 'monday', 1, 3, NULL, true),
('00000001-0001-0001-0001-000000000004', 'CF中', 'クリニック棟', 'AM', 'monday', 1, 4, NULL, true);

-- 月曜日 AM - 健診棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000001-0001-0001-0001-000000000005', 'CF洗浄', '健診棟', 'AM', 'monday', 1, 1, 'AM健診棟の看護助手さんが行う', true),
('00000001-0001-0001-0001-000000000006', '健診G', '健診棟', 'AM', 'monday', 2, 2, NULL, true),
('00000001-0001-0001-0001-000000000007', '健診', '健診棟', 'AM', 'monday', 4, 3, '最低3人', true);

-- 月曜日 PM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000001-0001-0001-0001-000000000008', 'D', 'クリニック棟', 'PM', 'monday', 1, 1, 'AM、CF不可', true),
('00000001-0001-0001-0001-000000000009', '処', 'クリニック棟', 'PM', 'monday', 3, 2, NULL, true),
('00000001-0001-0001-0001-000000000010', 'CF', 'クリニック棟', 'PM', 'monday', 1, 3, NULL, true);

-- 火曜日 AM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000002-0002-0002-0002-000000000001', 'D', 'クリニック棟', 'AM', 'tuesday', 1, 1, 'PM、CF不可', true),
('00000002-0002-0002-0002-000000000002', '処', 'クリニック棟', 'AM', 'tuesday', 3, 2, NULL, true),
('00000002-0002-0002-0002-000000000003', 'CF外', 'クリニック棟', 'AM', 'tuesday', 1, 3, NULL, true),
('00000002-0002-0002-0002-000000000004', 'CF中', 'クリニック棟', 'AM', 'tuesday', 1, 4, NULL, true);

-- 火曜日 AM - 健診棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000002-0002-0002-0002-000000000005', 'CF洗浄', '健診棟', 'AM', 'tuesday', 1, 1, 'AM健診棟の看護助手さんが行う', true),
('00000002-0002-0002-0002-000000000006', '健診G', '健診棟', 'AM', 'tuesday', 2, 2, NULL, true),
('00000002-0002-0002-0002-000000000007', '健診', '健診棟', 'AM', 'tuesday', 4, 3, '最低3人', true);

-- 火曜日 PM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000002-0002-0002-0002-000000000008', 'D', 'クリニック棟', 'PM', 'tuesday', 1, 1, 'AM、CF不可', true),
('00000002-0002-0002-0002-000000000009', '処', 'クリニック棟', 'PM', 'tuesday', 3, 2, NULL, true),
('00000002-0002-0002-0002-000000000010', 'CF', 'クリニック棟', 'PM', 'tuesday', 1, 3, NULL, true);

-- 水曜日 AM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000003-0003-0003-0003-000000000001', 'D', 'クリニック棟', 'AM', 'wednesday', 1, 1, 'PM、CF不可', true),
('00000003-0003-0003-0003-000000000002', '処', 'クリニック棟', 'AM', 'wednesday', 3, 2, NULL, true),
('00000003-0003-0003-0003-000000000003', 'CF外', 'クリニック棟', 'AM', 'wednesday', 1, 3, NULL, true),
('00000003-0003-0003-0003-000000000004', 'CF中', 'クリニック棟', 'AM', 'wednesday', 1, 4, NULL, true);

-- 水曜日 AM - 健診棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000003-0003-0003-0003-000000000005', 'CF洗浄', '健診棟', 'AM', 'wednesday', 1, 1, 'AM健診棟の看護助手さんが行う', true),
('00000003-0003-0003-0003-000000000006', '健診G', '健診棟', 'AM', 'wednesday', 2, 2, NULL, true),
('00000003-0003-0003-0003-000000000007', '健診', '健診棟', 'AM', 'wednesday', 4, 3, '最低3人', true);

-- 水曜日 PM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000003-0003-0003-0003-000000000008', 'D', 'クリニック棟', 'PM', 'wednesday', 1, 1, 'AM、CF不可', true),
('00000003-0003-0003-0003-000000000009', '処', 'クリニック棟', 'PM', 'wednesday', 3, 2, NULL, true),
('00000003-0003-0003-0003-000000000010', 'CF', 'クリニック棟', 'PM', 'wednesday', 1, 3, NULL, true);

-- 木曜日 AM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000004-0004-0004-0004-000000000001', 'D', 'クリニック棟', 'AM', 'thursday', 1, 1, 'PM、CF不可', true),
('00000004-0004-0004-0004-000000000002', '処', 'クリニック棟', 'AM', 'thursday', 3, 2, NULL, true),
('00000004-0004-0004-0004-000000000003', 'CF外', 'クリニック棟', 'AM', 'thursday', 1, 3, NULL, true),
('00000004-0004-0004-0004-000000000004', 'CF中', 'クリニック棟', 'AM', 'thursday', 1, 4, NULL, true);

-- 木曜日 AM - 健診棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000004-0004-0004-0004-000000000005', 'CF洗浄', '健診棟', 'AM', 'thursday', 1, 1, 'AM健診棟の看護助手さんが行う', true),
('00000004-0004-0004-0004-000000000006', '健診G', '健診棟', 'AM', 'thursday', 2, 2, NULL, true),
('00000004-0004-0004-0004-000000000007', '健診', '健診棟', 'AM', 'thursday', 4, 3, '最低3人', true);

-- 木曜日 PM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000004-0004-0004-0004-000000000008', 'D', 'クリニック棟', 'PM', 'thursday', 1, 1, 'AM、CF不可', true),
('00000004-0004-0004-0004-000000000009', '処', 'クリニック棟', 'PM', 'thursday', 3, 2, NULL, true),
('00000004-0004-0004-0004-000000000010', 'CF', 'クリニック棟', 'PM', 'thursday', 1, 3, NULL, true);

-- 金曜日 AM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000005-0005-0005-0005-000000000001', 'D', 'クリニック棟', 'AM', 'friday', 1, 1, 'PM、CF不可', true),
('00000005-0005-0005-0005-000000000002', '処', 'クリニック棟', 'AM', 'friday', 3, 2, NULL, true),
('00000005-0005-0005-0005-000000000003', 'CF外', 'クリニック棟', 'AM', 'friday', 1, 3, NULL, true),
('00000005-0005-0005-0005-000000000004', 'CF中', 'クリニック棟', 'AM', 'friday', 1, 4, NULL, true);

-- 金曜日 AM - 健診棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000005-0005-0005-0005-000000000005', 'CF洗浄', '健診棟', 'AM', 'friday', 1, 1, 'AM健診棟の看護助手さんが行う', true),
('00000005-0005-0005-0005-000000000006', '健診G', '健診棟', 'AM', 'friday', 2, 2, NULL, true),
('00000005-0005-0005-0005-000000000007', '健診', '健診棟', 'AM', 'friday', 4, 3, '最低3人', true);

-- 金曜日 PM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000005-0005-0005-0005-000000000008', 'D', 'クリニック棟', 'PM', 'friday', 1, 1, 'AM、CF不可', true),
('00000005-0005-0005-0005-000000000009', '処', 'クリニック棟', 'PM', 'friday', 3, 2, NULL, true),
('00000005-0005-0005-0005-000000000010', 'CF', 'クリニック棟', 'PM', 'friday', 1, 3, NULL, true);

-- 土曜日 AM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000006-0006-0006-0006-000000000001', 'D', 'クリニック棟', 'AM', 'saturday', 1, 1, 'PM、CF不可', true),
('00000006-0006-0006-0006-000000000002', '処', 'クリニック棟', 'AM', 'saturday', 3, 2, NULL, true),
('00000006-0006-0006-0006-000000000003', 'CF外', 'クリニック棟', 'AM', 'saturday', 1, 3, NULL, true),
('00000006-0006-0006-0006-000000000004', 'CF中', 'クリニック棟', 'AM', 'saturday', 1, 4, NULL, true);

-- 土曜日 AM - 健診棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000006-0006-0006-0006-000000000005', 'CF洗浄', '健診棟', 'AM', 'saturday', 1, 1, 'AM健診棟の看護助手さんが行う', true),
('00000006-0006-0006-0006-000000000006', '健診G', '健診棟', 'AM', 'saturday', 2, 2, NULL, true),
('00000006-0006-0006-0006-000000000007', '健診', '健診棟', 'AM', 'saturday', 4, 3, '最低3人', true);

-- 土曜日 PM - クリニック棟
INSERT INTO workplaces (id, name, facility, time_slot, day_of_week, required_count, order_index, remarks, is_active) VALUES
('00000006-0006-0006-0006-000000000008', 'D', 'クリニック棟', 'PM', 'saturday', 1, 1, 'AM、CF不可', true),
('00000006-0006-0006-0006-000000000009', '処', 'クリニック棟', 'PM', 'saturday', 3, 2, NULL, true),
('00000006-0006-0006-0006-000000000010', 'CF', 'クリニック棟', 'PM', 'saturday', 1, 3, NULL, true);
