import { Logger } from "../libs/logger";
import { ChromeStorage } from "./chrome_storage";
import { BannedTarget, BlockType, KeywordType } from "./enums";

interface BannedWordItems {
  bannedWords: BannedWord[];
}

export interface BannedWord {
  keyword: string;
  blockType: BlockType;
  target: BannedTarget;
  keywordType: KeywordType;
}

export const BannedWordRepository = {
  async load(): Promise<BannedWord[]> {
    const items = (await ChromeStorage.get({
      bannedWords: [],
    })) as BannedWordItems;

    const itemsCopy = items.bannedWords;
    for (const item of itemsCopy) {
      if (!item.blockType) {
        item.blockType = BlockType.SOFT;
      }

      if (!item.target) {
        item.target = BannedTarget.TITLE_AND_CONTENTS;
      }

      if (!item.keywordType) {
        item.keywordType = KeywordType.STRING;
      }
    }

    Logger.debug("bannedWords: ", itemsCopy);

    return itemsCopy;
  },

  async save(words: BannedWord[]): Promise<void> {
    await ChromeStorage.set({ bannedWords: words });
  },

  async clear(): Promise<void> {
    await ChromeStorage.set({ bannedWords: [] });
  },

  async addAll(bannedWordList: BannedWord[]): Promise<void> {
    const words: BannedWord[] = await this.load();

    for (const bannedWord of bannedWordList) {
      let found = false;
      for (const word of words) {
        if (bannedWord.keyword === word.keyword) {
          // do nothing.
          found = true;
        }
      }

      if (!found) {
        words.push(bannedWord);
      }
    }

    await this.save(words);
  },

  async add(addWord: string): Promise<boolean> {
    const words: BannedWord[] = await this.load();

    for (const word of words) {
      if (addWord === word.keyword) {
        // do nothing.
        return false;
      }
    }

    words.push({
      keyword: addWord,
      blockType: BlockType.SOFT,
      target: BannedTarget.TITLE_AND_CONTENTS,
      keywordType: KeywordType.STRING,
    });
    await this.save(words);
    return true;
  },

  async changeType(changeWord: string, type: BlockType): Promise<void> {
    const words: BannedWord[] = await this.load();

    const filteredWords = words.map((word) => {
      if (word.keyword !== changeWord) {
        return word;
      }

      // eslint-disable-next-line no-param-reassign
      word.blockType = type;
      return word;
    });

    await this.save(filteredWords);
  },

  async changeTarget(changeWord: string, target: BannedTarget): Promise<void> {
    const words: BannedWord[] = await this.load();

    const filteredWords = words.map((word) => {
      if (word.keyword !== changeWord) {
        return word;
      }

      // eslint-disable-next-line no-param-reassign
      word.target = target;
      return word;
    });

    await this.save(filteredWords);
  },

  async changeKeywordType(
    changeWord: string,
    keywordType: KeywordType,
  ): Promise<void> {
    const words: BannedWord[] = await this.load();

    const filteredWords = words.map((word) => {
      if (word.keyword !== changeWord) {
        return word;
      }

      // eslint-disable-next-line no-param-reassign
      word.keywordType = keywordType;
      return word;
    });

    await this.save(filteredWords);
  },

  async delete(deleteWord: string): Promise<boolean> {
    const words: BannedWord[] = await this.load();

    const contains =
      words.find((word) => word.keyword !== deleteWord) !== undefined;
    const filteredWords = words.filter((word) => word.keyword !== deleteWord);

    await this.save(filteredWords);

    return contains;
  },
};
