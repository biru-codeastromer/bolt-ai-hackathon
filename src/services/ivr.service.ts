import { Device } from '@twilio/voice-sdk';

class IVRService {
  private device: Device | null = null;
  private token: string | null = null;

  async initialize(token: string) {
    this.token = token;
    this.device = new Device(token, {
      codecPreferences: ['opus', 'pcmu'],
      fakeLocalDTMF: true,
      enableRingingState: true,
    });

    await this.device.register();
  }

  async makeCall(phoneNumber: string, formId?: string) {
    if (!this.device) throw new Error('Device not initialized');

    const params = {
      phoneNumber,
      formId,
    };

    const call = await this.device.connect({ params });
    
    call.on('disconnect', () => {
      console.log('Call ended');
    });

    return call;
  }

  async handleIncoming(callback: (call: any) => void) {
    if (!this.device) throw new Error('Device not initialized');

    this.device.on('incoming', callback);
  }

  disconnect() {
    if (this.device) {
      this.device.destroy();
      this.device = null;
      this.token = null;
    }
  }
}

export const ivrService = new IVRService();