-- Sample data for EventEase development and testing

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@eventeasy.com', '$2b$10$example_hash_admin', 'Admin', 'User', 'admin'),
('staff@eventeasy.com', '$2b$10$example_hash_staff', 'Staff', 'Member', 'staff'),
('owner@eventeasy.com', '$2b$10$example_hash_owner', 'Event', 'Owner', 'event_owner')
ON CONFLICT (email) DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, event_date, end_date, location, max_attendees, is_public, status, created_by) VALUES
(
    'Annual Company Retreat 2024',
    'Join us for our annual company retreat featuring team building activities, workshops, and networking opportunities.',
    '2024-06-15 09:00:00+00',
    '2024-06-15 17:00:00+00',
    'Mountain View Conference Center, CA',
    150,
    false,
    'published',
    (SELECT id FROM users WHERE email = 'owner@eventeasy.com' LIMIT 1)
),
(
    'Tech Innovation Summit',
    'Explore the latest trends in technology and innovation with industry leaders and experts.',
    '2024-07-20 10:00:00+00',
    '2024-07-20 18:00:00+00',
    'Downtown Convention Center, SF',
    500,
    true,
    'published',
    (SELECT id FROM users WHERE email = 'owner@eventeasy.com' LIMIT 1)
),
(
    'Community Fundraising Gala',
    'An elegant evening supporting local community initiatives and charitable causes.',
    '2024-08-10 19:00:00+00',
    '2024-08-10 23:00:00+00',
    'Grand Ballroom, City Hotel',
    200,
    true,
    'draft',
    (SELECT id FROM users WHERE email = 'owner@eventeasy.com' LIMIT 1)
);

-- Insert sample RSVPs
INSERT INTO rsvps (event_id, attendee_name, attendee_email, status, notes) VALUES
(
    (SELECT id FROM events WHERE title = 'Tech Innovation Summit' LIMIT 1),
    'John Doe',
    'john.doe@email.com',
    'confirmed',
    'Looking forward to the keynote!'
),
(
    (SELECT id FROM events WHERE title = 'Tech Innovation Summit' LIMIT 1),
    'Jane Smith',
    'jane.smith@email.com',
    'confirmed',
    'Interested in the AI workshop'
),
(
    (SELECT id FROM events WHERE title = 'Community Fundraising Gala' LIMIT 1),
    'Michael Johnson',
    'michael.j@email.com',
    'pending',
    'Will confirm by next week'
);

-- Assign staff to events
INSERT INTO event_staff (event_id, user_id, role) VALUES
(
    (SELECT id FROM events WHERE title = 'Annual Company Retreat 2024' LIMIT 1),
    (SELECT id FROM users WHERE email = 'staff@eventeasy.com' LIMIT 1),
    'Event Coordinator'
),
(
    (SELECT id FROM events WHERE title = 'Tech Innovation Summit' LIMIT 1),
    (SELECT id FROM users WHERE email = 'staff@eventeasy.com' LIMIT 1),
    'Registration Manager'
);
