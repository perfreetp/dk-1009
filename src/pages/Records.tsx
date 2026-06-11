import { useState } from 'react';
import { useStore } from '../store';
import { ClipboardList, Download, Calendar, CheckCircle, Clock, XCircle, FileText, Copy, ChevronRight, Quote, Check } from 'lucide-react';

export function Records() {
  const { applications, samples, recordDownload, getDownloadsForApplication } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const getSampleNames = (sampleIds: string[]) => {
    return sampleIds.map((id) => samples.find((s) => s.id === id)?.name).filter(Boolean) as string[];
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

  const handleDownload = (applicationId: string) => {
    recordDownload(applicationId);
  };

  const generateCitation = (app: typeof applications[0]) => {
    const sampleNames = getSampleNames(app.sample_ids).join('; ');
    const date = new Date(app.submitted_at);
    const year = date.getFullYear();
    return `低空数据集样本 [${sampleNames}]. 低空数据集平台, ${year}. Available at: https://lowaltitude.edu/dataset/${app.id}`;
  };

  const getDownloadHistory = (applicationId: string) => {
    return getDownloadsForApplication(applicationId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900">申请记录</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-sm rounded-full">
              {applications.length}
            </span>
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
              const downloads = getDownloadHistory(application.id);
              const isExpanded = expandedApp === application.id;

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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedApp(isExpanded ? null : application.id)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? '收起详情' : '查看详情'}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">申请数据 ({application.sample_ids.length}个)</h3>
                      <div className="flex flex-wrap gap-2">
                        {sampleNames.slice(0, 3).map((name, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg truncate max-w-[200px]"
                          >
                            {name}
                          </span>
                        ))}
                        {sampleNames.length > 3 && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-lg">
                            +{sampleNames.length - 3} 更多
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">使用说明</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{application.purpose}</p>
                    </div>

                    {application.status === 'approved' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500">
                            <Download className="w-4 h-4 inline mr-1" />
                            下载次数: {downloads.length}
                          </span>
                          <button
                            onClick={() => handleDownload(application.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            下载数据
                          </button>
                        </div>

                        {downloads.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-2">下载记录:</div>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {downloads.map((d, i) => (
                                <div key={d.id} className="text-xs text-gray-600 flex items-center gap-2">
                                  <Check className="w-3 h-3 text-green-500" />
                                  {formatDate(d.downloaded_at)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-blue-800 font-medium">
                              <Quote className="w-4 h-4" />
                              引用信息
                            </div>
                            <button
                              onClick={() => handleCopy(generateCitation(application))}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              {copiedId === application.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  已复制
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  复制引用
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-xs text-blue-700 bg-white/50 rounded p-2 font-mono leading-relaxed">
                            {generateCitation(application)}
                          </div>
                        </div>
                      </div>
                    )}

                    {application.status === 'rejected' && application.review_comment && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-sm font-medium text-red-800 mb-1">拒绝原因</div>
                        <p className="text-sm text-red-600">{application.review_comment}</p>
                      </div>
                    )}

                    {application.status === 'pending' && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-600">
                          您的申请正在审核中，请耐心等待。我们会在1-3个工作日内完成审核并通过邮件通知您结果。
                        </div>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">申请ID</div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-gray-600 bg-white px-2 py-1 rounded">{application.id}</code>
                          <button
                            onClick={() => handleCopy(application.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">申请时间</div>
                        <div className="text-sm text-gray-600">{formatDate(application.submitted_at)}</div>
                      </div>

                      {application.reviewed_at && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">审核时间</div>
                          <div className="text-sm text-gray-600">{formatDate(application.reviewed_at)}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">完整样本列表</div>
                        <div className="space-y-2">
                          {sampleNames.map((name, index) => (
                            <div key={index} className="text-sm text-gray-600 bg-white px-3 py-2 rounded">
                              {name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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