import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Search,
  MessageSquare,
  Settings,
  LogOut,
  LayoutDashboard,
  Cloud,
  GraduationCap,
  X,
  Send,
  Menu,
  BarChart2,
  Star,
  Target,
  User,
  UserPlus,
  Database,
  Brain,
  Server,
} from "lucide-react";

// ==========================================
// 1. Firebase 設定
// ==========================================
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

const isFirebaseConfigured =
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "請填入";

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn("Firebase 初始化警告:", error);
  }
}

// ==========================================
// 2. 模擬公開職缺資料
// ==========================================
const PUBLIC_JOBS = [
  {
    id: 1,
    title: "數位行銷企劃",
    company: "星傳媒體集團",
    location: "台北市",
    type: "全職",
    reqSkills: ["社群行銷", "SEO", "Google Analytics", "文案撰寫"],
  },
  {
    id: 2,
    title: "UI/UX 設計師",
    company: "創新設計實驗室",
    location: "台中市",
    type: "全職",
    reqSkills: ["Figma", "Prototyping", "User Research", "CSS"],
  },
  {
    id: 3,
    title: "前端工程師",
    company: "雲端科技股份有限公司",
    location: "台北市",
    type: "全職",
    reqSkills: ["React", "JavaScript", "CSS", "Firebase"],
  },
  {
    id: 4,
    title: "人力資源專員 HR",
    company: "全球製造集團",
    location: "桃園市",
    type: "全職",
    reqSkills: ["人才招募", "勞基法", "員工訓練", "跨部門溝通"],
  },
  {
    id: 5,
    title: "產品助理 PM",
    company: "知名電商平台",
    location: "台北市",
    type: "全職",
    reqSkills: ["專案管理", "Agile", "數據分析", "Wireframe"],
  },
  {
    id: 6,
    title: "後端工程師",
    company: "系統整合企業",
    location: "高雄市",
    type: "全職",
    reqSkills: ["Node.js", "Python", "MySQL", "Docker"],
  },
  {
    id: 7,
    title: "資料分析助理",
    company: "大數據智庫",
    location: "新竹市",
    type: "實習 / 全職",
    reqSkills: ["Python", "SQL", "Excel", "資料視覺化"],
  },
  {
    id: 8,
    title: "雲端系統助理工程師",
    company: "雲端整合服務公司",
    location: "台北市",
    type: "全職",
    reqSkills: ["Firebase", "Cloud", "API", "資料庫"],
  },
];

const CHAT_RESPONSES = {
  "我適合什麼工作？":
    "建議你先上傳履歷並貼上履歷文字，系統會根據你的技能、經歷與職缺條件進行 Gemini AI 分析，再產生個人化推薦。",
  "我的履歷缺少什麼？":
    "多數新鮮人履歷容易缺少量化成果、專案角色說明與技能對應職缺的關鍵字。建議用具體數字描述成果。",
  "新鮮人該怎麼準備？":
    "建議準備一頁式履歷、1 到 2 個可展示作品集、GitHub 或專題連結，並針對目標職缺調整技能順序。",
};

// ==========================================
// 3. 樣式
// ==========================================
const COLORS = {
  primary: "#0B2046",
  secondary: "#254B7A",
  accent: "#3B82F6",
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
    borderRadius: "12px",
    padding: "24px",
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "20px",
  },
  button: {
    backgroundColor: COLORS.primary,
    color: COLORS.surface,
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    boxSizing: "border-box",
    marginTop: "8px",
    marginBottom: "16px",
  },
  title: {
    color: COLORS.primary,
    margin: "0 0 16px 0",
    fontSize: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};

const tagStyle = (color) => ({
  backgroundColor: `${color}15`,
  color,
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "0.85rem",
  fontWeight: "bold",
  border: `1px solid ${color}30`,
});

const listStyle = {
  margin: "8px 0 0 0",
  paddingLeft: "20px",
  color: COLORS.textMain,
  lineHeight: "1.7",
};

