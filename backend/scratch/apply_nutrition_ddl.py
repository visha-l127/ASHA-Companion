import cx_Oracle

try:
    conn = cx_Oracle.connect('ASHA/ASHA@localhost:1521/XE')
    cursor = conn.cursor()
    print('Connected to Oracle database ASHA/ASHA@localhost:1521/XE')
    
    # Check if column already exists
    cursor.execute("SELECT column_name, data_type, data_precision, data_scale, nullable, data_default FROM user_tab_columns WHERE table_name = 'NUTRITION_RECORDS' AND column_name = 'ACTIVE'")
    existing = cursor.fetchone()
    
    if existing:
        print('Column ACTIVE already exists:', existing)
    else:
        print('Applying DDL: ALTER TABLE nutrition_records ADD active NUMBER(10,0) DEFAULT 1 NOT NULL')
        cursor.execute('ALTER TABLE nutrition_records ADD active NUMBER(10,0) DEFAULT 1 NOT NULL')
        conn.commit()
        print('DDL executed successfully!')

    # 1. Query user_tab_columns
    cursor.execute("SELECT column_name, data_type, data_precision, data_scale, nullable, data_default FROM user_tab_columns WHERE table_name = 'NUTRITION_RECORDS' AND column_name = 'ACTIVE'")
    col_info = cursor.fetchone()
    print('COLUMN VERIFICATION RESULT:')
    print(f'  Column Name:   {col_info[0]}')
    print(f'  Data Type:     {col_info[1]}')
    print(f'  Precision:     {col_info[2]}')
    print(f'  Scale:         {col_info[3]}')
    print(f'  Nullable:      {col_info[4]}')
    print(f'  Data Default:  {col_info[5]}')

    # 2. Query row counts
    cursor.execute('SELECT COUNT(*), COUNT(CASE WHEN active = 1 THEN 1 END), COUNT(CASE WHEN active != 1 OR active IS NULL THEN 1 END) FROM nutrition_records')
    total, active_1, active_other = cursor.fetchone()
    print('ROW VERIFICATION RESULT:')
    print(f'  Total Rows:    {total}')
    print(f'  Active = 1:    {active_1}')
    print(f'  Other/Null:    {active_other}')

    cursor.close()
    conn.close()
except Exception as e:
    print('Error:', e)
