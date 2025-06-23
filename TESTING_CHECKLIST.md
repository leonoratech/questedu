# Testing Checklist for College Authorization Fix

## Prerequisites
1. ✅ QuestAdmin development server running on port 3001
2. ✅ Valid user account with instructor role
3. ✅ Known college ID and program ID for testing

## Test Scenarios

### 1. Profile Update Test
**Goal:** Verify that college associations are properly saved

**Steps:**
1. Login to QuestAdmin as an instructor
2. Navigate to Profile page
3. Select a college using the CollegeSelector component
4. Save the profile
5. Check browser network tab - verify PUT request to `/api/auth/profile` includes `collegeId`
6. Check Firestore user document - verify `collegeId` field is saved

**Expected Result:** ✅ User's `collegeId` is saved in their Firestore document

### 2. College Endpoint Access Test
**Goal:** Verify that users can access endpoints for their associated college

**Endpoints to test:**
- `GET /api/colleges/[collegeId]/instructors`
- `GET /api/colleges/[collegeId]/programs/[programId]/subjects`

**Test Cases:**

#### Case A: User with College Association
**Setup:** User has `collegeId` in their profile matching the test college
**Expected Result:** ✅ 200 OK responses with data

#### Case B: User without College Association  
**Setup:** User has no `collegeId` or different `collegeId` in profile
**Expected Result:** ✅ 403 Forbidden responses

#### Case C: Superadmin User
**Setup:** User with `superadmin` role
**Expected Result:** ✅ 200 OK responses regardless of college association

#### Case D: Formal College Administrator
**Setup:** User has entry in `collegeAdministrators` collection for the college
**Expected Result:** ✅ 200 OK responses

### 3. Cross-College Access Test
**Goal:** Verify users cannot access other colleges' data

**Steps:**
1. User associated with College A tries to access College B endpoints
2. Should receive 403 Forbidden

**Expected Result:** ✅ Proper access control maintained

## Quick Manual Test

### Using Browser Developer Tools:
1. Login to QuestAdmin
2. Open browser developer tools (F12)
3. Navigate to Network tab
4. Try accessing a college-specific page (e.g., college programs)
5. Check network requests for the failing endpoints
6. Verify responses are now 200 OK instead of 401 Unauthorized

### Using the Test Script:
```bash
# Replace YOUR_JWT_TOKEN with actual token from browser localStorage
JWT_TOKEN=YOUR_JWT_TOKEN node test-college-endpoints.js
```

## Success Criteria
- ✅ Profile updates save `collegeId` properly
- ✅ College-specific endpoints return 200 OK for authorized users
- ✅ College-specific endpoints return 403 Forbidden for unauthorized users
- ✅ No 401 Unauthorized errors for valid college associations
- ✅ Superadmins maintain access to all colleges
- ✅ Formal college administrators maintain their access

## Common Issues to Check
- Import path errors in updated endpoint files
- Missing Firestore document permissions
- JWT token expiration during testing
- Incorrect college ID or program ID in test data

## Rollback Plan
If the fix causes issues:
1. Revert authorization logic in the two endpoint files
2. Revert profile update API changes
3. Test with original authorization pattern
