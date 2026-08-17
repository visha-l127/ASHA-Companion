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

def run_test():
    print("=" * 65)
    print("STARTING E2E PHARMACIST MEDICINES CATALOG REGISTRATION TEST")
    print("=" * 65)

    # 1. Login as Pharmacist
    print("TEST 1: Login as Pharmacist (mei.pharm)...")
    status, auth = login("mei.pharm", "Pharmacist@123")
    if status != 200:
        print(f"FAILED to login. Status: {status}")
        return
    token = auth["token"]
    print(f"PASSED. Token resolved.")

    # 2. Register new drug
    print("\nTEST 2: POST /medicines (Register New Drug)...")
    payload = {
        "name": "TEST_PARACETAMOL_VERIFICATION",
        "code": "DRUG-PARACETAMOL-VERIFY",
        "genericName": "Paracetamol BP 500mg",
        "category": "Analgesic",
        "dosageForm": "Tablet",
        "strength": "500mg",
        "unit": "Tablets",
        "reorderLevel": 350
    }
    status, create_res = make_req("http://localhost:8081/medicines", "POST", payload, token)
    print(f"POST /medicines Response Status: {status}")
    print(f"Created Record: {create_res}")
    if status == 201 and create_res.get("id") is not None:
        print("PASSED: Drug successfully registered in Oracle DB.")
        med_id = create_res["id"]
    else:
        print("FAILED: Drug registration failed.")
        return

    # 3. Read catalog
    print("\nTEST 3: GET /medicines (Read Catalog)...")
    status, list_res = make_req("http://localhost:8081/medicines", "GET", None, token)
    print(f"GET /medicines Response Status: {status}")
    if status == 200 and any(m.get("id") == med_id for m in list_res):
        print("PASSED: Registered drug found in database catalog list.")
    else:
        print("FAILED: Read catalog failed.")

    # 4. Update drug reorder level
    print(f"\nTEST 4: PUT /medicines/{med_id} (Update Drug)...")
    update_payload = {
        "name": "TEST_PARACETAMOL_VERIFICATION",
        "code": "DRUG-PARACETAMOL-VERIFY",
        "genericName": "Paracetamol BP 500mg",
        "category": "Analgesic",
        "dosageForm": "Tablet",
        "strength": "500mg",
        "unit": "Tablets",
        "reorderLevel": 400
    }
    status, update_res = make_req(f"http://localhost:8081/medicines/{med_id}", "PUT", update_payload, token)
    print(f"PUT /medicines/{med_id} Response Status: {status}")
    print(f"Updated Record: {update_res}")
    if status == 200 and update_res.get("reorderLevel") == 400:
        print("PASSED: Drug reorder level successfully updated in Oracle DB.")
    else:
        print("FAILED: Update drug failed.")

    # 5. Unauthorized RBAC boundary enforcement check
    print("\nTEST 5: ASHA role POST /medicines (RBAC block)...")
    status, asha_auth = login("anita.devi", "Asha@123")
    asha_token = asha_auth["token"]
    status, error_res = make_req("http://localhost:8081/medicines", "POST", payload, asha_token)
    print(f"ASHA POST /medicines Status: {status} (Expected 403)")
    if status == 403:
        print("PASSED: Unauthorized role successfully blocked from registering drugs.")
    else:
        print("FAILED: RBAC boundary protection failed.")

    # 6. Deactivate/delete drug
    print(f"\nTEST 6: DELETE /medicines/{med_id} (Delete Drug)...")
    status, delete_res = make_req(f"http://localhost:8081/medicines/{med_id}", "DELETE", None, token)
    print(f"DELETE /medicines/{med_id} Response Status: {status}")
    if status == 204:
        print("PASSED: Drug successfully deactivated in Oracle DB.")
    else:
        print("FAILED: Deactivate drug failed.")

if __name__ == "__main__":
    run_test()