// ==========================================
// 4. 主程式
// ==========================================
export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("jobs");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sysError, setSysError] = useState("");
  const [sysMsg, setSysMsg] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    let unsubscribe = () => {};

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user || null);
        setAuthLoading(false);
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
      setSysError("AI 分析進行中，請等待分析完成後再切換頁面。");
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
  };

  const handleLogout = async () => {
    if (isAnalyzing) {
      setSysError("AI 分析進行中，請等待完成後再登出。");
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

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
          background: ${COLORS.background};
        }
        * { box-sizing: inherit; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .spin-animation {
          animation: pulse 1.4s infinite;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: COLORS.background,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: COLORS.textMain,
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
            display: "flex",
            flexDirection: "column",
            width: isMobile ? "100%" : "calc(100% - 260px)",
            minHeight: "100vh",
          }}
        >
          {isMobile && (
            <div
              style={{
                backgroundColor: COLORS.surface,
                padding: "16px 20px",
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
                  marginLeft: "16px",
                  fontWeight: "bold",
                  color: COLORS.primary,
                }}
              >
                雲端智慧履歷系統
              </span>
            </div>
          )}

          <main style={{ padding: isMobile ? "20px" : "40px", flex: 1 }}>
            {sysError && (
              <MessageBox type="error" text={sysError} />
            )}

            {sysMsg && (
              <MessageBox type="success" text={sysMsg} />
            )}

            {currentTab === "auth" && (
              <AuthView
                setSysError={setSysError}
                setSysMsg={setSysMsg}
                onLoginSuccess={() => setCurrentTab("dashboard")}
              />
            )}

            {currentTab === "jobs" && <JobBoardView isMobile={isMobile} />}

            {currentTab === "campus" && <CampusView isMobile={isMobile} />}

            {currentTab === "dashboard" && (
              <DashboardView
                isMobile={isMobile}
                setCurrentTab={handleTabClick}
                currentUser={currentUser}
              />
            )}

            {currentTab === "upload" && (
              <UploadView
                isMobile={isMobile}
                setSysError={setSysError}
                setSysMsg={setSysMsg}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
                currentUser={currentUser}
              />
            )}

            {currentTab === "architecture" && (
              <ArchitectureView isMobile={isMobile} />
            )}

            {currentTab === "settings" && (
              <SettingsView currentUser={currentUser} />
            )}
          </main>
        </div>

        <ChatAssistant isMobile={isMobile} />
      </div>
    </>
  );
}

