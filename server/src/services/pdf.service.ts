import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fetch from 'node-fetch';
import { VoterIDFormData } from '../../src/types';

export const generateVoterIDPDF = async (formData: VoterIDFormData): Promise<Uint8Array> => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Add a new page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Set initial position
  let y = height - 50;
  const margin = 50;
  const lineHeight = 25;

  // Add header
  page.drawText('Voter ID Application Form', {
    x: margin,
    y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  // Add form data
  const addField = (label: string, value: string) => {
    page.drawText(label + ':', {
      x: margin,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(value, {
      x: margin + 150,
      y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  };

  // Personal Information
  page.drawText('Personal Information', {
    x: margin,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  addField('Full Name', formData.fullName);
  addField('Date of Birth', formData.dateOfBirth);
  addField('Gender', formData.gender);

  y -= lineHeight;

  // Address Information
  page.drawText('Address Information', {
    x: margin,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  addField('Street', formData.address.street);
  addField('City', formData.address.city);
  addField('State', formData.address.state);
  addField('Pincode', formData.address.pincode);

  y -= lineHeight;

  // Verification Information
  page.drawText('Verification Information', {
    x: margin,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  addField('Aadhaar Number', '********' + formData.aadhaarNumber.slice(-4));

  // Add photo if available
  if (formData.photo) {
    const photoBytes = await fetch(URL.createObjectURL(formData.photo)).then(res => res.arrayBuffer());
    const photoImage = await pdfDoc.embedJpg(photoBytes);
    const photoDims = photoImage.scale(0.5);
    
    page.drawImage(photoImage, {
      x: width - margin - photoDims.width,
      y: height - margin - photoDims.height,
      width: photoDims.width,
      height: photoDims.height,
    });
  }

  // Add footer
  page.drawText('Generated on: ' + new Date().toLocaleDateString(), {
    x: margin,
    y: margin,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Serialize the PDF to bytes
  return await pdfDoc.save();
};