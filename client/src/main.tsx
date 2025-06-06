// Direct DOM manipulation - bypass React entirely
console.log("Direct DOM test starting...");

const root = document.getElementById("root");
if (root) {
  root.innerHTML = `
    <div style="
      padding: 50px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      font-size: 28px; 
      text-align: center; 
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <h1 style="margin: 0 0 20px 0; font-size: 48px; font-weight: bold;">
        🎯 Direct DOM Render
      </h1>
      <p style="margin: 0; opacity: 0.9;">
        Bypassing React - pure JavaScript working
      </p>
      <button onclick="location.reload()" style="
        margin-top: 30px;
        padding: 15px 30px;
        background: rgba(255,255,255,0.2);
        border: 2px solid white;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
      ">
        Reload Page
      </button>
    </div>
  `;
  console.log("DOM content set successfully");
} else {
  console.error("Root element not found");
  document.body.innerHTML = '<div style="padding: 50px; background: red; color: white; font-size: 24px;">ROOT ELEMENT NOT FOUND</div>';
}
