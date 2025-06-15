import time
import csv
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# 支持多浏览器初始化
def init_driver(browser_name="chrome"):
    if browser_name == "chrome":
        options = ChromeOptions()
        options.add_argument("--start-maximized")
        driver = webdriver.Chrome(options=options)
    elif browser_name == "firefox":
        options = FirefoxOptions()
        driver = webdriver.Firefox(options=options)
    elif browser_name == "edge":
        options = EdgeOptions()
        driver = webdriver.Edge(options=options)
    else:
        raise ValueError(f"不支持的浏览器: {browser_name}")
    return driver

# 记录页面加载时间
def measure_page_load_time(driver, url):
    driver.get(url)
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
    except TimeoutException:
        print("页面加载超时")
    timing = driver.execute_script("""
        const timing = window.performance.timing;
        return {
            loadTime: timing.loadEventEnd - timing.navigationStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart
        };
    """)
    return timing

# 记录按钮点击响应时间
def measure_click_response(driver, click_selector, wait_selector, by=By.ID):
    start = time.time()
    driver.find_element(by, click_selector).click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((by, wait_selector)))
    end = time.time()
    return round((end - start) * 1000)

# 写入结果到 CSV
def log_to_csv(browser, operation, duration_ms):
    with open("performance_results.csv", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([browser, operation, duration_ms])

# 单次测试流程
def single_run_test(driver, browser_name, data_recorder):
    base_url = "http://127.0.0.1:11489/"
    print(f"测试URL: {base_url}")

    # 1. 打开首页
    try:
        metrics = measure_page_load_time(driver, base_url)
        load_time = metrics["loadTime"]
        data_recorder["首页加载"].append(load_time)
        print(f"[{browser_name.upper()}] ✅ 首页加载完成: {load_time} ms")
        log_to_csv(browser_name, "首页加载", load_time)
    except Exception as e:
        print(f"首页加载失败: {str(e)}")
        return False

    # 2. 浏览商品（点击第一个商品）
    try:
        product_card = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".hot-product-card-img-overlay"))
        )
        start_time = time.time()
        product_card.click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-image"))
        )
        click_time = round((time.time() - start_time) * 1000)
        data_recorder["点击商品进入详情"].append(click_time)
        print(f"[{browser_name.upper()}] ✅ 商品详情打开时间: {click_time} ms")
        log_to_csv(browser_name, "点击商品进入详情", click_time)
    except TimeoutException as e:
        print(f"步骤2超时: {e.msg}")
        return False

    # 3. 添加到购物车
    try:
        add_to_cart_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".cymbal-button-primary"))
        )
        start_time = time.time()
        add_to_cart_button.click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".cymbal-button-primary:nth-child(1)"))
        )
        click_time = round((time.time() - start_time) * 1000)
        data_recorder["添加到购物车"].append(click_time)
        print(f"[{browser_name.upper()}] ✅ 添加购物车响应时间: {click_time} ms")
        log_to_csv(browser_name, "添加到购物车", click_time)
    except TimeoutException as e:
        print(f"步骤3超时: {e.msg}")
        return False

    # 4. 清空购物车
    try:
        clear_cart_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".cymbal-button-secondary"))
        )
        start_time = time.time()
        clear_cart_button.click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".hot-product-card-img-overlay"))
        )
        continue_time = round((time.time() - start_time) * 1000)
        data_recorder["清空购物车"].append(continue_time)  # 键名存在
        print(f"[{browser_name.upper()}] ✅ 清空购物车耗时: {continue_time} ms")
        log_to_csv(browser_name, "清空购物车", continue_time)
    except TimeoutException as e:
        print(f"步骤4超时: {e.msg}")
        return False

    # 5. 打开购物车
    try:
        product_card = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".hot-product-card-img-overlay"))
        )
        product_card.click()
        add_to_cart_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".cymbal-button-primary"))
        )
        add_to_cart_button.click()
        continue_shopping = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.LINK_TEXT, "Continue Shopping"))
        )
        continue_shopping.click()
        view_cart_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a.cart-link"))
        )
        start_time = time.time()
        view_cart_button.click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".cymbal-button-primary:nth-child(1)"))
        )
        click_time = round((time.time() - start_time) * 1000)
        data_recorder["查看购物车"].append(click_time)
        print(f"[{browser_name.upper()}] ✅ 查看购物车响应时间: {click_time} ms")
        log_to_csv(browser_name, "查看购物车", click_time)
    except TimeoutException as e:
        print(f"步骤5超时: {e.msg}")
        return False


    # 6. 结账流程
    try:
        place_order_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".cymbal-button-primary:nth-child(1)"))
        )
        start_time = time.time()
        place_order_button.click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.LINK_TEXT, "Continue Shopping"))
        )
        click_time = round((time.time() - start_time) * 1000)
        data_recorder["进入结账页面"].append(click_time)
        print(f"[{browser_name.upper()}] ✅ 结账页面加载时间: {click_time} ms")
        log_to_csv(browser_name, "进入结账页面", click_time)
    except TimeoutException as e:
        print(f"步骤6超时: {e.msg}")
        return False

    return True

# 计算均值
def calculate_average(data):
    return sum(data) / len(data) if data else 0

if __name__ == "__main__":
    supported_browsers = ["edge"]  # 暂只支持单浏览器重复测试
    repeat_times = 20  # 执行次数
    browser = "edge"  # 固定测试

    # 初始化数据记录器
    operations = ["首页加载", "点击商品进入详情", "添加到购物车",
                  "清空购物车", "查看购物车", "进入结账页面"]
    data_recorder = {op: [] for op in operations}

    # 创建CSV文件并写入标题
    with open("performance_results.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["浏览器", "操作", "耗时(ms)"])

    print(f"\n开始执行 {repeat_times} 次测试...")
    for run in range(repeat_times):
        print(f"\n第 {run+1}/{repeat_times} 次测试...")
        driver = init_driver(browser)
        try:
            if single_run_test(driver, browser, data_recorder):
                print("本次测试成功完成")
            else:
                print("本次测试失败，已跳过")
        finally:
            driver.quit()

    # 计算并输出均值
    print("\n================= 统计结果 ==================")
    for op, times in data_recorder.items():
        avg = calculate_average(times)
        print(f"{op} 平均耗时: {avg:.2f} ms ({len(times)} 次有效记录)")
    print("=================================================")