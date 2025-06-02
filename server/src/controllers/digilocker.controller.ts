import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import QRCode from 'qrcode';

// Mock DigiLocker API integration
const mockDocuments = [
  {
    id: '1',
    type: 'aadhaar',
    name: 'Aadhaar Card',
    issuer: 'UIDAI',
    issuedOn: '2024-01-01',
    url: 'https://example.com/aadhaar.pdf'
  },
  {
    id: '2',
    type: 'pan',
    name: 'PAN Card',
    issuer: 'Income Tax Department',
    issuedOn: '2024-01-01',
    url: 'https://example.com/pan.pdf'
  }
];

export const authorize = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Generate QR code for DigiLocker authorization
    const authUrl = `digilocker://authorize?client_id=${process.env.DIGILOCKER_CLIENT_ID}`;
    const qrCode = await QRCode.toDataURL(authUrl);

    res.status(200).json({
      status: 'success',
      data: {
        qrCode,
        authUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // In production, fetch from DigiLocker API
    res.status(200).json({
      status: 'success',
      data: {
        documents: mockDocuments
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const document = mockDocuments.find(doc => doc.type === type);

    if (!document) {
      const error = new Error('Document not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        document
      }
    });
  } catch (error) {
    next(error);
  }
};