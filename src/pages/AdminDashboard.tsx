import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  MapPin,
  Shield 
} from 'lucide-react';

interface DashboardMetrics {
  totalForms: number;
  completionRate: number;
  averageTime: number;
  errorRate: number;
  userLocations: Array<{
    latitude: number;
    longitude: number;
    count: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalForms: 0,
    completionRate: 0,
    averageTime: 0,
    errorRate: 0,
    userLocations: []
  });
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Initialize Mapbox
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    const mapInstance = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v11',
      center: [78.9629, 20.5937], // Center of India
      zoom: 4
    });

    setMap(mapInstance);

    // Fetch metrics
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();

    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (map && metrics.userLocations.length > 0) {
      // Add heatmap layer
      map.addLayer({
        id: 'user-heatmap',
        type: 'heatmap',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: metrics.userLocations.map(loc => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [loc.longitude, loc.latitude]
              },
              properties: {
                weight: loc.count
              }
            }))
          }
        },
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': 30
        }
      });
    }
  }, [map, metrics.userLocations]);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Forms Completed',
        data: [65, 78, 90, 85, 95, 100],
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4
      }
    ]
  };

  const errorData = {
    labels: ['Validation', 'Network', 'Server', 'Other'],
    datasets: [
      {
        data: [30, 25, 15, 30],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(107, 114, 128)'
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalForms}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FileCheck className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.completionRate}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Time</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.averageTime}m</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.errorRate}%</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Submissions Trend</h2>
            <Line data={chartData} options={{ maintainAspectRatio: false }} height={300} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Error Distribution</h2>
            <Doughnut data={errorData} options={{ maintainAspectRatio: false }} height={300} />
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">User Geography</h2>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              Active Users Heatmap
            </div>
          </div>
          <div id="map" className="h-[400px] rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;