create table if not exists  sales_managers (
    id serial primary key not null,
    name varchar(250) not null,
    languages varchar(100)[],
    products varchar(100)[],
    customer_ratings varchar(100)[]
);

create table if not exists slots (
    id serial primary key not null,
    start_date timestamptz not null,
    end_date timestamptz not null,
    booked boolean not null default false,
    sales_manager_id int not null references sales_managers(Id)
);

-- Insert initial sample data
insert into sales_managers (name, languages, products, customer_ratings) values ('Seller 1', '{"German"}', '{"SolarPanels"}', '{"Bronze"}');
insert into sales_managers (name, languages, products, customer_ratings) values ('Seller 2', '{"German", "English"}', '{"SolarPanels", "Heatpumps"}', '{"Gold","Silver","Bronze"}');
insert into sales_managers (name, languages, products, customer_ratings) values ('Seller 3', '{"German", "English"}', '{"Heatpumps"}', '{"Gold","Silver","Bronze"}');

insert into slots (sales_manager_id, booked, start_date, end_date) values (1, false, '2024-05-03T10:30Z', '2024-05-03T11:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (1, true,  '2024-05-03T11:00Z', '2024-05-03T12:00Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (1, false, '2024-05-03T11:30Z', '2024-05-03T12:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (2, false, '2024-05-03T10:30Z', '2024-05-03T11:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (2, false, '2024-05-03T11:00Z', '2024-05-03T12:00Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (2, false, '2024-05-03T11:30Z', '2024-05-03T12:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (3, true,  '2024-05-03T10:30Z', '2024-05-03T11:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (3, false, '2024-05-03T11:00Z', '2024-05-03T12:00Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (3, false, '2024-05-03T11:30Z', '2024-05-03T12:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (1, false, '2024-05-04T10:30Z', '2024-05-04T11:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (1, false, '2024-05-04T11:00Z', '2024-05-04T12:00Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (1, true,  '2024-05-04T11:30Z', '2024-05-04T12:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (2, true,  '2024-05-04T10:30Z', '2024-05-04T11:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (2, false, '2024-05-04T11:00Z', '2024-05-04T12:00Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (2, true,  '2024-05-04T11:30Z', '2024-05-04T12:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (3, true,  '2024-05-04T10:30Z', '2024-05-04T11:30Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (3, false, '2024-05-04T11:00Z', '2024-05-04T12:00Z');
insert into slots (sales_manager_id, booked, start_date, end_date) values (3, false, '2024-05-04T11:30Z', '2024-05-04T12:30Z');


--------------------------------------------------
-- Generate large dataset for appointment booking challenge
--------------------------------------------------

-- NOTE:
-- Generating 200,000 sales_managers and ensuring at least 3 slots each implies at least 600,000 slots.
-- If you need exactly 500,000 slots, you would need to relax the "at least 3 per manager" requirement.

-- Insert additional 200,000 sales_managers.
-- (Assuming the first 3 sample rows remain, so we start from 4)
insert into sales_managers (name, languages, products, customer_ratings)
SELECT
    'Seller ' || gs,
    -- Example: randomly choose languages and products (you can customize these arrays as needed)
    ARRAY['German', 'English'],
    ARRAY['SolarPanels', 'Heatpumps'],
    ARRAY['Gold', 'Silver', 'Bronze']
FROM generate_series(4, 200000 + 3) as gs;

-- Insert 3 slots for each sales manager.
-- For each slot we generate a random start time based on a base date and then add 1 hour for the end_date.
-- Here we use a lateral join to compute a random start time for each slot with much more variation.
INSERT INTO slots (sales_manager_id, booked, start_date, end_date)
SELECT
    sm.id,
    (random() < 0.5) AS booked,
    sd.start_date,
    sd.start_date + INTERVAL '1 hour' AS end_date
FROM sales_managers sm,
     generate_series(1, 3) AS gs,
     LATERAL (
         SELECT TIMESTAMP '2024-01-01 00:00:00'
                    -- Spread across 6 months (180 days)
                    + ((FLOOR(random() * 180) + (sm.id % 30) + gs) || ' days')::INTERVAL
                    -- Full day coverage (0-23 hours)
                    + ((FLOOR(random() * 24)) || ' hours')::INTERVAL
                    -- Add minute variation (0-55 minutes, in 5-minute increments)
                    + ((FLOOR(random() * 12) * 5) || ' minutes')::INTERVAL AS start_date
         ) sd;

