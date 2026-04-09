import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const SearchIcon  = () => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
const ArchiveIcon = () => <Icon d="M21 8v13H3V8M1 3h22v5H1V3zM10 12h4" />;
const CheckIcon   = () => <Icon d="M20 6L9 17l-5-5" />;
const TrashIcon   = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const MailIcon    = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />;
const UserIcon    = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />;

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({ totalPages: 1, totalItems: 0 });
  const [activeTab, setActiveTab] = useState("new"); 
  const [searchQuery, setSearchQuery] = useState("");
  

  // جلب الرسائل من السيرفر مع تمرير التبويب والبحث
  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/contact`, { 
        params: { 
          page, 
          tab: activeTab, 
          search: searchQuery 
        } 
      });
      setMessages(res.data.data || []);
      setMeta(res.data.meta || { totalPages: 1, totalItems: 0 });
    } catch {
      console.error("Error loading messages");
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, searchQuery]);

  useEffect(() => {
    // استخدام debounce بسيط للبحث لتجنب كثرة الطلبات
    const timer = setTimeout(() => {
      loadMessages();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadMessages]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/contact/${id}/status`, { status });
      loadMessages(); // إعادة التحميل لضمان انتقال الرسالة للتبويب الصحيح
    } catch {
      alert("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
      await api.delete(`/admin/contact/${id}`);
      loadMessages();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "10px" }}>
      
      {/* 1. Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>Inbox</h1>
        <p style={{ fontSize: 14, color: "#64748b" }}>You have {meta.totalItems} messages</p>
      </div>

      {/* 2. Nav & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, background: "#fff", padding: "12px", borderRadius: "18px", border: "1px solid #f1f5f9" }}>
        
        <div style={{ display: "flex", background: "#f8fafc", padding: "4px", borderRadius: "12px", gap: 4 }}>
  {['new', 'reading', 'archive'].map((tab) => ( // غيّرنا 'all' بـ 'new'
    <button
      key={tab}
      onClick={() => { setActiveTab(tab); setPage(1); }}
      style={{
        padding: "8px 20px",
        borderRadius: "10px",
        border: "none",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
        background: activeTab === tab ? "#fff" : "transparent",
        color: activeTab === tab ? "#2563eb" : "#64748b",
        boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.05)" : "none"
      }}
    >
      {/* عرض الاسم بشكل جميل */}
      {tab === 'new' ? 'New' : tab === 'reading' ? 'Read' : 'Archived'}
    </button>
  ))}
</div>

        <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><SearchIcon size={18}/></span>
          <input 
            type="text"
            placeholder="Search by name or subject..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* 3. Messages List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
           <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map(msg => (
            <div key={msg.id} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: "24px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, background: "#eff6ff", color: "#3b82f6", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}><UserIcon size={22} /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{msg.username}</h4>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{msg.email}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: "#94a3b8" }}>{new Date(msg.createdAt).toLocaleDateString()}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{msg.subject}</div>
                <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{msg.message}</p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <a href={`mailto:${msg.email}`} style={{ flex: 1, background: "#2563eb", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: "12px", fontWeight: 700, fontSize: 13, height: "42px" }}>
                  <MailIcon size={18}/> Reply
                </a>

                {!msg.isReplied && activeTab !== 'archive' && (
                  <button onClick={() => handleUpdateStatus(msg.id, 'replied')} style={{ padding: "0 15px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", borderRadius: "12px", cursor: "pointer" }} title="Mark as Read"><CheckIcon /></button>
                )}

                {!msg.isArchived && (
                  <button onClick={() => handleUpdateStatus(msg.id, 'archived')} style={{ padding: "0 15px", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "12px", cursor: "pointer" }} title="Archive"><ArchiveIcon /></button>
                )}

                <button onClick={() => handleDelete(msg.id)} style={{ padding: "0 15px", background: "#fff", border: "1px solid #fee2e2", color: "#ef4444", borderRadius: "12px", cursor: "pointer" }}><TrashIcon /></button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "60px", background: "#f8fafc", borderRadius: "24px", color: "#94a3b8" }}>No messages found.</div>
        )}
      </div>

      {/* 4. Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
          {[...Array(meta.totalPages)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => setPage(i + 1)} 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: "10px", 
                border: page === i + 1 ? "none" : "1px solid #e2e8f0", 
                background: page === i + 1 ? "#2563eb" : "#fff", 
                color: page === i + 1 ? "#fff" : "#64748b", 
                fontWeight: 700, 
                cursor: "pointer" 
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}