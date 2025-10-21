import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [deviceData, setDeviceData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // 我们的后端服务运行在3001端口
      const response = await fetch('http://localhost:3001/api/latest-data');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDeviceData(data);
    } catch (error) {
      setError(error.message);
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // 页面加载时获取一次数据
    const intervalId = setInterval(fetchData, 3000); // 每3秒刷新一次

    return () => clearInterval(intervalId); // 组件卸载时清除定时器
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>EMS Real-Time Data</h1>
        {error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : (
          <div>
            <h2>Latest Reading</h2>
            {deviceData.length > 0 ? (
              <ul>
                {deviceData.map((item, index) => (
                  <li key={index}>
                    <strong>{item._field}:</strong> {item._value.toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Waiting for data...</p>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;