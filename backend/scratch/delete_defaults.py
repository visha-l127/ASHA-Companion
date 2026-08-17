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

def make_req(url, method, body, token):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode()) if res.status != 204 else {}
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

# 1. Login as admin
_, admin_res = login('admin', 'Admin@123')
token = admin_res['token']

# 2. Fetch all users
_, all_users = make_req('http://localhost:8081/users', 'GET', None, token)

# 3. Find and delete users: Sunita Kumari (sunita) and Arjun Menon (arjun)
# Since admin might not be able to delete pharmacists directly (or can they?), wait:
# Let's check UserController.java:
# "ADMIN can delete PHC_SUPERVISOR accounts only"
# "PHC_SUPERVISOR can delete ASHA workers and PHARMACIST accounts belonging to their assigned PHC only"
# So we need to log in as Supervisor 'vedava' to delete ASHA and PHARMACIST!
_, sup_res = login('vedava', 'Vedava@123')
sup_tok = sup_res['token']

for usr in all_users:
    username = usr.get('username', '').lower()
    name = usr.get('name', '').lower()
    role = usr.get('role', '')
    user_id = usr.get('id')
    
    if username in ('sunita', 'arjun') or 'sunita' in name or 'arjun menon' in name:
        print(f'Attempting to delete user: {usr}')
        status, _ = make_req(f'http://localhost:8081/users/{user_id}', 'DELETE', None, sup_tok)
        print(f'Delete status for user {user_id}: {status}')
