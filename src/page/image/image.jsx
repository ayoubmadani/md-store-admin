import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Copy } from "lucide-react";

// إعداد الـ API (يفضل أن يكون في ملف منفصل ولكن سأضعه هنا للتوضيح)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);
const UploadIcon = () => <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />;
const ImageIcon = () => <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2zM8.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21" />;

export default function ImageAdminPage() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(1);

    // 1. جلب الصور من السيرفر
    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`admin-images`);
            console.log(res.data);

            setImages(res.data);
        } catch (err) {
            console.error("Failed to load images", err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchImages(); }, [fetchImages]);

    // 2. معالجة رفع الصور
    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        setUploading(true);
        try {
            await api.post("admin-images", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            fetchImages(); // إعادة تحديث القائمة بعد الرفع
        } catch (err) {
            alert("خطأ أثناء الرفع: " + (err.response?.data?.message || "فشل الرفع"));
        } finally {
            setUploading(false);
            e.target.value = null; // إعادة تعيين حقل الاختيار
        }
    };

    const handleDelete = async (id) => {
    // 1. التأكد من الموافقة (إصلاح الشرط)
    if (!window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
        return;
    }

    setUploading(true);
    try {
        // 2. إرسال طلب الحذف (تمت إزالة الهيدرز غير الضرورية)
        await api.delete(`admin-images/${id}`);
        
        // 3. تحديث القائمة
        fetchImages(); 
        
        alert("تم حذف الصورة بنجاح");
    } catch (err) {
        console.error(err);
        alert("خطأ أثناء الحذف: " + (err.response?.data?.message || "فشل الحذف"));
    } finally {
        setUploading(false);
    }
};

    return (
        <div style={{ padding: 24, fontFamily: 'inherit' }}>

            {/* Header & Upload Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>مكتبة الصور</h1>
                    <p style={{ color: "#64748b", fontSize: 14 }}>إدارة ورفع الصور الخاصة بلوحة التحكم</p>
                </div>

                <label style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                    background: uploading ? "#94a3b8" : "#2563eb", color: "#fff",
                    borderRadius: 8, cursor: uploading ? "not-allowed" : "pointer",
                    fontWeight: 600, fontSize: 14, transition: "0.2s"
                }}>
                    <UploadIcon />
                    {uploading ? "جاري الرفع..." : "رفع صور جديدة"}
                    <input type="file" multiple hidden onChange={handleUpload} disabled={uploading} accept="image/*" />
                </label>
            </div>

            {/* Images Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: 50, color: "#94a3b8" }}>جاري تحميل الصور...</div>
            ) : images.length === 0 ? (
                <div style={{ textAlign: "center", padding: 100, background: "#f8fafc", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
                    <ImageIcon />
                    <p style={{ color: "#64748b", marginTop: 10 }}>لا توجد صور مرفوعة حالياً</p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 20
                }}>
                    {images.map((img) => (

                        <div
                            key={img.id}
                            style={{
                                group: "card", // للإشارة البرمجية فقط
                                background: "#fff",
                                borderRadius: "16px",
                                overflow: "hidden",
                                position: "relative",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                border: "1px solid #f1f5f9",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {/* طبقة الأزرار العلوية */}
                            <div style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                display: "flex",
                                gap: "6px",
                                zIndex: 20
                            }}>
                                {/* زر النسخ */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(img.url);
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        padding: "6px",
                                        background: "rgba(255, 255, 255, 0.9)",
                                        backdropFilter: "blur(4px)",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        display: "flex",
                                        color: "#64748b",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "#3b82f6"} // أزرق عند الحوم
                                    onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
                                >
                                    <Copy size={14} />
                                </button>

                                {/* زر الحذف */}
                                <button
                                    onClick={()=> handleDelete(img.id)}
                                    style={{
                                        cursor: "pointer",
                                        padding: "6px",
                                        background: "rgba(255, 255, 255, 0.9)",
                                        backdropFilter: "blur(4px)",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        display: "flex",
                                        color: "#64748b",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "#ef4444";
                                        e.currentTarget.style.color = "#ef4444";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#e2e8f0";
                                        e.currentTarget.style.color = "#64748b";
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* الصورة */}
                            <div style={{ height: "160px", overflow: "hidden", background: "#f8fafc" }}>
                                <img
                                    src={img.url}
                                    alt="upload"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />
                            </div>

                            {/* شريط المعلومات السفلي */}
                            <div style={{
                                padding: "10px 14px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#1e293b" }}>
                                        صورة مرفوعة
                                    </span>
                                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                                        {(img.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>

                                {/* علامة الحالة (اختياري) */}
                                <div style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "#10b981" // أخضر للحالة النشطة
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Pagination Control */}
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 10 }}>
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}
                >
                    السابق
                </button>
                <span style={{ alignSelf: "center", fontWeight: 600 }}>صفحة {page}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={images.length < 100} // افترضنا أن الـ take هو 100 كما في السيرفر
                    style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}
                >
                    التالي
                </button>
            </div>
        </div>
    );
}