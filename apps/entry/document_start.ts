import { BannedWordRepository } from "../storage/banned_words";
import { RegExpRepository } from "../storage/regexp_repository";
import {
  AutoBlockIDN,
  BlockGoogleImagesTab,
  BlockGoogleNewsTab,
  BlockGoogleSearchMovie,
  DefaultBlockType,
  DeveloperMode,
  MenuPosition,
  Options,
  ShowBlockedByWordInfo,
} from "../storage/options";
import { Logger } from "../libs/logger";
import { BlockReason } from "../model/block_reason";
import BlockedSitesRepository from "../storage/blocked_sites";
import { GoogleSearchResult } from "../block/google_search_result";
import { GoogleSearchInnerCard } from "../block/google_search_inner_card";
import { GoogleSearchTopNews } from "../block/google_search_top_news";
import { GoogleNewsCard } from "../block/google_news_card";
import { GoogleNewsSectionWithHeader } from "../block/google_news_section_with_header";
import { GoogleNewsResult } from "../block/google_news_result";
import { GoogleImageTab } from "../block/google_image_tab";
import { GoogleSearchMovie } from "../block/google_search_movie";
import DocumentURL from "../values/document_url";
import { SearchResultToBlock } from "../block/block";
import { blockElement } from "../content_script/block_element";

declare global {
  interface Window {
    blockReasons: BlockReason[];
  }
}

window.blockReasons = [];

const pendingsList: SearchResultToBlock[] = [];

async function loadOption(): Promise<Options> {
  await DeveloperMode.load();

  const blockedSites = await BlockedSitesRepository.load();
  const bannedWords = await BannedWordRepository.load();
  const regexpList = await RegExpRepository.load();
  const autoBlockIDN = await AutoBlockIDN.load();
  const defaultBlockType = await DefaultBlockType.load();
  const menuPosition = await MenuPosition.load();
  const bannedWordOption = await ShowBlockedByWordInfo.load();
  const blockGoogleNewsTab = await BlockGoogleNewsTab.load();
  const blockGoogleImagesTab = await BlockGoogleImagesTab.load();
  const blockGoogleSearchMovie = await BlockGoogleSearchMovie.load();
  Logger.debug("autoBlockIDNOption:", autoBlockIDN);

  return {
    blockedSites,
    bannedWords,
    regexpList,
    autoBlockIDN,
    defaultBlockType,
    menuPosition,
    bannedWordOption,
    blockGoogleNewsTab,
    blockGoogleImagesTab,
    blockGoogleSearchMovie,
  };
}

const gsbOptions: Options = await loadOption();

// add observer
const observer = new MutationObserver((mutations) => {
  const documentURL = new DocumentURL(document.location.href);

  mutations.forEach((mutation) => {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) {
        processAddedNode(node, documentURL);
      }
    }
  });
});

const config = { childList: true, subtree: true };
observer.observe(document.documentElement, config);

(async (): Promise<void> => {
  for (const g of pendingsList) {
    blockElement(g, gsbOptions);
  }
})();

function processAddedNode(node: Element, documentURL: DocumentURL) {
  const blockTarget = processAddedNodeInternal(node, documentURL);
  if (blockTarget) {
    const { ended, reason } = blockElement(blockTarget, gsbOptions);

    if (reason) {
      window.blockReasons.push(reason);
    }

    if (!ended) {
      pendingsList.push(blockTarget);
    }
  }
}

function processAddedNodeInternal(node: Element, documentURL: DocumentURL) {
  if (
    gsbOptions.blockGoogleNewsTab &&
    GoogleNewsSectionWithHeader.isCandidate(node, documentURL)
  ) {
    return new GoogleNewsSectionWithHeader(node);
  }

  if (
    gsbOptions.blockGoogleNewsTab &&
    GoogleNewsResult.isCandidate(node, documentURL)
  ) {
    return new GoogleNewsResult(node);
  }

  if (GoogleSearchResult.isCandidate(node, documentURL)) {
    return new GoogleSearchResult(node);
  }

  if (GoogleSearchInnerCard.isCandidate(node, documentURL)) {
    return new GoogleSearchInnerCard(node);
  }

  if (GoogleSearchTopNews.isCandidate(node, documentURL)) {
    return new GoogleSearchTopNews(node);
  }

  if (
    gsbOptions.blockGoogleImagesTab &&
    GoogleImageTab.isCandidate(node, documentURL)
  ) {
    return new GoogleImageTab(node);
  }

  if (
    gsbOptions.blockGoogleNewsTab &&
    GoogleNewsCard.isCandidate(node, documentURL)
  ) {
    return new GoogleNewsCard(node);
  }

  if (
    gsbOptions.blockGoogleSearchMovie &&
    GoogleSearchMovie.isCandidate(node, documentURL)
  ) {
    return new GoogleSearchMovie(node);
  }
}
