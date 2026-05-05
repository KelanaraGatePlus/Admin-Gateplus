import React from "react";

export function Toast({ toasts, removeToast }) {
    const meta = {
        success: { bar: "#22c55e", icon: "#22c55e", iconBg: "#f0fdf4" },
        error: { bar: "#ef4444", icon: "#ef4444", iconBg: "#fef2f2" },
        warning: { bar: "#f59e0b", icon: "#f59e0b", iconBg: "#fffbeb" },
        info: { bar: "#1297DC", icon: "#1297DC", iconBg: "#eff9ff" },
    };
    return (
        <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none">
            {toasts.map((t) => {
                const m = meta[t.type] || meta.info;
                return (
                    <div
                        key={t.id}
                        className="pointer-events-auto flex items-stretch min-w-[320px] max-w-sm rounded-xl overflow-hidden animate-[slideIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                        style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)" }}
                    >
                        {/* Left accent bar */}
                        <div className="w-1 flex-shrink-0" style={{ background: m.bar }} />
                        <div className="flex items-start gap-3 px-4 py-3.5 flex-1">
                            <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: m.iconBg }}>
                                {t.type === "success" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={m.icon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                {t.type === "error" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={m.icon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                                {t.type === "warning" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={m.icon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /></svg>}
                                {t.type === "info" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={m.icon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
                            </span>
                            <div className="flex-1 min-w-0">
                                {t.title && <p className="text-sm font-semibold text-gray-900 leading-tight">{t.title}</p>}
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{t.message}</p>
                            </div>
                            <button onClick={() => removeToast(t.id)} className="flex-shrink-0 ml-1 mt-0.5 text-gray-300 hover:text-gray-500 transition-colors">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}