import { MapPin, Navigation } from 'lucide-react';

interface TrajectoryMapProps {
  path: { lat: number; lng: number }[];
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

export function TrajectoryMap({ path, startLat, startLng, endLat, endLng }: TrajectoryMapProps) {
  const minLat = Math.min(...path.map(p => p.lat));
  const maxLat = Math.max(...path.map(p => p.lat));
  const minLng = Math.min(...path.map(p => p.lng));
  const maxLng = Math.max(...path.map(p => p.lng));
  
  const padding = 0.001;
  const width = 400;
  const height = 300;
  
  const scaleX = width / ((maxLng - minLng) || 0.001 + padding * 2);
  const scaleY = height / ((maxLat - minLat) || 0.001 + padding * 2);
  
  const toSVGCoords = (lat: number, lng: number) => ({
    x: (lng - minLng + padding) * scaleX,
    y: height - (lat - minLat + padding) * scaleY
  });
  
  const points = path.map(p => toSVGCoords(p.lat, p.lng));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900">飞行轨迹</h3>
      </div>
      <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: '#f0f9ff' }}>
        <svg width={width} height={height} className="mx-auto">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          
          <g>
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={(height / 4) * i}
                x2={width}
                y2={(height / 4) * i}
                stroke="#cbd5e1"
                strokeWidth="0.5"
                strokeDasharray="4"
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={(width / 4) * i}
                y1={0}
                x2={(width / 4) * i}
                y2={height}
                stroke="#cbd5e1"
                strokeWidth="0.5"
                strokeDasharray="4"
              />
            ))}
          </g>
          
          <path
            d={pathD}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <circle
            cx={toSVGCoords(startLat, startLng).x}
            cy={toSVGCoords(startLat, startLng).y}
            r="8"
            fill="#22c55e"
            className="animate-pulse"
          />
          <text
            x={toSVGCoords(startLat, startLng).x}
            y={toSVGCoords(startLat, startLng).y - 15}
            textAnchor="middle"
            className="text-xs fill-gray-600"
            fontSize="10"
          >
            起点
          </text>
          
          <circle
            cx={toSVGCoords(endLat, endLng).x}
            cy={toSVGCoords(endLat, endLng).y}
            r="8"
            fill="#ef4444"
          />
          <text
            x={toSVGCoords(endLat, endLng).x}
            y={toSVGCoords(endLat, endLng).y - 15}
            textAnchor="middle"
            className="text-xs fill-gray-600"
            fontSize="10"
          >
            终点
          </text>
        </svg>
        
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            轨迹可视化
          </span>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500">起点坐标</div>
          <div className="font-medium text-gray-900">{startLat.toFixed(4)}, {startLng.toFixed(4)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500">终点坐标</div>
          <div className="font-medium text-gray-900">{endLat.toFixed(4)}, {endLng.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}