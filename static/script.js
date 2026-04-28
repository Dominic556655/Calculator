const BASE_URL = "/api/";
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const calculatorInputs = document.querySelectorAll(
  "#amount, #vat, #cost, #price, #shipping, #fee, #referral_fee, #fba_fee, #extra_fee, #principal, #rate, #years"
);

let activeInput = null;

calculatorInputs.forEach((input) => {
  input.addEventListener("focus", () => {
    activeInput = input;
  });

  if (isMobile) {
    input.setAttribute("readonly", true);
  } else {
    input.removeAttribute("readonly");

    input.addEventListener("keydown", (e) => {
      if (
        !/[\d.]/.test(e.key) &&
        e.key !== "Backspace" &&
        e.key !== "Delete" &&
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight" &&
        e.key !== "Tab"
      ) {
        e.preventDefault();
      }

      if (e.key === "." && input.value.includes(".")) {
        e.preventDefault();
      }
    });

    input.addEventListener("input", () => {
      let raw = input.value.replace(/,/g, "");

      if (raw === "") return;

      if (raw.includes(".")) {
        const parts = raw.split(".");
        parts[0] = parts[0] ? Number(parts[0]).toLocaleString("en-US") : "0";
        input.value = parts.join(".");
        input.value = parts.join(".");
      } else {
        input.value = Number(raw).toLocaleString("en-US");
      }
       window.clearInput = function () {
    if (!activeInput) return;
    activeInput.value = "";
  };
    });
  }
});


