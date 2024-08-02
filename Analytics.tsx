import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    currentPeople: 0,
    avgDuration: 0,
    peakTime: null,
    mostUsedGate: null,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await axios.get('http://localhost:3000/api/analytics');
      setAnalytics(response.data);
    };
    fetchAnalytics();
  }, []);

  return (
    <div>
      <h2>Analytics</h2>
      <p>Current People: {analytics.currentPeople}</p>
      <p>Average Duration of Stay: {analytics.avgDuration / 1000 / 60} minutes</p>
      <p>Peak Time: {analytics.peakTime}:00</p>
      <p>Most Used Gate: {analytics.mostUsedGate}</p>
    </div>
  );
};

export default Analytics;
