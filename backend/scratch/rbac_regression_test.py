import urllib.request
import json

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

def run_rbac_test():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE ROLE & REGRESSION VERIFICATION")
    print("=" * 60)

    # 1. Admin Login & CRUD test
    print("TEST Admin login...")
    status, auth = login("admin", "Admin@123")
    print(f"Admin Login: {status}")
    if status == 200:
        token = auth["token"]
        # Admin gets PHC list
        status, phcs = make_req("http://localhost:8081/phcs", "GET", None, token)
        print(f"Admin GET /phcs: {status} (Total PHCs: {len(phcs) if isinstance(phcs, list) else 0})")
        # Admin gets all users
        status, users = make_req("http://localhost:8081/users", "GET", None, token)
        print(f"Admin GET /users: {status} (Total Users: {len(users) if isinstance(users, list) else 0})")

    # 2. Supervisor Login & Access test
    print("\nTEST Supervisor login...")
    status, auth = login("vedava", "Vedava@123")
    print(f"Supervisor Login: {status}")
    if status == 200:
        token = auth["token"]
        # Supervisor gets users
        status, users = make_req("http://localhost:8081/users", "GET", None, token)
        print(f"Supervisor GET /users: {status} (Total Users: {len(users) if isinstance(users, list) else 0})")
        # Supervisor gets patients
        status, patients = make_req("http://localhost:8081/patients", "GET", None, token)
        print(f"Supervisor GET /patients: {status} (Total Patients: {len(patients) if isinstance(patients, list) else 0})")

    # 3. ASHA Login & Access test
    print("\nTEST ASHA login...")
    status, auth = login("anita.devi", "Asha@123")
    print(f"ASHA Login: {status}")
    if status == 200:
        token = auth["token"]
        # ASHA gets patients
        status, patients = make_req("http://localhost:8081/patients", "GET", None, token)
        print(f"ASHA GET /patients: {status} (Total Patients: {len(patients) if isinstance(patients, list) else 0})")
        # ASHA tries to get users (Should be rejected with 403 Forbidden)
        status, users_res = make_req("http://localhost:8081/users", "GET", None, token)
        print(f"ASHA GET /users (RBAC protection check): {status} (Expected 403)")

    # 4. Pharmacist Login & Access test
    print("\nTEST Pharmacist login...")
    
    # We can fetch the user details of mei.pharm first, then update password via POST /users
    status, sup_auth = login("vedava", "Vedava@123")
    sup_token = sup_auth["token"]
    
    print(f"Updating mei.pharm password to Pharmacist@123 via POST /users...")
    status, update_res = make_req("http://localhost:8081/users", "POST", {
        "name": "Meiyappan",
        "username": "mei.pharm",
        "password": "Pharmacist@123",
        "role": "PHARMACIST",
        "phcId": "PHC_N1_1786513619"
    }, sup_token)
    print(f"Update response: {status}")
        
    status, auth = login("mei.pharm", "Pharmacist@123")
    print(f"Pharmacist Login: {status}")
    if status == 200:
        token = auth["token"]
        # Pharmacist gets profile
        status, profile = make_req("http://localhost:8081/users/profile", "GET", None, token)
        print(f"Pharmacist GET /users/profile: {status} (Name: {profile.get('name')})")
        # Pharmacist gets medicines
        status, meds = make_req("http://localhost:8081/medicines", "GET", None, token)
        print(f"Pharmacist GET /medicines: {status} (Total Medicines: {len(meds) if isinstance(meds, list) else 0})")
        # Pharmacist tries to access patients (Should be rejected with 403 Forbidden)
        status, pat_res = make_req("http://localhost:8081/patients", "GET", None, token)
        print(f"Pharmacist GET /patients (RBAC protection check): {status} (Expected 403)")

    # 5. AI Decision Support endpoints check
    print("\nTEST AI endpoints check...")
    status, auth = login("anita.devi", "Asha@123")
    if status == 200:
        token = auth["token"]
        status, ai_summary = make_req("http://localhost:8081/ai/dashboard/summary", "GET", None, token)
        print(f"ASHA GET /ai/dashboard/summary: {status}")

if __name__ == "__main__":
    run_rbac_test()
