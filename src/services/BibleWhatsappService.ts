// @ts-ignore
import qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';
import nvi from '../../public/bibles/nvi.json';
import BibleService from "./BibleService";
import Utils from './Utils';

interface WppClientMessage {
  body: string
  from: string
  reply: (str: string) => void
}

export default class BibleWhatsappService
{
  private bibleService: BibleService;

  constructor(bibleService: BibleService) {
    this.bibleService = bibleService;
  }

  static init() {
    const bibleService = new BibleService(nvi);
    const wppClient = new Client({});
    wppClient.on('qr', (qr: any) => {
      qrcode.generate(qr, { small: true })
    });
    
    wppClient.on('ready', () => {
        console.log('Client is ready!');
    });
    
    wppClient.on('message', (msg: WppClientMessage) => {
        const { body, from } = msg;
        if (body === 'livros') {
          return bibleService.booksNames;
        }
        const bibleHandle = bibleService.handle(Utils.normalize(body));
        if (bibleHandle.length > 0) {
          bibleHandle.forEach((r) => {
            wppClient.sendMessage(from, r)
          });
        }
    });

    wppClient.initialize();
  }
}