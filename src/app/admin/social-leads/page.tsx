'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Copy,
  ExternalLink,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Bookmark,
  Share2,
} from 'lucide-react';

interface SocialLead {
  id: string;
  sourceType: string;
  groupName: string;
  postUrl?: string | null;
  postText: string;
  locationText?: string | null;
  serviceCategory: string;
  areaStatus: 'IN_AREA' | 'NEEDS_REVIEW' | 'OUTSIDE_AREA';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'SAFETY';
  safetyFlag?: string | null;
  leadScore: number;
  recommendedAction: string;
  replyDraft?: string | null;
  status: string;
  operatorNotes?: string | null;
  createdAt: string;
}

export default function AdminSocialLeadsPage() {
  const [leads, setLeads] = useState<SocialLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkletCode, setBookmarkletCode] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [locationText, setLocationText] = useState('');
  const [postText, setPostText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus) query.set('status', filterStatus);
      const res = await fetch(`/api/social-leads?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      }
    } catch {}
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    fetchLeads();
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const code = `javascript:(function(){var s=window.getSelection().toString().trim();if(!s){alert('请先划选Facebook帖子的文字！');return;}var u=window.location.href;var t=document.title||'Facebook Group';var d=document.createElement('div');d.style='position:fixed;top:20px;right:20px;z-index:9999999;background:#15803d;color:#fff;padding:12px 20px;border-radius:10px;font-family:sans-serif;font-size:14px;font-weight:bold;box-shadow:0 8px 24px rgba(0,0,0,0.3);border:2px solid #86efac;';d.innerHTML='✅ 已同步到 Surefire 工作台！正在进行 AI 打分...';document.body.appendChild(d);setTimeout(function(){d.remove();},3500);var p='${origin}/quick-capture?group='+encodeURIComponent(t)+'&url='+encodeURIComponent(u)+'&text='+encodeURIComponent(s);window.open(p,'surefire_sync','width=480,height=360,menubar=no,toolbar=no');})();`;
      setBookmarkletCode(code);
    }
  }, [fetchLeads]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/social-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: groupName.trim() || 'Facebook Group',
          postUrl: postUrl.trim() || null,
          locationText: locationText.trim() || null,
          postText: postText.trim(),
        }),
      });
      if (res.ok) {
        setPostText('');
        setPostUrl('');
        setLocationText('');
        showToast('✓ 帖子已成功录入并完成 AI 智能分析与英文回复草稿生成！');
        fetchLeads();
      }
    } catch {}
    setSubmitting(false);
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/social-leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
      showToast(`状态已更新为: ${newStatus}`);
    } catch {}
  };

  const deleteLead = async (id: string) => {
    if (!confirm('确定要删除此条线索记录吗？')) return;
    try {
      await fetch(`/api/social-leads/${id}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      showToast('线索已删除');
    } catch {}
  };

  const copyReplyDraft = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    showToast('✓ 回复草稿已复制到剪贴板，可直接在 Facebook 粘贴发送！');
  };

  const fillSampleWarringtonBath = () => {
    setGroupName('Warrington Professional Handyman Services');
    setPostUrl('https://www.facebook.com/groups/446408770029790');
    setLocationText(''); // Leave empty to test auto WA1 location extraction
    setPostText(
      'Can anyone recommend someone to re fit/ adjust and fix a bath please? We had it fitted in "good faith" but have been made aware as it\'s a shower bath it needs wooden frame / battens to be attached to the wall/ bath before sides and shower screen can go up and it be used ! We are in wa1 and need it doing asap please by some one who is experienced. Many thanks'
    );
    showToast('已填入真实 Facebook 群组测试样本 (Warrington WA1 浴室安装/调整需求)！');
  };

  const fillSampleWarringtonTap = () => {
    setGroupName('Warrington Community Forum');
    setPostUrl('https://www.facebook.com/groups/warrington-residents/posts/102938475');
    setLocationText('');
    setPostText(
      'Can anyone recommend a reliable plumber in Warrington? My kitchen tap is leaking and dripping non-stop under the sink.'
    );
    showToast('已填入 Warrington 水龙头漏水需求样本！');
  };

  const getBookingServiceId = (category: string) => {
    if (category === 'boiler_heating') return 'boiler-heating';
    if (category === 'leak_repair') return 'emergency-plumbing';
    return 'general-repairs';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0F2B4A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-blue-400 text-sm font-medium animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-slate-400 hover:text-slate-700 transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-[#0F2B4A]">
              社交线索智能工作台 · Social Lead Workbench
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            涵盖 Liverpool · Merseyside · Cheshire · Runcorn · Widnes · Warrington · 曼城核心区 · 遵守合规原则 · 人工审核发送
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-semibold">
            £40 标准上门费 · 免费估价
          </span>
          <button
            onClick={fetchLeads}
            className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            刷新线索
          </button>
        </div>
      </div>

      {/* Bookmarklet Quick Setup Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
          <Bookmark size={20} className="text-emerald-600" />
          <span>⚡ 浏览器一键划选书签配置（解决 Facebook 跨域阻断与 Mixed Content 问题）</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>操作方法：</strong>鼠标按住下方的蓝色按钮，直接拖拽到浏览器的<strong>书签栏（Bookmarks Bar）</strong>。
          在 Facebook 浏览群组时，鼠标<strong>划选关键帖子正文</strong>，点击该书签，系统会自动在右上角弹出
          <span className="text-emerald-700 font-bold">「✅ 已同步到工作台」</span>，并在后台完成 AI 区域核验与英式英语回复草稿生成！
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href={bookmarkletCode}
            onClick={(e) => {
              if (window.location.protocol === 'file:') return;
              e.preventDefault();
              showToast('请按住此按钮直接拖动到浏览器的书签栏中！');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md hover:bg-blue-700 cursor-grab active:cursor-grabbing transition"
          >
            📌 拖我到书签栏 (Surefire 划选捕获)
          </a>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(bookmarkletCode);
              showToast('✓ 书签代码已复制！您也可在浏览器新建书签并粘贴为网址 (URL)');
            }}
            className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-2 rounded-xl transition"
          >
            复制代码手动添加书签
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Capture Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-[#0F2B4A] text-base">录入 / 捕获帖子</h2>
            <span className="text-xs text-slate-400">手动或插件</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">快速测试样本</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fillSampleWarringtonBath}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition"
              >
                ⚡ 样本: Warrington WA1 浴室调整
              </button>
              <button
                type="button"
                onClick={fillSampleWarringtonTap}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition"
              >
                ⚡ 样本: Warrington 厨房水龙头漏水
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateLead} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facebook 群组名称 *
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="例如: Warrington Community Forum"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                原帖链接 (URL)
              </label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.facebook.com/groups/..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                确认地区 / 邮编 (选填，留空则自动提取)
              </label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="例如: Warrington, WA1, L18 (留空自动扫描正文)"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                帖子正文内容 *
              </label>
              <textarea
                required
                rows={5}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="在此粘贴客户在群组里寻找水暖工的提问内容..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#0F2B4A] hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {submitting ? '正在分析...' : 'AI 智能分析并生成回复草稿'}
            </button>
          </form>
        </div>

        {/* Right Columns: Leads Inbox */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="font-bold text-[#0F2B4A] text-base">客户需求线索收件箱</h2>
              <p className="text-xs text-slate-500">已自动过滤非服务区并拦截燃气安全隐患</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">状态筛选:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs p-2 border border-slate-300 rounded-xl bg-white focus:outline-none"
              >
                <option value="">全部状态 ({leads.length})</option>
                <option value="NEW">新线索 (NEW)</option>
                <option value="READY_FOR_MANUAL_REPLY">已审核就绪 (READY)</option>
                <option value="MANUALLY_REPLIED">已在FB回复 (REPLIED)</option>
                <option value="CONVERTED">已转换为工单 (CONVERTED)</option>
                <option value="SAFETY_REVIEW_REQUIRED">燃气安全风险 (SAFETY)</option>
                <option value="OUTSIDE_SERVICE_AREA">超出服务范围 (OUTSIDE)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              正在同步线索列表...
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
              <p className="font-semibold text-slate-700">暂无线索记录</p>
              <p className="text-xs text-slate-400">
                可通过左侧表单手动录入，或在 Facebook 划选文字点击书签自动采集。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => {
                const isSafety = Boolean(lead.safetyFlag);
                const isArea = lead.areaStatus === 'IN_AREA';
                const bookingService = getBookingServiceId(lead.serviceCategory);
                const bookingUrl = `/booking/datetime?service=${bookingService}&location=${encodeURIComponent(
                  lead.locationText || ''
                )}`;

                return (
                  <div
                    key={lead.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-baseline gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm capitalize">
                          {lead.serviceCategory.replace('_', ' ')}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          评分: {lead.leadScore}/100
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {lead.createdAt?.slice(0, 16).replace('T', ' ')}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold ${
                          isArea
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        📍 {lead.areaStatus} {lead.locationText ? `(${lead.locationText})` : ''}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        ⏱️ {lead.urgency}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        来源: {lead.sourceType}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                        状态: {lead.status}
                      </span>
                      {isSafety && (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold animate-pulse">
                          ⚠️ 燃气/一氧化碳安全拦截
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>
                        <strong>所属群组:</strong> {lead.groupName}
                        {lead.postUrl && (
                          <a
                            href={lead.postUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-2"
                          >
                            原帖链接 <ExternalLink size={11} />
                          </a>
                        )}
                      </p>
                    </div>

                    {/* Post Excerpt */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-sans">
                      <p className="font-semibold text-slate-500 mb-1">捕获的帖子正文:</p>
                      <p className="whitespace-pre-wrap">{lead.postText}</p>
                    </div>

                    {/* Safety Alert Warning */}
                    {isSafety && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle size={15} className="text-red-600" />
                          <span>已拦截常规商业推广回复：涉及燃气或一氧化碳安全！</span>
                        </div>
                        <p>
                          必须遵守英国 Gas Safe 规范，请指引客户关闭总阀并立即拨打国家燃气急救热线 0800 111 999。
                        </p>
                      </div>
                    )}

                    {/* Reply Draft */}
                    {lead.replyDraft && !isSafety && (
                      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                            <Sparkles size={14} className="text-blue-600" /> 推荐本地化英式回复草稿 (AI Generated)
                          </span>
                          <span className="text-xs text-blue-700">含 20+ 年信誉及实时日历预约链接</span>
                        </div>
                        <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-blue-100 whitespace-pre-wrap leading-relaxed font-sans">
                          {lead.replyDraft}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => copyReplyDraft(lead.id, lead.replyDraft!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                          >
                            <Copy size={13} />
                            {copiedId === lead.id ? '✓ 已复制到剪贴板！' : '一键复制回复草稿'}
                          </button>
                          {lead.postUrl && (
                            <a
                              href={lead.postUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition"
                            >
                              <ExternalLink size={13} /> 打开 Facebook 发送
                            </a>
                          )}
                          <Link
                            href={bookingUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                          >
                            <Calendar size={13} /> 一键转为平台预约单
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'READY_FOR_MANUAL_REPLY')}
                        disabled={lead.status === 'READY_FOR_MANUAL_REPLY' || isSafety}
                        className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-40 font-medium"
                      >
                        确认审核通过
                      </button>
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'MANUALLY_REPLIED')}
                        disabled={lead.status === 'MANUALLY_REPLIED'}
                        className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-40 font-medium"
                      >
                        标记已在 FB 发送
                      </button>
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'CONVERTED')}
                        disabled={lead.status === 'CONVERTED'}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg hover:bg-emerald-100 disabled:opacity-40 font-semibold"
                      >
                        标记已成单 (Converted)
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="删除线索"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
