let options = null;
// add observer
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        for (const node of mutation.addedNodes) {
            if (node instanceof Element) {
                if (node.classList.contains("g")) {
                    if (options !== null) {
                        blockGoogleElement(node, options);
                    }
                    else {
                        pendingsGoogle.push(node);
                    }
                }
                else if (node.nodeName.toLowerCase() === "g-inner-card") {
                    if (options !== null) {
                        blockGoogleInnerCard(node, options);
                    }
                    else {
                        pendingsInnerCard.push(node);
                    }
                }
            }
        }
    });
});
const pendingsGoogle = [];
const pendingsInnerCard = [];
const config = { childList: true, subtree: true };
observer.observe(document.documentElement, config);
(async () => {
    const blockedSites = await BlockedSitesRepository.load();
    const bannedWords = await BannedWordRepository.load();
    const idnOption = await OptionRepository.getAutoBlockIDNOption();
    const defaultBlockType = await OptionRepository.defaultBlockType();
    Logger.debug("autoBlockIDNOption:", idnOption);
    options = { blockedSites, bannedWords, idnOption, defaultBlockType };
    for (const node of pendingsGoogle) {
        blockGoogleElement(node, options);
    }
    for (const node of pendingsInnerCard) {
        blockGoogleInnerCard(node, options);
    }
})();
//# sourceMappingURL=start.js.map