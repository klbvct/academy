import nodemailer from 'nodemailer'

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // false для TLS (587), true для SSL (465)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) {
    return transporter
  }

  // Если SMTP параметры установлены - используем реальный сервер
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
    console.log('📧 Using real SMTP server:', process.env.SMTP_HOST)
    transporter = nodemailer.createTransport(SMTP_CONFIG)
    return transporter
  }

  // Если параметры не установлены - используем mock для разработки
  console.log('⚠️  SMTP not configured, using mock email sender')
  const mockTransporter = {
    sendMail: async (options: any) => {
      console.log('📧 [MOCK] Email logged to console:')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      return { messageId: 'dev-message-id' }
    },
  }

  transporter = mockTransporter as any
  return transporter
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<boolean> {
  try {
    const transporter = getTransporter()

    if (!transporter) {
      console.error('Email transporter not configured')
      return false
    }

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://academy.education-design.com.ua'
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@education-design.com.ua',
      to: email,
      subject: 'Відновлення пароля - Дизайн Освіти',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Привіт, ${userName}! 👋</h2>
          
          <p>Ми отримали запит на відновлення вашого пароля для облікового запису Дизайн Освіти.</p>
          
          <p>Натисніть кнопку нижче для встановлення нового пароля:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="
              display: inline-block;
              padding: 12px 30px;
              background-color: #3B82F6;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            ">
              Встановити новий пароль
            </a>
          </div>
          
          <p>Або скопіюйте це посилання в браузер:</p>
          <p style="word-break: break-all; color: #666;">
            ${resetLink}
          </p>
          
          <p style="color: #999; font-size: 12px;">
            Це посилання буде дійсне протягом 1 години.
          </p>
          
          <p style="color: #999; font-size: 12px;">
            Якщо ви не запитували відновлення пароля, просто проігноруйте це письмо.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Дизайн Освіти &copy; 2026 | Всі права захищені
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return false
  }
}

export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<boolean> {
  try {
    const transporter = getTransporter()

    if (!transporter) {
      console.error('Email transporter not configured')
      return false
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@education-design.com.ua',
      to: email,
      subject: 'Ласкаво просимо в Дизайн Освіти! 🎓',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Ласкаво просимо, ${userName}! 🎉</h2>
          
          <p>Спасибо за реєстрацію на Дизайн Освіти - вашу персональну платформу для профорієнтації.</p>
          
          <p>Тепер ви можете:</p>
          <ul>
            <li>✅ Проходити професійні тести</li>
            <li>✅ Отримувати персональні рекомендації</li>
            <li>✅ Відслідковувати своє развитие</li>
            <li>✅ Отримувати доступ до доповідей про результати</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="
              display: inline-block;
              padding: 12px 30px;
              background-color: #3B82F6;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            ">
              Перейти до кабінету
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px;">
            Дизайн Освіти &copy; 2026 | Всі права захищені
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Welcome email sent:', result.messageId)
    return true
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return false
  }
}
