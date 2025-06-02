import { google } from 'googleapis';
import { Readable } from 'stream';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export const uploadToDrive = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  accessToken: string
): Promise<string> => {
  oauth2Client.setCredentials({ access_token: accessToken });

  const fileMetadata = {
    name: fileName,
    mimeType,
  };

  const media = {
    mimeType,
    body: Readable.from(fileBuffer),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink',
  });

  return response.data.webViewLink || '';
};