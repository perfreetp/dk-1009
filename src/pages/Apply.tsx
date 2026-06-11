import { useState } from 'react';
import { useStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Info, Trash2, Send } from 'lucide-react';

export function Apply() {
  const { selectedSamples, samples, removeSelectedSample, submitApplication } = useStore();
  const navigate = useNavigate();
  
  const [purpose, setPurpose] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedSamplesData = selectedSamples.map((id) => samples.find((s) => s.id === id)).filter(Boolean);

  const handleSubmit = () => {
    if (!purpose.trim()) return;
    if (!agreed) return;
    
    submitApplication(purpose);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">申请提交成功</h2>
          <p className="text-gray-500 mb-6">
            您的申请已提交，我们将在1-3个工作日内审核并通过邮件通知您结果。
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/search')}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              继续检索
            </button>
            <button
              onClick={() => navigate('/records')}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              查看记录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900">申请下载</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">选择的数据样本</h2>
              
              {selectedSamplesData.length > 0 ? (
                <div className="space-y-3">
                  {selectedSamplesData.map((sample) => (
                    <div key={sample.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={sample.thumbnail_url}
                        alt={sample.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{sample.name}</h3>
                        <p className="text-sm text-gray-500">{sample.scene_type} - {sample.sensor_type}</p>
                      </div>
                      <button
                        onClick={() => removeSelectedSample(sample.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>暂无选择的数据样本</p>
                  <Link to="/search" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    去检索并选择样本
                  </Link>
                </div>
              )}
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