// ==========================================
// 5. Layout components
// ==========================================
function Sidebar({
  isMobile,
  sidebarOpen,
  currentTab,
  currentUser,
  handleTabClick,
  handleLogout,
}) {
  return (
    <div
      style={{
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        height: "100vh",
        width: "260px",
        backgroundColor: COLORS.primary,
        color: COLORS.surface,
        transition: "transform 0.3s ease",
        transform:
          isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          padding: "24px",
          fontSize: "1.15rem",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: `1px solid ${COLORS.secondary}`,
        }}
      >
        <Cloud size={28} color={COLORS.accent} />
        <span>AI 雲端求職平台</span>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
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
        <NavItem
          icon={<Cloud />}
          label="雲端系統架構"
          isActive={currentTab === "architecture"}
          onClick={() => handleTabClick("architecture")}
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
          label="履歷上傳與 AI 分析"
          isActive={currentTab === "upload"}
          onClick={() => handleTabClick("upload")}
        />
      </nav>

      <div
        style={{
          padding: "20px",
          borderTop: `1px solid ${COLORS.secondary}`,
        }}
      >
        {currentUser ? (
          <>
            <div
              style={{
                marginBottom: "16px",
                fontSize: "0.85rem",
                color: COLORS.accent,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                wordBreak: "break-all",
              }}
            >
              <User size={16} /> {currentUser.email}
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
    </div>
  );
}

function SideLabel({ text }) {
  return (
    <div
      style={{
        padding: "18px 24px 8px 24px",
        fontSize: "0.78rem",
        color: "#94A3B8",
        fontWeight: "bold",
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
        backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
        color: COLORS.surface,
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        fontSize: "1rem",
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
        borderRadius: "8px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        border: `1px solid ${isError ? "#FECACA" : "#A7F3D0"}`,
      }}
    >
      {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      {text}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundColor: COLORS.primary,
        color: COLORS.surface,
      }}
    >
      <Cloud
        size={60}
        color={COLORS.accent}
        className="spin-animation"
        style={{ marginBottom: "20px" }}
      />
      <h2>系統載入中...</h2>
      <p style={{ opacity: 0.75 }}>正在連線至 Firebase Authentication</p>
    </div>
  );
}

// ==========================================
// 6. Auth
// ==========================================
function AuthView({ setSysError, setSysMsg, onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!account || !password) {
      setSysError("請輸入信箱與密碼。");
      return;
    }

    if (password.length < 6) {
      setSysError("Firebase Authentication 要求密碼至少 6 碼。");
      return;
    }

    setIsLoading(true);
    setSysError("");
    setSysMsg("");

    try {
      if (!auth) {
        throw new Error("Firebase 尚未正確初始化。");
      }

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
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "40px auto" }}>
      <div style={{ ...STYLES.card, textAlign: "center", padding: "40px" }}>
        <Cloud
          size={48}
          color={COLORS.primary}
          style={{ marginBottom: "16px" }}
        />

        <h2 style={{ margin: "0 0 8px 0", color: COLORS.primary }}>
          {isLoginMode ? "登入會員" : "註冊新帳號"}
        </h2>

        <p
          style={{
            color: COLORS.textMuted,
            marginBottom: "24px",
            fontSize: "0.9rem",
          }}
        >
          登入後可使用履歷 AI 分析與個人化職缺推薦。
        </p>

        <input
          type="email"
          placeholder="電子信箱"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          style={STYLES.input}
        />

        <input
          type="password"
          placeholder="密碼至少 6 碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={STYLES.input}
        />

        <button
          style={{ ...STYLES.button, width: "100%", marginTop: "10px" }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "處理中..." : isLoginMode ? "登入系統" : "註冊帳號"}
        </button>

        <div
          style={{
            marginTop: "20px",
            fontSize: "0.9rem",
            color: COLORS.textMuted,
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
              fontWeight: "bold",
            }}
          >
            {isLoginMode ? "立即註冊" : "返回登入"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. Views
// ==========================================
function JobBoardView({ isMobile }) {
  const [searchTerm, setSearchTerm] = useState("");

  const keyword = searchTerm.toLowerCase();

  const filteredJobs = PUBLIC_JOBS.filter((job) => {
    return (
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword) ||
      job.location.toLowerCase().includes(keyword) ||
      job.reqSkills.some((skill) => skill.toLowerCase().includes(keyword))
    );
  });

  return (
    <div>
      <h2 style={{ ...STYLES.title, fontSize: "1.8rem" }}>最新職缺看板</h2>

      <p style={{ color: COLORS.textMuted, marginBottom: "20px" }}>
        可先瀏覽公開職缺；登入後上傳履歷，系統會透過 Gemini AI 產生個人化推薦。
      </p>

      <div
        style={{
          ...STYLES.card,
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <Search color={COLORS.textMuted} />
        <input
          type="text"
          placeholder="搜尋職缺、公司、地點或技能，例如 React、行銷、資料分析"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            ...STYLES.input,
            margin: 0,
            border: "none",
            boxShadow: "none",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "20px",
        }}
      >
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            style={{
              ...STYLES.card,
              marginBottom: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                color: COLORS.primary,
                fontSize: "1.1rem",
              }}
            >
              {job.title}
            </h3>

            <p
              style={{
                margin: "0 0 12px 0",
                color: COLORS.textMuted,
                fontSize: "0.9rem",
              }}
            >
              {job.company} ‧ {job.location} ‧ {job.type}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "20px",
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
                backgroundColor: "#F8FAFC",
                color: COLORS.primary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              查看職缺詳情
            </button>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <p
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: COLORS.textMuted,
              padding: "40px",
            }}
          >
            找不到符合條件的職缺。
          </p>
        )}
      </div>
    </div>
  );
}

