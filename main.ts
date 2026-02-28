import { serve } from "https://deno.land/std/http/server.ts";

// UUID پیش‌فرض (می‌تونی عوض کنی)
const UUID = "d342d11e-d424-4583-b36e-524ab1f0afa4";

// پروکسی پشتیبان (اختیاری)
const BACKUP_PROXY = "your-proxy.com"; // می‌تونی خالی بذاری

// تابع اصلی
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "deno-v2ray.deno.dev";
  
  // بررسی WebSocket (برای VLESS واقعی)
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() === "websocket") {
    try {
      const { socket, response } = Deno.upgradeWebSocket(req);
      
      socket.onopen = () => {
        console.log("✅ WebSocket connected");
        socket.send(JSON.stringify({ status: "connected", uuid: UUID }));
      };
      
      socket.onmessage = (event) => {
        console.log("📦 Received data:", event.data);
        // اینجا می‌تونی داده رو پردازش کنی
        // برای پروکسی واقعی باید پروتکل VLESS رو پیاده‌سازی کنی
        socket.send("Echo: " + event.data);
      };
      
      socket.onclose = () => console.log("❌ WebSocket closed");
      socket.onerror = (err) => console.error("⚠️ WebSocket error:", err);
      
      return response;
    } catch (error) {
      console.error("WebSocket upgrade failed:", error);
      return new Response("WebSocket upgrade failed", { status: 500 });
    }
  }
  
  // صفحه اصلی - نمایش کانفیگ
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>V2Ray on Deno Deploy</title>
  <style>
    body {
      font-family: 'Tahoma', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      color: white;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    h1 {
      text-align: center;
      font-size: 2.5em;
      margin-bottom: 30px;
    }
    .status {
      background: #4CAF50;
      padding: 10px;
      border-radius: 10px;
      text-align: center;
      margin: 20px 0;
    }
    .config-box {
      background: #1a1a1a;
      color: #00ff00;
      padding: 20px;
      border-radius: 10px;
      direction: ltr;
      word-break: break-all;
      margin: 20px 0;
      border: 2px solid #4CAF50;
    }
    .btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
      margin: 10px;
    }
    .info {
      background: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 10px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 V2Ray on Deno Deploy</h1>
    
    <div class="status">✅ سرور فعال است</div>
    
    <div class="info">
      <p><strong>🔑 UUID:</strong> ${UUID}</p>
      <p><strong>🌐 آدرس:</strong> ${host}</p>
      <p><strong>📡 پروتکل:</strong> VLESS + WebSocket</p>
    </div>
    
    <h3>📦 کانفیگ VLESS:</h3>
    <div class="config-box" id="config">
vless://${UUID}@${host}:443?encryption=none&security=tls&sni=${host}&fp=randomized&type=ws&host=${host}&path=%2Fvless%3Fed%3D2048#Deno-${host.split('.')[0]}
    </div>
    
    <button class="btn" onclick="copyConfig()">📋 کپی کانفیگ</button>
    <button class="btn" onclick="window.location.href='/vless.txt'">📄 دانلود فایل</button>
    
    <div style="margin-top: 30px; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
      <h4>📱 روش استفاده در V2RayNG:</h4>
      <ol style="margin-right: 20px;">
        <li>برنامه رو باز کن</li>
        <li>+ را بزن</li>
        <li>Import Config from URL</li>
        <li>وارد کن: https://${host}/vless.txt</li>
      </ol>
    </div>
  </div>
  
  <script>
    function copyConfig() {
      const config = document.getElementById('config').innerText;
      navigator.clipboard.writeText(config);
      alert('✅ کپی شد!');
    }
  </script>
</body>
</html>
    `;
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
  
  // فایل کانفیگ برای دانلود
  if (url.pathname === "/vless.txt" || url.pathname === "/config") {
    const config = `vless://${UUID}@${host}:443?encryption=none&security=tls&sni=${host}&fp=randomized&type=ws&host=${host}&path=%2Fvless%3Fed%3D2048#Deno-${host.split('.')[0]}`;
    return new Response(config, {
      headers: { 
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache"
      }
    });
  }
  
  // مسیر WebSocket برای VLESS
  if (url.pathname === "/vless") {
    // اینجا باید WebSocket رو هندل کنی
    return new Response("WebSocket endpoint", { status: 400 });
  }
  
  // وضعیت JSON
  if (url.pathname === "/status") {
    return new Response(JSON.stringify({
      status: "online",
      uuid: UUID,
      host: host,
      protocol: "vless+ws",
      timestamp: new Date().toISOString()
    }), {
      headers: { "content-type": "application/json" }
    });
  }
  
  // 404
  return new Response("Not Found", { status: 404 });
}

// اجرای سرور
serve(handler, { port: 8080 });
console.log("🚀 V2Ray Proxy running on http://localhost:8080");
