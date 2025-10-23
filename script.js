/* ---------- Data & initial values ---------- */
const prices = { Nairobi_Agrovet: 100, Kisii_Agrovet: 95, Homabay_Agrovet: 100 }; // KSh per litre (sample)
const weeklyVolumes = { Nairobi_Agrovet: 30, Kisii_Agrovet: 100, Homabay_Agrovet: 1000 };

/* ---------- Tab navigation ---------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.querySelectorAll("[data-panel]").forEach(p => p.style.display = (p.id === tab ? '' : 'none'));
  });
});

/* ---------- Home 'Get Started' Button ---------- */
const getStartedBtn = document.getElementById("get-started");
if (getStartedBtn) {
  getStartedBtn.addEventListener("click", () => {
    document.querySelectorAll("[data-panel]").forEach(p => p.style.display = 'none');
    document.getElementById("farmers").style.display = ''; // open Farmers first
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelector(".tab-btn[data-tab='farmers']").classList.add("active");
  });
}

/* ---------- Farmer Estimate & Publish ---------- */
const estimateBtn = document.getElementById("estimate-btn");
const publishBtn = document.getElementById("publish-btn");
estimateBtn.addEventListener("click", () => {
  const name = document.getElementById("farmer-name").value || "Farmer";
  const litres = Number(document.getElementById("litres").value) || 0;
  const city = document.getElementById("city-select").value;
  const price = prices[city] || 0;
  const revenue = litres * price;
  const estIncomeMonthly = revenue * 4; // simple projection
  document.getElementById("farmer-result").style.display = "block";
  document.getElementById("est-output").textContent = `${name} — Offer: ${litres} L → ${city} — Est. KSh ${revenue.toLocaleString()}`;
  document.getElementById("est-details").textContent = `Projected monthly (4 weeks): KSh ${estIncomeMonthly.toLocaleString()} (payment: ${document.getElementById("payment").value})`;
});

publishBtn.addEventListener("click", () => {
  // simple publish simulation
  const litres = Number(document.getElementById("litres").value) || 0;
  const city = document.getElementById("city-select").value;
  alert(`Published: ${litres} L to ${city}. Buyers will be notified. (Simulated)`);
});

/* ---------- Prices & SMS log ---------- */
const smsLog = document.getElementById("sms-log");
document.getElementById("send-sms").addEventListener("click", () => {
  const msg = `Price Alert: Nairobi_Agrovet ${prices.Nairobi} KSh/L • Kisii_Agrovet ${prices.Kisii_Agrovet} KSh/L • Homabay_Agrovet ${prices.Homabay_Agrovet} KSh/L`;
  const entry = document.createElement("div");
  entry.textContent = `${new Date().toLocaleTimeString()} — ${msg}`;
  smsLog.prepend(entry);
});

document.getElementById("simulate-fluct").addEventListener("click", () => {
  // random small fluctuation
  prices.Nairobi_Agrovet += Math.round((Math.random()-0.5)*6);
  prices.Kisii_Agrovet += Math.round((Math.random()-0.5)*6);
  prices.Homabay_Agrovet += Math.round((Math.random()-0.5)*6);
  document.getElementById("price-Nairobi_Agrovet").textContent = `KSh ${prices.Nairobi_Agrovet}`;
  document.getElementById("price-Kisii_Agrovet").textContent = `KSh ${prices.Kisii_Agrovet}`;
  document.getElementById("price-Homabay_Agrovet").textContent = `KSh ${prices.Homabay_Agrovet}`;
  // push SMS automatically
  const entry = document.createElement("div");
  entry.textContent = `${new Date().toLocaleTimeString()} — Price update: Nairobi_Agrovet ${prices.Nairobi_Agrovet}, Kisii_Agrovet ${prices.Kisii_Agrovet}, Homabay_Agrovet ${prices.Homabay_Agrovet}`;
  smsLog.prepend(entry);
});

/* ---------- Chatbot (simple rule-based) ---------- */
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

