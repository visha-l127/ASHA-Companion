import urllib.request, json

def login(u, p):
    try:
        req = urllib.request.Request('http://localhost:8081/auth/login', data=json.dumps({'username': u, 'password': p}).encode(), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

users = [
    ('admin', 'Admin@123'),
    ('vedava', 'Vedava@123'),
    ('anita.devi', 'Anita@123'),
    ('arjun', 'Pharmacist@123'),
]

for u, p in users:
    status, res = login(u, p)
    print(f'User: {u} | Status: {status}')

status, admin_res = login('admin', 'Admin@123')
if status == 200:
    token = admin_res['token']
    req = urllib.request.Request('http://localhost:8081/users', headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req) as res:
        all_users = json.loads(res.read().decode())
        print('\n--- ALL REGISTERED USERS IN BACKEND DB ---')
        for usr in all_users:
            print(f"ID: {usr.get('id')} | Username: {usr.get('username')} | Name: {usr.get('name')} | Role: {usr.get('role')} | PHC: {usr.get('phcId')}")
