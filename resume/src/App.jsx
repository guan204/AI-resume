import * as pdfjsLib from "pdfjs-dist";
import { createWorker } from "tesseract.js";
import React, { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc
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
  ChevronRight,
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
  Sparkles,
  Star,
  Target,
  Upload,
  User,
  UserPlus,
  X,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

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
    borderRadius: "18px",
    padding: "24px",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  button: {
    backgroundColor: COLORS.primary,
    color: COLORS.surface,
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    lineHeight: 1,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    boxSizing: "border-box",
    fontSize: "0.95rem",
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.primary,
    margin: "0 0 16px 0",
    fontSize: "1.18rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textAlign: "left",
  },
};

const PUBLIC_JOBS = [
  { id: 1, title: "前端工程師", company: "雲端科技股份有限公司", location: "台北市", type: "全職", category: "資訊工程", reqSkills: ["React", "JavaScript", "CSS", "Firebase"], intro: "負責前端介面開發、資料串接與平台功能維護，適合具備作品集的新鮮人。" },
  { id: 2, title: "後端工程師", company: "系統整合企業", location: "高雄市", type: "全職", category: "資訊工程", reqSkills: ["Node.js", "Python", "MySQL", "API"], intro: "協助 API 開發、資料庫設計與系統維運，重視基礎程式能力與邏輯思考。" },
  { id: 3, title: "資料分析助理", company: "大數據智庫", location: "新竹市", type: "實習 / 全職", category: "資料分析", reqSkills: ["Python", "SQL", "Excel", "資料視覺化"], intro: "整理資料、建立報表並協助分析商業問題，適合想進入資料領域的新鮮人。" },
  { id: 4, title: "雲端系統助理工程師", company: "雲端整合服務公司", location: "台北市", type: "全職", category: "資訊工程", reqSkills: ["Firebase", "Cloud", "API", "資料庫"], intro: "協助雲端平台建置與資料服務串接，適合對雲端應用有基礎認識者。" },
  { id: 5, title: "軟體測試工程師", company: "全球軟體集團", location: "台中市", type: "全職", category: "資訊工程", reqSkills: ["QA", "測試案例", "JavaScript", "自動化測試"], intro: "負責測試案例規劃、功能驗證與品質追蹤，適合細心且具程式基礎者。" },
  { id: 6, title: "UI/UX 設計師", company: "創新設計實驗室", location: "台中市", type: "全職", category: "設計", reqSkills: ["Figma", "Prototype", "User Research", "Wireframe"], intro: "參與產品介面設計、使用者研究與原型製作，適合具設計作品集者。" },
  { id: 7, title: "數位行銷企劃", company: "星傳媒體集團", location: "台北市", type: "全職", category: "行銷", reqSkills: ["社群行銷", "SEO", "Google Analytics", "文案撰寫"], intro: "負責社群內容、廣告成效追蹤與行銷活動企劃，適合善於文字與數據觀察者。" },
  { id: 8, title: "內容編輯 / 社群小編", company: "新媒體內容公司", location: "遠端 / 台北市", type: "兼職 / 全職", category: "內容行銷", reqSkills: ["文案撰寫", "社群經營", "Canva", "企劃"], intro: "製作社群貼文、短文內容與活動素材，適合對內容創作有興趣的新鮮人。" },
  { id: 9, title: "產品助理 PM", company: "知名電商平台", location: "台北市", type: "全職", category: "產品管理", reqSkills: ["專案管理", "Agile", "數據分析", "溝通協調"], intro: "協助需求整理、跨部門溝通與產品流程追蹤，適合具邏輯與溝通能力者。" },
  { id: 10, title: "人力資源專員 HR", company: "全球製造集團", location: "桃園市", type: "全職", category: "人力資源", reqSkills: ["人才招募", "勞基法", "員工訓練", "跨部門溝通"], intro: "協助招募、教育訓練與員工關係管理，適合喜歡與人互動者。" },
  { id: 11, title: "行政助理", company: "區域營運中心", location: "台南市", type: "全職", category: "行政", reqSkills: ["文件管理", "Excel", "溝通協調", "細心"], intro: "處理文件、會議安排與跨部門行政支援，適合重視穩定與細節者。" },
  { id: 12, title: "業務助理", company: "B2B 解決方案公司", location: "新北市", type: "全職", category: "業務", reqSkills: ["客戶溝通", "簡報", "CRM", "資料整理"], intro: "協助客戶資料整理、簡報準備與業務流程追蹤，適合外向且願意學習者。" },
  { id: 13, title: "客服專員", company: "金融科技服務平台", location: "台北市", type: "全職", category: "客服", reqSkills: ["問題處理", "溝通能力", "耐心", "服務流程"], intro: "協助客戶問題處理與服務流程紀錄，適合有耐心且表達清楚者。" },
  { id: 14, title: "財務會計助理", company: "連鎖零售企業", location: "台中市", type: "全職", category: "財會", reqSkills: ["Excel", "帳務處理", "細心", "數字敏感度"], intro: "協助帳務整理、報表製作與資料核對，適合細心且對數字敏感者。" },
  { id: 15, title: "供應鏈管理助理", company: "智慧物流公司", location: "桃園市", type: "全職", category: "供應鏈", reqSkills: ["庫存管理", "Excel", "資料整理", "流程優化"], intro: "協助庫存追蹤、物流資料整理與流程改善，適合具組織能力者。" },
  { id: 16, title: "遊戲企劃助理", company: "手機遊戲開發工作室", location: "台北市", type: "實習 / 全職", category: "遊戲企劃", reqSkills: ["遊戲企劃", "關卡設計", "文件撰寫", "使用者體驗"], intro: "協助關卡設計、玩法文件撰寫與遊戲測試，適合對遊戲設計有熱情者。" },
  { id: 17, title: "研究助理", company: "校園產學合作中心", location: "屏東縣", type: "兼職 / 實習", category: "研究", reqSkills: ["資料蒐集", "文獻整理", "簡報製作", "報告撰寫"], intro: "協助資料整理、研究文件撰寫與專題報告製作，適合學生兼職或實習。" },
  { id: 18, title: "AI 應用助理工程師", company: "AI 新創實驗室", location: "台北市", type: "全職", category: "資訊工程", reqSkills: ["Python", "Prompt", "API", "資料處理"], intro: "協助 AI 應用功能測試、資料整理與工具串接，適合對 AI 應用有興趣者。" },
];

const CHAT_RESPONSES = {
  "我適合什麼工作？": "建議先使用履歷分析功能，系統會根據你的技能、經歷與職缺條件產生較精準的推薦。如果還沒上傳履歷，可以先從公開職缺看板搜尋感興趣的工作。",
  "我的履歷缺少什麼？": "新鮮人履歷常見問題是缺少量化成果、專案角色不清楚、技能和職缺需求沒有對齊。建議把經歷改成具體成果，例如完成什麼專案、使用了哪些工具、最後做出了什麼結果。",
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
  lineHeight: "1.8",
  textAlign: "left",
};

