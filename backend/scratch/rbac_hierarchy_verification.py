import urllib.request
import json
import time

BASE_URL = "http://localhost:8081"

def login(username, password):
    req = urllib.request.Request(
        f"{BASE_URL}/auth/login",
        data=json.dumps({"username": username, "password": password}).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))['token']

def make_req(url, method="GET", body=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            status = res.status
            text = res.read().decode('utf-8')
            return status, json.loads(text) if text else {}
    except urllib.error.HTTPError as e:
        text = e.read().decode('utf-8')
        try:
            return e.code, json.loads(text)
        except:
            return e.code, {"raw": text}

def run_rbac_tests():
    print("=" * 80)
    print("ASHA COMPANION - STRICT RBAC USER MANAGEMENT HIERARCHY VERIFICATION")
    print("=" * 80)

    passed = 0
    failed = 0

    ts = int(time.time())

    # 1. Login Tokens
    admin_token = login("admin", "Admin@123")
    sup_token = login("vedava", "Vedava@123")
    asha_token = login("anita.devi", "Asha@123")
    phar_token = login("arjun", "Pharmacist@123")

    # Setup secondary PHC & Supervisor for PHC Isolation Tests
    make_req(f"{BASE_URL}/phcs", "POST", {"name": "Isolation Secondary PHC", "code": "PHC_ISO_002", "district": "Madurai", "block": "Block B"}, token=admin_token)
    
    _, sup2_user = make_req(f"{BASE_URL}/users", "POST", {
        "name": "Supervisor Two",
        "username": f"sup_iso_{ts}",
        "password": "Supervisor@123",
        "role": "PHC_SUPERVISOR",
        "phcId": "PHC_ISO_002"
    }, token=admin_token)
    
    sup2_token = login(f"sup_iso_{ts}", "Supervisor@123")

    # Create target ASHA in PHC_ISO_002 owned by sup2
    _, asha_in_phc2 = make_req(f"{BASE_URL}/users", "POST", {
        "name": "Asha PHC 2",
        "username": f"asha_phc2_{ts}",
        "password": "Asha@123",
        "role": "ASHA"
    }, token=sup2_token)
    asha_phc2_id = asha_in_phc2.get("id")

    # ---------------------------------------------------------
    # POSITIVE TESTS
    # ---------------------------------------------------------
    # 1. ADMIN creates PHC_SUPERVISOR -> 201
    s1, r1 = make_req(f"{BASE_URL}/users", "POST", {
        "name": "Positive Sup Test",
        "username": f"pos_sup_{ts}",
        "password": "Supervisor@123",
        "role": "PHC_SUPERVISOR",
        "phcId": "PHC_N1_1786513619"
    }, token=admin_token)
    pos_sup_id = r1.get("id")

    # 2. PHC_SUPERVISOR creates ASHA -> 201
    s2, r2 = make_req(f"{BASE_URL}/users", "POST", {
        "name": "Positive Asha Test",
        "username": f"pos_asha_{ts}",
        "password": "Asha@123",
        "role": "ASHA"
    }, token=sup_token)
    pos_asha_id = r2.get("id")

    # 3. PHC_SUPERVISOR creates PHARMACIST -> 201
    s3, r3 = make_req(f"{BASE_URL}/users", "POST", {
        "name": "Positive Phar Test",
        "username": f"pos_phar_{ts}",
        "password": "Pharmacist@123",
        "role": "PHARMACIST"
    }, token=sup_token)
    pos_phar_id = r3.get("id")

    # 4. PHC_SUPERVISOR deletes ASHA -> 204
    s4, _ = make_req(f"{BASE_URL}/users/{pos_asha_id}", "DELETE", None, token=sup_token)

    # 5. PHC_SUPERVISOR deletes PHARMACIST -> 204
    s5, _ = make_req(f"{BASE_URL}/users/{pos_phar_id}", "DELETE", None, token=sup_token)

    # 6. ADMIN deletes PHC_SUPERVISOR -> 204
    s6, _ = make_req(f"{BASE_URL}/users/{pos_sup_id}", "DELETE", None, token=admin_token)

    # ---------------------------------------------------------
    # NEGATIVE TESTS
    # ---------------------------------------------------------
    # 7. ADMIN attempts to create ASHA -> 403
    s7, _ = make_req(f"{BASE_URL}/users", "POST", {"name": "Err Asha", "username": f"err_asha_{ts}", "password": "A@1", "role": "ASHA"}, token=admin_token)

    # 8. ADMIN attempts to create PHARMACIST -> 403
    s8, _ = make_req(f"{BASE_URL}/users", "POST", {"name": "Err Phar", "username": f"err_phar_{ts}", "password": "P@1", "role": "PHARMACIST"}, token=admin_token)

    # 9. PHARMACIST creates ASHA -> 403
    s9, _ = make_req(f"{BASE_URL}/users", "POST", {"name": "Pharm Asha", "username": f"p_asha_{ts}", "password": "A@1", "role": "ASHA"}, token=phar_token)

    # 10. PHARMACIST deletes ASHA -> 403
    s10, _ = make_req(f"{BASE_URL}/users/{asha_phc2_id}", "DELETE", None, token=phar_token)

    # 11. PHARMACIST creates PHARMACIST -> 403
    s11, _ = make_req(f"{BASE_URL}/users", "POST", {"name": "Pharm Phar", "username": f"p_phar_{ts}", "password": "P@1", "role": "PHARMACIST"}, token=phar_token)

    # 12. ASHA creates ASHA -> 403
    s12, _ = make_req(f"{BASE_URL}/users", "POST", {"name": "Asha Asha", "username": f"a_asha_{ts}", "password": "A@1", "role": "ASHA"}, token=asha_token)

    # 13. ASHA deletes ASHA -> 403
    s13, _ = make_req(f"{BASE_URL}/users/{asha_phc2_id}", "DELETE", None, token=asha_token)

    # ---------------------------------------------------------
    # PHC ISOLATION TESTS
    # ---------------------------------------------------------
    # 14. Supervisor PHC1 attempts to delete ASHA in PHC2 -> 403
    s14, _ = make_req(f"{BASE_URL}/users/{asha_phc2_id}", "DELETE", None, token=sup_token)

    # Clean up sup2 & asha_phc2
    make_req(f"{BASE_URL}/users/{asha_phc2_id}", "DELETE", None, token=sup2_token)
    make_req(f"{BASE_URL}/users/{sup2_user.get('id')}", "DELETE", None, token=admin_token)

    # Matrix Evaluation
    test_matrix = [
        ("POSIX-1: ADMIN creates PHC_SUPERVISOR -> 201", s1, 201),
        ("POSIX-2: PHC_SUPERVISOR creates ASHA -> 201", s2, 201),
        ("POSIX-3: PHC_SUPERVISOR creates PHARMACIST -> 201", s3, 201),
        ("POSIX-4: PHC_SUPERVISOR deletes ASHA -> 204", s4, 204),
        ("POSIX-5: PHC_SUPERVISOR deletes PHARMACIST -> 204", s5, 204),
        ("POSIX-6: ADMIN deletes PHC_SUPERVISOR -> 204", s6, 204),
        ("NEG-7:   ADMIN attempts to create ASHA -> 403", s7, 403),
        ("NEG-8:   ADMIN attempts to create PHARMACIST -> 403", s8, 403),
        ("NEG-9:   PHARMACIST creates ASHA -> 403", s9, 403),
        ("NEG-10:  PHARMACIST deletes ASHA -> 403", s10, 403),
        ("NEG-11:  PHARMACIST creates PHARMACIST -> 403", s11, 403),
        ("NEG-12:  ASHA creates ASHA -> 403", s12, 403),
        ("NEG-13:  ASHA deletes ASHA -> 403", s13, 403),
        ("ISO-14:  Supervisor PHC1 attempts to delete ASHA in PHC2 -> 403", s14, 403),
    ]

    for title, actual, expected in test_matrix:
        if actual == expected:
            print(f"{title} -> PASS ({actual})")
            passed += 1
        else:
            print(f"{title} -> FAIL (Expected {expected}, Got {actual})")
            failed += 1

    print("=" * 80)
    print(f"RBAC MATRIX EXECUTION COMPLETE: PASSED {passed} / {len(test_matrix)} | FAILED {failed} / {len(test_matrix)}")
    print("=" * 80)

if __name__ == "__main__":
    run_rbac_tests()
