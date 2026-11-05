export interface MesSupportContact {
  phone: string;
  wechat: string;
  wechatQrValue: string;
  email: string;
  encodeQr(value: string): Uint8Array | Promise<Uint8Array>;
}

let contact: MesSupportContact = {
  phone: '',
  wechat: '',
  wechatQrValue: '',
  email: '',
  encodeQr: async () => { throw new Error('The host app must configure its QR encoder.'); },
};

export function configureMesSupportContact(value: MesSupportContact): void {
  contact = { ...value };
}

export const SUPPORT_CONTACT: Readonly<MesSupportContact> = new Proxy({} as MesSupportContact, {
  get(_target, property) {
    return Reflect.get(contact, property);
  },
});
