import React, { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  AlertCircle,
  BarChart2,
  Briefcase,
  CheckCircle,
  Cloud,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Send,
  Settings,
  Star,
  Target,
  Upload,
  User,
  UserPlus,
  X,
} from "lucide-react";

const firebaseConfig = {
  apiKey: "AIzaSyA9qmQY2S803Nxog-SRoo39U_s8hV93Sr8",
  authDomain: "ai-resume-c5d49.firebaseapp.com",
  projectId: "ai-resume-c5d49",
  storageBucket: "ai-resume-c5d49.firebasestorage.app",
  messagingSenderId: "61017203398",
  appId: "1:61017203398:web:83434c32379297d803adc7",
};

let app;
let db;
let auth;

try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase 初始化失敗：", error);
}

const COLORS = {
  primary: "#0B2046",
  secondary: "#254B7A",
  accent: "#2563EB",
  background: "#F4F7F9",
  surface: "#FFFFFF",
  textMain: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
};

const STYLES = {
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: "14px",
    padding: "24px",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
  },
  button: {
    backgroundColor: COLORS.primary,
    color: COLORS.surface,
    border: "none",
    padding: "11px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    lineHeight: 1,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    boxSizing: "border-box",
    fontSize: "0.95rem",
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.primary,
    margin: "0 0 16px 0",
    fontSize: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textAlign: "left",
  },
};

const PUBLIC_JOBS = [
  { id: 1, title: "前端工程師", company: "雲端科技股份有限公司", location: "台北市", type: "全職", category: "資訊工程", reqSkills: ["React", "JavaScript", "CSS", "Firebase"] },
  { id: 2, title: "後端工程師", company: "系統整合企業", location: "高雄市", type: "全職", category: "資訊工程", reqSkills: ["Node.js", "Python", "MySQL", "API"] },
  { id: 3, title: "資料分析助理", company: "大數據智庫", location: "新竹市", type: "實習 / 全職", category: "資料分析", reqSkills: ["Python", "SQL", "Excel", "資料視覺化"] },
  { id: 4, title: "雲端系統助理工程師", company: "雲端整合服務公司", location: "台北市", type: "全職", category: "資訊工程", reqSkills: ["Firebase", "Cloud", "API", "資料庫"] },
  { id: 5, title: "軟體測試工程師", company: "全球軟體集團", location: "台中市", type: "全職", category: "資訊工程", reqSkills: ["QA", "測試案例", "JavaScript", "自動化測試"] },
  { id: 6, title: "UI/UX 設計師", company: "創新設計實驗室", location: "台中市", type: "全職", category: "設計", reqSkills: ["Figma", "Prototype", "User Research", "Wireframe"] },
  { id: 7, title: "數位行銷企劃", company: "星傳媒體集團", location: "台北市", type: "全職", category: "行銷", reqSkills: ["社群行銷", "SEO", "Google Analytics", "文案撰寫"] },
  { id: 8, title: "內容編輯 / 社群小編", company: "新媒體內容公司", location: "遠端 / 台北市", type: "兼職 / 全職", category: "內容行銷", reqSkills: ["文案撰寫", "社群經營", "Canva", "企劃"] },
  { id: 9, title: "產品助理 PM", company: "知名電商平台", location: "台北市", type: "全職", category: "產品管理", reqSkills: ["專案管理", "Agile", "數據分析", "溝通協調"] },
  { id: 10, title: "人力資源專員 HR", company: "全球製造集團", location: "桃園市", type: "全職", category: "人力資源", reqSkills: ["人才招募", "勞基法", "員工訓練", "跨部門溝通"] },
  { id: 11, title: "行政助理", company: "區域營運中心", location: "台南市", type: "全職", category: "行政", reqSkills: ["文件管理", "Excel", "溝通協調", "細心"] },
  { id: 12, title: "業務助理", company: "B2B 解決方案公司", location: "新北市", type: "全職", category: "業務", reqSkills: ["客戶溝通", "簡報", "CRM", "資料整理"] },
  { id: 13, title: "客服專員", company: "金融科技服務平台", location: "台北市", type: "全職", category: "客服", reqSkills: ["問題處理", "溝通能力", "耐心", "服務流程"] },
  { id: 14, title: "財務會計助理", company: "連鎖零售企業", location: "台中市", type: "全職", category: "財會", reqSkills: ["Excel", "帳務處理", "細心", "數字敏感度"] },
  { id: 15, title: "供應鏈管理助理", company: "智慧物流公司", location: "桃園市", type: "全職", category: "供應鏈", reqSkills: ["庫存管理", "Excel", "資料整理", "流程優化"] },
  { id: 16, title: "遊戲企劃助理", company: "手機遊戲開發工作室", location: "台北市", type: "實習 / 全職", category: "遊戲企劃", reqSkills: ["遊戲企劃", "關卡設計", "文件撰寫", "使用者體驗"] },
  { id: 17, title: "研究助理", company: "校園產學合作中心", location: "屏東縣", type: "兼職 / 實習", category: "研究", reqSkills: ["資料蒐集", "文獻整理", "簡報製作", "報告撰寫"] },
  { id: 18, title: "AI 應用助理工程師", company: "AI 新創實驗室", location: "台北市", type: "全職", category: "資訊工程", reqSkills: ["Python", "Prompt", "API", "資料處理"] },
];

