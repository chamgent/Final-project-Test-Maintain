### 1、应用服务层
| Istio/Envoy metric                           | 含义                                                    |
| -------------------------------------------- | ----------------------------------------------------- |
| `istio_requests_total`                       | 请求总数（核心指标，按 service / destination / response\_code 分） |
| `istio_request_duration_milliseconds_bucket` | 请求时延分布（可计算 P50/P95/P99）                               |
| `istio_request_bytes`                        | 请求体大小                                                 |
| `istio_response_bytes`                       | 响应体大小                                                 |


### 2、容器资源层
| metric                                   | 说明         |
| ---------------------------------------- | ---------- |
| `container_cpu_usage_seconds_total`      | 容器 CPU 使用量 |
| `container_memory_usage_bytes`           | 容器内存使用量    |
| `container_memory_working_set_bytes`     | 容器工作集大小    |
| `container_network_transmit_bytes_total` | 容器网络发送流量   |
| `container_network_receive_bytes_total`  | 容器网络接收流量   |
| `container_fs_usage_bytes`               | 容器磁盘使用量    |
| `container_fs_reads_bytes_total`         | 容器磁盘读流量    |
| `container_fs_writes_bytes_total`        | 容器磁盘写流量    |

### 3、节点系统层
| metric                                  | 说明                 |
| --------------------------------------- | ------------------ |
| `node_cpu_seconds_total{mode="user"}`   | User 模式 CPU 使用时间   |
| `node_cpu_seconds_total{mode="system"}` | System 模式 CPU 使用时间 |
| `node_memory_MemAvailable_bytes`        | 可用内存               |
| `node_memory_MemFree_bytes`             | 空闲内存               |
| `node_load1`                            | 1 分钟平均负载           |
| `node_load5`                            | 5 分钟平均负载           |
| `node_disk_read_bytes_total`            | 磁盘读流量              |
| `node_disk_written_bytes_total`         | 磁盘写流量              |
| `node_network_receive_bytes_total`      | 网络接收流量             |
| `node_network_transmit_bytes_total`     | 网络发送流量             |
