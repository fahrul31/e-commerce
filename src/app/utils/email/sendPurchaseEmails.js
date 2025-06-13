// lib/sendEmails.js
import transporter from "@/lib/nodemailer";

export async function sendPurchaseEmails(order, items) {

    // Membuat daftar item dalam bentuk string HTML
    let itemDetails = '';
    items.forEach(item => {
        itemDetails += `
            <li><strong>Nama Produk:</strong> ${item.product_name}</li>
            <li><strong>Jumlah:</strong> ${item.quantity}</li>
            <li><strong>Harga:</strong> Rp ${item.price.toLocaleString('id-ID')}</li>
            <br />
        `;
    });


    // Email ke pembeli
    const buyerMailOptions = {
        from: process.env.EMAIL,
        to: order.email,
        subject: "Pembayaran Berhasil - Terima Kasih atas Pembelian Anda",
        html: `
            <p>Terima kasih telah melakukan pembelian di toko kami!</p>
            <p>Pembayaran Anda untuk transaksi dengan <strong>Order ID: ${order.order_id}</strong> telah berhasil diproses.</p>
            <p>Berikut adalah rincian pesanan Anda:</p>
            <ul>
                ${itemDetails}
            </ul>
            <p><strong>Total Pembayaran:</strong> Rp ${Number(order.total_price).toLocaleString('id-ID')}</p>
            <p>Pesanan Anda akan segera diproses dan dikirimkan kepada Anda. Terima kasih atas kepercayaan Anda!</p>
            <p>Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.</p>
        `,
    };

    // Email ke admin
    const adminMailOptions = {
        from: process.env.EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `Pesanan Baru - Order ID: ${order.order_id}`,
        html: `
            <p>Pesanan baru telah dibuat oleh <strong>${order.customer_name}</strong> (${order.email})</p>
            <p><strong>Order ID:</strong> ${order.order_id}</p>
            <p><strong>Alamat Pengiriman:</strong> ${order.shipping_address}</p>
            <p><strong>Kontak:</strong> ${order.phone}</p>
            <p>Detail Pesanan:</p>
            <ul>
                ${itemDetails}
            </ul>
            <p><strong>Total:</strong> Rp ${Number(order.total_price).toLocaleString('id-ID')}</p>
        `,
    };

    // Kirim email
    await transporter.sendMail(buyerMailOptions);
    await transporter.sendMail(adminMailOptions);
}