const CHAT_RESPONSES = {
  "我適合什麼工作？": "建議先使用履歷分析功能，系統會根據你的技能、經歷與職缺條件產生較精準的推薦。如果還沒上傳履歷，可以先從公開職缺看板搜尋感興趣的工作。",
  "我的履歷缺少什麼？": "新鮮人履歷常見問題是缺少量化成果、專案角色不清楚、技能和職缺需求沒有對齊。建議把經歷改成具體成果，例如「完成 React 專題並部署至 Vercel」。",
  "新鮮人該怎麼準備？": "建議準備一頁式履歷、1 到 2 個可展示作品集、GitHub 或 Demo 連結，並針對目標職缺調整技能順序。",
};

const tagStyle = (color) => ({
  backgroundColor: `${color}15`,
  color,
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "0.82rem",
  fontWeight: 700,
  border: `1px solid ${color}30`,
});

const listStyle = {
  margin: "8px 0 0 0",
  paddingLeft: "20px",
  color: COLORS.textMain,
  lineHeight: "1.7",
  textAlign: "left",
};

function makeUserFriendlySummary(text, fallback = "系統已完成履歷重點整理，並根據你的經歷產生適合的職缺建議。") {
  if (!text || typeof text !== "string") return fallback;

  return text
    .replace(/自然語言處理技術/g, "履歷分析")
    .replace(/自然語言處理/g, "履歷分析")
    .replace(/NLP/g, "履歷分析")
    .replace(/Gemini API/g, "分析功能")
    .replace(/Gemini/g, "系統")
    .replace(/模型/g, "系統")
    .replace(/語義分析/g, "內容整理")
    .replace(/技術/g, "功能")
    .replace(/系統透過/g, "系統已根據")
    .trim();
}

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("jobs");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sysError, setSysError] = useState("");
  const [sysMsg, setSysMsg] = useState("");
  const [resumeRecords, setResumeRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const loadResumeRecords = async (user) => {
    if (!db || !user?.uid) return;

    setRecordsLoading(true);

    try {
      const q = query(collection(db, "resumes"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const records = snapshot.docs
        .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setResumeRecords(records);
    } catch (error) {
      console.warn("讀取履歷紀錄失敗：", error);
      setSysError("讀取履歷紀錄失敗，請確認 Firestore Rules 是否允許讀取。");
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);

    let unsubscribe = () => {};

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user || null);
        setAuthLoading(false);

        if (user) {
          loadResumeRecords(user);
        } else {
          setResumeRecords([]);
        }
      });
    } else {
      setAuthLoading(false);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
  }, []);

  const handleTabClick = (tab) => {
    if (isAnalyzing) {
      setSysError("履歷分析進行中，請等待完成後再切換頁面。");
      setTimeout(() => setSysError(""), 3000);
      return;
    }

    const needLogin = ["dashboard", "upload", "settings"].includes(tab);

    if (needLogin && !currentUser) {
      setSysError("請先登入或註冊，才能使用會員專屬功能。");
      setCurrentTab("auth");
      setSidebarOpen(false);
      return;
    }

    setSysError("");
    setSysMsg("");
    setCurrentTab(tab);
    setSidebarOpen(false);

    if (tab === "dashboard" && currentUser) {
      loadResumeRecords(currentUser);
    }
  };

  const handleLogout = async () => {
    if (isAnalyzing) {
      setSysError("履歷分析進行中，請等待完成後再登出。");
      return;
    }

    try {
      if (auth) await signOut(auth);
      setCurrentTab("jobs");
      setSysMsg("已成功登出。");
    } catch (error) {
      setSysError("登出失敗：" + error.message);
    }
  };

  const handleRecordCreated = (record) => {
    setResumeRecords((prev) => [record, ...prev]);
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-width: 100% !important;
          min-height: 100vh !important;
          max-width: none !important;
          background: ${COLORS.background};
          overflow-x: hidden;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
        }

        #root {
          display: block !important;
          text-align: left !important;
        }

        * {
          box-sizing: border-box;
        }

        button, input, textarea, select {
          font-family: inherit;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.82; }
          100% { transform: scale(1); opacity: 1; }
        }

        .spin-animation {
          animation: pulse 1.4s infinite;
        }

        @media (max-width: 900px) {
          .responsive-grid-2,
          .responsive-grid-3,
          .responsive-grid-4 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: COLORS.background,
          color: COLORS.textMain,
          textAlign: "left",
        }}
      >
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 40,
            }}
          />
        )}

        <Sidebar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          currentTab={currentTab}
          currentUser={currentUser}
          handleTabClick={handleTabClick}
          handleLogout={handleLogout}
        />

        <div
          style={{
            flex: 1,
            minWidth: 0,
            width: isMobile ? "100%" : "calc(100% - 260px)",
            minHeight: "100vh",
          }}
        >
          {isMobile && (
            <div
              style={{
                backgroundColor: COLORS.surface,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                position: "sticky",
                top: 0,
                zIndex: 30,
              }}
            >
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: COLORS.primary,
                }}
              >
                <Menu size={24} />
              </button>

              <span
                style={{
                  marginLeft: "14px",
                  fontWeight: 800,
                  color: COLORS.primary,
                }}
              >
                雲端智慧履歷系統
              </span>
            </div>
          )}

          <main
            style={{
              width: "100%",
              margin: 0,
              padding: isMobile ? "20px" : "36px",
            }}
          >
            {sysError && <MessageBox type="error" text={sysError} />}
            {sysMsg && <MessageBox type="success" text={sysMsg} />}

            {currentTab === "auth" && (
              <AuthView
                setSysError={setSysError}
                setSysMsg={setSysMsg}
                onLoginSuccess={() => {
                  setCurrentTab("dashboard");
                }}
              />
            )}

            {currentTab === "jobs" && <JobBoardView />}
            {currentTab === "campus" && <CampusView />}
            {currentTab === "dashboard" && (
              <DashboardView
                currentUser={currentUser}
                resumeRecords={resumeRecords}
                recordsLoading={recordsLoading}
                setCurrentTab={handleTabClick}
              />
            )}
            {currentTab === "upload" && (
              <UploadView
                setSysError={setSysError}
                setSysMsg={setSysMsg}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
                currentUser={currentUser}
                onRecordCreated={handleRecordCreated}
              />
            )}
            {currentTab === "settings" && <SettingsView currentUser={currentUser} />}
          </main>
        </div>

        <ChatAssistant isMobile={isMobile} />
      </div>
    </>
  );
}

