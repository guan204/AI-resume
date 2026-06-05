import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Briefcase, Search, 
  MessageSquare, Settings, LogOut, LayoutDashboard, Cloud, 
  GraduationCap, X, Send, Menu, BarChart2, Star, Target
} from 'lucide-react';

// ==========================================
// 1. Firebase 設定 (請填寫您的 Config)
// ==========================================
const firebaseConfig = {
  apiKey: "請填入",
  authDomain: "請填入",
  projectId: "請填入",
  storageBucket: "請填入",
  messagingSenderId: "請填入",
  appId: "請填入"
};

// 避免 React Strict Mode 重複初始化
let app, db, storage;
const isFirebaseConfigured = firebaseConfig.apiKey !== "請填入" && firebaseConfig.apiKey !== "";

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn("Firebase 初始化警告 (若為設定檔未填寫請忽略):", error);
  }
}

// ==========================================
// 2. 模擬資料 (職缺與 AI 聊天)
// ==========================================
const MOCK_JOBS = [
  { id: 1, title: '前端工程師', company: '雲端科技股份有限公司', location: '台北市', type: '全職', reqSkills: ['React', 'JavaScript', 'CSS'], fit: 92, reason: '您的 React 與前端技術棧與此職缺高度吻合。', missing: ['TypeScript'] },
  { id: 2, title: '資料分析助理', company: '大數據智庫', location: '新竹市', type: '實習/兼職', reqSkills: ['Python', 'SQL', 'Data Visualization'], fit: 85, reason: '具備基礎 Python 能力，適合新鮮人入門。', missing: ['Tableau'] },
  { id: 3, title: '後端工程師', company: '電商巨擘', location: '台北市', type: '全職', reqSkills: ['Node.js', 'Firebase', 'API Design'], fit: 78, reason: '具備 Firebase 經驗，但後端架構經驗需補強。', missing: ['Docker', 'CI/CD'] },
  { id: 4, title: '雲端系統助理工程師', company: '系統整合企業', location: '新北市', type: '全職', reqSkills: ['AWS/GCP', 'Linux', 'Networking'], fit: 65, reason: '有基礎雲端概念，但缺乏實際維運經驗。', missing: ['AWS Certification', 'Terraform'] },
  { id: 5, title: 'AI 應用工程師', company: '新創 AI 實驗室', location: '台北市', type: '全職', reqSkills: ['Python', 'Machine Learning', 'NLP'], fit: 60, reason: '有分析潛力，但欠缺深度學習模型部署經驗。', missing: ['PyTorch', 'TensorFlow'] },
  { id: 6, title: '軟體測試工程師', company: '全球軟體集團', location: '台中市', type: '全職', reqSkills: ['QA', 'Automated Testing', 'JavaScript'], fit: 88, reason: '細心且具備開發基礎，能快速上手自動化測試。', missing: ['Selenium', 'Cypress'] }
];

const CHAT_RESPONSES = {
  '我適合什麼工作？': '根據近期新鮮人趨勢與系統分析，若您具備 React 與 Firebase 基礎，建議可以從「前端工程師」或「雲端系統助理」開始投遞。建議先完成一份專題 MVP 作為作品集。',
  '我的履歷缺少什麼？': '多數大學生履歷缺乏「量化數據」。建議將「做過專題」改為「使用 React 開發專題，並透過 Firebase 將資料讀取速度提升 20%」。',
  '新鮮人該怎麼準備？': '1. 盤點核心技能。2. 準備 1-2 個完整且可 Demo 的作品集 (如本系統)。3. 針對目標職缺客製化履歷。4. 多參加校園徵才累積面試經驗。'
};

// ==========================================
// 3. 樣式常數 (純 Inline Style 系統)
// ==========================================
const COLORS = {
  primary: '#0B2046', // 深藍
  secondary: '#254B7A', // 低彩度藍
  accent: '#3B82F6', // 現代藍
  background: '#F4F7F9', // 淺灰背景
  surface: '#FFFFFF', // 白色卡片
  textMain: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B'
};

const STYLES = {
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: `1px solid ${COLORS.border}`,
    marginBottom: '20px'
  },
  button: {
    backgroundColor: COLORS.primary,
    color: COLORS.surface,
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: '8px',
    marginBottom: '16px'
  },
  title: { color: COLORS.primary, margin: '0 0 16px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }
};

