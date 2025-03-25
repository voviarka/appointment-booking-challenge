create table if not exists sales_managers (
    id serial primary key not null,
    name varchar(250) not null
);

-- New normalized tables for the previously array fields
create table if not exists languages (
    id serial primary key not null,
    name varchar(100) not null unique
);

create table if not exists products (
    id serial primary key not null,
    name varchar(100) not null unique
);

create table if not exists customer_ratings (
    id serial primary key not null,
    name varchar(100) not null unique
);

-- Junction tables for many-to-many relationships
create table if not exists sales_manager_languages (
    sales_manager_id int not null references sales_managers(id),
    language_id int not null references languages(id),
    primary key (sales_manager_id, language_id)
);

create table if not exists sales_manager_products (
    sales_manager_id int not null references sales_managers(id),
    product_id int not null references products(id),
    primary key (sales_manager_id, product_id)
);

create table if not exists sales_manager_customer_ratings (
    sales_manager_id int not null references sales_managers(id),
    customer_rating_id int not null references customer_ratings(id),
    primary key (sales_manager_id, customer_rating_id)
);

create table if not exists slots (
    id serial primary key not null,
    start_date timestamptz not null,
    end_date timestamptz not null,
    booked boolean not null default false,
    sales_manager_id int not null references sales_managers(Id)
);

-- Insert initial lookup data
insert into languages (name) values ('German'), ('English');
insert into products (name) values ('SolarPanels'), ('Heatpumps');
insert into customer_ratings (name) values ('Bronze'), ('Silver'), ('Gold');

-- Insert initial sample data for sales managers
insert into sales_managers (name) values ('Seller 1'), ('Seller 2'), ('Seller 3');

-- Mapping sales managers to languages
insert into sales_manager_languages (sales_manager_id, language_id) 
values (1, (select id from languages where name = 'German'));

insert into sales_manager_languages (sales_manager_id, language_id) 
values 
    (2, (select id from languages where name = 'German')),
    (2, (select id from languages where name = 'English')),
    (3, (select id from languages where name = 'German')),
    (3, (select id from languages where name = 'English'));

-- Mapping sales managers to products
insert into sales_manager_products (sales_manager_id, product_id) 
values 
    (1, (select id from products where name = 'SolarPanels')),
    (2, (select id from products where name = 'SolarPanels')),
    (2, (select id from products where name = 'Heatpumps')),
    (3, (select id from products where name = 'Heatpumps'));

-- Mapping sales managers to customer ratings
insert into sales_manager_customer_ratings (sales_manager_id, customer_rating_id) 
values 
    (1, (select id from customer_ratings where name = 'Bronze')),
    (2, (select id from customer_ratings where name = 'Gold')),
    (2, (select id from customer_ratings where name = 'Silver')),
    (2, (select id from customer_ratings where name = 'Bronze')),
    (3, (select id from customer_ratings where name = 'Gold')),
    (3, (select id from customer_ratings where name = 'Silver')),
    (3, (select id from customer_ratings where name = 'Bronze'));

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

-- Insert additional sales_managers (starting from ID 4)
insert into sales_managers (name)
SELECT 'Seller ' || gs
FROM generate_series(4, 200000 + 3) as gs;

-- Assign languages to all sales managers (ensuring each has at least one language)
WITH lang_assignments AS (
  SELECT 
    sm.id as sales_manager_id,
    l.id as language_id,
    -- Distribute languages somewhat randomly but ensure variety
    (sm.id % 3) + 1 as assignment_pattern
  FROM sales_managers sm
  CROSS JOIN languages l
  WHERE sm.id > 3
)
INSERT INTO sales_manager_languages (sales_manager_id, language_id)
SELECT 
  sales_manager_id,
  language_id
FROM lang_assignments la
WHERE 
  -- Different patterns to ensure varied assignments
  (la.assignment_pattern = 1 AND la.language_id = 1) OR
  (la.assignment_pattern = 2 AND la.language_id = 2) OR
  (la.assignment_pattern = 3);

-- Assign products to all sales managers (ensuring each has at least one product)
WITH product_assignments AS (
  SELECT 
    sm.id as sales_manager_id,
    p.id as product_id,
    -- Distribute products somewhat randomly but ensure variety
    (sm.id % 3) + 1 as assignment_pattern
  FROM sales_managers sm
  CROSS JOIN products p
  WHERE sm.id > 3
)
INSERT INTO sales_manager_products (sales_manager_id, product_id)
SELECT 
  sales_manager_id,
  product_id
FROM product_assignments pa
WHERE 
  -- Different patterns to ensure varied assignments
  (pa.assignment_pattern = 1 AND pa.product_id = 1) OR
  (pa.assignment_pattern = 2 AND pa.product_id = 2) OR
  (pa.assignment_pattern = 3);

-- Assign customer ratings to all sales managers
WITH rating_assignments AS (
  SELECT 
    sm.id as sales_manager_id,
    cr.id as rating_id,
    -- Distribute ratings somewhat randomly but ensure variety
    (sm.id % 3) + 1 as assignment_pattern
  FROM sales_managers sm
  CROSS JOIN customer_ratings cr
  WHERE sm.id > 3
)
INSERT INTO sales_manager_customer_ratings (sales_manager_id, customer_rating_id)
SELECT 
  sales_manager_id,
  rating_id
FROM rating_assignments ra
WHERE 
  -- Different patterns to ensure varied assignments
  (ra.assignment_pattern = 1 AND ra.rating_id = 1) OR
  (ra.assignment_pattern = 2 AND ra.rating_id = 2) OR
  (ra.assignment_pattern = 3);

-- Insert 3 slots for each sales manager
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