function Sidebar({
  isMobile,
  sidebarOpen,
  currentTab,
  currentUser,
  handleTabClick,
  handleLogout,
}) {
  return (
    <aside
      style={{
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        height: "100vh",
        width: "260px",
        flexShrink: 0,
        backgroundColor: COLORS.primary,
        color: COLORS.surface,
        transition: "transform 0.25s ease",
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          padding: "24px",
          fontSize: "1.08rem",
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: `1px solid ${COLORS.secondary}`,
          lineHeight: "1.35",
        }}
      >
        <Cloud size={28} color={COLORS.accent} />
        <span>雲端智慧履歷系統</span>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "18px 0",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <SideLabel text="公開功能" />
        <NavItem
          icon={<Search />}
          label="最新職缺看板"
          isActive={currentTab === "jobs"}
          onClick={() => handleTabClick("jobs")}
        />
        <NavItem
          icon={<GraduationCap />}
          label="校園求職支援"
          isActive={currentTab === "campus"}
          onClick={() => handleTabClick("campus")}
        />

        <SideLabel text="會員專屬" />
        <NavItem
          icon={<LayoutDashboard />}
          label="個人總覽"
          isActive={currentTab === "dashboard"}
          onClick={() => handleTabClick("dashboard")}
        />
        <NavItem
          icon={<Upload />}
          label="履歷上傳分析"
          isActive={currentTab === "upload"}
          onClick={() => handleTabClick("upload")}
        />
      </nav>

      <div style={{ padding: "20px", borderTop: `1px solid ${COLORS.secondary}` }}>
        {currentUser ? (
          <>
            <div
              style={{
                marginBottom: "14px",
                fontSize: "0.83rem",
                color: "#93C5FD",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                wordBreak: "break-all",
                lineHeight: 1.4,
              }}
            >
              <User size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{currentUser.email}</span>
            </div>

            <NavItem
              icon={<Settings size={18} />}
              label="系統設定"
              isActive={currentTab === "settings"}
              onClick={() => handleTabClick("settings")}
            />

            <button
              onClick={handleLogout}
              style={{
                ...STYLES.button,
                backgroundColor: "transparent",
                width: "100%",
                justifyContent: "flex-start",
                padding: "12px 20px",
                marginTop: "10px",
                color: COLORS.surface,
                border: `1px solid ${COLORS.secondary}`,
              }}
            >
              <LogOut size={18} /> 登出
            </button>
          </>
        ) : (
          <button
            onClick={() => handleTabClick("auth")}
            style={{ ...STYLES.button, width: "100%" }}
          >
            <UserPlus size={18} /> 登入 / 註冊
          </button>
        )}
      </div>
    </aside>
  );
}

