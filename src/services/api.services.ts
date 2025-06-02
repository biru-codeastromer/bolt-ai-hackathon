import api from './api';

// Chat API
export const chatAPI = {
  getMessages: async () => {
    const response = await api.get('/chat/messages');
    return response.data;
  },
  
  sendMessage: async (content: string) => {
    const response = await api.post('/chat/send', { content });
    return response.data;
  },
  
  clearHistory: async () => {
    const response = await api.delete('/chat/clear');
    return response.data;
  },
};

// Forms API
export const formsAPI = {
  getForms: async () => {
    const response = await api.get('/forms');
    return response.data;
  },
  
  getForm: async (formId: string) => {
    const response = await api.get(`/forms/${formId}`);
    return response.data;
  },
  
  createForm: async (formData: any) => {
    const response = await api.post('/forms', formData);
    return response.data;
  },
  
  submitForm: async (formId: string, data: Record<string, any>) => {
    const response = await api.post('/forms/submit', { formId, data });
    return response.data;
  },
  
  getSubmissions: async (formId: string) => {
    const response = await api.get(`/forms/${formId}/submissions`);
    return response.data;
  },
};

// eKYC API
export const ekycAPI = {
  sendOTP: async (aadhaarNumber: string) => {
    const response = await api.post('/ekyc/send-otp', { aadhaarNumber });
    return response.data;
  },

  verifyOTP: async (aadhaarNumber: string, otp: string, hash: string) => {
    const response = await api.post('/ekyc/verify-otp', { aadhaarNumber, otp, hash });
    return response.data;
  },
};

// DigiLocker API
export const digiLockerAPI = {
  authorize: async () => {
    const response = await api.get('/digilocker/authorize');
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/digilocker/documents');
    return response.data;
  },

  getDocument: async (docType: string) => {
    const response = await api.get(`/digilocker/documents/${docType}`);
    return response.data;
  },
};