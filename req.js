const payload = { email: "walidemo@bqa.local", password: "password123", name: "Wali Demo" };
fetch("https://hris.baitulquranalikhwan.cloud/api/auth/sign-in/email", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": "https://portal.baitulquranalikhwan.cloud" },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log("Result:", data))
.catch(err => console.error("Error:", err));
