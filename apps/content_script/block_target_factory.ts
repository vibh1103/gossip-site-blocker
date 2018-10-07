interface IBlockable {
    getUrl(): string;

    contains(keyword: string): boolean;
}

const BlockTargetFactory = {
    async init() {
        let count = 0;

        const blockedSites: BlockedSites = await BlockedSitesRepository.load();
        const bannedWords: IBannedWord[] = await BannedWordRepository.load();
        const idnOption = await OptionRepository.getAutoBlockIDNOption();
        Logger.debug("autoBlockIDNOption:", idnOption);

        document.querySelectorAll(".g").forEach((g1: Element) => {
            const g = new GoogleElement(g1);

            if (!g.canBlock()) {
                return;
            }

            const blockState: BlockState = new BlockState(g, blockedSites, bannedWords, idnOption);

            if (blockState.state === "hard") {
                g.deleteElement();
                return;
            }

            const id = `block${++count}`;
            const blockTarget = new BlockTarget(g.getElement(), g.getUrl(), id, blockState.state);
            const blockAnchor = new BlockAnchor(id, blockState.state, blockTarget, g.getUrl(), blockState.reason);

            // insert anchor after target.
            DOMUtils.insertAfter(blockTarget.getDOMElement(), blockAnchor.getDOMElement());
        });

        document.querySelectorAll("g-inner-card").forEach((g1) => {
            const g = new GoogleInnerCard(g1);

            if (!g.canBlock()) {
                return;
            }

            const blockState: BlockState = new BlockState(g, blockedSites, bannedWords, idnOption);

            if (blockState.state === "hard") {
                g.deleteElement();
                return;
            }

            const id = `block${++count}`;
            const blockTarget = new BlockTarget(g.getElement(), g.getUrl(), id, blockState.state);
            const blockAnchor = new BlockAnchor(id, blockState.state, blockTarget, g.getUrl(), blockState.reason);
            blockAnchor.setWrappable("205px");

            // insert anchor after target.
            DOMUtils.insertAfter(blockTarget.getDOMElement(), blockAnchor.getDOMElement());
        });

        return this;
    },
};
