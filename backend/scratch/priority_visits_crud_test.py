import urllib.request
import json
import time

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

def run():
    print("=" * 60)
    print("STARTING PRIORITY VISITS & PHARMACIST PROFILE CRUD INTEGRATION TEST")
    print("=" * 60)

    # 1. Login as Supervisor
    print("TEST 1: Logging in as Supervisor (vedava)...")
    status, auth_res = login("vedava", "Vedava@123")
    if status != 200:
        print(f"FAILED to login as Pharmacist. Status: {status}, Response: {auth_res}")
        return
    token = auth_res["token"]
    print(f"PASSED. Logged in successfully. Token length: {len(token)}")

    # 2. Get Pharmacist Profile
    print("\nTEST 2: GET /users/profile (Pharmacist Profile)...")
    status, profile = make_req("http://localhost:8081/users/profile", "GET", None, token)
    print(f"GET /users/profile Response Status: {status}")
    print(f"Profile Data: {profile}")
    if status == 200 and profile.get("username") == "vedava":
        print("PASSED: Profile successfully fetched from backend DB and matches logged-in user.")
    else:
        print("FAILED: Profile check failed.")

    # 3. Create Priority Visit
    print("\nTEST 3: POST /priority-visits (Create Priority Visit)...")
    visit_payload = {
        "patientName": "Sunita Devi Test Visit",
        "village": "Madukkarai",
        "ashaId": "183",
        "ashaName": "Yadesh",
        "condition": "Severe post-partum fatigue checkup",
        "urgency": "High",
        "notes": "Verify iron supplement compliance and check BP."
    }
    status, create_res = make_req("http://localhost:8081/priority-visits", "POST", visit_payload, token)
    print(f"POST /priority-visits Response Status: {status}")
    print(f"Created Record: {create_res}")
    if status == 201 and create_res.get("id") is not None:
        print("PASSED: Priority Visit successfully created in Oracle DB.")
        visit_id = create_res["id"]
    else:
        print("FAILED: Create Priority Visit failed.")
        return

    # 4. Read Priority Visits
    print("\nTEST 4: GET /priority-visits (Read Priority Visits)...")
    status, visits_list = make_req("http://localhost:8081/priority-visits", "GET", None, token)
    print(f"GET /priority-visits Response Status: {status}")
    if status == 200 and any(v.get("id") == visit_id for v in visits_list):
        print("PASSED: Newly created Priority Visit found in list.")
    else:
        print("FAILED: Read Priority Visits failed.")

    # 5. Update Priority Visit
    print(f"\nTEST 5: PUT /priority-visits/{visit_id} (Update Priority Visit)...")
    update_payload = {
        "status": "Completed",
        "notes": "Patient visited. Iron supplements verified. BP normal at 122/80."
    }
    status, update_res = make_req(f"http://localhost:8081/priority-visits/{visit_id}", "PUT", update_payload, token)
    print(f"PUT /priority-visits/{visit_id} Response Status: {status}")
    print(f"Updated Record: {update_res}")
    if status == 200 and update_res.get("status") == "Completed":
        print("PASSED: Priority Visit status successfully updated in Oracle DB.")
    else:
        print("FAILED: Update Priority Visit failed.")

    # 6. Delete Priority Visit
    print(f"\nTEST 6: DELETE /priority-visits/{visit_id} (Delete Priority Visit)...")
    status, delete_res = make_req(f"http://localhost:8081/priority-visits/{visit_id}", "DELETE", None, token)
    print(f"DELETE /priority-visits/{visit_id} Response Status: {status}")
    if status == 204:
        print("PASSED: Priority Visit successfully deleted from Oracle DB.")
    else:
        print("FAILED: Delete Priority Visit failed.")

    # 7. Verify deletion
    print("\nTEST 7: Verify deletion in list...")
    status, post_visits_list = make_req("http://localhost:8081/priority-visits", "GET", None, token)
    if status == 200 and not any(v.get("id") == visit_id for v in post_visits_list):
        print("PASSED: Deleted Priority Visit is indeed absent from the list.")
    else:
        print("FAILED: Deleted Priority Visit still exists.")

if __name__ == "__main__":
    run()
