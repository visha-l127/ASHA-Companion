ALTER TABLE nutrition_records ADD active NUMBER(10,0) DEFAULT 1 NOT NULL;
COMMIT;

COLUMN COLUMN_NAME FORMAT A20
COLUMN DATA_TYPE FORMAT A15
COLUMN DATA_DEFAULT FORMAT A20
COLUMN NULLABLE FORMAT A10

SELECT column_name, data_type, data_precision, data_scale, nullable, data_default 
FROM user_tab_columns 
WHERE table_name = 'NUTRITION_RECORDS' AND column_name = 'ACTIVE';

SELECT COUNT(*) as total_rows, 
       COUNT(CASE WHEN active = 1 THEN 1 END) as active_1, 
       COUNT(CASE WHEN active != 1 OR active IS NULL THEN 1 END) as other 
FROM nutrition_records;

EXIT;
