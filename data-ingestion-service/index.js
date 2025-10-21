const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// --- 配置 ---
const app = express();
app.use(cors()); // 允许所有跨域请求，开发阶段方便
const port = 3001; // 后端服务运行的端口

//const MQTT_BROKER_URL = 'mqtt://localhost:1883';
//const MQTT_BROKER_URL = 'mqtt://127.0.0.1:1883'; // 保持一致
const MQTT_BROKER_URL = 'mqtt://mosquitto:1883'; // <-- 修改这里

const MQTT_TOPIC = 'ems/device/data';

//const INFLUXDB_URL = 'http://localhost:8086';
const INFLUXDB_URL = 'http://influxdb:8086'; // <-- 修改这里

const INFLUXDB_TOKEN = '2jlMTVRA6fFhtOG8da3cG4a5rdYaNk8soSadDc0exsnT7yIGVMii14mFhe7auk8zsJk3qaDsG2mA2DL-q0ZbfQ=='; // 注意：请手动在InfluxDB UI中创建一个All-Access Token并替换这里
const INFLUXDB_ORG = 'my-org';
const INFLUXDB_BUCKET = 'ems-data';

// --- 连接 InfluxDB ---
const influxDB = new InfluxDB({ url: INFLUXDB_URL, token: INFLUXDB_TOKEN });
const writeApi = influxDB.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET);
const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);

console.log('Connected to InfluxDB');

// --- 连接 MQTT Broker ---
const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
    client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
            console.log(`Successfully subscribed to topic: ${MQTT_TOPIC}`);
        }
    });
});

// --- 处理接收到的消息 ---
client.on('message', (topic, message) => {
    console.log(`Received message from topic ${topic}: ${message.toString()}`);
    try {
        const data = JSON.parse(message.toString());

        // 创建一个数据点并写入 InfluxDB
        const point = new Point('energy_usage')
            .tag('deviceId', data.deviceId)
            .floatField('voltage', data.voltage)
            .floatField('current', data.current)
            .timestamp(new Date(data.timestamp));

        writeApi.writePoint(point);
        console.log(`Data point written to InfluxDB for device ${data.deviceId}`);

    } catch (e) {
        console.error('Error processing message:', e);
    }
});

// --- 创建一个API给前端 ---
let latestData = {}; // 简单缓存最新数据
app.get('/api/latest-data', (req, res) => {
  // 真实场景下，这里应该查询InfluxDB
  const fluxQuery = `from(bucket: "${INFLUXDB_BUCKET}")
    |> range(start: -1m)
    |> filter(fn: (r) => r._measurement == "energy_usage")
    |> last()`;
    
  const data = [];
  queryApi.queryRows(fluxQuery, {
    next(row, tableMeta) {
      const o = tableMeta.toObject(row);
      data.push(o);
    },
    error(error) {
      console.error(error);
      res.status(500).send('Error querying data');
    },
    complete() {
      res.json(data);
    },
  });
});

app.listen(port, () => {
    console.log(`Backend service listening at http://localhost:${port}`);
});