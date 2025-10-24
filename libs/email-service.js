import { ServerClient } from 'postmark';

const postmarkClient = new ServerClient(process.env.NEXT_PUBLIC_POSTMARK_SERVER_TOKEN);

export class EmailService {
  static async sendEmail({ to, subject, html, text }) {
    try {
      console.log('📧 Attempting to send email to:', to);
      
      const result = await postmarkClient.sendEmail({
        From: process.env.NEXT_PUBLIC_POSTMARK_FROM_EMAIL,
        To: to,
        Subject: subject,
        HtmlBody: html,
        TextBody: text,
        MessageStream: 'outbound'
      });

      console.log('✅ Email sent successfully:', result.MessageID);
      return { success: true, messageId: result.MessageID };
      
    } catch (error) {
      console.error('❌ Email error:', error);
      return { success: false, error: error.message };
    }
  }
}