// نسخه ساده‌شده و تضمینی برای Deno Deploy

// UUID ثابت
const UUID = "d342d11e-d424-4583-b36e-524ab1f0afa4";

// هندلر درخواست‌ها
function handler(req: Request): Response {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "localhost";
  
  // صفحه اصلی
  if (url.pathname === "/") {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>V2Ray Config</title>
  <style>
    body { font-family: Arial; background: #1a1a1a; color: white; padding: 20px; }
    .config { background: #333; padding: 15px; border-radius: 5px; direction: ltr; word-break: break-all; }
    .btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>🚀 V2Ray Proxy</h1>
  <p>✅ Status: Active</p>
  <p>🔑 UUID: ${UUID}</p>
  <div class="config" id="config">
    vless://${UUID}@${host}:443?encryption=none&security=tls&sni=${host}&type=ws&host=${host}&path=%2Fvless#Deno-Proxy
  </div>
  <button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('config').innerText)">Copy Config</button>
  <p style="margin-top:20px;">📱 Subscription: https://${host}/vless.txt</p>
</body>
</html>
    `;
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
  
  // فایل کانفیگ
  if (url.pathname === "/vless.txt" || url.pathname === "/config") {
    const config = `vless://${UUID}@${host}:443?encryption=none&security=tls&sni=${host}&type=ws&host=${host}&path=%2Fvless%3Fed%3D2048#Deno-${host.split('.')[0]}`;
    return new Response(config, {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
  
  // وضعیت JSON
  if (url.pathname === "/status") {
    return new Response(JSON.stringify({
      status: "online",
      uuid: UUID,
      host: host,
      timestamp: new Date().toISOString()
    }), {
      headers: { "content-type": "application/json" }
    });
  }
  
  // 404
  return new Response("404 - Not Found", { status: 404 });
}

// گوش دادن به درخواست‌ها - پورت رو خود Deno انتخاب میکنه
Deno.serve(handler);