function makeUserFriendlySummary(
  text,
  fallback = "系統已完成履歷重點整理，並根據你的經歷產生適合的職缺建議。"
) {
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
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState("jobseeker");
  const [allResumeRecords, setAllResumeRecords] = useState([]);

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

  const loadUserProfile = async (user) => {
    if (!db || !user?.uid) return null;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const profile = userSnap.data();

        setUserProfile(profile);
        setUserRole(profile.role || "jobseeker");

        return profile;
      }

      const defaultProfile = {
        email: user.email || "",
        role: "jobseeker",
        companyName: "",
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, defaultProfile);

      setUserProfile(defaultProfile);
      setUserRole("jobseeker");

      return defaultProfile;
    } catch (error) {
      console.warn("讀取使用者角色失敗：", error);
      setUserProfile(null);
      setUserRole("jobseeker");
      setSysError("讀取使用者身分失敗，系統將暫時以求職者模式顯示。");
      return null;
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);

    let unsubscribe = () => {};

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user || null);

        if (user) {
          const profile = await loadUserProfile(user);

          if ((profile?.role || "jobseeker") === "jobseeker") {
            await loadResumeRecords(user);
          } else {
            setResumeRecords([]);
          }
        } else {
          setUserProfile(null);
          setUserRole("jobseeker");
          setResumeRecords([]);
        }

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
      setSysError("履歷分析進行中，請等待完成後再切換頁面。");
      setTimeout(() => setSysError(""), 3000);
      return;
    }

    const needLogin = [
      "dashboard",
      "upload",
      "settings",
      "compare",
      "employerDashboard",
      "employerScreening",
      "candidateList",
    ].includes(tab);

    if (needLogin && !currentUser) {
      setSysError("請先登入或註冊，才能使用會員專屬功能。");
      setCurrentTab("auth");
      setSidebarOpen(false);
      return;
    }

    const employerOnlyTabs = ["employerDashboard", "employerScreening", "candidateList"];
    const jobseekerOnlyTabs = ["dashboard", "upload", "compare"];

    if (employerOnlyTabs.includes(tab) && userRole !== "employer") {
      setSysError("此功能僅限企業端帳號使用。");
      return;
    }

    if (jobseekerOnlyTabs.includes(tab) && userRole === "employer") {
      setSysError("此功能僅限求職者帳號使用。");
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
          .responsive-grid-4,
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
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
          userRole={userRole}
          userProfile={userProfile}
          handleTabClick={handleTabClick}
          handleLogout={handleLogout}
        />

        <div
          style={{
            marginLeft: isMobile ? 0 : 260,
            minHeight: "100vh",
            width: isMobile ? "100%" : "calc(100% - 260px)",
            backgroundColor: COLORS.background,
          }}
        >
          {isMobile && (
            <MobileHeader setSidebarOpen={setSidebarOpen} />
          )}

          <main style={{ width: "100%", margin: 0, padding: 0 }}>
            {sysError && (
              <div style={{ padding: isMobile ? "20px 20px 0" : "24px 32px 0" }}>
                <MessageBox type="error" text={sysError} />
              </div>
            )}

            {sysMsg && (
              <div style={{ padding: isMobile ? "20px 20px 0" : "24px 32px 0" }}>
                <MessageBox type="success" text={sysMsg} />
              </div>
            )}

            {currentTab === "auth" && (
              <AuthView
                setSysError={setSysError}
                setSysMsg={setSysMsg}
                onLoginSuccess={(role) => {
                  setCurrentTab(role === "employer" ? "employerDashboard" : "dashboard");
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

            {currentTab === "compare" && (
              <ResumeCompareView resumeRecords={resumeRecords} />
            )}

            {currentTab === "employerDashboard" && (
              <EmployerDashboardView userProfile={userProfile} />
            )}

            {currentTab === "employerScreening" && (
              <EmployerScreeningView setSysError={setSysError} />
            )}

            {currentTab === "candidateList" && (
              <CandidateListView setSysError={setSysError} />
            )}
          </main>
        </div>

        <ChatAssistant isMobile={isMobile} />
      </div>
    </>
  );
}

function MobileHeader({ setSidebarOpen }) {
  return (
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
  );
}

function Sidebar({
  isMobile,
  sidebarOpen,
  currentTab,
  currentUser,
  userRole,
  userProfile,
  handleTabClick,
  handleLogout,
}) {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "260px",
        height: "100vh",
        backgroundColor: COLORS.primary,
        color: COLORS.surface,
        transition: "transform 0.25s ease",
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 8px rgba(0,0,0,0.12)",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "26px 24px",
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

        {userRole === "employer" ? (
          <>
            <SideLabel text="企業端功能" />

            <NavItem
              icon={<LayoutDashboard />}
              label="企業端總覽"
              isActive={currentTab === "employerDashboard"}
              onClick={() => handleTabClick("employerDashboard")}
            />

            <NavItem
              icon={<Target />}
              label="人才自動篩選"
              isActive={currentTab === "employerScreening"}
              onClick={() => handleTabClick("employerScreening")}
            />

            <NavItem
              icon={<FileText />}
              label="候選人履歷資料"
              isActive={currentTab === "candidateList"}
              onClick={() => handleTabClick("candidateList")}
            />
          </>
        ) : (
          <>
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

            <NavItem
              icon={<BarChart2 />}
              label="履歷版本比較"
              isActive={currentTab === "compare"}
              onClick={() => handleTabClick("compare")}
            />
          </>
        )}
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
  const [accountRole, setAccountRole] = useState("jobseeker");
  const [companyName, setCompanyName] = useState("");
  const [employerCode, setEmployerCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const EMPLOYER_VERIFY_CODE = "HR2026";

  const resetRoleFields = () => {
    setCompanyName("");
    setEmployerCode("");
  };

  const handleSubmit = async () => {
    if (!account || !password) {
      setSysError("請輸入信箱與密碼。");
      return;
    }

    if (password.length < 6) {
      setSysError("密碼至少需要 6 碼。");
      return;
    }

    if (accountRole === "employer") {
      if (!isLoginMode && !companyName.trim()) {
        setSysError("註冊企業端帳號時，請填寫公司名稱。");
        return;
      }

      if (employerCode.trim() !== EMPLOYER_VERIFY_CODE) {
        setSysError(
          isLoginMode
            ? "企業驗證碼錯誤，請確認後再登入。"
            : "企業驗證碼錯誤，請確認後再註冊，或改用求職者帳號。"
        );
        return;
      }
    }

    setIsSubmitting(true);
    setSysError("");
    setSysMsg("");

    try {
      if (!auth) throw new Error("登入服務尚未正確啟用。");

      if (isLoginMode) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          account,
          password
        );

        let profileRole = "jobseeker";

        if (db) {
          const userRef = doc(db, "users", userCredential.user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const profile = userSnap.data();
            profileRole = profile.role || "jobseeker";
          } else {
            const defaultProfile = {
              email: account,
              role: "jobseeker",
              companyName: "",
              createdAt: new Date().toISOString(),
            };

            await setDoc(userRef, defaultProfile);
            profileRole = "jobseeker";
          }
        }

        if (profileRole !== accountRole) {
          await signOut(auth);

          setSysError(
            accountRole === "employer"
              ? "此帳號不是企業端帳號，請切換為求職者登入。"
              : "此帳號不是求職者帳號，請切換為企業端登入。"
          );

          return;
        }

        setSysMsg(
          accountRole === "employer"
            ? "企業端登入成功！"
            : "求職者登入成功！"
        );

        onLoginSuccess(profileRole);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          account,
          password
        );

        if (db) {
          const userRef = doc(db, "users", userCredential.user.uid);

          await setDoc(userRef, {
            email: account,
            role: accountRole,
            companyName: accountRole === "employer" ? companyName.trim() : "",
            createdAt: new Date().toISOString(),
          });
        }

        setSysMsg(
          accountRole === "employer"
            ? "企業端帳號註冊成功，系統已自動登入。"
            : "求職者帳號註冊成功，系統已自動登入。"
        );

        onLoginSuccess(accountRole);
      }
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
    <div style={{ padding: "48px 24px" }}>
      <div style={{ maxWidth: "460px", margin: "0 auto" }}>
        <div style={{ ...STYLES.card, padding: "38px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Cloud size={48} color={COLORS.primary} />
            <h2 style={{ margin: "14px 0 8px", color: COLORS.primary }}>
              {isLoginMode ? "登入會員" : "註冊新帳號"}
            </h2>
            <p style={{ color: COLORS.textMuted, margin: 0, lineHeight: 1.6 }}>
              {isLoginMode
                ? "請先選擇登入身分，再輸入帳號密碼。"
                : "註冊後會依照帳號身分，顯示求職者端或企業端功能。"}
            </p>
          </div>
          
          <div style={{ marginBottom: "18px" }}>
            <label style={{ fontWeight: 700, color: COLORS.primary }}>
              {isLoginMode ? "登入身分" : "帳號類型"}
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAccountRole("jobseeker");
                  resetRoleFields();
                }}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border:
                    accountRole === "jobseeker"
                      ? `2px solid ${COLORS.accent}`
                      : `1px solid ${COLORS.border}`,
                  backgroundColor:
                    accountRole === "jobseeker" ? "#EFF6FF" : "#FFFFFF",
                  color: COLORS.primary,
                  fontWeight: 800,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                求職者
              </button>

              <button
                type="button"
                onClick={() => setAccountRole("employer")}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border:
                    accountRole === "employer"
                      ? `2px solid ${COLORS.accent}`
                      : `1px solid ${COLORS.border}`,
                  backgroundColor:
                    accountRole === "employer" ? "#EFF6FF" : "#FFFFFF",
                  color: COLORS.primary,
                  fontWeight: 800,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                企業端 / HR
              </button>
            </div>
          </div>

          <label style={{ fontWeight: 700, color: COLORS.primary }}>
            電子信箱
          </label>
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

          {accountRole === "employer" && (
            <div
              style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "18px",
                backgroundColor: "#FBFDFF",
              }}
            >
              {!isLoginMode && (
                <>
                  <label style={{ fontWeight: 700, color: COLORS.primary }}>
                    公司名稱
                  </label>
                  <input
                    type="text"
                    placeholder="例如：AI Resume 測試企業"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ ...STYLES.input, marginTop: 8, marginBottom: 16 }}
                  />
                </>
              )}

              <label style={{ fontWeight: 700, color: COLORS.primary }}>
                企業驗證碼
              </label>
              <input
                type="password"
                placeholder="請輸入企業驗證碼"
                value={employerCode}
                onChange={(e) => setEmployerCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{ ...STYLES.input, marginTop: 8, marginBottom: 8 }}
              />
            </div>
          )}

          <button
            style={{ ...STYLES.button, width: "100%" }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "處理中..."
              : isLoginMode
              ? accountRole === "employer"
                ? "登入企業端"
                : "登入求職者帳號"
              : accountRole === "employer"
              ? "註冊企業端帳號"
              : "註冊求職者帳號"}
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
                setAccountRole("jobseeker");
                resetRoleFields();
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
    </div>
  );
}

