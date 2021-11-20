import nvi from '../../public/bibles/nvi.json';
import BibleService from '../services/BibleService';
import { BibleChapter } from '../types/Bible';

export function TestSuit() {
  const bibleService = new BibleService(nvi as BibleChapter[]);
  const shouldPass = ['jd 1', 'jd 1:9', 'jd 1:9-10'];
  const shouldNotPass = ['jd 2', 'jd 1:26', 'jd 1:25:26'];

  const errors = [];
  let success = 0;
  let fails = 0;
  try {
    shouldPass.forEach((v) => {
      const result = bibleService.handle(v);
      if (result.length > 0) {
        success += 1;
      } else {
        fails += 1;
      }
    });
    shouldNotPass.forEach((v) => {
      const result = bibleService.handle(v);
      if (result.length === 0) {
        success += 1;
      } else {
        fails += 1;
      }
    })
  } catch (error) {
    errors.push(error);
  }
  return success;
}