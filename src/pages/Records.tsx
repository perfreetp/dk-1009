import { useStore } from '../store';
import { mockDownloads } from '../data/mockData';
import { ClipboardList, Download, Calendar, CheckCircle, Clock, XCircle, FileText, Copy, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function Records() {
  const { applications, samples } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getSampleNames = (sampleIds: string[]) => {
    return sampleIds.map((id) => samples.find((s) => s.id === id)?.name).filter(Boolean);
  };

  const getDownloadCount = (appId: string) => {
    return mockDownloads.filter((d) => d.application_id === appId).length;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待审核', color: 'bg-orange-100 text-orange-600', icon: Clock };
      case 'approved':
        return { label: '已通过', color: 'bg-green-100 text-green-600', icon: CheckCircle };
      case 'rejected':
        return { label: '已拒绝', color: 'bg-red-100 text-red-600', icon: XCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-600', icon: FileText };
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900">申请记录</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusInfo = getStatusInfo(application.status);
              const StatusIcon = statusInfo.icon;
              const sampleNames = getSampleNames(application.sample_ids);
              const downloadCount = getDownloadCount(application.id);

              return (
                <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(application.submitted_at)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(application.id)}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedId === application.id ? '已复制' : '复制ID'}
                      </button>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">申请数据</h3>
                      <div className="flex flex-wrap gap-2">
                        {sampleNames.map((name, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">使用说明</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{application.purpose}</p>
                    </div>

                    {application.status === 'approved' && application.reviewed_at && (
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            审核时间: {formatDate(application.reviewed_at)}
                          </span>
                          <span className="text-sm text-gray-500">
                            <Download className="w-4 h-4 inline mr-1" />
                            下载次数: {downloadCount}
                          </span>
                        </div>
                        <button className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                          下载数据
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {application.status === 'rejected' && application.review_comment && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-sm font-medium text-red-800 mb-1">拒绝原因</div>
                        <p className="text-sm text-red-600">{application.review_comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无申请记录</h3>
            <p className="text-gray-500 mb-6">您还没有提交任何数据申请</p>
          </div>
        )}
      </div>
    </div>
  );
}