// VAT
function calculateVAT() {
  let amountInput = document.getElementById("amount").value;
  let vatInput = document.getElementById("vat").value;
  const currency = document.getElementById("currency").value;
  const mode = document.getElementById("mode").value;

  amountInput = amountInput.replace(/,/g, "");

  const amount = parseFloat(amountInput);
  const vat = parseFloat(vatInput);

  if (isNaN(amount) || isNaN(vat)) {
    return alert("Enter valid numbers");
  }

  fetch(BASE_URL + "vat/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken")
    },
    body: JSON.stringify({
      amount: amount,
      vat_rate: vat,
      currency: currency,
      mode: mode
    }),
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      return alert(data.error || "Server error");
    }

    document.getElementById("result").innerText =
      `Net Amount: ${data.currency}${Number(data.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `VAT: ${data.currency}${Number(data.vat_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `Total: ${data.currency}${Number(data.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const history = getHistory();
    history.push({
      type: "VAT",
      result: data
    });

    saveHistory(history);
    loadHistory();
  });
}


// Mortgage
function calculateMortgage() {
  let principalInput = document.getElementById("principal").value;
  let rateInput = document.getElementById("rate").value;
  let yearsInput = document.getElementById("years").value;

  const currency = document.getElementById("currency").value;

  principalInput = principalInput.replace(/,/g, "");

  let principal = parseFloat(principalInput);
  let annual_rate = parseFloat(rateInput);
  let years = parseInt(yearsInput);

  if (isNaN(principal) || isNaN(annual_rate) || isNaN(years))
    return alert("Enter valid numbers");

  fetch(BASE_URL + "mortgage/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ principal, annual_rate, years, currency })
  })
  .then(res => res.json())
  .then(data => {
    if (!data) return alert("Error calculating mortgage");

    document.getElementById("result").innerText =
      `Monthly: ${data.currency}${data.monthly_payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `Interest: ${data.currency}${data.total_interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `Total: ${data.currency}${data.total_payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const history = getHistory();
    history.push({
      type: "Mortgage",
      result: data
    });

    saveHistory(history);
    loadHistory();
  });
}


// FBA
function calculateFBA() {
  let product_cost = Number(document.getElementById("cost").value.replace(/,/g, "") || 0);
  let selling_price = Number(document.getElementById("price").value.replace(/,/g, "") || 0);
  let shipping_cost = Number(document.getElementById("shipping").value.replace(/,/g, "") || 0);
  let amazon_fee = Number(document.getElementById("fee").value.replace(/,/g, "") || 0);

  const currency = document.getElementById("currency").value;
  const mode = document.getElementById("mode").value;

  if (!product_cost || !selling_price) {
    return alert("Enter product cost and selling price");
  }

  fetch(BASE_URL + "fba/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_cost,
      selling_price,
      shipping_cost,
      currency,
      amazon_fee,
      referral_fee_percent: Number(document.getElementById("referral_fee").value || 0),
      fba_fee: Number(document.getElementById("fba_fee").value || 0),
      extra_fee: Number(document.getElementById("extra_fee").value || 0),
      use_advanced: String(document.getElementById("mode").value).trim() === "advanced"
    }),
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      console.log(data);
      alert(data.error || "Error calculating FBA");
      return;
    }

    document.getElementById("result").innerText =
      `Total Cost: ${data.currency}${data.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `Profit: ${data.currency}${data.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
      `ROI: ${data.roi.toFixed(2)}%\n` +
      `Amazon Fees: ${data.currency}${data.amazon_fee_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const history = getHistory();
    history.push({
      type: "FBA",
      result: data
    });

    saveHistory(history);
    loadHistory();
  });
}


// History
function loadHistory() {
  const list = document.getElementById("history");
  list.innerHTML = "";

  const history = getHistory();

  if (history.length === 0) {
    list.innerHTML = "<li>No history yet</li>";
    return;
  }

  history.forEach(item => {
    const li = document.createElement("li");

    if (item.type === "FBA") {
      li.innerText =
        `FBA: Fee ${item.result.currency}${Number(item.result.amazon_fee_amount).toLocaleString()}, ` +
        `Cost ${item.result.currency}${Number(item.result.total_cost).toLocaleString()}, ` +
        `Profit ${item.result.currency}${Number(item.result.profit).toLocaleString()}, ` +
        `ROI ${item.result.roi}%`;
    } else if (item.type === "VAT") {
      li.innerText =
        `VAT: Amount ${item.result.currency}${Number(item.result.vat_amount).toLocaleString()}, ` +
        `Total ${item.result.currency}${Number(item.result.total).toLocaleString()}`;
    } else if (item.type === "Mortgage") {
      li.innerText =
        `Mortgage: Monthly ${item.result.currency}${Number(item.result.monthly_payment).toLocaleString()}, ` +
        `Total ${item.result.currency}${Number(item.result.total_payment).toLocaleString()}, ` +
        `Interest ${item.result.total_interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}%`;
    } else {
      li.innerText = `${item.type}`;
    }

    list.prepend(li);
  });
}

function getHistory() {
  return JSON.parse(sessionStorage.getItem("calc_history")) || [];
}

function saveHistory(history) {
  sessionStorage.setItem("calc_history", JSON.stringify(history));
}

document.addEventListener("DOMContentLoaded", loadHistory);

function clearHistory() {
  sessionStorage.removeItem("calc_history");
  loadHistory();
  alert("History cleared");
}


// Helpers
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    document.cookie.split(';').forEach((c) => {
      let cookie = c.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
      }
    });
  }
  return cookieValue;
}

function formatInputWithCommas(input) {
  let raw = input.value.replace(/,/g, "");
  if (!raw) return;

  if (raw.includes(".")) {
    const parts = raw.split(".");
    parts[0] = Number(parts[0]).toLocaleString("en-US");
    input.value = parts.join(".");
  } else {
    input.value = Number(raw).toLocaleString("en-US");
  }
}

function appendValue(value) {
  if (!activeInput) return;

  let raw = activeInput.value.replace(/,/g, "");

  if (value === "." && raw.includes(".")) return;

  raw += value;

  if (raw.includes(".")) {
    const parts = raw.split(".");
    parts[0] = Number(parts[0]).toLocaleString("en-US");
    activeInput.value = parts.join(".");
  } else {
    activeInput.value = Number(raw).toLocaleString("en-US");
  }
}

let activeField = "amount";

function setActive(field) {
  activeField = field;
}




// Footer year
const year = document.getElementById("year");
const thisYear = new Date().getFullYear();
year.setAttribute("datetime", thisYear);
year.textContent = thisYear;



