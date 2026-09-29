import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly _mailService: MailerService) {}

  async sendVerificationOtp(email: string, otp: string): Promise<void> {
    try {
      await this._mailService.sendMail({
        to: email,
        subject: 'Activation OTP',
        template: './otp',
        context: { confirmEmailOTP: otp },
      });
    } catch (error: any) {
      this.logger.error(`Failed to send otp to ${email} : ${error.message}`);
    }
  }
}
