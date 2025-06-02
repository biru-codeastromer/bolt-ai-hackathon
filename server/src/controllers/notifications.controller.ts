import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { BitlyClient } from 'bitly';
import { AppError } from '../middleware/error.middleware';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const bitly = new BitlyClient(process.env.BITLY_ACCESS_TOKEN || '');

export const sendWhatsApp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to, documentUrl } = req.body;

    // Send WhatsApp message with document
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
      body: 'Here is your requested document:',
      mediaUrl: [documentUrl]
    });

    res.status(200).json({
      status: 'success',
      message: 'WhatsApp message sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const sendSMS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to, documentUrl } = req.body;

    // Shorten URL for SMS
    const shortUrl = await bitly.shorten(documentUrl);

    // Send SMS with shortened link
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body: `Your document is ready. Download here: ${shortUrl.link}`
    });

    res.status(200).json({
      status: 'success',
      message: 'SMS sent successfully'
    });
  } catch (error) {
    next(error);
  }
};