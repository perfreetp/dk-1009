import { useState } from 'react';
import { Tag, Eye, EyeOff } from 'lucide-react';
import { Annotation } from '../../types';

interface AnnotationLayerProps {
  annotations: Annotation[];
}

export function AnnotationLayer({ annotations }: AnnotationLayerProps) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set());

  const types = [...new Set(annotations.map(a => a.type))];

  const toggleType = (type: string) => {
    if (visibleTypes.has(type)) {
      visibleTypes.delete(type);
    } else {
      visibleTypes.add(type);
    }
    setVisibleTypes(new Set(visibleTypes));
  };

  const filteredAnnotations = annotations.filter(a => visibleTypes.has(a.type));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900">标注层</h3>
        <span className="text-sm text-gray-500">({annotations.length}个标注)</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {types.map((type) => {
          const isVisible = visibleTypes.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isVisible
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {type}
            </button>
          );
        })}
      </div>

      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: 200 }}>
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {filteredAnnotations.map((annotation, index) => {
            const coord = annotation.coordinates[0] || { x: 0, y: 0, width: 50, height: 30 };
            const x = (coord.x / 400) * 100;
            const y = (coord.y / 200) * 100;
            const width = (coord.width / 400) * 100;
            const height = (coord.height / 200) * 100;
            
            const colors: Record<string, string> = {
              '建筑物': 'fill-red-500/30 stroke-red-400',
              '道路': 'fill-yellow-500/30 stroke-yellow-400',
              '车辆': 'fill-blue-500/30 stroke-blue-400',
              '树木': 'fill-green-500/30 stroke-green-400',
              '地形': 'fill-purple-500/30 stroke-purple-400',
            };
            
            return (
              <g key={annotation.id}>
                <rect
                  x={`${x}%`}
                  y={`${y}%`}
                  width={`${width}%`}
                  height={`${height}%`}
                  className={`${colors[annotation.type] || 'fill-gray-500/30 stroke-gray-400'} stroke-2`}
                  rx="4"
                  onClick={() => setActiveType(activeType === annotation.type ? null : annotation.type)}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  x={`${x + width/2}%`}
                  y={`${y - 5}%`}
                  textAnchor="middle"
                  className="fill-white text-xs"
                  fontSize="10"
                >
                  {annotation.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {filteredAnnotations.length === 0 && types.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">请选择标注类型查看</p>
        </div>
      )}

      {annotations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无标注数据</p>
        </div>
      )}
    </div>
  );
}