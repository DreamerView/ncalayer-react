import React, { useState } from "react";
import NcaLayer from "ncalayer-js-client";

export default function SignCms() {
  const [status, setStatus] = useState("Ожидание...");
  const [signedData, setSignedData] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSignPdf = async () => { 
    if (!selectedFile) {
      alert("Выберите PDF-файл");
      return;
    }

    setStatus("📄 Чтение PDF-файла...");

    const base64 = await toBase64(selectedFile); // важно: байтовое чтение

    const client = new NcaLayer.NCALayerClient();

    try {
      setStatus("🔐 Подключение к NCALayer...");
      await client.connect();

      const documentInBase64 = "MTEK"


      setStatus("📂 Подписание...");

      const result = await client.basicsSignCMS(
        NcaLayer.NCALayerClient.basicsStoragesAll,
        base64,
        NcaLayer.NCALayerClient.basicsCMSParamsDetached,
        NcaLayer.NCALayerClient.basicsSignerSignAny,
      );

      setSignedData(result);
      setStatus("✅ PDF подписан успешно");
    } catch (err) {
      console.error(err);
      setStatus("❌ Ошибка: " + (err.message || err));
    } finally {
      if (client.socket?.readyState === WebSocket.OPEN) {
        client.socket.close();
      }
    }
  };

  const toBase64 = async (file) => {
    const buffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    let binary = "";
    for (let byte of uint8) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  };

  const downloadP7s = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: "application/pkcs7-signature" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = selectedFile?.name.replace(/\.pdf$/i, "") + ".p7s";
    link.click();
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 600 }}>
      <h2>Подпись PDF через NCALayer</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleSignPdf} style={{ marginLeft: "1rem" }}>
        Подписать PDF
      </button>
      <p>{status}</p>

      {signedData && (
        <div>
          <h4>📎 CMS-подпись:</h4>
          <textarea
            value={signedData}
            readOnly
            style={{ width: "100%", height: "200px", fontFamily: "monospace" }}
          />
          <button onClick={() => downloadP7s(signedData)} style={{ marginTop: "1rem" }}>
            ⬇️ Скачать .p7s файл
          </button>
        </div>
      )}
    </div>
  );
}
