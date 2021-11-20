import nvi from '../../public/bibles/nvi.json';
import { BibleChapter } from '../types/Bible';
import Utils from './Utils';

export default class BibleService
{
  private bible: Array<BibleChapter>;
  public booksAbbrevs: string[];
  public booksNames: string[];

  constructor(jsonBible: Array<BibleChapter>) {
    this.bible = jsonBible;
    this.booksAbbrevs = this.bible.map(c => Utils.normalize(c.abbrev));
    this.booksNames = this.bible.map(c => Utils.normalize(c.name));
  }

  getBook(bookAbbrev: string) {
    return this.bible.find(b => b.abbrev === bookAbbrev);
  }

  getVersicles(bookAbbrev: string, chapter: number, versicleBegin: number | null = null, versicleEnd: number | null = null) {
    if (chapter <= 0 || (versicleBegin && versicleBegin <= 0) || (versicleEnd && versicleEnd <= 0)) {
      return [];
    }
    if (versicleBegin && versicleEnd && versicleEnd < versicleBegin) {
      return [];
    }
    const book = this.getBook(bookAbbrev);
    if (!book) {
      return [];
    }
    const bookChaptersLength = book.chapters.length;
    if (chapter && chapter > bookChaptersLength) {
      return [];
    }
    const bookChapter = book.chapters[chapter - 1];
    if (!versicleBegin) {
      return bookChapter.map((bC, i) => `${i+1}.${bC}`);
      // return bookChapter;
    }
    if (!versicleEnd && versicleBegin) {
      let pivot = versicleBegin;
      return bookChapter.slice(versicleBegin -1, versicleBegin).map((bC) => {
        pivot += 1;
        return `${pivot-1}.${bC}`;
      });
      // return bookChapter.slice(versicleBegin -1, versicleBegin);
    }
    if (versicleBegin && versicleEnd) {
      const bookChapterLength = bookChapter.length;
      if (versicleBegin > bookChapterLength || versicleEnd > bookChapterLength) {
        return []
      }
      let pivot = versicleBegin;
      const bookBegin = bookChapter.slice(versicleBegin -1, versicleEnd);
      return bookBegin.map((bC) => {
        pivot += 1;
        return `${pivot - 1}.${bC}`
      });
      // return bookBegin;
    }
    return [];
  }

  handle(bibleVerse: string): string[] {
    const hasChapter = Boolean(
      this.booksAbbrevs.find(bookAbbrev => bibleVerse.includes(bookAbbrev))
    );
    const chapterFullName = this.booksNames.find(bName => {
      const regex = new RegExp(`^${bName}`, 'gm');
      return regex.test(bibleVerse)
    });
    if (chapterFullName) {
      const chapterAbbrIndex = this.booksNames.indexOf(chapterFullName);
      const abbr = this.booksAbbrevs[chapterAbbrIndex];
      bibleVerse = bibleVerse.replace(chapterFullName, abbr);
    }
    const [bookAbb, chapter] = bibleVerse.split(' ');
    if ((!hasChapter && !chapterFullName) || !chapter || !bookAbb) {
      return [];
    }
    const bibleVersiclesRegex = {
      entireChapter: /^\d{1}$/g,
      chapterSingleVersicle: /^\d+:\d*$/g,
      chapterMultipleVersicles: /^\d+:\d*-\d*$/g,
    };
    const chapterMatchRegex = (
      Object.keys(bibleVersiclesRegex) as Array<keyof typeof bibleVersiclesRegex>
    ).find(k => bibleVersiclesRegex[k].test(chapter));
    if (!chapterMatchRegex) {
      return [];
    }
    switch (chapterMatchRegex) {
      case 'entireChapter':
        return this.getVersicles(bookAbb, Number(chapter));
      case 'chapterMultipleVersicles': {
        const [curChapter, versicles] = chapter.split(':');
        const [versicleBegin, versicleEnd] = versicles.split('-');
        return this.getVersicles(bookAbb, Number(curChapter), Number(versicleBegin), Number(versicleEnd));
      }
      case 'chapterSingleVersicle': {
        const [chap, versciel] = chapter.split(':');
        return this.getVersicles(bookAbb, Number(chap), Number(versciel));
      }
      default: {
        return [];
      }
    }
  }
}