function botReply(text){
  const node = document.createElement("div");
  node.className = "bubble bot";
  node.textContent = text;
  chatWindow.appendChild(node);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function userBubble(text){
  const node = document.createElement("div");
  node.className = "bubble user";
  node.textContent = text;
  chatWindow.appendChild(node);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatSend.addEventListener("click", () => {
  const q = chatInput.value.trim();
  if(!q) return;
  userBubble(q);
  chatInput.value = "";
  // simple "AI"
  setTimeout(()=> {
    const ql = q.toLowerCase();
    if(ql.includes("cold")|| ql.includes("cool") || ql.includes("fridge")) botReply("Cool milk quickly after milking: use clean insulated containers and try cooling to <10°C. Seek local collection point for cold chain.");
    else if(ql.includes("price")) botReply(`Current sample prices: Nairobi_Agrovet ${prices.Nairobi_Agrovet} KSh/L, Kisii_Agrovet ${prices.Kisii_Agrovet} KSh/L, Homabay_Agrovet ${prices.Homabay_Agrovet} KSh/L.`);
    else if(ql.includes("how") && ql.includes("sell")) botReply("Use USSD *123# to publish litres. Choose verified buyer and confirm collection point. Keep receipt and track delivery.");
    else if(ql.includes("sick")||ql.includes("disease")) botReply("If camel appears sick, separate milk and contact extension officer. For urgent vet support, call local service number.");
    else if(ql.includes("kiswahili")) botReply("Habari! Unaweza kuniandikia kwa Kiswahili pia — nisaidie kujua tatizo lako.");
    else botReply("Thanks — to get started ask about 'prices', 'how to cool milk', or 'how to sell'.");
  }, 600);
});

/* sample suggestions */
document.getElementById("sample1").addEventListener("click", ()=>{ chatInput.value = "How to cool milk quickly?"; chatSend.click();});
document.getElementById("sample2").addEventListener("click", ()=>{ chatInput.value = "Send price alerts"; chatSend.click();});

/* ---------- Analytics & Charts ---------- */
function calculateAnalytics(){
  const totals = {
    volume: weeklyVolumes.Nairobi_Agrovet + weeklyVolumes.Kisii_Agrovet + weeklyVolumes.Homabay_Agrovet,
    revenue: weeklyVolumes.Nairobi_Agrovet*prices.Nairobi_Agrovet + weeklyVolumes.Kisii_Agrovet*prices.Kisii_Agrovet + weeklyVolumes.Homabay_Agrovet*prices.Homabay_Agrovet
  };
  document.getElementById("total-volume").textContent = `${totals.volume.toLocaleString()} L`;
  document.getElementById("total-revenue").textContent = `KSh ${totals.revenue.toLocaleString()}`;
  // estimate farmer income: assume 60% of revenue goes to farmers (after buyers/transport)
  const monthlyFarmerIncome = Math.round((totals.revenue*0.6) * 4);
  document.getElementById("farmer-income").textContent = `KSh ${monthlyFarmerIncome.toLocaleString()}`;
  return { totals, monthlyFarmerIncome };
}

const ctx = document.getElementById('volChart').getContext('2d');
const volChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Nairobi_Agrovet','Kisii_Agrovet','Homabay_Agrovet'],
    datasets: [{
      label: 'Weekly Volume (L)',
      data: [weeklyVolumes.Nairobi_Agrovet, weeklyVolumes.Kisii_Agrovet, weeklyVolumes.Homabay_Agrovet],
      backgroundColor: ['#ff7aa2','#f6e45a','#165724'],
      borderRadius:8
    }]
  },
  options: {
    responsive:true,
    plugins:{legend:{display:false}},
    scales:{
      y:{beginAtZero:true}
    }
  }
});

calculateAnalytics();

/* Recalculate with custom prices */
document.getElementById("recalc").addEventListener("click", ()=> {
  const pN = Number(prompt("Enter Nairobi_Agrovet price (KSh/L):", prices.Nairobi_Agrovet)) || prices.Nairobi_Agrovet;
  const pM = Number(prompt("Enter Kisii_Agrovet price (KSh/L):", prices.Kisii_Agrovet)) || prices.Kisii_Agrovet;
  const pK = Number(prompt("Enter Homabay_Agrovet price (KSh/L):", prices.Homabay_Agrovet)) || prices.Homabay_Agrovet;
  prices.Nairobi_Agrovet = pN; prices.Kisii_Agrovet = pM; prices.Homabay_Agrovet = pK;
  document.getElementById("price-Nairobi_Agrovet").textContent = `KSh ${pN}`;
  document.getElementById("price-Kisii_Agrovet").textContent = `KSh ${pM}`;
  document.getElementById("price-Homabay_Agrovet").textContent = `KSh ${pK}`;
  calculateAnalytics();
});

/* ---------- USSD Simulator ---------- */
const ussdModal = document.getElementById("ussd-modal");
const ussdScreen = document.getElementById("ussd-screen");
document.getElementById("open-usss").addEventListener("click", ()=> {
  ussdModal.style.display = "flex";
  ussdScreen.innerHTML = `<div style="font-weight:700;color:var(--dark-green)">*123# — AGRIMARKSoft</div>
  <ol style="padding-left:16px;margin-top:8px">
    <li>Prices</li>
    <li>Publish Offer</li>
    <li>My Offers</li>
  </ol>
  <div style="font-size:13px;color:#11401f">Send: Reply '1' to view prices, '2' to publish sample offer</div>`;
});
document.getElementById("ussd-close").addEventListener("click", ()=> ussdModal.style.display = "none");

/* ---------- Export report example (simulated) ---------- */
document.getElementById("download-sample").addEventListener("click", ()=> {
  alert("Exported summary report (simulated). For real export, back-end integration is required.");
});

/* ---------- Export / sample interactions ---------- */
document.getElementById("download-sample").addEventListener("dblclick", ()=> {
  alert("Double-clicked export - advanced options could be implemented in real app.");
});

/* ---------- small helpers */
document.getElementById("chat-input").addEventListener("keydown", (e)=>{ if(e.key==='Enter'){ chatSend.click(); } });

/* Optional: fake initial SMS */
smsLog.innerHTML = `<div style="opacity:0.9">${new Date().toLocaleTimeString()} — Welcome: WhiteGOLD prices are updated weekly.</div>`;
smsLog.innerHTML = `<div style="opacity:0.9">${new Date().toLocaleTimeString()} — Welcome: WhiteGOLD prices are updated weekly.</div>`;