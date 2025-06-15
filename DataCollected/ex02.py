import requests
import json
from datetime import datetime, timedelta

PROMETHEUS_URL = "http://localhost:9090"
METRICS = [

"istio_request_bytes_sum",
"istio_request_bytes_bucket",
"istio_request_bytes_count"



]

# 设置时间范围（例如：过去1小时）
end = datetime.utcnow()
start = end - timedelta(hours=24)
step = "60s"  # 每分钟一个点

def query_range(metric, start, end, step):
    url = f"{PROMETHEUS_URL}/api/v1/query_range"
    params = {
        "query": metric,
        "start": start.timestamp(),
        "end": end.timestamp(),
        "step": step
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

# 批量导出所有指标为 JSON
for metric in METRICS:
    try:
        print(f"Exporting metric: {metric}")
        result = query_range(metric, start, end, step)
        with open(f"{metric}.json", "w") as f:
            json.dump(result, f, indent=2)
        print(f"Saved: {metric}.json")
    except Exception as e:
        print(f"Error exporting {metric}: {e}")
