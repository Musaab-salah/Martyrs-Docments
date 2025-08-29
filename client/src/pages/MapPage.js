import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import ImageWithFallback from '../components/ImageWithFallback';
import { martyrsApi } from '../services/api';
import { formatDateToGregorian } from '../utils/dateFormatter';

// Helper function to get API base URL
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapPage = () => {
  const [martyrs, setMartyrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('clustering'); // 'clustering' or 'grouped'

  // State coordinates mapping for map markers (fallback when lat/lng not available)
  const stateCoordinates = {
    'الخرطوم (Khartoum)': [15.5007, 32.5599],
    'الجزيرة (Gezira)': [14.4060, 33.5186],
    'كسلا (Kassala)': [15.4500, 36.4000],
    'البحر الأحمر (Red Sea)': [19.5000, 37.2000],
    'شمال دارفور (North Darfur)': [13.6333, 25.3333],
    'جنوب دارفور (South Darfur)': [11.4000, 25.5000],
    'غرب دارفور (West Darfur)': [12.6167, 23.2667],
    'شرق دارفور (East Darfur)': [11.1333, 26.1333],
    'وسط دارفور (Central Darfur)': [12.4000, 24.8667],
    'شمال كردفان (North Kordofan)': [13.1667, 30.2167],
    'جنوب كردفان (South Kordofan)': [11.0167, 29.7167],
    'سنار (Sennar)': [13.5500, 33.6000],
    'النيل الأبيض (White Nile)': [13.1000, 33.7333],
    'النيل الأزرق (Blue Nile)': [11.1667, 34.3333],
    'نهر النيل (River Nile)': [18.2167, 32.8167],
    'الشمالية (Northern)': [19.6167, 30.2167],
    'غرب كردفان (West Kordofan)': [12.1667, 28.6667]
  };

  useEffect(() => {
    fetchMartyrs();
  }, []);

  const fetchMartyrs = async () => {
    try {
      const data = await martyrsApi.getAll();
      setMartyrs(data.martyrs);
    } catch (err) {
      console.error('Error fetching martyrs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group martyrs by location for grouped view
  const groupMartyrsByLocation = () => {
    const grouped = {};
    
    martyrs.forEach(martyr => {
      let placeData;
      try {
        placeData = JSON.parse(martyr.place_of_martyrdom);
      } catch (error) {
        placeData = { state: martyr.place_of_martyrdom, area: '' };
      }

      // Use state coordinates for map display
      let position = stateCoordinates[placeData.state];

      if (!position) return;

      const key = `${position[0]}-${position[1]}`;
      if (!grouped[key]) {
        grouped[key] = {
          position,
          martyrs: [],
          placeData
        };
      }
      grouped[key].martyrs.push(martyr);
    });

    return Object.values(grouped);
  };

  // Create custom marker icon with green theme
  const createCustomIcon = (count = 1) => {
    const size = count > 1 ? 30 : 25;
    const color = count > 1 ? '#059669' : '#10b981'; // Darker green for multiple martyrs
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${count > 1 ? '12px' : '14px'};
        ">
          ${count > 1 ? count : '●'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  const groupedLocations = groupMartyrsByLocation();

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">خريطة الشهداء</h2>
              <p className="text-gray-600">انقر على العلامات لعرض تفاصيل الشهداء</p>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => setViewMode('clustering')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'clustering'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                عرض جميع العلامات
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                تجميع حسب الموقع
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>إجمالي الشهداء: <span className="font-semibold text-green-600">{martyrs.length}</span></p>
            <p>عدد المواقع: <span className="font-semibold text-green-600">{groupedLocations.length}</span></p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
          <MapContainer 
            center={[15.5007, 32.5599]} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {viewMode === 'clustering' ? (
              // Option 1: Individual Markers - shows all individual markers
              martyrs.map((martyr) => {
                let placeData;
                try {
                  placeData = JSON.parse(martyr.place_of_martyrdom);
                } catch (error) {
                  placeData = { state: martyr.place_of_martyrdom, area: '' };
                }

                // Use state coordinates for map display
                let position = stateCoordinates[placeData.state];
                
                if (!position) return null;
                
                return (
                  <Marker 
                    key={martyr.id} 
                    position={position}
                    icon={createCustomIcon(1)}
                  >
                    <Popup>
                      <div className="text-right" dir="rtl">
                        <h3 className="font-bold text-lg">{martyr.name_ar}</h3>
                        <p className="text-sm text-gray-600">{martyr.name_en}</p>
                        <p className="text-sm"><strong>التاريخ:</strong> {formatDateToGregorian(martyr.date_of_martyrdom)}</p>
                        <p className="text-sm"><strong>الولاية:</strong> {placeData.state}</p>
                        {placeData.area && <p className="text-sm"><strong>المنطقة:</strong> {placeData.area}</p>}
                        <p className="text-sm"><strong>المهنة:</strong> {martyr.occupation}</p>
                        <ImageWithFallback 
                          src={martyr.image_url ? `${getApiBaseUrl()}${martyr.image_url}` : "/default.png"}
                          alt={martyr.name_ar}
                          className="w-20 h-20 object-cover rounded mt-2"
                          fallbackSrc="/default.png"
                        />
                        {martyr.bio && (
                          <p className="text-sm mt-2">{martyr.bio.substring(0, 100)}...</p>
                        )}
                        <div className="mt-3">
                          <Link 
                            to={`/martyr/${martyr.id}`}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            عرض التفاصيل
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })
            ) : (
              // Option 2: Grouped Markers - one marker per location with all martyrs in popup
              groupedLocations.map((location, index) => (
                <Marker 
                  key={index} 
                  position={location.position}
                  icon={createCustomIcon(location.martyrs.length)}
                >
                  <Popup>
                    <div className="text-right" dir="rtl" style={{ maxWidth: '300px' }}>
                      <h3 className="font-bold text-lg mb-2">
                        {location.martyrs.length > 1 
                          ? `${location.martyrs.length} شهيد في ${location.placeData.state}`
                          : location.martyrs[0].name_ar
                        }
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>الولاية:</strong> {location.placeData.state}
                        {location.placeData.area && <><br /><strong>المنطقة:</strong> {location.placeData.area}</>}
                      </p>
                      
                      <div className="max-h-60 overflow-y-auto">
                        {location.martyrs.map((martyr, martyrIndex) => (
                          <div key={martyr.id} className={`border-b border-gray-200 ${martyrIndex > 0 ? 'pt-3' : ''}`}>
                            <div className="flex items-start space-x-3 space-x-reverse">
                              <ImageWithFallback 
                                src={martyr.image_url ? `${getApiBaseUrl()}${martyr.image_url}` : "/default.png"}
                                alt={martyr.name_ar}
                                className="w-12 h-12 object-cover rounded flex-shrink-0"
                                fallbackSrc="/default.png"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm">{martyr.name_ar}</h4>
                                <p className="text-xs text-gray-600">{martyr.name_en}</p>
                                <p className="text-xs text-gray-700">
                                  <strong>التاريخ:</strong> {formatDateToGregorian(martyr.date_of_martyrdom)}
                                </p>
                                <p className="text-xs text-gray-700">
                                  <strong>المهنة:</strong> {martyr.occupation}
                                </p>
                                <Link 
                                  to={`/martyr/${martyr.id}`}
                                  className="inline-block mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                >
                                  عرض التفاصيل
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
