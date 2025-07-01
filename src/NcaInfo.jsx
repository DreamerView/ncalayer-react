import React, { useState } from "react";
import { NCALayerClient } from "ncalayer-js-client";// именно так — CommonJS обёртка

export default function NcaInfo() {
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState("Ожидание подключения...");

  const handleGetInfo = async () => {
    const client = new NCALayerClient();

    try {
      setStatus("🔄 Подключение к NCALayer...");
      await client.connect();

      setStatus("📂 Ожидание выбора ключа...");
      const keyInfo = await client.getKeyInfo("PKCS12", "NONE");

      console.log(keyInfo);

      setInfo(keyInfo);
      setStatus("✅ Данные успешно получены");
    } catch (err) {
      setStatus("❌ Ошибка: " + (err.message || err));
      console.error(err);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 600 }}>
      <h1>Информация об ЭЦП</h1>
      <button onClick={handleGetInfo}>Получить данные ЭЦП</button>
      <p>{status}</p>

      {info && (
        <div style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
          <p><strong>👤 ФИО:</strong> {info.subjectCn || "не указано"}</p>
          <p><strong>🆔 Подробнее:</strong> {info.subjectDn || "не указано"}</p>
        </div>
      )}
    </div>
  );
}
