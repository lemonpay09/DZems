const mqtt = require('mqtt');

const MQTT_BROKER_URL = 'mqtt://mosquitto:1883';
const MQTT_TOPIC = 'ems/device/data';
const DEVICE_ID = 'DEVICE_001';

function connectAndSimulate() {
    console.log('Attempting to connect to MQTT broker...');
    const client = mqtt.connect(MQTT_BROKER_URL, {
        connectTimeout: 5000 // 5秒连接超时
    });

    client.on('connect', () => {
        console.log('Device simulator connected to MQTT broker.');

        setInterval(() => {
            const data = {
                deviceId: DEVICE_ID,
                voltage: 220 + (Math.random() * 10 - 5),
                current: 1.5 + (Math.random() * 1 - 0.5),
                timestamp: new Date().toISOString()
            };
            const message = JSON.stringify(data);
            client.publish(MQTT_TOPIC, message, () => {
                console.log(`Published: ${message}`);
            });
        }, 3000);
    });

    client.on('error', (err) => {
        console.error('Connection error, will retry in 5 seconds:', err.message);
        client.end();
        setTimeout(connectAndSimulate, 5000); // 5秒后重试
    });
}

connectAndSimulate(); // 启动连接