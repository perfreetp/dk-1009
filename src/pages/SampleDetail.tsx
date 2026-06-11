import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ThumbnailGallery } from '../components/Sample/ThumbnailGallery';
import { TrajectoryMap } from '../components/Sample/TrajectoryMap';
import { AnnotationLayer } from '../components/Sample/AnnotationLayer';
import { mockAnnotations, mockTrajectories } from '../data/mockData';
import { ArrowLeft, Bookmark, Download, Calendar, Camera, MapPin, Cloud, Ruler, Tag } from 'lucide-react';

export function SampleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { samples, isFavorite, addFavorite, removeFavorite } = useStore();

  const sample = samples.find((s) => s.id === id);
  const annotations = mockAnnotations.filter((a) => a.sample_id === id);
  const trajectory = mockTrajectories.find((t) => t.sample_id === id);

  const favorite = isFavorite(id || '');

  const handleFavorite = () => {
    if (favorite) {
      removeFavorite(id || '');
    } else {
      addFavorite(id || '');
    }
  };

  if (!sample) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">样本不存在</h3>
          <p className="text-gray-500 mb-4">未找到指定的样本信息</p>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回检索
          </button>
        </div>
      </div>
    );
  }

  const thumbnails = [
    sample.thumbnail_url,
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(sample.scene_type + ' aerial view detail')}&image_size=landscape_16_9`,
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(sample.scene_type + ' drone photography closeup')}&image_size=landscape_16_9`,
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{sample.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ThumbnailGallery mainUrl={sample.thumbnail_url} thumbnails={thumbnails} />

            {trajectory && (
              <TrajectoryMap
                path={trajectory.path}
                startLat={trajectory.start_latitude}
                startLng={trajectory.start_longitude}
                endLat={trajectory.end_latitude}
                endLng={trajectory.end_longitude}
              />
            )}

            <AnnotationLayer annotations={annotations} />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">基本信息</h2>
                <button
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    favorite
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
                  {favorite ? '已收藏' : '收藏'}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">传感器类型</div>
                    <div className="font-medium text-gray-900">{sample.sensor_type}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ruler className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">飞行高度</div>
                    <div className="font-medium text-gray-900">{sample.flight_height} 米</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">地貌类型</div>
                    <div className="font-medium text-gray-900">{sample.terrain}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">天气条件</div>
                    <div className="font-medium text-gray-900">{sample.weather}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">采集时间</div>
                    <div className="font-medium text-gray-900">{formatDate(sample.captured_at)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-2">目标类别</div>
                <div className="flex flex-wrap gap-2">
                  {sample.target_classes.split(',').map((cls) => (
                    <span
                      key={cls}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-2">采集说明</div>
                <p className="text-gray-700 text-sm leading-relaxed">{sample.description}</p>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4" />
                申请下载
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}