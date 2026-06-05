import { Upload } from "lucide-react";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          width: "500px",
          textAlign: "center",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1>雲端智慧履歷分析系統</h1>

        <p>上傳你的履歷 PDF 或圖片</p>

        <input type="file" />

        <br />
        <br />

        <button
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <Upload size={18} />
          開始分析
        </button>
      </div>
    </div>
  );
}

export default App;