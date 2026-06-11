import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Info, Trash2, Send, Plus, Search, ShoppingCart, Group, Layers } from 'lucide-react';
import { sceneTypes, sensorTypes } from '../data/mockData';

export function Apply() {
  const { selectedSamples, samples, removeSelectedSample, submitApplication, addSamplesToSelection } = useStore();
  const navigate = useNavigate();

  const [purpose, setPurpose] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'group'>('list');

  const selectedSamplesData = selectedSamples.map((id) => samples.find((s) => s.id === id)).filter(Boolean) as typeof samples;

  const groupedSamples = selectedSamplesData.reduce((acc, sample) => {
    const key = `${sample.scene_type}-${sample.sensor_type}`;
    if (!acc[key]) {
      acc[key] = {
        sceneType: sample.scene_type,
        sensorType: sample.sensor_type,
        count: 0,
        samples: [],
      };
    }
    acc[key].count++;
    acc[key].samples.push(sample);
    return acc;
  }, {} as Record<string, { sceneType: string; sensorType: string; count: number; samples: typeof samples }>);

  const handleSubmit = () => {
    if (!purpose.trim()) return;
    if (!agreed) return;

    submitApplication(purpose);
    navigate('/records');
  };

  const handleRemoveGroup = (groupKey: string) => {
    const group = groupedSamples[groupKey];
    group.samples.forEach((sample) => {
      removeSelectedSample(sample.id);
    });
  };

  const handleAddBySceneType = (sceneType: string) => {
    const matchingSamples = samples.filter((s) => s.scene_type === sceneType && !selectedSamples.includes(s.id));
    addSamplesToSelection(matchingSamples.map((s) => s.id));
  };

  const handleAddBySensorType = (sensorType: string) => {
    const matchingSamples = samples.filter((s) => s.sensor_type === sensorType && !selectedSamples.includes(s.id));
    addSamplesToSelection(matchingSamples.map((s) => s.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900">申请下载</h1>
              {selectedSamples.length > 0 && (
                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-sm rounded-full">
                  {selectedSamples.length} 个样本
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/search"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                继续添加
              </Link>
              {selectedSamples.length > 0 && (
                <button
                  onClick={() => {
                    selectedSamples.forEach((id) => removeSelectedSample(id));
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  实验数据篮
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="列表视图"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('group')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'group' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="分组视图"
                  >
                    <Group className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedSamplesData.length > 0 ? (
                viewMode === 'list' ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedSamplesData.map((sample) => (
                      <div key={sample.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={sample.thumbnail_url}
                          alt={sample.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{sample.name}</h3>
                          <p className="text-sm text-gray-500">
                            {sample.scene_type} - {sample.sensor_type} - {sample.terrain}
                          </p>
                        </div>
                        <button
                          onClick={() => removeSelectedSample(sample.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="移除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(groupedSamples).map(([key, group]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {group.sceneType} - {group.sensorType}
                            </div>
                            <div className="text-sm text-gray-500">{group.count} 个样本</div>
                          </div>
                          <button
                            onClick={() => handleRemoveGroup(key)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.samples.map((sample) => (
                            <div key={sample.id} className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-700">
                              {sample.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-4">实验数据篮为空</p>
                  <Link
                    to="/search"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    去检索添加
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">按类型快速添加</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-2">按场景类型</div>
                  <div className="flex flex-wrap gap-2">
                    {sceneTypes.map((type) => {
                      const count = samples.filter((s) => s.scene_type === type && !selectedSamples.includes(s.id)).length;
                      return (
                        <button
                          key={type}
                          onClick={() => handleAddBySceneType(type)}
                          disabled={count === 0}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            count > 0
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {type} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2">按传感器类型</div>
                  <div className="flex flex-wrap gap-2">
                    {sensorTypes.map((type) => {
                      const count = samples.filter((s) => s.sensor_type === type && !selectedSamples.includes(s.id)).length;
                      return (
                        <button
                          key={type}
                          onClick={() => handleAddBySensorType(type)}
                          disabled={count === 0}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            count > 0
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {type} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">使用说明</h2>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="请详细说明您将如何使用这些数据，包括研究目的、预期成果等..."
                className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="mt-2 text-sm text-gray-500">
                请提供足够详细的说明，以便我们评估您的申请。
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
                <div className="text-sm text-gray-600">
                  我已阅读并同意《数据使用协议》，承诺仅将数据用于非商业研究目的，并在发表相关成果时引用本数据集。
                </div>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedSamplesData.length === 0 || !purpose.trim() || !agreed}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              提交申请
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-4">申请须知</h3>
              <ul className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>申请审核周期为1-3个工作日</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>审核结果将通过邮件通知</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>数据仅限非商业研究使用</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>发表成果时需引用本数据集</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6">
              <h3 className="font-semibold text-yellow-900 mb-4">注意事项</h3>
              <ul className="space-y-3 text-sm text-yellow-800">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>请确保使用说明真实准确</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>滥用数据将导致访问权限被撤销</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>如需商业使用，请联系管理员</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}