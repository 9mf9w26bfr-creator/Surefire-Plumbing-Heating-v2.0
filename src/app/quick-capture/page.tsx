'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

function QuickCaptureContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<any>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const text = searchParams.get('text') || '';
    const group = searchParams.get('group') || 'Facebook Group';
    const url = searchParams.get('url') || '';
    const loc = searchParams.get('location') || '';

    if (!text) {
      setStatus('error');
      return;
    }

    async function submitLead() {
      try {
        const res = await fetch('/api/social-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceType: 'BROWSER_BOOKMARKLET',
            groupName: group,
            postUrl: url,
            locationText: loc,
            postText: text,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setResult(data.lead);
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    }

    submitLead();
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            try {
              window.close();
            } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
        {status === 'loading' && (
          <div className="py-6 space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-lg font-bold text-slate-900">正在同步至 Surefire 工作台...</h2>
            <p className="text-xs text-slate-500">AI 正在分析客户需求、核验服务区域与生成回复草稿</p>
          </div>
        )}

        {status === 'success' && result && (
          <div className="py-2 space-y-3">
            <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">✅ 已成功同步到工作台！</h2>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">服务区域:</span>
                <span className="font-semibold text-green-700">
                  📍 {result.areaStatus} {result.locationText ? `(${result.locationText})` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">需求分类:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {result.serviceCategory.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">意向评分:</span>
                <span className="font-bold text-blue-700">{result.leadScore} / 100</span>
              </div>
              {result.safetyFlag ? (
                <div className="p-2 bg-red-50 text-red-700 rounded font-medium mt-1">
                  ⚠️ 燃气/一氧化碳安全预警：已强制拦截商业回复
                </div>
              ) : (
                <div className="p-2 bg-blue-50 text-blue-800 rounded font-medium mt-1">
                  ✍️ 地道英式英语回复草稿已生成，等待管理员确认
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              窗口将在 <span className="font-bold text-slate-700">{countdown}</span> 秒后自动关闭...
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => window.close()}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                立即关闭
              </button>
              <a
                href="/admin/social-leads"
                target="_blank"
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-1"
              >
                打开工作台 <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-3">
            <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">同步失败</h2>
            <p className="text-xs text-slate-500">未能提取到有效的划选内容，请重新在 Facebook 选中文本后再试。</p>
            <button
              onClick={() => window.close()}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              关闭窗口
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuickCapturePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
          正在加载中转窗口...
        </div>
      }
    >
      <QuickCaptureContent />
    </Suspense>
  );
}
