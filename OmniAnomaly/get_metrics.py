from prometheus_api_client import PrometheusConnect
import datetime
import json
import os
prom = PrometheusConnect(url="", disable_ssl=True)

# 选几个典型 metrics
metrics = [
    
]

start_time = datetime.datetime.now() - datetime.timedelta(hours=24)
end_time = datetime.datetime.now()

step = '60s'  # 每1分钟采样一次


for metric in metrics:
    metric_data = prom.get_metric_range_data(
        metric_name=metric,
        start_time=start_time,
        end_time=end_time,
        chunk_size=datetime.timedelta(hours=1),
        step=step
    )

    with open(os.path.join("metrics",metric+'.json'), 'w') as f:
        json.dump(metric_data, f)