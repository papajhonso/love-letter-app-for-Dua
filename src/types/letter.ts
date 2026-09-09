export type HandwritingFont =
  | 'caveat'
  | 'dancing-script'
  | 'sacramento'
  | 'homemade-apple'
  | 'shadows-into-light'
  | 'patrick-hand';

export type PaperStyle =
  | 'cream'
  | 'blush'
  | 'celestial'
  | 'parchment'
  | 'midnight';

export type SealColor =
  | 'crimson'
  | 'rose-gold'
  | 'royal-navy'
  | 'emerald'
  | 'antique-gold';

export type StickerType =
  | 'wax-seal'
  | 'dried-rose'
  | 'cupid-heart'
  | 'vintage-stamp'
  | 'sparkle'
  | 'kiss-mark';

export type SendMethod = 'link' | 'email' | 'both';

export interface Letter {
  id: string;
  slug: string;
  recipientName: string;
  senderName: string;
  body: string;
  fontChoice: HandwritingFont;
  paperStyle: PaperStyle;
  photoUrl?: string;
  photoCaption?: string;
  stickers: StickerType[];
  sealColor: SealColor;
  sendMethod: SendMethod;
  recipientEmail?: string;
  createdAt: string;
  openedAt?: string;
}

export interface CreateLetterPayload {
  recipientName: string;
  senderName: string;
  body: string;
  fontChoice: HandwritingFont;
  paperStyle: PaperStyle;
  photoUrl?: string;
  photoCaption?: string;
  stickers?: StickerType[];
  sealColor?: SealColor;
  sendMethod: SendMethod;
  recipientEmail?: string;
}

export interface SendEmailPayload {
  slug: string;
  recipientEmail: string;
  senderName?: string;
  recipientName?: string;
}