function HeroSection({ title, description, action, statItems = [] }) {
  return (
    <section
      style={{
        backgroundColor: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "36px 32px 28px",
      }}
    >
      <div
        className="hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 0.9fr",
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              backgroundColor: "#EFF6FF",
              color: COLORS.accent,
              fontSize: "0.82rem",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <Sparkles size={14} />
            智慧履歷與職缺媒合平台
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              color: COLORS.primary,
              fontSize: "clamp(1.9rem, 2.8vw, 2.5rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: 0,
              color: COLORS.textMuted,
              lineHeight: 1.8,
              maxWidth: 760,
              fontSize: "1rem",
            }}
          >
            {description}
          </p>

          {action && <div style={{ marginTop: 20 }}>{action}</div>}
        </div>

        <div
          style={{
            ...STYLES.card,
            padding: "20px",
            background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            alignContent: "start",
          }}
        >
          {statItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "16px",
                backgroundColor: "#fff",
              }}
            >
              <div style={{ color: COLORS.accent, marginBottom: 10 }}>{item.icon}</div>
              <div
                style={{
                  color: COLORS.primary,
                  fontWeight: 900,
                  fontSize: "1.35rem",
                  lineHeight: 1.15,
                }}
              >
                {item.value}
              </div>
              <div style={{ marginTop: 6, color: COLORS.textMuted, fontSize: "0.9rem" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PageBody({ children }) {
  return <section style={{ padding: "28px 32px 42px" }}>{children}</section>;
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
    <>
      <HeroSection
        title="探索適合你的職缺方向"
        description="瀏覽多元職缺，快速掌握不同領域所需的能力與職務方向。登入後還能根據履歷內容取得更貼近個人的推薦結果。"
        statItems={[
          { icon: <Briefcase size={18} />, value: PUBLIC_JOBS.length, label: "公開職缺" },
          { icon: <Target size={18} />, value: categories.length - 1, label: "職務分類" },
          { icon: <Star size={18} />, value: "新鮮人", label: "友善導向" },
          { icon: <Search size={18} />, value: "即時", label: "快速搜尋" },
        ]}
      />

      <PageBody>
        <div style={{ ...STYLES.card, marginBottom: "22px", padding: "20px" }}>
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
                  borderRadius: "12px",
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
                  style={{ ...STYLES.input, margin: 0, border: "none", paddingLeft: 0 }}
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
                  borderRadius: "12px",
                }}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredJobs.map((job) => (
            <JobListItem key={job.id} job={job} />
          ))}

          {filteredJobs.length === 0 && (
            <div style={STYLES.card}>
              <p style={{ margin: 0, color: COLORS.textMuted }}>
                找不到符合條件的職缺，請嘗試更換關鍵字或類別。
              </p>
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}

function JobListItem({ job }) {
  return (
    <div
      style={{
        ...STYLES.card,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "18px",
        alignItems: "center",
        padding: "22px 24px",
      }}
      className="responsive-grid-2"
    >
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <span style={tagStyle(COLORS.accent)}>{job.category}</span>
          <span style={tagStyle(COLORS.textMuted)}>{job.type}</span>
          <span style={tagStyle(COLORS.textMuted)}>{job.location}</span>
        </div>

        <h3 style={{ margin: "0 0 8px", color: COLORS.primary, fontSize: "1.12rem" }}>
          {job.title}
        </h3>

        <p style={{ margin: "0 0 10px", color: COLORS.textMuted, fontSize: "0.94rem" }}>
          {job.company}
        </p>

        <p style={{ margin: "0 0 14px", color: COLORS.textMuted, lineHeight: 1.7 }}>
          {job.intro}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {job.reqSkills.map((skill) => (
            <span key={skill} style={tagStyle(COLORS.textMuted)}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <button
        style={{
          ...STYLES.button,
          backgroundColor: "#F8FAFC",
          color: COLORS.primary,
          border: `1px solid ${COLORS.border}`,
          whiteSpace: "nowrap",
        }}
      >
        查看詳情
      </button>
    </div>
  );
}

function DashboardView({ currentUser, resumeRecords, recordsLoading, setCurrentTab }) {
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
    <>
      <HeroSection
        title="你的履歷概況與職缺建議"
        description={`歡迎回來，${currentUser?.email || "使用者"}。在這裡可以查看履歷分析紀錄、推薦職缺與目前較需要補強的能力方向。`}
        action={
          <button style={STYLES.button} onClick={() => setCurrentTab("upload")}>
            <Upload size={18} />
            上傳新履歷
          </button>
        }
        statItems={[
          { icon: <FileText size={18} />, value: resumeRecords.length, label: "履歷分析紀錄" },
          { icon: <Briefcase size={18} />, value: recommendedCount, label: "最新推薦職缺" },
          { icon: <BarChart2 size={18} />, value: avgMatch ? `${avgMatch}%` : "尚無", label: "平均適合度" },
          { icon: <Target size={18} />, value: missingSkillCount, label: "建議補強能力" },
        ]}
      />

      <PageBody>
        <div
          className="responsive-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "20px",
          }}
        >
          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <Star size={20} /> 最新履歷摘要
            </h3>

            {latestRecord ? (
              <>
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: "14px",
                    backgroundColor: "#F8FAFC",
                    border: `1px solid ${COLORS.border}`,
                    marginBottom: 18,
                  }}
                >
                  <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 6 }}>
                    {latestRecord.fileName || "未命名履歷"}
                  </div>
                  <div style={{ color: COLORS.textMuted, fontSize: "0.9rem" }}>
                    {latestRecord.createdAt
                      ? new Date(latestRecord.createdAt).toLocaleString()
                      : "無時間紀錄"}
                  </div>
                </div>

                <p style={{ margin: "0 0 14px", color: COLORS.textMuted, lineHeight: 1.8 }}>
                  {makeUserFriendlySummary(latestRecord.userSummary || latestRecord.nlpSummary)}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {latestRecord.careerDirection && (
                    <span style={tagStyle(COLORS.accent)}>
                      {latestRecord.careerDirection}
                    </span>
                  )}

                  {latestRecord.experienceLevel && (
                    <span style={tagStyle(COLORS.textMuted)}>
                      {latestRecord.experienceLevel}
                    </span>
                  )}

                  {latestRecord.resumeScore ? (
                    <span style={tagStyle(COLORS.success)}>
                      履歷完整度 {latestRecord.resumeScore}/100
                    </span>
                  ) : null}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(latestRecord.skills || []).slice(0, 8).map((skill) => (
                    <span key={skill} style={tagStyle(COLORS.success)}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: COLORS.textMuted, lineHeight: 1.8 }}>
                尚未有履歷分析紀錄。你可以先上傳履歷，系統會為你整理重點並產生職缺建議。
              </p>
            )}
          </div>

          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <Briefcase size={20} /> 快速操作
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <QuickActionCard
                title="上傳履歷並開始分析"
                text="整理履歷重點、優勢與需要補強的能力。"
                onClick={() => setCurrentTab("upload")}
              />
              <QuickActionCard
                title="瀏覽更多公開職缺"
                text="查看不同領域的職缺方向與所需能力。"
                onClick={() => setCurrentTab("jobs")}
              />
              <QuickActionCard
                title="查看新鮮人求職建議"
                text="快速掌握履歷撰寫與面試準備方向。"
                onClick={() => setCurrentTab("campus")}
              />
            </div>
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
                    borderRadius: 14,
                    padding: 18,
                    backgroundColor: "#FBFDFF",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 10,
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

                  <p style={{ color: COLORS.textMuted, lineHeight: 1.7, margin: 0 }}>
                    {makeUserFriendlySummary(record.userSummary || record.nlpSummary).slice(0, 120)}
                    {makeUserFriendlySummary(record.userSummary || record.nlpSummary).length > 120 ? "..." : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    pages.push(text);
  }

  return pages.join("\n").trim();
}

