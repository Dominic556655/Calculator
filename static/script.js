

const BASE_URL = "/api/";

// VAT
function calculateVAT() {
  let amountInput = document.getElementById("amount").value;
  let vatInput = document.getElementById("vat").value;
  const currency = document.getElementById("currency").value;

  // 🔥 Remove commas
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
      vat: vat,
      currency: currency,
    }),
  })
      .then(res => res.json())
    .then(data => {
      // if (!data.success) return alert("Error calculating VAT");
      if (!data) {
  return alert("Error calculating result");
}

      document.getElementById("result").innerText =
        `VAT: ${data.currency}${data.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
        `Total: ${data.currency}${data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

      // 👉 SAVE HISTORY
      const history = getHistory();
      history.push({
        type: "VAT",
        result: data
      });
      saveHistory(history);

      loadHistory();
    });
}

//     .then((res) => res.json())
//     .then((data) => 
//       {
//       if (data.success) {
//         document.getElementById("result").innerText =
//           `VAT: ${data.currency}${data.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
//           `Total: ${data.currency}${data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
//       } else {
//         alert("Error calculating VAT");
//       }
//     });
// }


// Mortgage
function calculateMortgage() {
  let principalInput = document.getElementById("principal").value;
  let rateInput = document.getElementById("rate").value;
  let yearsInput = document.getElementById("years").value;

  const currency = document.getElementById("currency").value;

  // 🔥 Remove commas
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

  //  here is where the mortgage changes started
  .then(res => res.json())
    .then(data => {
      if (!data) return alert("Error calculating mortgage");

      document.getElementById("result").innerText =
        `Monthly: ${data.currency}${data.monthly_payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
        `Interest: ${data.currency}${data.total_interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
        `Total: ${data.currency}${data.total_payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

      // 👉 SAVE HISTORY
      const history = getHistory();
      history.push({
        type: "Mortgage",
        result: data
      });
      saveHistory(history);

      loadHistory();
    });
    // Ended here
}


//   .then(res => res.json())
//   .then(data => {
//     if (!data.success) return alert("Error: " + JSON.stringify(data.error));

//     document.getElementById("result").innerHTML =
//       `Monthly: ${data.currency}${data.monthly_payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
//       `Interest: ${data.currency}${data.total_interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
//       `Total: ${data.currency}${data.total_payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      

//     loadHistory();
//   })
//   .catch(err => console.error("Fetch error:", err));
// }

// FBA
function calculateFBA() {
  // get raw input (STRING first)
  let product_costInput = document.getElementById("cost").value;
  let selling_priceInput = document.getElementById("price").value;
  let amazon_feeInput = document.getElementById("fee").value;
  let shipping_costInput = document.getElementById("shipping").value || "0";

  const currency = document.getElementById("currency").value;

  // 🔥 remove commas
  product_costInput = product_costInput.replace(/,/g, "");
  selling_priceInput = selling_priceInput.replace(/,/g, "");
  amazon_feeInput = amazon_feeInput.replace(/,/g, "");
  shipping_costInput = shipping_costInput.replace(/,/g, "");

  // convert to numbers
  let product_cost = parseFloat(product_costInput);
  let selling_price = parseFloat(selling_priceInput);
  let amazon_fee = parseFloat(amazon_feeInput);
  let shipping_cost = parseFloat(shipping_costInput);

  // validation
  if (isNaN(product_cost) || isNaN(selling_price) || isNaN(amazon_fee))
    return alert("Enter valid numbers");

  fetch(BASE_URL + "fba/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_cost,
      selling_price,
      amazon_fee,
      shipping_cost,
      currency,
    }),
  })
  .then(res => res.json())
    .then(data => {
      if (!data) return alert("Error calculating FBA");

      document.getElementById("result").innerText =
        `Profit: ${data.currency}${data.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
        `ROI: ${data.roi.toLocaleString(undefined, { minimumFractionDigits: 2 })}%`;

      // 👉 SAVE HISTORY
      const history = getHistory();
      history.push({
        type: "FBA",
        result: data
      });
      saveHistory(history);

      loadHistory();
    });
}
//     .then((res) => res.json())
//     .then((data) => {
//       if (!data.success) return alert("Error: " + JSON.stringify(data.error));

//       document.getElementById("result").innerHTML =
//         `Profit: ${data.currency}${data.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` +
//         `ROI: ${data.roi.toLocaleString(undefined, { minimumFractionDigits: 2 })}%`;

//       loadHistory();
//     })
//     .catch((err) => console.error("Fetch error:", err));
// }

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

     // ✅ CLEAN FORMAT (NO JSON.stringify)
       if (item.type === "FBA") {
      li.innerText =
        `FBA: Fee ${item.result.currency}${Number(item.result.amazon_fee_amount).toLocaleString()}, ` +
        `Cost ${item.result.currency}${Number(item.result.total_cost).toLocaleString()}, ` +
        `Profit ${item.result.currency}${Number(item.result.profit).toLocaleString()}, ` +
        `ROI ${item.result.roi}%`;
    } 
    else if (item.type === "VAT") {
      li.innerText =
        `VAT: Amount ${item.result.currency}${Number(item.result.vat_amount).toLocaleString()}, ` +
        `Total ${item.result.currency}${Number(item.result.total).toLocaleString()}`;
    } 
    // ✅ ADD THIS (MORTGAGE FIX)
    else if (item.type === "Mortgage") {
      li.innerText =
        `Mortgage: Monthly ${item.result.currency}${Number(item.result.monthly_payment).toLocaleString()}, ` +
        `Total ${item.result.currency}${Number(item.result.total_payment).toLocaleString()}, ` +
        `Interest ${item.result.total_interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}%`;
    }
    else {
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
// function loadHistory() {
//   fetch("/api/history/")
//     .then(res => res.json())
//     .then(data => {
//       const list = document.getElementById("history");
//       list.innerHTML = "";

//       if (!data.history || data.history.length === 0) {
//         list.innerHTML = "<li>No history yet</li>";
//         return;
        
//       }

//       data.history.forEach(item => {
//         const li = document.createElement("li");
//         li.innerText = `${item.type.toLocaleString(undefined, { minimumFractionDigits: 2 })} → ${JSON.stringify(item.result)}`;
//         list.appendChild(li);
//       });
//     })
//     .catch(err => {
//       console.error(err);
//     });
// }

/* =========================
   AUTO LOAD ON PAGE OPEN
========================= */

document.addEventListener("DOMContentLoaded", loadHistory);

// Clear history for this session
function clearHistory() {
  sessionStorage.removeItem("calc_history");
  loadHistory();
  alert("History cleared");
}
// async function clearHistory() {
//   try {
//     const res = await fetch(BASE_URL + "history/clear/", {
//       method: "DELETE",
//       headers: {
//         'X-CSRFToken': getCookie('csrftoken'),  // include CSRF token【31†L149-L153】
//       }
//     });
//     const data = await res.json();
//     loadHistory(); // refresh list
//     alert(data.message);
//     } catch (err) {
//     console.error(err);
//     alert("Failed to clear history");
//   }
    
// }

// Helper to get CSRF token cookie
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
  let value = input.value.replace(/,/g, ""); // remove existing commas

  if (value === "" || isNaN(value)) return;

  input.value = Number(value).toLocaleString();
}

$(document).ready(function () {
  $('#currency').select2({
    placeholder: "Search currency...",
    
  });
});


// this is for footer, for making years

const year = document.getElementById("year")
const thisYear = new Date().getFullYear()
year.setAttribute("datetime", thisYear)
year.textContent = thisYear

