import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer'; 
import { envs } from 'src/config/envs';
import { EmailOptions } from 'src/core/interfaces/mail-option.interface';

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        service: envs.MAILER_SERVICE,
        auth: {
            user: envs.MAILER_EMAIL,
            pass: envs.MAILER_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    async sendEmail(options: EmailOptions): Promise<Boolean> {

        try {
            await this.transporter.sendMail({
                from: envs.MAILER_EMAIL,
                to: options.to,
                subject: options.subject,
                html: options.html
            });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