function SideLabel({ text }) {
  return (
    <div
      style={{
        padding: "16px 24px 7px",
        fontSize: "0.76rem",
        color: "#94A3B8",
        fontWeight: 800,
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "12px 24px",
        backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
        color: COLORS.surface,
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        fontSize: "0.98rem",
        fontWeight: isActive ? 800 : 600,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MessageBox({ type, text }) {
  const isError = type === "error";

  return (
    <div
      style={{
        padding: "12px 16px",
        backgroundColor: isError ? "#FEF2F2" : "#ECFDF5",
        color: isError ? COLORS.error : COLORS.success,
        borderRadius: "10px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        border: `1px solid ${isError ? "#FECACA" : "#A7F3D0"}`,
        lineHeight: 1.55,
        textAlign: "left",
      }}
    >
      {isError ? (
        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      ) : (
        <CheckCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      )}
      <span>{text}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundColor: COLORS.primary,
        color: COLORS.surface,
        textAlign: "center",
      }}
    >
      <Cloud size={60} color={COLORS.accent} className="spin-animation" />
      <h2 style={{ marginBottom: 8 }}>系統載入中...</h2>
      <p style={{ opacity: 0.75, margin: 0 }}>正在確認登入狀態</p>
    </div>
  );
}

function AuthView({ setSysError, setSysMsg, onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!account || !password) {
      setSysError("請輸入信箱與密碼。");
      return;
    }

    if (password.length < 6) {
      setSysError("密碼至少需要 6 碼。");
      return;
    }

    setIsSubmitting(true);
    setSysError("");
    setSysMsg("");

    try {
      if (!auth) throw new Error("登入服務尚未正確啟用。");

      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, account, password);
        setSysMsg("登入成功！");
      } else {
        await createUserWithEmailAndPassword(auth, account, password);
        setSysMsg("註冊成功，系統已自動登入。");
      }

      onLoginSuccess();
    } catch (err) {
      console.error(err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setSysError("此信箱已被註冊，請直接登入。");
          break;
        case "auth/invalid-email":
          setSysError("信箱格式不正確。");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setSysError("信箱或密碼錯誤。");
          break;
        default:
          setSysError("操作失敗：" + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "430px", margin: "40px auto" }}>
      <div style={{ ...STYLES.card, padding: "38px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Cloud size={48} color={COLORS.primary} />
          <h2 style={{ margin: "14px 0 8px", color: COLORS.primary }}>
            {isLoginMode ? "登入會員" : "註冊新帳號"}
          </h2>
          <p style={{ color: COLORS.textMuted, margin: 0, lineHeight: 1.6 }}>
            登入後可使用履歷分析與個人化職缺推薦。
          </p>
        </div>

        <label style={{ fontWeight: 700, color: COLORS.primary }}>電子信箱</label>
        <input
          type="email"
          placeholder="example@email.com"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          style={{ ...STYLES.input, marginTop: 8, marginBottom: 16 }}
        />

        <label style={{ fontWeight: 700, color: COLORS.primary }}>密碼</label>
        <input
          type="password"
          placeholder="至少 6 碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{ ...STYLES.input, marginTop: 8, marginBottom: 18 }}
        />

        <button
          style={{ ...STYLES.button, width: "100%" }}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "處理中..." : isLoginMode ? "登入系統" : "註冊帳號"}
        </button>

        <div
          style={{
            marginTop: "20px",
            fontSize: "0.92rem",
            color: COLORS.textMuted,
            textAlign: "center",
          }}
        >
          {isLoginMode ? "還沒有帳號？" : "已有帳號？"}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setSysError("");
              setSysMsg("");
            }}
            style={{
              background: "none",
              border: "none",
              color: COLORS.accent,
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            {isLoginMode ? "立即註冊" : "返回登入"}
          </button>
        </div>
      </div>
    </div>
  );
}

function JobBoardView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("全部");

  const categories = useMemo(() => {
    return ["全部", ...Array.from(new Set(PUBLIC_JOBS.map((job) => job.category)))];
  }, []);

  const filteredJobs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return PUBLIC_JOBS.filter((job) => {
      const matchCategory = category === "全部" || job.category === category;
      const matchKeyword =
        !keyword ||
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword) ||
        job.location.toLowerCase().includes(keyword) ||
        job.category.toLowerCase().includes(keyword) ||
        job.reqSkills.some((skill) => skill.toLowerCase().includes(keyword));

      return matchCategory && matchKeyword;
    });
  }, [searchTerm, category]);

  return (
    <div>
      <PageHeader
        title="最新職缺看板"
        description="公開瀏覽多元職缺。登入後可上傳履歷，取得個人化職缺推薦。"
      />

      <div style={{ ...STYLES.card, marginBottom: "22px" }}>
        <div
          className="responsive-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 0.8fr",
            gap: "14px",
            alignItems: "end",
          }}
        >
          <div>
            <label style={{ fontWeight: 800, color: COLORS.primary }}>搜尋職缺</label>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: "10px",
                alignItems: "center",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "10px",
                padding: "0 12px",
                backgroundColor: COLORS.surface,
              }}
            >
              <Search color={COLORS.textMuted} size={20} />
              <input
                type="text"
                placeholder="搜尋職缺、公司、地點或技能，例如 React、行銷、資料分析"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...STYLES.input,
                  margin: 0,
                  border: "none",
                  paddingLeft: 0,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 800, color: COLORS.primary }}>職缺類別</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                ...STYLES.input,
                marginTop: 8,
                marginBottom: 0,
                cursor: "pointer",
              }}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        className="responsive-grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "18px",
        }}
      >
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}

        {filteredJobs.length === 0 && (
          <div style={{ ...STYLES.card, gridColumn: "1 / -1", textAlign: "left" }}>
            <p style={{ margin: 0, color: COLORS.textMuted }}>
              找不到符合條件的職缺，請嘗試更換關鍵字或類別。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job }) {
  return (
    <div
      style={{
        ...STYLES.card,
        marginBottom: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: "260px",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <span style={tagStyle(COLORS.accent)}>{job.category}</span>
      </div>

      <h3 style={{ margin: "0 0 8px", color: COLORS.primary, fontSize: "1.08rem" }}>
        {job.title}
      </h3>

      <p style={{ margin: "0 0 14px", color: COLORS.textMuted, fontSize: "0.9rem", lineHeight: 1.5 }}>
        {job.company} ‧ {job.location} ‧ {job.type}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: "18px",
          flex: 1,
        }}
      >
        {job.reqSkills.map((skill) => (
          <span key={skill} style={tagStyle(COLORS.textMuted)}>
            {skill}
          </span>
        ))}
      </div>

      <button
        style={{
          ...STYLES.button,
          width: "100%",
          backgroundColor: "#F8FAFC",
          color: COLORS.primary,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        查看職缺詳情
      </button>
    </div>
  );
}

function DashboardView({
  currentUser,
  resumeRecords,
  recordsLoading,
  setCurrentTab,
}) {
  const latestRecord = resumeRecords[0];

  const allMatchRates = resumeRecords
    .flatMap((record) => record.recommendedJobs || [])
    .map((job) => Number(job.matchRate || 0))
    .filter((num) => num > 0);

  const avgMatch =
    allMatchRates.length > 0
      ? Math.round(allMatchRates.reduce((a, b) => a + b, 0) / allMatchRates.length)
      : 0;

  const missingSkillCount = latestRecord?.missingSkills?.length || 0;
  const recommendedCount = latestRecord?.recommendedJobs?.length || 0;

  return (
    <div>
      <PageHeader
        title="個人總覽"
        description={`歡迎回來，${currentUser?.email || "使用者"}。這裡會顯示你的履歷分析紀錄、推薦職缺與技能缺口摘要。`}
      />

      <div
        className="responsive-grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        <StatCard icon={<FileText color={COLORS.accent} />} label="履歷分析紀錄" value={resumeRecords.length} />
        <StatCard icon={<Briefcase color={COLORS.success} />} label="最新推薦職缺" value={recommendedCount} />
        <StatCard icon={<BarChart2 color={COLORS.warning} />} label="平均適配度" value={avgMatch ? `${avgMatch}%` : "尚無"} />
        <StatCard icon={<Target color={COLORS.error} />} label="最新技能缺口" value={missingSkillCount} />
      </div>

      <div
        className="responsive-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: "20px",
        }}
      >
        <div style={STYLES.card}>
          <h3 style={STYLES.title}>
            <Upload size={20} /> 快速操作
          </h3>

          <p style={{ color: COLORS.textMuted, lineHeight: 1.7, marginTop: 0 }}>
            上傳履歷檔案並貼上履歷文字後，系統會整理你的技能、履歷亮點、可改善問題與適合的職缺方向。
          </p>

          <button style={{ ...STYLES.button, marginTop: 8 }} onClick={() => setCurrentTab("upload")}>
            前往履歷分析
          </button>
        </div>

        <div style={STYLES.card}>
          <h3 style={STYLES.title}>
            <Star size={20} /> 最新分析摘要
          </h3>

          {latestRecord ? (
            <>
              <p style={{ margin: "0 0 12px", color: COLORS.textMuted, lineHeight: 1.7 }}>
                檔案名稱：
                <strong style={{ color: COLORS.primary }}> {latestRecord.fileName || "未命名履歷"}</strong>
              </p>

              <p style={{ margin: "0 0 14px", color: COLORS.textMuted, lineHeight: 1.7 }}>
                {makeUserFriendlySummary(latestRecord.userSummary || latestRecord.nlpSummary)}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(latestRecord.skills || []).slice(0, 6).map((skill) => (
                  <span key={skill} style={tagStyle(COLORS.success)}>
                    {skill}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ margin: 0, color: COLORS.textMuted, lineHeight: 1.7 }}>
              尚未有履歷分析紀錄。請先前往「履歷上傳分析」建立第一筆紀錄。
            </p>
          )}
        </div>
      </div>

      <div style={{ ...STYLES.card, marginTop: 22 }}>
        <h3 style={STYLES.title}>
          <FileText size={20} /> 履歷分析紀錄
        </h3>

        {recordsLoading ? (
          <p style={{ color: COLORS.textMuted }}>正在讀取紀錄...</p>
        ) : resumeRecords.length === 0 ? (
          <p style={{ color: COLORS.textMuted, margin: 0 }}>
            目前尚無履歷紀錄。完成一次履歷分析後，紀錄會顯示在這裡。
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {resumeRecords.slice(0, 5).map((record) => (
              <div
                key={record.id || `${record.fileName}-${record.createdAt}`}
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: "#FBFDFF",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <strong style={{ color: COLORS.primary }}>{record.fileName || "未命名履歷"}</strong>
                    <p style={{ margin: "6px 0 0", color: COLORS.textMuted, fontSize: "0.9rem" }}>
                      {record.createdAt ? new Date(record.createdAt).toLocaleString() : "無時間紀錄"}
                    </p>
                  </div>

                  <span style={tagStyle(COLORS.accent)}>
                    推薦 {record.recommendedJobs?.length || 0} 個職缺
                  </span>
                </div>

                <p style={{ color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 0 }}>
                  {makeUserFriendlySummary(record.userSummary || record.nlpSummary).slice(0, 120)}
                  {makeUserFriendlySummary(record.userSummary || record.nlpSummary).length > 120 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{ ...STYLES.card, textAlign: "left", marginBottom: 0 }}>
      <div style={{ marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 900, color: COLORS.primary, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: 8, color: COLORS.textMuted, fontSize: "0.92rem" }}>{label}</div>
    </div>
  );
}

function UploadView({
  setSysError,
  setSysMsg,
  isAnalyzing,
  setIsAnalyzing,
  currentUser,
  onRecordCreated,
}) {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setSysError("");
    setSysMsg("");
  };

  const startAnalysis = async () => {
    if (!file) {
      setSysError("請先選擇履歷檔案。");
      return;
    }

    if (!resumeText || resumeText.trim().length < 20) {
      setSysError("請貼上履歷文字內容，至少 20 個字，系統才能進行履歷分析。");
      return;
    }

    setIsAnalyzing(true);
    setSysError("");
    setSysMsg("");

    try {
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
        throw new Error(aiResult.error || aiResult.detail || "履歷分析失敗。");
      }

      const finalResult = {
        uid: currentUser?.uid || "",
        userEmail: currentUser?.email || "",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storageMode: "no-storage-demo",
        resumeTextPreview: resumeText.slice(0, 500),
        skills: aiResult.skills || [],
        resumeHighlights: aiResult.resumeHighlights || [],
        resumeProblems: aiResult.resumeProblems || [],
        resumeSuggestions: aiResult.resumeSuggestions || [],
        careerAdvice: aiResult.careerAdvice || "",
        missingSkills: aiResult.missingSkills || [],
        recommendedJobs: aiResult.recommendedJobs || [],
        userSummary: makeUserFriendlySummary(aiResult.userSummary || aiResult.nlpSummary),
        nlpSummary: aiResult.nlpSummary || "",
        createdAt: new Date().toISOString(),
      };

      let savedRecord = finalResult;

      if (db) {
        const docRef = await addDoc(collection(db, "resumes"), finalResult);
        savedRecord = { id: docRef.id, ...finalResult };
      }

      setResult(savedRecord);
      onRecordCreated(savedRecord);
      setSysMsg("履歷分析完成！分析結果已儲存。");
    } catch (error) {
      console.error(error);
      setSysError("分析失敗：" + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="履歷上傳與分析"
        description="選擇履歷檔案並貼上履歷文字，系統會整理技能、履歷亮點、可改善問題與適合的職缺方向。"
      />

      <div
        style={{
          padding: "14px 16px",
          backgroundColor: "#FFFBEB",
          color: "#92400E",
          borderRadius: "10px",
          marginBottom: "20px",
          border: `1px solid #FDE68A`,
          lineHeight: 1.7,
          textAlign: "left",
        }}
      >
        <strong>Demo 說明：</strong>
        目前版本會記錄履歷檔名，並將你貼上的履歷文字進行分析；分析結果會儲存在系統中，方便之後查看紀錄。
      </div>

      {isAnalyzing && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#EFF6FF",
            color: COLORS.accent,
            borderRadius: "10px",
            marginBottom: "20px",
            border: `1px solid #BFDBFE`,
            fontWeight: 800,
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            lineHeight: 1.6,
            textAlign: "left",
          }}
        >
          <Cloud className="spin-animation" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          系統正在分析履歷，請勿切換頁面。
        </div>
      )}

      <div
        className="responsive-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={STYLES.card}>
          <h3 style={STYLES.title}>
            <Upload size={20} /> 選擇履歷檔案
          </h3>

          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={isAnalyzing}
          />

          <label
            htmlFor="resume-upload"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
              padding: "28px",
              border: `2px dashed ${COLORS.accent}`,
              borderRadius: "12px",
              cursor: isAnalyzing ? "not-allowed" : "pointer",
              backgroundColor: "#EFF6FF",
              color: COLORS.accent,
              opacity: isAnalyzing ? 0.5 : 1,
              textAlign: "left",
            }}
          >
            <Upload size={40} />
            <strong>點擊選擇履歷檔案</strong>
            <span style={{ fontSize: "0.9rem", color: COLORS.textMuted }}>
              {file ? `已選擇：${file.name}` : "支援 PDF、PNG、JPG、JPEG"}
            </span>
          </label>
        </div>

        <div style={STYLES.card}>
          <h3 style={STYLES.title}>
            <FileText size={20} /> 貼上履歷文字
          </h3>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={isAnalyzing}
            placeholder="請貼上履歷文字內容，例如：學歷、技能、專案經驗、工作經驗、證照、作品集等。"
            style={{
              width: "100%",
              minHeight: "230px",
              padding: "14px",
              borderRadius: "10px",
              border: `1px solid ${COLORS.border}`,
              outline: "none",
              resize: "vertical",
              lineHeight: 1.7,
              fontFamily: "inherit",
              fontSize: "0.95rem",
              textAlign: "left",
            }}
          />

          <button
            style={{
              ...STYLES.button,
              marginTop: 16,
              width: "100%",
              opacity: isAnalyzing ? 0.7 : 1,
              cursor: isAnalyzing ? "not-allowed" : "pointer",
            }}
            onClick={startAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Cloud className="spin-animation" size={18} /> 分析中
              </>
            ) : (
              <>
                <Target size={18} /> 開始履歷分析
              </>
            )}
          </button>
        </div>
      </div>

      {result && <AnalysisResult result={result} />}
    </div>
  );
}

