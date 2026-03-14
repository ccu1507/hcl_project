import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saurabh98048@gmail.com',
    pass: 'hvrh chos jxpf yexd',
  },
});

export const sendOrderReceiptEmail = async (userEmail, userName, orderDetails) => {
  try {
    const { orderId, items, totalAmount } = orderDetails;

    // Create a plain text summary of the items
    let itemsListText = '';
    let itemsListHTML = '<ul>';
    
    items.forEach(item => {
      itemsListText += `- ${item.quantity}x ${item.title} (₹${item.priceAtPurchase.toFixed(2)} each)\n`;
      itemsListHTML += `<li>${item.quantity}x <strong>${item.title}</strong> (₹${item.priceAtPurchase.toFixed(2)} each)</li>`;
    });
    itemsListHTML += '</ul>';

    const mailOptions = {
      from: '"McDonalds Clone" <saurabh98048@gmail.com>',
      to: userEmail,
      subject: `Order Confirmation - #${orderId}`,
      text: `Hello ${userName},\n\nThank you for your order!\n\nOrder ID: ${orderId}\n\nItems:\n${itemsListText}\nTotal Paid: ₹${totalAmount.toFixed(2)}\n\nYour food is currently being prepared.\n\nBest,\nMcDonalds Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #da291c;">Thank you for your order, ${userName}!</h2>
          <p>We've received your order and it's being prepared.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3 style="color: #27251f;">Order Summary (#${orderId})</h3>
          ${itemsListHTML}
          <div style="font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; color: #27251f;">
            Total Paid: ₹${totalAmount.toFixed(2)}
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
            This is an automated confirmation email from the HCL Hackathon McDonalds Clone project.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email receipt:', error);
    return false;
  }
};
