#!/usr/bin/env python3
"""
ReWear Backend API Testing Suite
Tests all FastAPI endpoints for the clothing exchange platform
"""

import requests
import sys
import json
from datetime import datetime
from pathlib import Path
import tempfile
import os

class ReWearAPITester:
    def __init__(self, base_url="https://0631dfdd-7a87-4e43-aa1c-981a028d7aa1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.test_user_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_username = f"testuser_{datetime.now().strftime('%H%M%S')}"
        self.test_password = "TestPass123!"
        self.created_item_id = None
        self.created_swap_id = None
        
        self.tests_run = 0
        self.tests_passed = 0
        
        print(f"🚀 Starting ReWear API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"🔗 API URL: {self.api_url}")
        print(f"👤 Test User: {self.test_user_email}")
        print("=" * 60)

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
            if details:
                print(f"   {details}")
        else:
            print(f"❌ {name}")
            if details:
                print(f"   {details}")

    def make_request(self, method, endpoint, data=None, files=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
            
        if files:
            # Remove Content-Type for file uploads
            headers.pop('Content-Type', None)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
            
            return success, response.status_code, response_data
            
        except Exception as e:
            return False, 0, {"error": str(e)}

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        # Test root endpoint (should be outside /api)
        try:
            response = requests.get(f"{self.base_url}/")
            success = response.status_code == 200
            self.log_test("Basic Connectivity", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Basic Connectivity", False, f"Error: {str(e)}")

    def test_user_registration(self):
        """Test user registration"""
        data = {
            "email": self.test_user_email,
            "username": self.test_username,
            "password": self.test_password
        }
        
        success, status, response = self.make_request('POST', 'auth/register', data)
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.log_test("User Registration", True, f"User ID: {self.user_id}, Points: {response['user']['points']}")
        else:
            self.log_test("User Registration", False, f"Status: {status}, Response: {response}")

    def test_user_login(self):
        """Test user login"""
        data = {
            "email": self.test_user_email,
            "password": self.test_password
        }
        
        success, status, response = self.make_request('POST', 'auth/login', data)
        
        if success and 'token' in response:
            # Update token (should be same as registration)
            self.token = response['token']
            self.log_test("User Login", True, f"Username: {response['user']['username']}")
        else:
            self.log_test("User Login", False, f"Status: {status}, Response: {response}")

    def test_get_current_user(self):
        """Test getting current user info"""
        success, status, response = self.make_request('GET', 'auth/me')
        
        if success and 'username' in response:
            self.log_test("Get Current User", True, f"Username: {response['username']}, Points: {response['points']}")
        else:
            self.log_test("Get Current User", False, f"Status: {status}, Response: {response}")

    def test_create_item(self):
        """Test creating a new item"""
        data = {
            "title": "Test Vintage Jacket",
            "description": "A beautiful vintage denim jacket in excellent condition",
            "category": "outerwear",
            "size": "M",
            "condition": "excellent",
            "tags": ["vintage", "denim", "casual"],
            "price_points": 75
        }
        
        success, status, response = self.make_request('POST', 'items', data, expected_status=200)
        
        if success and 'id' in response:
            self.created_item_id = response['id']
            self.log_test("Create Item", True, f"Item ID: {self.created_item_id}, Title: {response['title']}")
        else:
            self.log_test("Create Item", False, f"Status: {status}, Response: {response}")

    def test_get_items(self):
        """Test getting all items"""
        success, status, response = self.make_request('GET', 'items')
        
        if success and isinstance(response, list):
            self.log_test("Get Items", True, f"Found {len(response)} items")
        else:
            self.log_test("Get Items", False, f"Status: {status}, Response: {response}")

    def test_get_item_by_id(self):
        """Test getting specific item by ID"""
        if not self.created_item_id:
            self.log_test("Get Item by ID", False, "No item ID available (create item test failed)")
            return
            
        success, status, response = self.make_request('GET', f'items/{self.created_item_id}')
        
        if success and 'title' in response:
            self.log_test("Get Item by ID", True, f"Title: {response['title']}, Owner: {response.get('owner_username', 'Unknown')}")
        else:
            self.log_test("Get Item by ID", False, f"Status: {status}, Response: {response}")

    def test_get_my_items(self):
        """Test getting current user's items"""
        success, status, response = self.make_request('GET', 'my-items')
        
        if success and isinstance(response, list):
            self.log_test("Get My Items", True, f"Found {len(response)} items owned by user")
        else:
            self.log_test("Get My Items", False, f"Status: {status}, Response: {response}")

    def test_image_upload(self):
        """Test image upload for item"""
        if not self.created_item_id:
            self.log_test("Image Upload", False, "No item ID available (create item test failed)")
            return
        
        # Create a temporary test image file
        try:
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                # Write minimal JPEG header
                tmp_file.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9')
                tmp_file_path = tmp_file.name
            
            with open(tmp_file_path, 'rb') as f:
                files = {'file': ('test_image.jpg', f, 'image/jpeg')}
                success, status, response = self.make_request('POST', f'items/{self.created_item_id}/upload-image', files=files)
            
            # Clean up
            os.unlink(tmp_file_path)
            
            if success and 'image_url' in response:
                self.log_test("Image Upload", True, f"Image URL: {response['image_url']}")
            else:
                self.log_test("Image Upload", False, f"Status: {status}, Response: {response}")
                
        except Exception as e:
            self.log_test("Image Upload", False, f"Error: {str(e)}")

    def test_create_swap_request_points(self):
        """Test creating a swap request using points"""
        if not self.created_item_id:
            self.log_test("Create Swap Request (Points)", False, "No item ID available")
            return
        
        # First create another user to swap with
        second_user_data = {
            "email": f"swapper_{datetime.now().strftime('%H%M%S')}@example.com",
            "username": f"swapper_{datetime.now().strftime('%H%M%S')}",
            "password": "SwapPass123!"
        }
        
        success, status, response = self.make_request('POST', 'auth/register', second_user_data)
        if not success:
            self.log_test("Create Swap Request (Points)", False, "Failed to create second user")
            return
        
        # Store original token
        original_token = self.token
        second_user_token = response['token']
        
        # Switch to second user and create an item
        self.token = second_user_token
        
        item_data = {
            "title": "Test Swap Item",
            "description": "Item for swap testing",
            "category": "tops",
            "size": "L",
            "condition": "good",
            "price_points": 60
        }
        
        success, status, response = self.make_request('POST', 'items', item_data)
        if not success:
            self.log_test("Create Swap Request (Points)", False, "Failed to create item for swap")
            self.token = original_token
            return
        
        swap_item_id = response['id']
        
        # Switch back to original user and create swap request
        self.token = original_token
        
        swap_data = {
            "item_id": swap_item_id,
            "is_points_request": True,
            "message": "I'd like to redeem this item with points"
        }
        
        success, status, response = self.make_request('POST', 'swaps', swap_data)
        
        if success and 'id' in response:
            self.created_swap_id = response['id']
            self.log_test("Create Swap Request (Points)", True, f"Swap ID: {self.created_swap_id}")
        else:
            self.log_test("Create Swap Request (Points)", False, f"Status: {status}, Response: {response}")

    def test_get_received_swaps(self):
        """Test getting received swap requests"""
        success, status, response = self.make_request('GET', 'swaps/received')
        
        if success and isinstance(response, list):
            self.log_test("Get Received Swaps", True, f"Found {len(response)} received swap requests")
        else:
            self.log_test("Get Received Swaps", False, f"Status: {status}, Response: {response}")

    def test_get_sent_swaps(self):
        """Test getting sent swap requests"""
        success, status, response = self.make_request('GET', 'swaps/sent')
        
        if success and isinstance(response, list):
            self.log_test("Get Sent Swaps", True, f"Found {len(response)} sent swap requests")
        else:
            self.log_test("Get Sent Swaps", False, f"Status: {status}, Response: {response}")

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        original_token = self.token
        self.token = None
        
        success, status, response = self.make_request('GET', 'auth/me', expected_status=401)
        
        if success:  # success means we got the expected 401
            self.log_test("Unauthorized Access Protection", True, "Correctly rejected unauthorized request")
        else:
            self.log_test("Unauthorized Access Protection", False, f"Status: {status}, should be 401")
        
        # Restore token
        self.token = original_token

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, status, response = self.make_request('POST', 'auth/login', data, expected_status=401)
        
        if success:  # success means we got the expected 401
            self.log_test("Invalid Login Protection", True, "Correctly rejected invalid credentials")
        else:
            self.log_test("Invalid Login Protection", False, f"Status: {status}, should be 401")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🧪 Running Backend API Tests...\n")
        
        # Basic connectivity
        self.test_basic_connectivity()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        
        # Item management tests
        self.test_create_item()
        self.test_get_items()
        self.test_get_item_by_id()
        self.test_get_my_items()
        self.test_image_upload()
        
        # Swap functionality tests
        self.test_create_swap_request_points()
        self.test_get_received_swaps()
        self.test_get_sent_swaps()
        
        # Security tests
        self.test_unauthorized_access()
        self.test_invalid_login()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test runner"""
    tester = ReWearAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())