function UploadView({
  setSysError,
  setSysMsg,
  isAnalyzing,
  setIsAnalyzing,
  currentUser,
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
      setSysError("請貼上履歷文字內容，至少 20 個字，系統才能進行 Gemini AI 分析。");
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
        throw new Error(aiResult.error || aiResult.detail || "Gemini AI 分析失敗。");
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
        nlpSummary: aiResult.nlpSummary || "",
        createdAt: new Date().toISOString(),
      };

      if (db) {
        await addDoc(collection(db, "resumes"), finalResult);
      }

      setResult(finalResult);
      setSysMsg("Gemini AI 履歷分析完成！分析結果已儲存至 Firestore。");
    } catch (error) {
      console.error(error);
      setSysError("AI 分析失敗：" + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <h2 style={{ ...STYLES.title, fontSize: "1.8rem" }}>
        履歷上傳與 Gemini AI 深度分析
      </h2>

      <div
        style={{
          padding: "14px 16px",
          backgroundColor: "#FFFBEB",
          color: COLORS.warning,
          borderRadius: "8px",
          marginBottom: "20px",
          border: `1px solid #FDE68A`,
          lineHeight: "1.6",
        }}
      >
        <strong>Demo 說明：</strong>
        Firebase Storage 目前需要 Blaze 方案，因此本 MVP 版本不會上傳檔案到
        Storage；系統會記錄檔名，並將履歷文字送至 Gemini API 分析，結果存入
        Firestore。
      </div>

      {isAnalyzing && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#EFF6FF",
            color: COLORS.accent,
            borderRadius: "8px",
            marginBottom: "20px",
            border: `1px solid #BFDBFE`,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Cloud className="spin-animation" size={20} />
          Gemini AI 正在分析履歷，請勿切換頁面。
        </div>
      )}

      <div style={{ ...STYLES.card, textAlign: "center", padding: "40px 20px" }}>
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
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "40px",
            border: `2px dashed ${COLORS.accent}`,
            borderRadius: "12px",
            cursor: isAnalyzing ? "not-allowed" : "pointer",
            backgroundColor: "#EFF6FF",
            color: COLORS.accent,
            width: "100%",
            maxWidth: "480px",
            opacity: isAnalyzing ? 0.5 : 1,
          }}
        >
          <Upload size={40} />
          <span style={{ fontWeight: "bold" }}>點擊選擇履歷檔案</span>
          <span style={{ fontSize: "0.85rem", color: COLORS.textMuted }}>
            {file ? `已選擇：${file.name}` : "支援 PDF、PNG、JPG、JPEG"}
          </span>
        </label>
      </div>

      <div style={STYLES.card}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            color: COLORS.primary,
          }}
        >
          貼上履歷文字內容
        </label>

        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          disabled={isAnalyzing}
          placeholder="請貼上履歷文字內容，例如：學歷、技能、專案經驗、工作經驗、證照、作品集等。這段內容會送至 Gemini API 進行 AI 分析。"
          style={{
            width: "100%",
            minHeight: "190px",
            padding: "14px",
            borderRadius: "10px",
            border: `1px solid ${COLORS.border}`,
            outline: "none",
            resize: "vertical",
            lineHeight: "1.6",
            fontFamily: "inherit",
            fontSize: "0.95rem",
          }}
        />

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            style={{
              ...STYLES.button,
              minWidth: "230px",
              opacity: isAnalyzing ? 0.7 : 1,
              cursor: isAnalyzing ? "not-allowed" : "pointer",
            }}
            onClick={startAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Cloud className="spin-animation" size={18} /> Gemini AI 分析中
              </>
            ) : (
              <>
                <Target size={18} /> 啟動 Gemini AI 分析
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
    <div style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <CheckCircle size={20} /> Gemini AI 分析摘要
        </h3>

        <p
          style={{
            margin: 0,
            color: COLORS.textMain,
            lineHeight: "1.7",
            backgroundColor: "#EFF6FF",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          {result.nlpSummary || "系統已根據履歷內容完成語義分析。"}
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ ...STYLES.card, flex: 1, minWidth: "300px" }}>
          <h3 style={STYLES.title}>
            <BarChart2 size={20} /> 技能擷取
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {result.skills.length > 0 ? (
              result.skills.map((skill) => (
                <span key={skill} style={tagStyle(COLORS.success)}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: COLORS.textMuted }}>尚未偵測到明確技能。</span>
            )}
          </div>
        </div>

        <div style={{ ...STYLES.card, flex: 1, minWidth: "300px" }}>
          <h3 style={STYLES.title}>
            <Target size={20} /> 技能缺口分析
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {result.missingSkills.length > 0 ? (
              result.missingSkills.map((skill) => (
                <span key={skill} style={tagStyle(COLORS.warning)}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: COLORS.textMuted }}>目前沒有明顯技能缺口。</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ ...STYLES.card, flex: 1, minWidth: "300px" }}>
          <h3 style={STYLES.title}>
            <Star size={20} /> 履歷亮點
          </h3>

          <ul style={listStyle}>
            {result.resumeHighlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={{ ...STYLES.card, flex: 1, minWidth: "300px" }}>
          <h3 style={STYLES.title}>
            <AlertCircle size={20} /> 履歷問題
          </h3>

          <ul style={listStyle}>
            {result.resumeProblems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <CheckCircle size={20} /> 履歷優化建議
        </h3>

        <ul style={listStyle}>
          {result.resumeSuggestions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <GraduationCap size={20} /> AI 職涯建議
        </h3>

        <p style={{ margin: 0, lineHeight: "1.7", color: COLORS.textMain }}>
          {result.careerAdvice || "建議持續補強專案經驗與職缺關鍵技能。"}
        </p>
      </div>

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <Briefcase size={20} /> 專屬職缺推薦
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                    <h4
                      style={{
                        margin: "0 0 6px 0",
                        color: COLORS.primary,
                        fontSize: "1.1rem",
                      }}
                    >
                      {job.title}
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        color: COLORS.textMuted,
                        fontSize: "0.9rem",
                      }}
                    >
                      {job.company} ‧ {job.location} ‧ {job.type || "全職 / 實習"}
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

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {(job.requiredSkills || []).map((skill) => (
                    <span key={skill} style={tagStyle(COLORS.accent)}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    backgroundColor: "#F8FAFC",
                    padding: "12px",
                    borderRadius: "8px",
                    lineHeight: "1.6",
                  }}
                >
                  <strong style={{ color: COLORS.primary }}>推薦理由：</strong>
                  <span> {job.reason}</span>
                </div>

                {job.missingSkills && job.missingSkills.length > 0 && (
                  <div style={{ marginTop: "12px" }}>
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: COLORS.textMuted,
                      }}
                    >
                      此職缺建議補強：
                    </strong>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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

function DashboardView({ isMobile, setCurrentTab, currentUser }) {
  const statsCardStyle = {
    ...STYLES.card,
    flex: 1,
    minWidth: isMobile ? "100%" : "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
  };

  return (
    <div>
      <h2 style={{ ...STYLES.title, fontSize: "1.8rem" }}>個人總覽</h2>

      <p style={{ color: COLORS.textMuted, marginBottom: "24px" }}>
        歡迎回來，{currentUser?.email}。你可以上傳履歷並使用 Gemini AI 進行分析。
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        <div style={statsCardStyle}>
          <FileText color={COLORS.accent} size={32} style={{ marginBottom: "10px" }} />
          <h3 style={{ margin: 0, fontSize: "2rem", color: COLORS.primary }}>1</h3>
          <span style={{ color: COLORS.textMuted, fontSize: "0.9rem" }}>履歷分析紀錄</span>
        </div>

        <div style={statsCardStyle}>
          <Briefcase color={COLORS.success} size={32} style={{ marginBottom: "10px" }} />
          <h3 style={{ margin: 0, fontSize: "2rem", color: COLORS.primary }}>3-5</h3>
          <span style={{ color: COLORS.textMuted, fontSize: "0.9rem" }}>AI 推薦職缺</span>
        </div>

        <div style={statsCardStyle}>
          <BarChart2 color={COLORS.warning} size={32} style={{ marginBottom: "10px" }} />
          <h3 style={{ margin: 0, fontSize: "2rem", color: COLORS.primary }}>AI</h3>
          <span style={{ color: COLORS.textMuted, fontSize: "0.9rem" }}>語義分析模式</span>
        </div>
      </div>

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <Upload size={20} /> 快速操作
        </h3>

        <p style={{ color: COLORS.textMuted, lineHeight: "1.6" }}>
          點擊下方按鈕，上傳履歷檔案並貼上履歷文字。系統會透過 Gemini API
          產生技能分析、技能缺口、履歷優化建議與職缺推薦。
        </p>

        <button
          style={{ ...STYLES.button, marginTop: "20px" }}
          onClick={() => setCurrentTab("upload")}
        >
          前往履歷分析
        </button>
      </div>
    </div>
  );
}

function CampusView() {
  return (
    <div>
      <h2 style={{ ...STYLES.title, fontSize: "1.8rem" }}>
        校園求職與新鮮人支援
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ ...STYLES.card, flex: 1, minWidth: "300px" }}>
          <h3 style={{ ...STYLES.title, color: COLORS.success }}>
            <GraduationCap size={24} /> 履歷撰寫指南
          </h3>

          <ul style={listStyle}>
            <li>
              <strong>STAR 原則：</strong>
              用情境、任務、行動、結果描述專案或經歷。
            </li>
            <li>
              <strong>量化成果：</strong>
              例如「提升 20% 效率」比「顯著提升效率」更有說服力。
            </li>
            <li>
              <strong>一頁式履歷：</strong>
              新鮮人履歷建議濃縮至一頁 A4。
            </li>
            <li>
              <strong>作品集連結：</strong>
              資訊相關科系建議補上 GitHub、Demo 網站或專題影片。
            </li>
          </ul>
        </div>

        <div style={{ ...STYLES.card, flex: 1, minWidth: "300px" }}>
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
      </div>
    </div>
  );
}

function ArchitectureView({ isMobile }) {
  const boxStyle = {
    backgroundColor: COLORS.surface,
    border: `2px solid ${COLORS.accent}`,
    borderRadius: "12px",
    padding: "18px",
    width: isMobile ? "100%" : "170px",
    textAlign: "center",
    fontWeight: "bold",
    color: COLORS.primary,
  };

  const arrowStyle = {
    color: COLORS.textMuted,
    fontWeight: "bold",
    fontSize: isMobile ? "1.5rem" : "1.2rem",
  };

  return (
    <div>
      <h2 style={{ ...STYLES.title, fontSize: "1.8rem" }}>
        雲端系統架構展示
      </h2>

      <div style={STYLES.card}>
        <p style={{ color: COLORS.textMuted, lineHeight: "1.7" }}>
          本系統採用 React + Vercel + Gemini API + Firebase Authentication +
          Firestore 的雲端架構。因 Firebase Storage 需要 Blaze 方案，本 MVP
          改為不儲存履歷檔案，只記錄檔名與 AI 分析結果。
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >
          <div style={boxStyle}>
            <User size={26} />
            <br />
            使用者
            <br />
            <span style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>
              上傳檔名 + 貼履歷文字
            </span>
          </div>

          <div style={arrowStyle}>→</div>

          <div style={boxStyle}>
            <Server size={26} />
            <br />
            React 前端
            <br />
            <span style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>
              Vercel 部署
            </span>
          </div>

          <div style={arrowStyle}>→</div>

          <div style={boxStyle}>
            <Brain size={26} />
            <br />
            Gemini API
            <br />
            <span style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>
              AI 語義分析
            </span>
          </div>

          <div style={arrowStyle}>→</div>

          <div style={boxStyle}>
            <Database size={26} />
            <br />
            Firestore
            <br />
            <span style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>
              分析結果儲存
            </span>
          </div>
        </div>
      </div>

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <Cloud size={20} /> 架構特色
        </h3>

        <ul style={listStyle}>
          <li>
            <strong>Firebase Authentication：</strong>
            提供使用者登入與註冊功能。
          </li>
          <li>
            <strong>Firestore：</strong>
            儲存履歷分析結果、推薦職缺、技能缺口與使用者紀錄。
          </li>
          <li>
            <strong>Vercel Serverless API：</strong>
            透過 `/api/analyzeResume` 呼叫 Gemini API，避免 API Key 暴露在前端。
          </li>
          <li>
            <strong>Gemini API：</strong>
            負責履歷語義分析、技能擷取、技能缺口與職缺推薦。
          </li>
        </ul>
      </div>
    </div>
  );
}

function SettingsView({ currentUser }) {
  return (
    <div style={{ maxWidth: "560px" }}>
      <h2 style={{ ...STYLES.title, fontSize: "1.8rem" }}>系統設定</h2>

      <div style={STYLES.card}>
        <h3 style={STYLES.title}>
          <User size={20} /> 帳號資訊
        </h3>

        <p style={{ color: COLORS.textMuted, lineHeight: "1.7" }}>
          目前登入帳號：
          <strong style={{ color: COLORS.primary }}> {currentUser?.email}</strong>
        </p>

        <p style={{ color: COLORS.textMuted, lineHeight: "1.7" }}>
          MVP 階段使用 Firebase Authentication 管理帳號。若需要修改密碼，可於後續版本加入重設密碼功能。
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 8. Chat assistant
// ==========================================
function ChatAssistant({ isMobile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "您好！我是職涯 AI 助理。您可以問我履歷準備、新鮮人求職或適合職缺方向。",
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
        "這是個好問題！建議先到「校園求職支援」查看基本方向，若想要更精準建議，請登入並使用履歷 AI 分析。";

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
        bottom: isMobile ? "0" : "24px",
        right: isMobile ? "0" : "24px",
        width: isMobile ? "100%" : "360px",
        height: isMobile ? "100%" : "460px",
        backgroundColor: COLORS.surface,
        borderRadius: isMobile ? "0" : "12px",
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
          borderRadius: isMobile ? "0" : "12px 12px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Cloud size={18} /> AI 助理
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
          padding: "16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backgroundColor: "#F8FAFC",
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
                backgroundColor:
                  message.sender === "user" ? COLORS.accent : "#E2E8F0",
                color:
                  message.sender === "user" ? COLORS.surface : COLORS.textMain,
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "0.9rem",
                lineHeight: "1.4",
              }}
            >
              {message.text}
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            {Object.keys(CHAT_RESPONSES).map((question) => (
              <button
                key={question}
                onClick={() => handleSend(question)}
                style={{
                  background: "none",
                  border: `1px solid ${COLORS.accent}`,
                  color: COLORS.accent,
                  borderRadius: "20px",
                  padding: "6px 12px",
                  fontSize: "0.8rem",
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

      <div
        style={{
          padding: "12px",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="輸入您的問題..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
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
            width: "40px",
            height: "40px",
            borderRadius: "20px",
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