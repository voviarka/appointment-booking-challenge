CREATE INDEX idx_slots_start_end_date ON slots(start_date, end_date);
CREATE INDEX idx_slots_booked_sales_manager_time ON slots (sales_manager_id, booked, start_date, end_date);