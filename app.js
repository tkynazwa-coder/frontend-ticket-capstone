// Ganti URL ini dengan URL API Gateway Anda setelah di-deploy
const API_URL = "https://6m1aw9xowb.execute-api.us-east-1.amazonaws.com/prod/orders";

document.getElementById('ticketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const statusMessage = document.getElementById('statusMessage');

    statusMessage.style.color = "blue";
    statusMessage.innerText = "Memproses pesanan...";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nama: nama, email: email })
        });

        const result = await response.json();
        
        if (response.ok) {
            statusMessage.style.color = "green";
            statusMessage.innerText = `Sukses! ID Pesanan: ${result.orderId}. Tiket sedang diproses.`;
        } else {
            throw new Error("Gagal memesan tiket.");
        }
    } catch (error) {
        statusMessage.style.color = "red";
        statusMessage.innerText = "Terjadi kesalahan pada server.";
    }
});