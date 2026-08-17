import urllib.request, json, time

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

ts = int(time.time())

# 1. Login as PHC Supervisor (vedava)
_, sup_res = login('vedava', 'Vedava@123')
sup_tok = sup_res['token']
print('=== SUPERVISOR LOGGED IN ===')

# Create ASHA worker
asha_user = f'asha_test_{ts}'
temp_pass = 'TempPass@123'
s_asha, res_asha = make_req('http://localhost:8081/users', 'POST', {'name': 'Anita Devi Test', 'username': asha_user, 'password': temp_pass, 'role': 'ASHA'}, sup_tok)
print('ASHA worker created:', s_asha, res_asha)

# Log in ASHA worker with temp password
s_al1, asha_l1 = login(asha_user, temp_pass)
print('ASHA logged in with temp pass:', s_al1, asha_l1)
asha_tok = asha_l1['token']

# Change password
new_pass = 'AnitaNewPass@999'
s_ch, res_ch = make_req('http://localhost:8081/auth/change-password', 'POST', {'newPassword': new_pass}, asha_tok)
print('Change password result:', s_ch, res_ch)

# Log in again with NEW password
s_al2, asha_l2 = login(asha_user, new_pass)
print('ASHA logged in with new password:', s_al2, asha_l2)