// ==========================================
// 4. 主應用程式組件
// ==========================================
export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dbPassword, setDbPassword] = useState('1234');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 系統狀態
  const [sysError, setSysError] = useState('');
  const [sysMsg, setSysMsg] = useState('');

  // 監聽螢幕寬度 (RWD)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 系統初始化：讀取 Firebase 密碼與登入狀態
  useEffect(() => {
    const initSystem = async () => {
      try {
        if (!db) {
          console.warn("Firebase 尚未正確初始化，目前使用本機測試模式。");
        } else {
          const docRef = doc(db, "settings", "security");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setDbPassword(docSnap.data().password);
          } else {
            await setDoc(docRef, { password: '1234' });
          }
        }
      } catch (error) {
        console.error("系統載入錯誤:", error);
        setSysError('無法連線至 Firebase，目前使用本機測試模式。請確認 API Key 是否填寫。');
      } finally {
        const localLogin = localStorage.getItem('isLoggedIn');
        if (localLogin === 'true') setIsLoggedIn(true);
        setTimeout(() => setIsLoading(false), 800); // 確保全螢幕遮罩展示
      }
    };
    initSystem();
  }, []);

  const handleLogin = (pwd) => {
    if (pwd === dbPassword) {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setSysError('');
    } else {
      setSysError('登入密碼錯誤');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setCurrentTab('dashboard');
  };

  if (isLoading) return <LoadingScreen />;
  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} error={sysError} />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.background, fontFamily: 'sans-serif', color: COLORS.textMain }}>
      {/* 行動版遮罩 */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* 側邊欄 */}
      <div style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, left: 0, height: '100vh',
        width: '260px',
        backgroundColor: COLORS.primary,
        color: COLORS.surface,
        transition: 'transform 0.3s ease',
        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '24px', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${COLORS.secondary}` }}>
          <Cloud size={28} color={COLORS.accent} />
          <span>雲端智慧履歷系統</span>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <NavItem icon={<LayoutDashboard />} label="系統總覽" isActive={currentTab === 'dashboard'} onClick={() => {setCurrentTab('dashboard'); setSidebarOpen(false);}} />
          <NavItem icon={<Upload />} label="履歷上傳與分析" isActive={currentTab === 'upload'} onClick={() => {setCurrentTab('upload'); setSidebarOpen(false);}} />
          <NavItem icon={<Briefcase />} label="職缺推薦與搜尋" isActive={currentTab === 'jobs'} onClick={() => {setCurrentTab('jobs'); setSidebarOpen(false);}} />
          <NavItem icon={<GraduationCap />} label="校園求職支援" isActive={currentTab === 'campus'} onClick={() => {setCurrentTab('campus'); setSidebarOpen(false);}} />
          <NavItem icon={<Target />} label="雲端系統架構" isActive={currentTab === 'architecture'} onClick={() => {setCurrentTab('architecture'); setSidebarOpen(false);}} />
        </nav>

        <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.secondary}` }}>
          <NavItem icon={<Settings size={18}/>} label="系統設定" isActive={currentTab === 'settings'} onClick={() => {setCurrentTab('settings'); setSidebarOpen(false);}} />
          <button 
            onClick={handleLogout}
            style={{ ...STYLES.button, backgroundColor: 'transparent', width: '100%', justifyContent: 'flex-start', padding: '12px 20px', marginTop: '10px', color: COLORS.surface, border: `1px solid ${COLORS.secondary}` }}
          >
            <LogOut size={18} /> 登出系統
          </button>
        </div>
      </div>

      {/* 主內容區 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : 'calc(100% - 260px)' }}>
        {/* 行動版頂部導覽列 */}
        {isMobile && (
          <div style={{ backgroundColor: COLORS.surface, padding: '16px 20px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 30 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.primary }}>
              <Menu size={24} />
            </button>
            <span style={{ marginLeft: '16px', fontWeight: 'bold', color: COLORS.primary }}>雲端履歷分析平台</span>
          </div>
        )}

        <main style={{ padding: isMobile ? '20px' : '40px', flex: 1, overflowY: 'auto' }}>
          {/* 全局系統訊息 */}
          {sysError && <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', color: COLORS.error, borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid #FECACA` }}><AlertCircle size={18} /> {sysError}</div>}
          {sysMsg && <div style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', color: COLORS.success, borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid #A7F3D0` }}><CheckCircle size={18} /> {sysMsg}</div>}

          {/* 視圖切換 */}
          {currentTab === 'dashboard' && <DashboardView isMobile={isMobile} setCurrentTab={setCurrentTab} />}
          {currentTab === 'upload' && <UploadView isMobile={isMobile} setSysError={setSysError} setSysMsg={setSysMsg} />}
          {currentTab === 'jobs' && <JobsView isMobile={isMobile} />}
          {currentTab === 'campus' && <CampusView isMobile={isMobile} />}
          {currentTab === 'architecture' && <ArchitectureView isMobile={isMobile} />}
          {currentTab === 'settings' && <SettingsView setSysMsg={setSysMsg} setSysError={setSysError} currentPassword={dbPassword} setDbPassword={setDbPassword} />}
        </main>
      </div>

      {/* 浮動 AI 助理 */}
      <ChatAssistant isMobile={isMobile} />
    </div>
  );
}

// ==========================================
// 5. 各區塊 View 組件
// ==========================================

function DashboardView({ isMobile, setCurrentTab }) {
  const statsCardStyle = { ...STYLES.card, flex: 1, minWidth: isMobile ? '100%' : '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' };

  return (
    <div>
      <h2 style={{ ...STYLES.title, fontSize: '1.8rem', marginBottom: '24px' }}>系統總覽 Dashboard</h2>
      
      {/* 頂部統計卡片 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div style={statsCardStyle}>
          <FileText color={COLORS.accent} size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ margin: 0, fontSize: '2rem', color: COLORS.primary }}>12</h3>
          <span style={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>已分析履歷數</span>
        </div>
        <div style={statsCardStyle}>
          <Briefcase color={COLORS.success} size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ margin: 0, fontSize: '2rem', color: COLORS.primary }}>45</h3>
          <span style={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>推薦職缺數</span>
        </div>
        <div style={statsCardStyle}>
          <BarChart2 color={COLORS.warning} size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ margin: 0, fontSize: '2rem', color: COLORS.primary }}>82%</h3>
          <span style={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>平均適配度</span>
        </div>
        <div style={statsCardStyle}>
          <Target color={COLORS.error} size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ margin: 0, fontSize: '2rem', color: COLORS.primary }}>3</h3>
          <span style={{ color: COLORS.textMuted, fontSize: '0.9rem' }}>平均技能缺口數</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ ...STYLES.card, flex: 2, minWidth: isMobile ? '100%' : '400px' }}>
          <h3 style={STYLES.title}><Upload size={20}/> 快速操作</h3>
          <p style={{ color: COLORS.textMuted, lineHeight: '1.6' }}>
            歡迎使用雲端智慧履歷分析系統。本系統採用前後端分離架構，結合 Firebase 進行資料儲存與驗證。
            請點擊下方按鈕上傳您的履歷，系統將自動進行語義分析與職缺媒合。
          </p>
          <button style={{ ...STYLES.button, marginTop: '20px' }} onClick={() => setCurrentTab('upload')}>
            前往履歷上傳 <ChevronRight size={18} />
          </button>
        </div>
        <div style={{ ...STYLES.card, flex: 1, minWidth: isMobile ? '100%' : '300px', backgroundColor: COLORS.primary, color: COLORS.surface }}>
          <h3 style={{ ...STYLES.title, color: COLORS.surface }}><Star size={20}/> 新鮮人專區</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
            不知道如何撰寫履歷？缺乏面試經驗？我們提供了專為大學生設計的職涯輔導與實習職缺資訊。
          </p>
          <button style={{ ...STYLES.button, backgroundColor: COLORS.surface, color: COLORS.primary, marginTop: '20px', width: '100%' }} onClick={() => setCurrentTab('campus')}>
            探索校園資源
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadView({ isMobile, setSysError, setSysMsg }) {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setSysError("");
      setSysMsg("");
    }
  };

  const startAnalysis = async () => {
    if (!file) {
      return setSysError("請先選擇履歷檔案");
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return setSysError("請在下方文字框貼上履歷內容，至少 20 個字，系統才能進行 Gemini AI 分析。");
    }

    setIsAnalyzing(true);
    setSysError("");
    setSysMsg("");

    try {
      let fileUrl = "local-demo-file";

      try {
        if (storage) {
          const storageRef = ref(storage, `resumes/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          fileUrl = await getDownloadURL(storageRef);
        }
      } catch (storageErr) {
        console.warn("Firebase Storage 上傳失敗，改以本機 Demo 模式繼續分析：", storageErr);
        setSysError("履歷檔案上傳 Firebase Storage 失敗，但系統會繼續進行 Gemini AI 分析。");
      }

      const response = await fetch("/api/analyzeResume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          fileName: file.name,
        }),
      });

      const aiResult = await response.json();

      if (!response.ok) {
        throw new Error(aiResult.error || aiResult.detail || "Gemini AI 分析失敗");
      }

      const finalResult = {
        fileName: file.name,
        fileUrl,
        skills: aiResult.skills || [],
        resumeHighlights: aiResult.resumeHighlights || [],
        resumeProblems: aiResult.resumeProblems || [],
        resumeSuggestions: aiResult.resumeSuggestions || [],
        careerAdvice: aiResult.careerAdvice || "",
        missingSkills: aiResult.missingSkills || [],
        recommendedJobs: aiResult.recommendedJobs || [],
        nlpSummary: aiResult.nlpSummary || "",
        createdAt: new Date().toISOString(),
      };

      try {
        if (db) {
          await addDoc(collection(db, "resumes"), finalResult);
        }
      } catch (dbErr) {
        console.warn("Firestore 儲存失敗，僅在前端顯示 Gemini 分析結果：", dbErr);
        setSysError("Firestore 儲存失敗，但 Gemini AI 分析結果已成功產生。");
      }

      setResult(finalResult);
      setSysMsg("Gemini AI 履歷分析完成！分析結果已產生，並嘗試同步至 Firestore。");
    } catch (error) {
      console.error(error);
      setSysError("AI 分析失敗：" + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <h2 style={STYLES.title}>履歷上傳與 Gemini AI 語義分析</h2>

      <div style={{ ...STYLES.card, padding: "32px 20px" }}>
        <div style={{ textAlign: "center" }}>
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <label
            htmlFor="resume-upload"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              padding: "40px",
              border: `2px dashed ${COLORS.accent}`,
              borderRadius: "12px",
              cursor: "pointer",
              backgroundColor: "#EFF6FF",
              color: COLORS.accent,
              width: "100%",
              maxWidth: "460px",
              boxSizing: "border-box",
            }}
          >
            <Upload size={40} />
            <span style={{ fontWeight: "bold" }}>點擊選擇履歷檔案</span>
            <span style={{ fontSize: "0.85rem", color: COLORS.textMuted }}>
              {file ? `已選擇：${file.name}` : "支援 PDF、PNG、JPG、JPEG"}
            </span>
          </label>
        </div>

        <div style={{ marginTop: "28px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: COLORS.primary }}>
            貼上履歷文字內容
          </label>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="請貼上履歷文字內容，例如：學歷、專案經驗、技能、證照、工作經驗等。這段內容會送到 Gemini API 進行 AI 履歷分析。"
            style={{
              width: "100%",
              minHeight: "180px",
              padding: "14px",
              borderRadius: "10px",
              border: `1px solid ${COLORS.border}`,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              lineHeight: "1.6",
              fontSize: "0.95rem",
              fontFamily: "inherit",
            }}
          />

          <p style={{ margin: "8px 0 0 0", color: COLORS.textMuted, fontSize: "0.85rem" }}>
            Demo 說明：目前檔案會上傳到 Firebase Storage，履歷文字會送至 Gemini API 進行分析。
          </p>
        </div>

        <div style={{ marginTop: "28px", display: "flex", justifyContent: "center" }}>
          <button
            style={{
              ...STYLES.button,
              minWidth: "220px",
              opacity: isAnalyzing ? 0.7 : 1,
              cursor: isAnalyzing ? "not-allowed" : "pointer",
            }}
            onClick={startAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Cloud className="spin-animation" size={18} /> Gemini AI 分析中...
              </>
            ) : (
              <>
                <Target size={18} /> 開始 Gemini AI 分析
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <CheckCircle size={20} /> Gemini AI 分析摘要
            </h3>

            <div style={{ backgroundColor: "#EFF6FF", padding: "16px", borderRadius: "8px", lineHeight: "1.7" }}>
              <strong style={{ color: COLORS.primary }}>NLP 語義分析說明：</strong>
              <p style={{ margin: "8px 0 0 0", color: COLORS.textMain }}>
                {result.nlpSummary || "系統已根據履歷內容完成語義分析，並產生技能、履歷建議與職缺推薦。"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ ...STYLES.card, flex: 1, minWidth: "300px" }}>
              <h3 style={STYLES.title}>
                <BarChart2 size={20} /> 技能擷取與缺口分析
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <strong style={{ display: "block", marginBottom: "8px", color: COLORS.textMuted }}>
                  已具備技能：
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.skills.length > 0 ? (
                    result.skills.map((s) => <span key={s} style={tagStyle(COLORS.success)}>{s}</span>)
                  ) : (
                    <span style={{ color: COLORS.textMuted }}>尚未偵測到明確技能</span>
                  )}
                </div>
              </div>

              <div>
                <strong style={{ display: "block", marginBottom: "8px", color: COLORS.textMuted }}>
                  建議補強技能：
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.missingSkills.length > 0 ? (
                    result.missingSkills.map((s) => <span key={s} style={tagStyle(COLORS.error)}>{s}</span>)
                  ) : (
                    <span style={{ color: COLORS.textMuted }}>目前無明顯技能缺口</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ ...STYLES.card, flex: 1, minWidth: "300px" }}>
              <h3 style={STYLES.title}>
                <Star size={20} /> 履歷亮點與問題
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <strong style={{ display: "block", marginBottom: "8px", color: COLORS.textMuted }}>
                  履歷亮點：
                </strong>
                <ul style={listStyle}>
                  {result.resumeHighlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>

              <div>
                <strong style={{ display: "block", marginBottom: "8px", color: COLORS.textMuted }}>
                  可改善問題：
                </strong>
                <ul style={listStyle}>
                  {result.resumeProblems.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <CheckCircle size={20} /> 履歷優化與 AI 職涯建議
            </h3>

            <div style={{ backgroundColor: "#EFF6FF", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <strong style={{ color: COLORS.primary }}>履歷優化建議：</strong>
              <ul style={{ ...listStyle, marginTop: "8px", marginBottom: 0 }}>
                {result.resumeSuggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
              <strong style={{ color: COLORS.primary }}>AI 職涯建議：</strong>
              <p style={{ margin: "8px 0 0 0", lineHeight: "1.6" }}>{result.careerAdvice}</p>
            </div>
          </div>

          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <Briefcase size={20} /> Gemini AI 職缺推薦
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {result.recommendedJobs && result.recommendedJobs.length > 0 ? (
                result.recommendedJobs
                  .sort((a, b) => (b.matchRate || 0) - (a.matchRate || 0))
                  .map((job, index) => (
                    <div
                      key={`${job.title}-${index}`}
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "12px",
                        padding: "18px",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                        <div>
                          <h4 style={{ margin: "0 0 6px 0", color: COLORS.primary, fontSize: "1.1rem" }}>
                            {job.title}
                          </h4>
                          <p style={{ margin: 0, color: COLORS.textMuted, fontSize: "0.9rem" }}>
                            {job.company} ‧ {job.location} ‧ {job.type}
                          </p>
                        </div>

                        <div
                          style={{
                            backgroundColor: "#ECFDF5",
                            color: COLORS.success,
                            padding: "8px 12px",
                            borderRadius: "20px",
                            fontWeight: "bold",
                            height: "fit-content",
                          }}
                        >
                          適配度 {job.matchRate || 0}%
                        </div>
                      </div>

                      <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {(job.requiredSkills || []).map((skill) => (
                          <span key={skill} style={tagStyle(COLORS.accent)}>{skill}</span>
                        ))}
                      </div>

                      <div style={{ marginTop: "12px", backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", lineHeight: "1.6" }}>
                        <strong style={{ color: COLORS.primary }}>推薦理由：</strong>
                        <span> {job.reason}</span>
                      </div>

                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <div style={{ marginTop: "12px" }}>
                          <strong style={{ display: "block", marginBottom: "8px", color: COLORS.textMuted }}>
                            此職缺建議補強：
                          </strong>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {job.missingSkills.map((skill) => (
                              <span key={skill} style={tagStyle(COLORS.warning)}>{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <p style={{ color: COLORS.textMuted }}>尚未產生職缺推薦。</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobsView({ isMobile }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredJobs = MOCK_JOBS.filter(job => 
    job.title.includes(searchTerm) || 
    job.company.includes(searchTerm) || 
    job.reqSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => b.fit - a.fit);

  return (
    <div>
      <h2 style={STYLES.title}>自動媒合與職缺推薦</h2>
      
      {/* 搜尋區 */}
      <div style={{ ...STYLES.card, display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Search color={COLORS.textMuted} />
        <input 
          type="text" 
          placeholder="搜尋職缺名稱、公司或技能 (例如: React, 工程師)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...STYLES.input, margin: 0, border: 'none', boxShadow: 'none' }}
        />
      </div>

      {/* 職缺列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredJobs.map(job => (
          <div key={job.id} style={{ ...STYLES.card, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 0 }}>
            {/* 適配度圓餅圖 (純 CSS 模擬) */}
            <div style={{ 
              minWidth: '80px', height: '80px', borderRadius: '50%', 
              background: `conic-gradient(${COLORS.success} ${job.fit}%, ${COLORS.border} 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: COLORS.surface, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: COLORS.primary }}>{job.fit}%</span>
                <span style={{ fontSize: '0.6rem', color: COLORS.textMuted }}>適配度</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: COLORS.primary, fontSize: '1.2rem' }}>{job.title}</h3>
                  <p style={{ margin: '0 0 8px 0', color: COLORS.textMuted, fontSize: '0.9rem' }}>
                    {job.company} ‧ {job.location} ‧ {job.type}
                  </p>
                </div>
                <button style={{ ...STYLES.button, padding: '6px 16px', fontSize: '0.9rem' }}>檢視詳情</button>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {job.reqSkills.map(s => <span key={s} style={tagStyle(COLORS.accent)}>{s}</span>)}
              </div>
              
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: COLORS.textMain }}>
                <strong style={{ color: COLORS.primary }}>💡 推薦理由：</strong>{job.reason}
              </div>
            </div>
          </div>
        ))}
        {filteredJobs.length === 0 && <p style={{ textAlign: 'center', color: COLORS.textMuted, padding: '40px' }}>找不到符合條件的職缺</p>}
      </div>
    </div>
  );
}

function CampusView({ isMobile }) {
  return (
    <div>
      <h2 style={STYLES.title}>校園求職與新鮮人支援</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ ...STYLES.card, flex: 1, minWidth: '300px' }}>
          <h3 style={{ ...STYLES.title, color: COLORS.success }}><GraduationCap size={24}/> 履歷撰寫指南</h3>
          <ul style={{ ...listStyle, lineHeight: '1.8' }}>
            <li><strong>STAR 原則：</strong> 情境(Situation)、任務(Task)、行動(Action)、結果(Result)。</li>
            <li><strong>量化成果：</strong> 用數據說話，例如「提升 20% 效率」勝過「顯著提升效率」。</li>
            <li><strong>客製化：</strong> 針對不同職缺調整技能排序與專案描述。</li>
            <li><strong>一頁式：</strong> 新鮮人履歷強烈建議濃縮至一頁 A4。</li>
          </ul>
        </div>
        <div style={{ ...STYLES.card, flex: 1, minWidth: '300px' }}>
          <h3 style={{ ...STYLES.title, color: COLORS.warning }}><MessageSquare size={24}/> 面試準備方向</h3>
          <ul style={{ ...listStyle, lineHeight: '1.8' }}>
            <li><strong>自我介紹：</strong> 準備 1分鐘、3分鐘 兩種版本。</li>
            <li><strong>專案深掘：</strong> 熟記自己做過的專題技術細節，為什麼選這個技術？遇到什麼困難？</li>
            <li><strong>行為面試：</strong> 準備「遇過最大的挫折」、「如何解決團隊衝突」等常見問題。</li>
            <li><strong>反問環節：</strong> 準備 2-3 個關於公司文化或職位發展的問題。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ArchitectureView({ isMobile }) {
  const boxStyle = {
    padding: '16px', backgroundColor: COLORS.surface, borderRadius: '8px', 
    border: `2px solid ${COLORS.accent}`, textAlign: 'center', fontWeight: 'bold',
    color: COLORS.primary, width: '160px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    zIndex: 2
  };
  
  const arrowStyle = {
    width: isMobile ? '2px' : '40px', height: isMobile ? '30px' : '2px', 
    backgroundColor: COLORS.border, margin: isMobile ? '10px auto' : 'auto 10px',
    position: 'relative'
  };

  return (
    <div>
      <h2 style={STYLES.title}>系統架構展示 (Cloud Architecture)</h2>
      <div style={STYLES.card}>
        <p style={{ color: COLORS.textMuted, marginBottom: '30px' }}>
          本 MVP 系統採用現代化 Serverless 架構，強調前後端分離與雲端分散式資料儲存。
        </p>

        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: isMobile ? '0' : '10px'
        }}>
          <div style={boxStyle}>React 前端 UI<br/><span style={{fontSize:'0.8rem', color:COLORS.textMuted}}>(Vercel 部署)</span></div>
          <div style={arrowStyle}></div>
          <div style={{ ...boxStyle, borderColor: COLORS.success }}>Firebase Storage<br/><span style={{fontSize:'0.8rem', color:COLORS.textMuted}}>(履歷檔案儲存)</span></div>
          <div style={arrowStyle}></div>
          <div style={{ ...boxStyle, borderColor: COLORS.warning }}>AI 語義分析<br/><span style={{fontSize:'0.8rem', color:COLORS.textMuted}}>(NLP 處理)</span></div>
          <div style={arrowStyle}></div>
          <div style={{ ...boxStyle, borderColor: COLORS.success }}>Firestore DB<br/><span style={{fontSize:'0.8rem', color:COLORS.textMuted}}>(分散式資料庫)</span></div>
          <div style={arrowStyle}></div>
          <div style={boxStyle}>Dashboard<br/><span style={{fontSize:'0.8rem', color:COLORS.textMuted}}>(媒合結果展示)</span></div>
        </div>

        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: COLORS.primary }}>架構特色說明：</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: COLORS.textMain, lineHeight: '1.6' }}>
            <li><strong>分散式資料庫：</strong> 使用 Firebase Firestore 確保資料高可用性與即時同步。</li>
            <li><strong>無伺服器 (Serverless)：</strong> 減少基礎設施維運成本，適合大學專題展示。</li>
            <li><strong>安全性：</strong> 透過 Firebase Security Rules 保護 API 端點與資料讀寫權限。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ setSysMsg, setSysError, currentPassword, setDbPassword }) {
  const [newPwd, setNewPwd] = useState('');

  const handleUpdate = async () => {
    if (newPwd.length < 4) {
      return setSysError('密碼長度至少需 4 碼');
    }
    try {
      if (db) {
        await setDoc(doc(db, "settings", "security"), { password: newPwd });
      }
      setDbPassword(newPwd);
      setSysMsg('密碼更新成功！下次請使用新密碼登入。');
      setNewPwd('');
      setSysError('');
    } catch (error) {
      console.error(error);
      setSysError('更新密碼失敗，請確認 Firebase 設定。');
    }
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <h2 style={STYLES.title}>系統設定</h2>
      <div style={STYLES.card}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>修改登入密碼</h3>
        <label style={{ display: 'block', marginBottom: '8px', color: COLORS.textMuted }}>目前密碼：(隱藏)</label>
        <input 
          type="password" 
          placeholder="輸入新密碼 (至少4碼)" 
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          style={STYLES.input}
        />
        <button style={STYLES.button} onClick={handleUpdate}>
          儲存設定
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 6. 附屬組件 (聊天、登入、載入)
// ==========================================

function ChatAssistant({ isMobile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: '您好！我是您的專屬職涯 AI 助理。您可以問我關於履歷準備或新鮮人求職的問題。' }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // 加入使用者訊息
    const newMsgs = [...messages, { sender: 'user', text: input }];
    setMessages(newMsgs);
    setInput('');

    // 模擬 AI 回覆
    setTimeout(() => {
      let reply = '這是一個很好的問題！建議您可以多參考系統提供的「校園求職支援」區塊，會有更詳細的指引。';
      // 簡單的關鍵字比對
      for (const [key, value] of Object.entries(CHAT_RESPONSES)) {
        if (input.includes(key.replace('？', '')) || key.includes(input)) {
          reply = value;
          break;
        }
      }
      setMessages([...newMsgs, { sender: 'ai', text: reply }]);
    }, 600);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', width: '60px', height: '60px',
          borderRadius: '30px', backgroundColor: COLORS.accent, color: COLORS.surface,
          border: 'none', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: isMobile ? '0' : '24px', right: isMobile ? '0' : '24px',
      width: isMobile ? '100%' : '350px', height: isMobile ? '100%' : '450px',
      backgroundColor: COLORS.surface, borderRadius: isMobile ? '0' : '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column',
      border: isMobile ? 'none' : `1px solid ${COLORS.border}`
    }}>
      <div style={{ padding: '16px', backgroundColor: COLORS.primary, color: COLORS.surface, borderRadius: isMobile ? '0' : '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Cloud size={18}/> AI 職涯助理</span>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: COLORS.surface, cursor: 'pointer' }}><X size={20}/></button>
      </div>
      
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#F8FAFC' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{
              backgroundColor: m.sender === 'user' ? COLORS.accent : '#E2E8F0',
              color: m.sender === 'user' ? COLORS.surface : COLORS.textMain,
              padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.4',
              borderBottomRightRadius: m.sender === 'user' ? '2px' : '12px',
              borderBottomLeftRadius: m.sender === 'ai' ? '2px' : '12px',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {/* 預設提示詞按鈕 */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {Object.keys(CHAT_RESPONSES).map(q => (
              <button key={q} onClick={() => {setInput(q); setTimeout(() => document.getElementById('chat-send-btn').click(), 50);}} style={{ background: 'none', border: `1px solid ${COLORS.accent}`, color: COLORS.accent, borderRadius: '20px', padding: '6px 12px', fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer' }}>
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '12px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: '8px' }}>
        <input 
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="輸入您的問題..."
          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, outline: 'none' }}
        />
        <button id="chat-send-btn" onClick={handleSend} style={{ backgroundColor: COLORS.accent, color: COLORS.surface, border: 'none', width: '40px', height: '40px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, error }) {
  const [pwd, setPwd] = useState('');
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: COLORS.background }}>
      <div style={{ ...STYLES.card, width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
        <Cloud size={48} color={COLORS.primary} style={{ marginBottom: '16px' }} />
        <h2 style={{ margin: '0 0 8px 0', color: COLORS.primary }}>雲端智慧履歷系統</h2>
        <p style={{ color: COLORS.textMuted, marginBottom: '24px', fontSize: '0.9rem' }}>專題展示系統 MVP</p>
        
        {error && <div style={{ color: COLORS.error, marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
        
        <input 
          type="password" 
          placeholder="請輸入系統密碼 (預設: 1234)" 
          value={pwd} 
          onChange={e => setPwd(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && onLogin(pwd)}
          style={{ ...STYLES.input, textAlign: 'center', fontSize: '1.1rem', letterSpacing: '2px' }}
        />
        <button style={{ ...STYLES.button, width: '100%' }} onClick={() => onLogin(pwd)}>
          登入系統
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: COLORS.primary, color: COLORS.surface }}>
      <Cloud size={60} color={COLORS.accent} className="spin-animation" style={{ marginBottom: '20px', animation: 'pulse 2s infinite' }} />
      <h2>系統載入中...</h2>
      <p style={{ opacity: 0.7 }}>正在連線至 Firebase 雲端資料庫</p>
      {/* 簡單的內聯 CSS 動畫 */}
      <style>{`
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        .spin-animation { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
        padding: '12px 24px', backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        color: COLORS.surface, border: 'none', textAlign: 'left',
        cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '1rem'
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// 共用小樣式
const tagStyle = (color) => ({
  backgroundColor: `${color}15`, color: color, padding: '4px 10px',
  borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: `1px solid ${color}30`
});

const listStyle = { margin: 0, paddingLeft: '20px', color: COLORS.textMain, lineHeight: '1.6' };

// 新增一個 ChevronRight Icon (Lucide-react 沒有直接 import 時可用這個簡單替代，或從上面 import)
function ChevronRight({ size = 24, color = "currentColor" }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>);
}