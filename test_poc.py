import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_uat():
    results = {}
    
    # 1. Target URL
    target_url = "https://poc64.blackfield-8b7bf6a5.malaysiawest.azurecontainerapps.io"
    
    # Configure Chrome Options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    print("Initializing WebDriver...")
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print(f"Navigating to Target URL: {target_url}")
        driver.get(target_url)
        
        # Test Case 1: Visual Load
        print("\n--- Running Test Case 1: Visual Load ---")
        try:
            # Wait for Leaflet map container to load
            map_container = WebDriverWait(driver, 15).until(
                EC.visibility_of_element_located((By.CLASS_NAME, "leaflet-container"))
            )
            print("Pass: Map container (.leaflet-container) is visible.")
            
            # Verify dark tiles tilelayer is present
            tiles = driver.find_elements(By.CLASS_NAME, "leaflet-tile-pane")
            if tiles:
                print("Pass: Map tiles loaded correctly.")
                results["Test Case 1 (Visual Load)"] = "PASS"
            else:
                print("Fail: Map tiles did not load.")
                results["Test Case 1 (Visual Load)"] = "FAIL - Map tiles missing"
        except Exception as e:
            print(f"Fail: Map container not visible or failed to load. Error: {str(e)}")
            results["Test Case 1 (Visual Load)"] = f"FAIL - {str(e)}"
            
        # Test Case 2: The Handshake
        print("\n--- Running Test Case 2: The Handshake ---")
        try:
            # Locate a map marker (custom-leaflet-icon)
            markers = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, "custom-leaflet-icon"))
            )
            
            if len(markers) > 0:
                print(f"Found {len(markers)} project markers on the map stage.")
                marker_to_click = markers[0]
                
                # Scroll into view and click
                driver.execute_script("arguments[0].scrollIntoView(true);", marker_to_click)
                time.sleep(1) # Allow scroll and animations
                marker_to_click.click()
                print("Clicked project marker.")
                
                # Verify 'Asset Intelligence' Panel slides into view / contains active elements
                # Checking if the text "Asset Intelligence" is visible
                intelligence_header = WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Asset Intelligence')]"))
                )
                print("Pass: 'Asset Intelligence' Panel is visible after clicking marker.")
                results["Test Case 2 (The Handshake)"] = "PASS"
            else:
                print("Fail: No project markers found on the map.")
                results["Test Case 2 (The Handshake)"] = "FAIL - No markers found"
        except Exception as e:
            print(f"Fail: Marker click failed or Intelligence Panel did not appear. Error: {str(e)}")
            results["Test Case 2 (The Handshake)"] = f"FAIL - {str(e)}"
            
        # Test Case 3: The Signature
        print("\n--- Running Test Case 3: The Signature ---")
        try:
            # First, close the slide-over panel if it is open and blocking
            try:
                close_btn = driver.find_element(By.XPATH, "//button[contains(@class, 'text-gray-400') and .//*[local-name()='svg']]")
                close_btn.click()
                print("Closed the slide-over panel to prevent overlap.")
                time.sleep(1)  # Wait for transition animation
            except Exception as e:
                print(f"Slide-over close not executed (already closed or not found): {str(e)}")

            # Locate Info button using the shadow-cyan-glow class
            info_btn = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "shadow-cyan-glow"))
            )
            
            # Click the button, using JS click as a fallback to avoid overlap issues
            try:
                WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.CLASS_NAME, "shadow-cyan-glow")))
                info_btn.click()
            except Exception:
                print("Standard click intercepted; attempting JS click on Info button.")
                driver.execute_script("arguments[0].click();", info_btn)
            
            print("Clicked Info (i) button.")
            
            # Verify name 'Anjana KS' is present in the modal
            developer_signature = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Anjana KS')]"))
            )
            print("Pass: Developer signature 'Anjana KS' verified in modal.")
            results["Test Case 3 (The Signature)"] = "PASS"
        except Exception as e:
            print(f"Fail: Info modal interaction or signature check failed. Error: {str(e)}")
            results["Test Case 3 (The Signature)"] = f"FAIL - {str(e)}"
            
    finally:
        print("\nClosing WebDriver...")
        driver.quit()
        
    # Output: Generate Test_Report.txt
    print("\nGenerating Test_Report.txt...")
    with open("Test_Report.txt", "w", encoding="utf-8") as f:
        f.write("==================================================\n")
        f.write("             UAT TEST AUTOMATION REPORT           \n")
        f.write("==================================================\n")
        f.write(f"Target URL: {target_url}\n")
        f.write(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("--------------------------------------------------\n")
        for test, status in results.items():
            f.write(f"{test}: {status}\n")
        f.write("==================================================\n")
    print("Test_Report.txt generated successfully.")

if __name__ == "__main__":
    run_uat()
