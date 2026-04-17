import type { Request, Response } from "express";
import nodemailer from "nodemailer";

export async function sendContactMail(req: Request, res: Response) {
  const { name, email, subject, message } = req.body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  const n = name?.trim();
  const e = email?.trim();
  const s = subject?.trim() || "Web Sitesi Ä°letiÅŸim Formu";
  const m = message?.trim();

  if (!n || !e || !m) {
    return res.status(400).json({ message: "name, email and message are required" });
  }

  const to = process.env.CONTACT_TO_EMAIL;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!to || !host || !port || !user || !pass) {
    return res.status(500).json({ message: "mail server not configured" });
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `"${n}" <${user}>`,
      to,
      replyTo: e,
      subject: `[PersonalBlog] ${s}`,
      text: `Name: ${n}\nEmail: ${e}\n\n${m}\n`,
    });
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : JSON.stringify(err);
    return res
      .status(500)
      .json({ message: process.env.NODE_ENV === "production" ? "mail send failed" : msg });
  }

  return res.status(200).json({ ok: true });
}
