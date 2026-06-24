import { prisma } from "./prisma";

interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  invoiceId: string;
  step: number;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const isDemoMode = !process.env.RESEND_API_KEY;

  if (isDemoMode) {
    console.log("\n📧 [MODE DÉMO] Email simulé :");
    console.log(`  À : ${opts.to}`);
    console.log(`  Objet : ${opts.subject}`);
    console.log(`  ---\n${opts.body}\n`);

    await prisma.reminder.create({
      data: {
        invoiceId: opts.invoiceId,
        step: opts.step,
        subject: opts.subject,
        body: opts.body,
        simulated: true,
      },
    });
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "relances@votredomaine.com",
    to: opts.to,
    subject: opts.subject,
    text: opts.body,
  });

  await prisma.reminder.create({
    data: {
      invoiceId: opts.invoiceId,
      step: opts.step,
      subject: opts.subject,
      body: opts.body,
      simulated: false,
    },
  });
}