async function extractTextFromImage(file) {
  let worker;

  try {
    worker = await createWorker("eng+chi_tra");
  } catch {
    worker = await createWorker("eng");
  }

  try {
    const {
      data: { text },
    } = await worker.recognize(file);

    return text.trim();
  } finally {
    await worker.terminate();
  }
}

function QuickActionCard({ title, text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${COLORS.border}`,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: "16px 18px",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 6 }}>{title}</div>
        <div style={{ color: COLORS.textMuted, lineHeight: 1.6, fontSize: "0.92rem" }}>{text}</div>
      </div>
      <ChevronRight size={18} color={COLORS.textMuted} />
    </button>
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
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractingMsg, setExtractingMsg] = useState("");

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setSysError("");
    setSysMsg("");

    const fileName = selectedFile.name.toLowerCase();
    const isPdf =
      selectedFile.type === "application/pdf" || fileName.endsWith(".pdf");
    const isImage =
      selectedFile.type.startsWith("image/") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg");

    if (!isPdf && !isImage) {
      setSysMsg("已選擇履歷檔案。若系統無法讀取內容，請手動貼上履歷文字。");
      return;
    }

    setIsExtracting(true);
    setExtractingMsg(isPdf ? "正在讀取 PDF 履歷內容..." : "正在辨識圖片履歷文字...");

    try {
      const extractedText = isPdf
        ? await extractTextFromPdf(selectedFile)
        : await extractTextFromImage(selectedFile);

      if (!extractedText || extractedText.length < 10) {
        setSysError("系統沒有讀到足夠的履歷文字，請手動貼上履歷內容。");
        return;
      }

      setResumeText((prev) => {
        const nextText = extractedText.trim();
        return prev.trim() ? `${prev.trim()}\n\n${nextText}` : nextText;
      });

      setSysMsg(
        isPdf
          ? "PDF 履歷內容讀取完成，已自動填入履歷文字框。"
          : "圖片文字辨識完成，已自動填入履歷文字框。"
      );
    } catch (error) {
      console.error(error);
      setSysError("自動讀取履歷內容失敗，請改用手動貼上履歷文字。");
    } finally {
      setIsExtracting(false);
      setExtractingMsg("");
    }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, fileName: file.name }),
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

        careerDirection: aiResult.careerDirection || "尚未判斷",
        experienceLevel: aiResult.experienceLevel || "新鮮人 / 初階",
        resumeScore: Number(aiResult.resumeScore || 0),
        workStyle: aiResult.workStyle || [],
        personalityTraits: aiResult.personalityTraits || [],
        jobFitReasoning: aiResult.jobFitReasoning || [],
        learningResources: aiResult.learningResources || [],

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

  const disabled = isAnalyzing || isExtracting;

  return (
    <>
      <HeroSection
        title="上傳履歷並整理你的求職優勢"
        description="選擇 PDF 或圖片履歷後，系統會嘗試自動讀取內容；你也可以手動貼上履歷文字，再進行分析。"
        statItems={[
          { icon: <Upload size={18} />, value: "自動讀取", label: "PDF / 圖片" },
          { icon: <BarChart2 size={18} />, value: "履歷分數", label: "完整度評估" },
          { icon: <Target size={18} />, value: "補強方向", label: "學習建議" },
          { icon: <Briefcase size={18} />, value: "職缺建議", label: "推薦結果" },
        ]}
      />

      <PageBody>
        {(isAnalyzing || isExtracting) && (
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
            {isExtracting ? extractingMsg : "系統正在分析履歷，請稍候。"}
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
              disabled={disabled}
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
                borderRadius: "14px",
                cursor: disabled ? "not-allowed" : "pointer",
                backgroundColor: "#F8FBFF",
                color: COLORS.accent,
                opacity: disabled ? 0.5 : 1,
                textAlign: "left",
              }}
            >
              <Upload size={40} />
              <strong>點擊選擇履歷檔案</strong>
              <span style={{ fontSize: "0.9rem", color: COLORS.textMuted }}>
                {file ? `已選擇：${file.name}` : "支援 PDF、PNG、JPG、JPEG"}
              </span>
              <span style={{ fontSize: "0.85rem", color: COLORS.textMuted, lineHeight: 1.6 }}>
                PDF 會自動解析文字；圖片會嘗試辨識文字。若結果不完整，可手動修改右側文字框。
              </span>
            </label>
          </div>

          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <FileText size={20} /> 履歷文字內容
            </h3>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={disabled}
              placeholder="請貼上履歷文字內容，或上傳 PDF / 圖片後由系統自動讀取。"
              style={{
                width: "100%",
                minHeight: "260px",
                padding: "14px",
                borderRadius: "12px",
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
                opacity: disabled ? 0.7 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                borderRadius: "12px",
              }}
              onClick={startAnalysis}
              disabled={disabled}
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
      </PageBody>
    </>
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
            backgroundColor: "#F8FAFC",
            padding: "16px 18px",
            borderRadius: "12px",
            textAlign: "left",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {makeUserFriendlySummary(result.userSummary || result.nlpSummary)}
        </p>
      </div>

      <SemanticProfileCard result={result} />

      <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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

      <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <BulletCard icon={<Star size={20} />} title="履歷亮點" items={result.resumeHighlights} />
        <BulletCard icon={<AlertCircle size={20} />} title="可改善問題" items={result.resumeProblems} />
      </div>

      <BulletCard icon={<CheckCircle size={20} />} title="履歷優化建議" items={result.resumeSuggestions} />

      <LearningResourcesCard resources={result.learningResources || []} />

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
                  borderRadius: "14px",
                  padding: "18px",
                  backgroundColor: "#FFFFFF",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
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

                <div style={{ marginTop: 12, backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px", lineHeight: 1.7 }}>
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

function SemanticProfileCard({ result }) {
  const score = Number(result.resumeScore || 0);

  return (
    <div style={STYLES.card}>
      <h3 style={STYLES.title}>
        <Sparkles size={20} /> 履歷整體評估
      </h3>

      <div
        className="responsive-grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "0.8fr 1fr 1fr",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 18,
            backgroundColor: "#F8FAFC",
          }}
        >
          <div style={{ color: COLORS.textMuted, fontSize: "0.9rem", marginBottom: 8 }}>
            履歷完整度
          </div>
          <div style={{ color: COLORS.primary, fontWeight: 900, fontSize: "2rem" }}>
            {score || "尚無"}
            {score ? <span style={{ fontSize: "1rem" }}> / 100</span> : null}
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 18,
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ color: COLORS.textMuted, fontSize: "0.9rem", marginBottom: 8 }}>
            適合職涯方向
          </div>
          <div style={{ color: COLORS.primary, fontWeight: 800, lineHeight: 1.6 }}>
            {result.careerDirection || "尚未判斷"}
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 18,
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ color: COLORS.textMuted, fontSize: "0.9rem", marginBottom: 8 }}>
            經驗程度
          </div>
          <div style={{ color: COLORS.primary, fontWeight: 800, lineHeight: 1.6 }}>
            {result.experienceLevel || "新鮮人 / 初階"}
          </div>
        </div>
      </div>

      <div
        className="responsive-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 10 }}>
            工作風格
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(result.workStyle || []).length > 0 ? (
              result.workStyle.map((item) => (
                <span key={item} style={tagStyle(COLORS.accent)}>
                  {item}
                </span>
              ))
            ) : (
              <span style={{ color: COLORS.textMuted }}>尚無資料</span>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 10 }}>
            個人特質
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(result.personalityTraits || []).length > 0 ? (
              result.personalityTraits.map((item) => (
                <span key={item} style={tagStyle(COLORS.success)}>
                  {item}
                </span>
              ))
            ) : (
              <span style={{ color: COLORS.textMuted }}>尚無資料</span>
            )}
          </div>
        </div>
      </div>

      {(result.jobFitReasoning || []).length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 10 }}>
            職缺媒合理由
          </div>
          <ul style={listStyle}>
            {result.jobFitReasoning.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LearningResourcesCard({ resources = [] }) {
  return (
    <div style={STYLES.card}>
      <h3 style={STYLES.title}>
        <Target size={20} /> 學習資源與補強路線
      </h3>

      {resources.length === 0 ? (
        <p style={{ margin: 0, color: COLORS.textMuted }}>
          目前沒有學習資源建議。
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {resources.map((resource, index) => (
            <div
              key={`${resource.skill}-${index}`}
              style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: 18,
                backgroundColor: "#FBFDFF",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <span style={tagStyle(COLORS.warning)}>
                  {resource.skill || "建議補強能力"}
                </span>
              </div>

              <p style={{ margin: "0 0 12px", color: COLORS.textMuted, lineHeight: 1.7 }}>
                {resource.reason || "建議補強這項能力以提升職缺適合度。"}
              </p>

              {resource.learningPath && resource.learningPath.length > 0 && (
                <>
                  <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 8 }}>
                    建議學習順序
                  </div>
                  <ol style={{ ...listStyle, marginBottom: 12 }}>
                    {resource.learningPath.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>
                </>
              )}

              {resource.practiceTask && (
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: 10,
                    padding: 12,
                    color: COLORS.textMain,
                    lineHeight: 1.7,
                  }}
                >
                  <strong style={{ color: COLORS.primary }}>練習任務：</strong>
                  <span> {resource.practiceTask}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoListCard({ icon, title, items = [], color, emptyText }) {
  return (
    <div style={STYLES.card}>
      <h3 style={STYLES.title}>{icon} {title}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.length > 0 ? (
          items.map((item) => <span key={item} style={tagStyle(color)}>{item}</span>)
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
      <h3 style={STYLES.title}>{icon} {title}</h3>
      {items.length > 0 ? (
        <ul style={listStyle}>
          {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      ) : (
        <p style={{ margin: 0, color: COLORS.textMuted }}>目前沒有資料。</p>
      )}
    </div>
  );
}

function CampusView() {
  return (
    <>
      <HeroSection
        title="新鮮人求職準備指南"
        description="從履歷撰寫、面試準備到能力補強方向，整理出適合大學生與新鮮人的求職建議。"
        statItems={[
          { icon: <GraduationCap size={18} />, value: "履歷撰寫", label: "基礎整理" },
          { icon: <MessageSquare size={18} />, value: "面試準備", label: "常見方向" },
          { icon: <Target size={18} />, value: "能力補強", label: "求職重點" },
          { icon: <Star size={18} />, value: "新鮮人", label: "友善設計" },
        ]}
      />

      <PageBody>
        <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={STYLES.card}>
            <h3 style={{ ...STYLES.title, color: COLORS.success }}>
              <GraduationCap size={24} /> 履歷撰寫指南
            </h3>
            <ul style={listStyle}>
              <li><strong>STAR 原則：</strong>用情境、任務、行動、結果描述專案或經歷。</li>
              <li><strong>量化成果：</strong>例如「提升 20% 效率」比「顯著提升效率」更有說服力。</li>
              <li><strong>一頁式履歷：</strong>新鮮人履歷建議濃縮至一頁 A4。</li>
              <li><strong>作品集連結：</strong>資訊相關科系建議補上 GitHub、Demo 網站或專題影片。</li>
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
      </PageBody>
    </>
  );
}

function SettingsView({ currentUser }) {
  return (
    <>
      <HeroSection
        title="帳號與系統設定"
        description="查看目前登入的帳號資訊，以及系統使用狀態。"
        statItems={[
          { icon: <User size={18} />, value: "帳號", label: "會員資訊" },
          { icon: <Settings size={18} />, value: "設定", label: "系統狀態" },
          { icon: <FileText size={18} />, value: "履歷紀錄", label: "分析保存" },
          { icon: <Cloud size={18} />, value: "雲端", label: "資料同步" },
        ]}
      />

      <PageBody>
        <div style={{ maxWidth: 720 }}>
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
      </PageBody>
    </>
  );
}

function EmployerDashboardView({ userProfile }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, "resumes"));
        const data = snapshot.docs
          .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setRecords(data);
      } catch (error) {
        console.warn("企業端總覽讀取候選人失敗：", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const uniqueCandidateCount = new Set(
    records.map((record) => record.uid || record.userEmail || record.id)
  ).size;

  const avgResumeScore =
    records.length > 0
      ? Math.round(
          records.reduce((sum, record) => sum + Number(record.resumeScore || 0), 0) /
            records.length
        )
      : 0;

  const allSkills = records.flatMap((record) => record.skills || []);
  const skillStats = allSkills.reduce((acc, skill) => {
    const key = String(skill || "").trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topSkills = Object.entries(skillStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const latestRecords = records.slice(0, 5);

  return (
    <>
      <HeroSection
        title="企業端總覽"
        description={`歡迎使用企業端功能，${userProfile?.companyName || "企業帳號"} 可以在這裡查看候選人資料概況，並進行人才自動篩選。`}
        statItems={[
          { icon: <User size={18} />, value: loading ? "讀取中" : uniqueCandidateCount, label: "候選人數" },
          { icon: <FileText size={18} />, value: loading ? "讀取中" : records.length, label: "履歷紀錄" },
          { icon: <BarChart2 size={18} />, value: avgResumeScore ? `${avgResumeScore}/100` : "尚無", label: "平均完整度" },
          { icon: <Target size={18} />, value: topSkills.length, label: "常見技能" },
        ]}
      />

      <PageBody>
        <div
          className="responsive-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <Target size={20} /> 常見候選人技能
            </h3>

            {loading ? (
              <p style={{ color: COLORS.textMuted, margin: 0 }}>正在讀取資料...</p>
            ) : topSkills.length === 0 ? (
              <p style={{ color: COLORS.textMuted, margin: 0 }}>
                目前尚無候選人技能資料。
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {topSkills.map(([skill, count]) => (
                  <span key={skill} style={tagStyle(COLORS.accent)}>
                    {skill} × {count}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <Briefcase size={20} /> 企業端功能
            </h3>

            <ul style={listStyle}>
              <li>可依職缺需求輸入技能條件，自動排序候選人。</li>
              <li>可查看候選人履歷摘要、完整度、能力與技能缺口。</li>
              <li>可作為 HR 初步篩選人才的輔助工具。</li>
            </ul>
          </div>
        </div>

        <div style={{ ...STYLES.card, marginTop: 22 }}>
          <h3 style={STYLES.title}>
            <FileText size={20} /> 最近新增候選人
          </h3>

          {loading ? (
            <p style={{ color: COLORS.textMuted, margin: 0 }}>正在讀取候選人紀錄...</p>
          ) : latestRecords.length === 0 ? (
            <p style={{ color: COLORS.textMuted, margin: 0 }}>
              目前尚無履歷分析紀錄。當求職者完成履歷分析後，候選人資料會顯示在這裡。
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {latestRecords.map((record) => (
                <div
                  key={record.id}
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 14,
                    padding: 16,
                    backgroundColor: "#FBFDFF",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ color: COLORS.primary }}>
                        {record.userEmail || "未提供信箱"}
                      </strong>
                      <p style={{ margin: "6px 0 0", color: COLORS.textMuted, lineHeight: 1.6 }}>
                        {record.fileName || "未命名履歷"}・
                        {record.createdAt ? new Date(record.createdAt).toLocaleString() : "無時間紀錄"}
                      </p>
                    </div>

                    <span style={tagStyle(COLORS.success)}>
                      完整度 {record.resumeScore || 0}/100
                    </span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(record.skills || []).slice(0, 6).map((skill) => (
                      <span key={skill} style={tagStyle(COLORS.accent)}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}

function EmployerScreeningView({ setSysError }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("前端工程師");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("全職");
  const [requiredSkillsText, setRequiredSkillsText] = useState("React, JavaScript, Firebase");
  const [minScore, setMinScore] = useState(60);
  const [results, setResults] = useState([]);

  const parseRequiredSkills = (text) =>
    text
      .split(/[,，、\n]/)
      .map((item) => item.trim())
      .filter(Boolean);

  const getLatestRecordsByCandidate = (items) => {
    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    const map = new Map();

    sorted.forEach((record) => {
      const key = record.uid || record.userEmail || record.id;
      if (!map.has(key)) map.set(key, record);
    });

    return Array.from(map.values());
  };

  const calculateFit = (record, requiredSkills) => {
    const candidateSkills = (record.skills || []).map((skill) => String(skill).trim());
    const candidateSkillsLower = candidateSkills.map((skill) => skill.toLowerCase());
    const requiredLower = requiredSkills.map((skill) => skill.toLowerCase());

    const matchedSkills = requiredSkills.filter((skill, index) => {
      const target = requiredLower[index];
      return candidateSkillsLower.some(
        (candidateSkill) =>
          candidateSkill.includes(target) || target.includes(candidateSkill)
      );
    });

    const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));

    const skillScore =
      requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 65)
        : 35;

    const resumeScore = Math.min(Number(record.resumeScore || 0), 100);
    const resumeScorePart = Math.round(resumeScore * 0.2);

    const careerText = `${record.careerDirection || ""} ${(record.recommendedJobs || [])
      .map((job) => job.title || "")
      .join(" ")}`.toLowerCase();

    const titleKeywords = jobTitle
      .split(/[\s,，、/]+/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const careerPart =
      titleKeywords.length > 0 && titleKeywords.some((word) => careerText.includes(word))
        ? 10
        : 0;

    const locationText = `${record.location || ""} ${(record.recommendedJobs || [])
      .map((job) => job.location || "")
      .join(" ")}`.toLowerCase();

    const locationPart =
      location && locationText.includes(location.trim().toLowerCase()) ? 5 : 0;

    const score = Math.min(
      100,
      Math.round(skillScore + resumeScorePart + careerPart + locationPart)
    );

    const reasonParts = [];

    if (matchedSkills.length > 0) {
      reasonParts.push(`符合 ${matchedSkills.join("、")} 等需求技能`);
    }

    if (resumeScore >= 80) {
      reasonParts.push("履歷完整度高，內容相對完整");
    } else if (resumeScore >= 60) {
      reasonParts.push("履歷完整度中等，具備進一步面試評估價值");
    } else {
      reasonParts.push("履歷完整度仍可補強，建議面試時確認細節");
    }

    if (record.careerDirection) {
      reasonParts.push(`職涯方向偏向「${record.careerDirection}」`);
    }

    return {
      ...record,
      screeningScore: score,
      matchedSkills,
      screeningMissingSkills: missingSkills,
      screeningReason: reasonParts.join("，") + "。",
    };
  };

  const loadRecords = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "resumes"));
      const data = snapshot.docs
        .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setRecords(data);
    } catch (error) {
      console.warn("讀取候選人資料失敗：", error);
      setSysError?.("讀取候選人資料失敗，請確認 Firestore Rules 是否允許企業端讀取 resumes。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const runScreening = () => {
    const requiredSkills = parseRequiredSkills(requiredSkillsText);

    if (requiredSkills.length === 0) {
      setSysError?.("請至少輸入一項需求技能，例如 React、SQL、Excel。");
      return;
    }

    const latestCandidates = getLatestRecordsByCandidate(records);

    const nextResults = latestCandidates
      .map((record) => calculateFit(record, requiredSkills))
      .filter((record) => record.screeningScore >= Number(minScore || 0))
      .sort((a, b) => b.screeningScore - a.screeningScore);

    setResults(nextResults);
  };

  useEffect(() => {
    if (records.length > 0) runScreening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  return (
    <>
      <HeroSection
        title="人才自動篩選"
        description="輸入職缺需求後，系統會根據候選人的履歷分析紀錄，比對需求技能、履歷完整度與職涯方向，協助企業端快速排序候選人。"
        statItems={[
          { icon: <Target size={18} />, value: "技能比對", label: "篩選依據" },
          { icon: <BarChart2 size={18} />, value: results.length, label: "符合候選人" },
          { icon: <User size={18} />, value: records.length, label: "履歷紀錄" },
          { icon: <CheckCircle size={18} />, value: `${minScore}%`, label: "最低符合度" },
        ]}
      />

      <PageBody>
        <div style={{ ...STYLES.card, marginBottom: 22 }}>
          <h3 style={STYLES.title}>
            <Briefcase size={20} /> 職缺條件設定
          </h3>

          <div
            className="responsive-grid-2"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={{ fontWeight: 800, color: COLORS.primary }}>職缺名稱</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="例如：前端工程師、資料分析助理"
                style={{ ...STYLES.input, marginTop: 8 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800, color: COLORS.primary }}>工作地點</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例如：台北市、遠端、台中市"
                style={{ ...STYLES.input, marginTop: 8 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800, color: COLORS.primary }}>職缺類型</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                style={{ ...STYLES.input, marginTop: 8 }}
              >
                <option>全職</option>
                <option>實習</option>
                <option>兼職</option>
                <option>遠端</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 800, color: COLORS.primary }}>最低符合度</label>
              <input
                type="number"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                style={{ ...STYLES.input, marginTop: 8 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 800, color: COLORS.primary }}>需求技能</label>
            <textarea
              value={requiredSkillsText}
              onChange={(e) => setRequiredSkillsText(e.target.value)}
              placeholder="請用逗號分隔，例如：React, JavaScript, Firebase"
              style={{
                ...STYLES.input,
                marginTop: 8,
                minHeight: 90,
                resize: "vertical",
                lineHeight: 1.7,
              }}
            />
          </div>

          <button
            onClick={runScreening}
            style={{ ...STYLES.button, marginTop: 16, width: "100%" }}
            disabled={loading}
          >
            <Target size={18} />
            {loading ? "讀取候選人資料中..." : "開始自動篩選"}
          </button>
        </div>

        <div style={STYLES.card}>
          <h3 style={STYLES.title}>
            <BarChart2 size={20} /> 篩選結果
          </h3>

          {loading ? (
            <p style={{ color: COLORS.textMuted, margin: 0 }}>正在讀取候選人資料...</p>
          ) : results.length === 0 ? (
            <p style={{ color: COLORS.textMuted, margin: 0 }}>
              目前沒有符合條件的候選人。可以降低最低符合度，或調整需求技能。
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {results.map((record) => (
                <div
                  key={record.id}
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 14,
                    padding: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <h4 style={{ margin: "0 0 6px", color: COLORS.primary }}>
                        {record.userEmail || "未提供信箱"}
                      </h4>
                      <p style={{ margin: 0, color: COLORS.textMuted, lineHeight: 1.6 }}>
                        {record.fileName || "未命名履歷"}・
                        {record.careerDirection || "尚未判斷方向"}・
                        {record.createdAt ? new Date(record.createdAt).toLocaleString() : "無時間"}
                      </p>
                    </div>

                    <span style={tagStyle(COLORS.success)}>
                      符合度 {record.screeningScore}%
                    </span>
                  </div>

                  <p style={{ color: COLORS.textMuted, lineHeight: 1.8, margin: "14px 0" }}>
                    {record.screeningReason}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    <span style={tagStyle(COLORS.accent)}>
                      履歷完整度 {record.resumeScore || 0}/100
                    </span>
                    <span style={tagStyle(COLORS.textMuted)}>
                      {jobType}
                    </span>
                    {location && <span style={tagStyle(COLORS.textMuted)}>{location}</span>}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <strong style={{ color: COLORS.primary }}>符合技能：</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {record.matchedSkills.length > 0 ? (
                        record.matchedSkills.map((skill) => (
                          <span key={skill} style={tagStyle(COLORS.success)}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: COLORS.textMuted }}>無明確符合技能</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <strong style={{ color: COLORS.primary }}>仍缺技能：</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {record.screeningMissingSkills.length > 0 ? (
                        record.screeningMissingSkills.map((skill) => (
                          <span key={skill} style={tagStyle(COLORS.warning)}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: COLORS.success, fontWeight: 800 }}>
                          需求技能皆已符合
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}

function CandidateListView({ setSysError }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const snapshot = await getDocs(collection(db, "resumes"));
        const data = snapshot.docs
          .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setRecords(data);
      } catch (error) {
        console.warn("讀取候選人履歷資料失敗：", error);
        setSysError?.("讀取候選人履歷資料失敗，請確認 Firestore Rules 是否允許讀取 resumes。");
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [setSysError]);

  const filteredRecords = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return records;

    return records.filter((record) => {
      const text = [
        record.userEmail,
        record.fileName,
        record.careerDirection,
        record.experienceLevel,
        record.userSummary,
        ...(record.skills || []),
        ...(record.missingSkills || []),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [records, keyword]);

  return (
    <>
      <HeroSection
        title="候選人履歷資料"
        description="企業端可查看系統中的候選人履歷分析紀錄，包含履歷摘要、已具備能力、技能缺口與推薦職缺方向。"
        statItems={[
          { icon: <FileText size={18} />, value: records.length, label: "履歷紀錄" },
          { icon: <Sparkles size={18} />, value: filteredRecords.length, label: "目前顯示" },
          { icon: <Target size={18} />, value: "技能缺口", label: "篩選參考" },
          { icon: <Briefcase size={18} />, value: "職涯方向", label: "媒合參考" },
        ]}
      />

      <PageBody>
        <div style={{ ...STYLES.card, marginBottom: 22 }}>
          <h3 style={STYLES.title}>
            <Search size={20} /> 搜尋候選人
          </h3>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋信箱、技能、職涯方向或履歷檔名，例如 React、資料分析、行銷"
            style={STYLES.input}
          />
        </div>

        <div style={STYLES.card}>
          <h3 style={STYLES.title}>
            <FileText size={20} /> 候選人資料列表
          </h3>

          {loading ? (
            <p style={{ color: COLORS.textMuted, margin: 0 }}>正在讀取候選人資料...</p>
          ) : filteredRecords.length === 0 ? (
            <p style={{ color: COLORS.textMuted, margin: 0 }}>
              找不到符合條件的候選人資料。
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 14,
                    padding: 18,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <h4 style={{ margin: "0 0 6px", color: COLORS.primary }}>
                        {record.userEmail || "未提供信箱"}
                      </h4>
                      <p style={{ margin: 0, color: COLORS.textMuted, lineHeight: 1.6 }}>
                        {record.fileName || "未命名履歷"}・
                        {record.createdAt ? new Date(record.createdAt).toLocaleString() : "無時間紀錄"}
                      </p>
                    </div>

                    <span style={tagStyle(COLORS.success)}>
                      完整度 {record.resumeScore || 0}/100
                    </span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {record.careerDirection && (
                      <span style={tagStyle(COLORS.accent)}>
                        {record.careerDirection}
                      </span>
                    )}

                    {record.experienceLevel && (
                      <span style={tagStyle(COLORS.textMuted)}>
                        {record.experienceLevel}
                      </span>
                    )}

                    <span style={tagStyle(COLORS.textMuted)}>
                      推薦 {record.recommendedJobs?.length || 0} 個職缺
                    </span>
                  </div>

                  <p style={{ color: COLORS.textMuted, lineHeight: 1.8, margin: "14px 0" }}>
                    {makeUserFriendlySummary(record.userSummary || record.nlpSummary)}
                  </p>

                  <div style={{ marginTop: 10 }}>
                    <strong style={{ color: COLORS.primary }}>已具備能力：</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {(record.skills || []).slice(0, 10).map((skill) => (
                        <span key={skill} style={tagStyle(COLORS.success)}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <strong style={{ color: COLORS.primary }}>技能缺口：</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {(record.missingSkills || []).length > 0 ? (
                        record.missingSkills.slice(0, 10).map((skill) => (
                          <span key={skill} style={tagStyle(COLORS.warning)}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: COLORS.textMuted }}>目前無明顯技能缺口</span>
                      )}
                    </div>
                  </div>

                  {(record.recommendedJobs || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <strong style={{ color: COLORS.primary }}>推薦職缺方向：</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                        {(record.recommendedJobs || []).slice(0, 5).map((job, index) => (
                          <span key={`${job.title}-${index}`} style={tagStyle(COLORS.accent)}>
                            {job.title} {job.matchRate ? `${job.matchRate}%` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}

function ResumeCompareView({ resumeRecords }) {
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  useEffect(() => {
    if (resumeRecords.length >= 2) {
      setLeftId((prev) => prev || resumeRecords[1]?.id || "");
      setRightId((prev) => prev || resumeRecords[0]?.id || "");
    } else if (resumeRecords.length === 1) {
      setLeftId(resumeRecords[0]?.id || "");
      setRightId(resumeRecords[0]?.id || "");
    }
  }, [resumeRecords]);

  const leftRecord = resumeRecords.find((record) => record.id === leftId);
  const rightRecord = resumeRecords.find((record) => record.id === rightId);

  const getAverageMatch = (record) => {
    const rates = (record?.recommendedJobs || [])
      .map((job) => Number(job.matchRate || 0))
      .filter((num) => num > 0);

    if (rates.length === 0) return 0;

    return Math.round(rates.reduce((sum, value) => sum + value, 0) / rates.length);
  };

  const getDiff = (a = [], b = []) => {
    const leftSet = new Set((a || []).map((item) => String(item).trim()));
    const rightSet = new Set((b || []).map((item) => String(item).trim()));

    return {
      added: Array.from(rightSet).filter((item) => item && !leftSet.has(item)),
      removed: Array.from(leftSet).filter((item) => item && !rightSet.has(item)),
    };
  };

  const skillDiff = getDiff(leftRecord?.skills, rightRecord?.skills);
  const missingDiff = getDiff(leftRecord?.missingSkills, rightRecord?.missingSkills);

  const scoreChange =
    leftRecord && rightRecord
      ? Number(rightRecord.resumeScore || 0) - Number(leftRecord.resumeScore || 0)
      : 0;

  const avgMatchChange =
    leftRecord && rightRecord ? getAverageMatch(rightRecord) - getAverageMatch(leftRecord) : 0;

  const renderChange = (value, suffix = "") => {
    if (value > 0) return `+${value}${suffix}`;
    if (value < 0) return `${value}${suffix}`;
    return `0${suffix}`;
  };

  const optionLabel = (record, index) => {
    const date = record.createdAt ? new Date(record.createdAt).toLocaleString() : `版本 ${index + 1}`;
    return `${record.fileName || "未命名履歷"}｜${date}`;
  };

  return (
    <>
      <HeroSection
        title="履歷版本比較"
        description="選擇兩次履歷分析紀錄，比較履歷完整度、技能變化、推薦職缺數與技能缺口差異。"
        statItems={[
          { icon: <FileText size={18} />, value: resumeRecords.length, label: "可比較紀錄" },
          { icon: <BarChart2 size={18} />, value: renderChange(scoreChange), label: "完整度變化" },
          { icon: <Sparkles size={18} />, value: skillDiff.added.length, label: "新增技能" },
          { icon: <Briefcase size={18} />, value: renderChange(avgMatchChange, "%"), label: "適合度變化" },
        ]}
      />

      <PageBody>
        {resumeRecords.length < 2 ? (
          <div style={STYLES.card}>
            <h3 style={STYLES.title}>
              <AlertCircle size={20} /> 尚無足夠版本可比較
            </h3>
            <p style={{ color: COLORS.textMuted, lineHeight: 1.8, margin: 0 }}>
              請至少完成兩次履歷分析，才能比較不同版本之間的變化。
            </p>
          </div>
        ) : (
          <>
            <div style={{ ...STYLES.card, marginBottom: 22 }}>
              <h3 style={STYLES.title}>
                <FileText size={20} /> 選擇比較版本
              </h3>

              <div
                className="responsive-grid-2"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
              >
                <div>
                  <label style={{ fontWeight: 800, color: COLORS.primary }}>舊版本</label>
                  <select
                    value={leftId}
                    onChange={(e) => setLeftId(e.target.value)}
                    style={{ ...STYLES.input, marginTop: 8 }}
                  >
                    {resumeRecords.map((record, index) => (
                      <option key={record.id} value={record.id}>
                        {optionLabel(record, index)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 800, color: COLORS.primary }}>新版本</label>
                  <select
                    value={rightId}
                    onChange={(e) => setRightId(e.target.value)}
                    style={{ ...STYLES.input, marginTop: 8 }}
                  >
                    {resumeRecords.map((record, index) => (
                      <option key={record.id} value={record.id}>
                        {optionLabel(record, index)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {leftRecord && rightRecord && (
              <>
                <div
                  className="responsive-grid-4"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 16,
                    marginBottom: 22,
                  }}
                >
                  <CompareMetricCard
                    title="履歷完整度"
                    oldValue={`${leftRecord.resumeScore || 0}/100`}
                    newValue={`${rightRecord.resumeScore || 0}/100`}
                    change={renderChange(scoreChange)}
                    positive={scoreChange >= 0}
                  />
                  <CompareMetricCard
                    title="技能數量"
                    oldValue={(leftRecord.skills || []).length}
                    newValue={(rightRecord.skills || []).length}
                    change={renderChange((rightRecord.skills || []).length - (leftRecord.skills || []).length)}
                    positive={(rightRecord.skills || []).length >= (leftRecord.skills || []).length}
                  />
                  <CompareMetricCard
                    title="推薦職缺數"
                    oldValue={(leftRecord.recommendedJobs || []).length}
                    newValue={(rightRecord.recommendedJobs || []).length}
                    change={renderChange((rightRecord.recommendedJobs || []).length - (leftRecord.recommendedJobs || []).length)}
                    positive={(rightRecord.recommendedJobs || []).length >= (leftRecord.recommendedJobs || []).length}
                  />
                  <CompareMetricCard
                    title="平均適合度"
                    oldValue={`${getAverageMatch(leftRecord)}%`}
                    newValue={`${getAverageMatch(rightRecord)}%`}
                    change={renderChange(avgMatchChange, "%")}
                    positive={avgMatchChange >= 0}
                  />
                </div>

                <div
                  className="responsive-grid-2"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
                >
                  <div style={STYLES.card}>
                    <h3 style={STYLES.title}>
                      <Sparkles size={20} /> 新增能力
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {skillDiff.added.length > 0 ? (
                        skillDiff.added.map((skill) => (
                          <span key={skill} style={tagStyle(COLORS.success)}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: COLORS.textMuted }}>沒有新增能力。</span>
                      )}
                    </div>

                    <h3 style={{ ...STYLES.title, marginTop: 20 }}>
                      <AlertCircle size={20} /> 減少能力
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {skillDiff.removed.length > 0 ? (
                        skillDiff.removed.map((skill) => (
                          <span key={skill} style={tagStyle(COLORS.warning)}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: COLORS.textMuted }}>沒有減少能力。</span>
                      )}
                    </div>
                  </div>

                  <div style={STYLES.card}>
                    <h3 style={STYLES.title}>
                      <Target size={20} /> 技能缺口變化
                    </h3>

                    <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 8 }}>
                      新增需補強項目
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                      {missingDiff.added.length > 0 ? (
                        missingDiff.added.map((skill) => (
                          <span key={skill} style={tagStyle(COLORS.warning)}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: COLORS.textMuted }}>沒有新增缺口。</span>
                      )}
                    </div>

                    <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 8 }}>
                      已改善缺口
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {missingDiff.removed.length > 0 ? (
                        missingDiff.removed.map((skill) => (
                          <span key={skill} style={tagStyle(COLORS.success)}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: COLORS.textMuted }}>尚無明顯改善項目。</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ ...STYLES.card, marginTop: 22 }}>
                  <h3 style={STYLES.title}>
                    <FileText size={20} /> 摘要比較
                  </h3>

                  <div
                    className="responsive-grid-2"
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
                  >
                    <div
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 14,
                        padding: 16,
                        backgroundColor: "#FBFDFF",
                      }}
                    >
                      <strong style={{ color: COLORS.primary }}>舊版本摘要</strong>
                      <p style={{ color: COLORS.textMuted, lineHeight: 1.8, marginBottom: 0 }}>
                        {makeUserFriendlySummary(leftRecord.userSummary || leftRecord.nlpSummary)}
                      </p>
                    </div>

                    <div
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 14,
                        padding: 16,
                        backgroundColor: "#FBFDFF",
                      }}
                    >
                      <strong style={{ color: COLORS.primary }}>新版本摘要</strong>
                      <p style={{ color: COLORS.textMuted, lineHeight: 1.8, marginBottom: 0 }}>
                        {makeUserFriendlySummary(rightRecord.userSummary || rightRecord.nlpSummary)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </PageBody>
    </>
  );
}

function CompareMetricCard({ title, oldValue, newValue, change, positive }) {
  return (
    <div style={STYLES.card}>
      <div style={{ color: COLORS.textMuted, fontSize: "0.9rem", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ color: COLORS.textMuted, fontWeight: 800 }}>{oldValue}</span>
        <span style={{ color: COLORS.textMuted }}>→</span>
        <span style={{ color: COLORS.primary, fontWeight: 900, fontSize: "1.25rem" }}>
          {newValue}
        </span>
      </div>
      <div
        style={{
          marginTop: 10,
          color: positive ? COLORS.success : COLORS.warning,
          fontWeight: 900,
        }}
      >
        {change}
      </div>
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