function AnalysisResult({ result }) {
  return (
    <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <CheckCircle size={20} /> 分析摘要
        </h3>

        <p
          style={{
            margin: 0,
            color: COLORS.textMain,
            lineHeight: 1.8,
            backgroundColor: "#EFF6FF",
            padding: "16px",
            borderRadius: "10px",
            textAlign: "left",
          }}
        >
          {makeUserFriendlySummary(result.userSummary || result.nlpSummary)}
        </p>
      </div>

      <div
        className="responsive-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <InfoListCard
          icon={<BarChart2 size={20} />}
          title="已具備能力"
          items={result.skills}
          color={COLORS.success}
          emptyText="尚未整理到明確能力。"
        />

        <InfoListCard
          icon={<Target size={20} />}
          title="建議補強能力"
          items={result.missingSkills}
          color={COLORS.warning}
          emptyText="目前沒有明顯需要補強的能力。"
        />
      </div>

      <div
        className="responsive-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <BulletCard icon={<Star size={20} />} title="履歷亮點" items={result.resumeHighlights} />
        <BulletCard icon={<AlertCircle size={20} />} title="可改善問題" items={result.resumeProblems} />
      </div>

      <BulletCard
        icon={<CheckCircle size={20} />}
        title="履歷優化建議"
        items={result.resumeSuggestions}
      />

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <GraduationCap size={20} /> 職涯建議
        </h3>

        <p style={{ margin: 0, lineHeight: 1.8, color: COLORS.textMain, textAlign: "left" }}>
          {result.careerAdvice || "建議持續補強專案經驗與職缺關鍵技能。"}
        </p>
      </div>

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <Briefcase size={20} /> 適合你的職缺
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(result.recommendedJobs || [])
            .sort((a, b) => (b.matchRate || 0) - (a.matchRate || 0))
            .map((job, index) => (
              <div
                key={`${job.title}-${index}`}
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px",
                  padding: "18px",
                  backgroundColor: "#FFFFFF",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 6px", color: COLORS.primary, fontSize: "1.1rem" }}>
                      {job.title}
                    </h4>

                    <p style={{ margin: 0, color: COLORS.textMuted, fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {job.company} ‧ {job.location} ‧ {job.type || "全職 / 實習"}
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#ECFDF5",
                      color: COLORS.success,
                      padding: "8px 12px",
                      borderRadius: "999px",
                      fontWeight: 800,
                      height: "fit-content",
                    }}
                  >
                    適合度 {job.matchRate || 0}%
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(job.requiredSkills || []).map((skill) => (
                    <span key={skill} style={tagStyle(COLORS.accent)}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    backgroundColor: "#F8FAFC",
                    padding: "12px",
                    borderRadius: "8px",
                    lineHeight: 1.7,
                  }}
                >
                  <strong style={{ color: COLORS.primary }}>推薦原因：</strong>
                  <span> {job.reason}</span>
                </div>

                {job.missingSkills && job.missingSkills.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <strong style={{ display: "block", marginBottom: 8, color: COLORS.textMuted }}>
                      建議補強：
                    </strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {job.missingSkills.map((skill) => (
                        <span key={skill} style={tagStyle(COLORS.warning)}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function InfoListCard({ icon, title, items = [], color, emptyText }) {
  return (
    <div style={STYLES.card}>
      <h3 style={STYLES.title}>
        {icon} {title}
      </h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} style={tagStyle(color)}>
              {item}
            </span>
          ))
        ) : (
          <span style={{ color: COLORS.textMuted }}>{emptyText}</span>
        )}
      </div>
    </div>
  );
}

function BulletCard({ icon, title, items = [] }) {
  return (
    <div style={STYLES.card}>
      <h3 style={STYLES.title}>
        {icon} {title}
      </h3>

      {items.length > 0 ? (
        <ul style={listStyle}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, color: COLORS.textMuted }}>目前沒有資料。</p>
      )}
    </div>
  );
}

function CampusView() {
  return (
    <div>
      <PageHeader
        title="校園求職與新鮮人支援"
        description="整理適合大學生與新鮮人的履歷撰寫、面試準備與求職方向。"
      />

      <div
        className="responsive-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <div style={STYLES.card}>
          <h3 style={{ ...STYLES.title, color: COLORS.success }}>
            <GraduationCap size={24} /> 履歷撰寫指南
          </h3>

          <ul style={listStyle}>
            <li>
              <strong>STAR 原則：</strong>用情境、任務、行動、結果描述專案或經歷。
            </li>
            <li>
              <strong>量化成果：</strong>例如「提升 20% 效率」比「顯著提升效率」更有說服力。
            </li>
            <li>
              <strong>一頁式履歷：</strong>新鮮人履歷建議濃縮至一頁 A4。
            </li>
            <li>
              <strong>作品集連結：</strong>資訊相關科系建議補上 GitHub、Demo 網站或專題影片。
            </li>
          </ul>
        </div>

        <div style={STYLES.card}>
          <h3 style={{ ...STYLES.title, color: COLORS.warning }}>
            <MessageSquare size={24} /> 面試準備方向
          </h3>

          <ul style={listStyle}>
            <li>準備 1 分鐘與 3 分鐘自我介紹。</li>
            <li>熟悉自己做過的專題，包含技術選擇、遇到問題與解法。</li>
            <li>準備「最大的挫折」、「如何解決團隊衝突」等行為題。</li>
            <li>準備 2 到 3 個反問問題，例如團隊文化與新人培訓方式。</li>
          </ul>
        </div>

        <div style={STYLES.card}>
          <h3 style={STYLES.title}>
            <Briefcase size={22} /> 新鮮人求職建議
          </h3>

          <ul style={listStyle}>
            <li>先鎖定 2 到 3 種職務方向，不要一次投太分散。</li>
            <li>針對每個職缺調整履歷關鍵字，例如 React、資料分析、企劃、溝通協調。</li>
            <li>面試時要能清楚說明「自己負責的部分」和「專題成果」。</li>
          </ul>
        </div>

        <div style={STYLES.card}>
          <h3 style={STYLES.title}>
            <Target size={22} /> 技能補強方向
          </h3>

          <ul style={listStyle}>
            <li>工程職：GitHub、API、資料庫、部署經驗。</li>
            <li>行銷職：文案、社群數據、活動企劃、SEO。</li>
            <li>PM / 企劃職：流程圖、需求分析、簡報、跨部門溝通。</li>
            <li>資料職：Excel、SQL、Python、資料視覺化。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ currentUser }) {
  return (
    <div style={{ maxWidth: 620 }}>
      <PageHeader title="系統設定" description="查看目前登入帳號與系統狀態。" />

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <User size={20} /> 帳號資訊
        </h3>

        <p style={{ color: COLORS.textMuted, lineHeight: 1.7, marginTop: 0 }}>
          目前登入帳號：
          <strong style={{ color: COLORS.primary }}> {currentUser?.email}</strong>
        </p>

        <p style={{ color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 0 }}>
          本系統使用帳號登入機制管理會員資料，履歷分析結果會儲存在系統中。
        </p>
      </div>
    </div>
  );
}

function PageHeader({ title, description }) {
  return (
    <div style={{ marginBottom: 24, textAlign: "left" }}>
      <h1
        style={{
          margin: "0 0 10px",
          color: COLORS.primary,
          fontSize: "clamp(1.65rem, 2.4vw, 2.15rem)",
          lineHeight: 1.25,
          textAlign: "left",
        }}
      >
        {title}
      </h1>

      {description && (
        <p
          style={{
            margin: 0,
            color: COLORS.textMuted,
            lineHeight: 1.7,
            maxWidth: 920,
            textAlign: "left",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function ChatAssistant({ isMobile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "您好！我是職涯助理。您可以問我履歷準備、新鮮人求職或適合職缺方向。",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (overrideText) => {
    const text = overrideText || input;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: "user", text }];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      let reply =
        "這是個好問題！建議先到「校園求職支援」查看基本方向；若想要更精準建議，請登入並使用履歷分析。";

      for (const [key, value] of Object.entries(CHAT_RESPONSES)) {
        if (text.includes(key.replace("？", "")) || key.includes(text)) {
          reply = value;
          break;
        }
      }

      setMessages([...newMessages, { sender: "ai", text: reply }]);
    }, 500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          backgroundColor: COLORS.accent,
          color: COLORS.surface,
          border: "none",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? 0 : 24,
        right: isMobile ? 0 : 24,
        width: isMobile ? "100%" : 360,
        height: isMobile ? "100%" : 460,
        backgroundColor: COLORS.surface,
        borderRadius: isMobile ? 0 : 14,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        border: isMobile ? "none" : `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          padding: "16px",
          backgroundColor: COLORS.primary,
          color: COLORS.surface,
          borderRadius: isMobile ? 0 : "14px 14px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
          <Cloud size={18} /> 職涯助理
        </span>

        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: COLORS.surface,
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: 16,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          backgroundColor: "#F8FAFC",
          textAlign: "left",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
            }}
          >
            <div
              style={{
                backgroundColor: message.sender === "user" ? COLORS.accent : "#E2E8F0",
                color: message.sender === "user" ? COLORS.surface : COLORS.textMain,
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: "0.9rem",
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              {message.text}
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {Object.keys(CHAT_RESPONSES).map((question) => (
              <button
                key={question}
                onClick={() => handleSend(question)}
                style={{
                  background: "none",
                  border: `1px solid ${COLORS.accent}`,
                  color: COLORS.accent,
                  borderRadius: 999,
                  padding: "7px 12px",
                  fontSize: "0.82rem",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="輸入您的問題..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 999,
            border: `1px solid ${COLORS.border}`,
            outline: "none",
          }}
        />

        <button
          onClick={() => handleSend()}
          style={{
            backgroundColor: COLORS.accent,
            color: COLORS.surface,
            border: "none",
            width: 40,
            height: 40,
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}