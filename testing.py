from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
driver = webdriver.Chrome(ChromeDriverManager().install(), chrome_options=chrome_options)

driver.get('http://localhost:5173')

driver.execute_script("window.open('about:blank', 'secondtab')")
driver.switch_to.window("secondtab")
driver.get('http://localhost:5173')

driver.execute_script("window.open('about:blank','thirdtab')")
driver.switch_to.window("thirdtab")
driver.get('http://localhost:5173')
