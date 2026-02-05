const nodemailer = require("nodemailer");
const { getDb } = require("../mongoDb");

async function sendContactEmails({ name, email, subject, message }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: String(process.env.SMTP_SECURE || 'true') === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    const adminMail = {
        from: `Portfolio Contact <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Contact Form: ${subject}`,
        text: `You received a new contact form submission.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
    };

    const clientMail = {
        from: `Balaji Portfolio <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Thanks for reaching out, ${name}!`,
        text: `Hi ${name},\n\nYour message has been received successfully.\n\nSubject: ${subject}\nMessage: ${message}\n\nI will get back to you soon.\n\nThanks,\nBalaji`
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(clientMail);
}

exports.saveContactUsData = async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection('contactUsData');
        
        const data = {
            ...req.body,
            createdAt: new Date().toISOString()
        };

        const result = await collection.insertOne(data);
        await sendContactEmails(data);

        res.json({
            success: true,
            message: 'Contact form submitted successfully',
            id: result.insertedId
        });

    } catch(error) {
        res.status(500).json({ message: 'error saving the contact us data', error });
    }
}
