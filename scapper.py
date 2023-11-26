from selenium import webdriver

driver = webdriver.Chrome()
driver.get(r"https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerDetail_mailto") 

driver.find_element("name-input").send_keys("John")

driver.quit()