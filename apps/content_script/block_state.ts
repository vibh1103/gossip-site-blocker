import { $, BannedTarget, BlockType, DOMUtils } from '../common';
import { RegExpItem } from '../repository/regexp_repository';
import BlockedSites from '../model/blocked_sites';
import { BannedWord } from '../repository/banned_word_repository';
import BlockedSite from '../model/blocked_site';
import { BlockReason, BlockReasonType } from '../model/block_reason';
import { ContentToBlock } from '../block/block';

class BlockState {
    private readonly state: string;

    private readonly blockReason?: BlockReason;

    constructor(
        content: ContentToBlock,
        blockedSites: BlockedSites,
        bannedWords: BannedWord[],
        regexpList: RegExpItem[],
        autoBlockIDN: boolean,
    ) {
        const blockedSite: BlockedSite | undefined = blockedSites.matches(content.getUrl());

        const banned: BannedWord | undefined = bannedWords.find((bannedWord) => {
            const { keyword } = bannedWord;

            switch (bannedWord.target) {
                case BannedTarget.TITLE_ONLY:
                    return content.containsInTitle(keyword);

                case BannedTarget.TITLE_AND_CONTENTS:
                default:
                    return content.contains(keyword);
            }
        });

        const regexp: RegExpItem | undefined = regexpList.find((regexpItem) => {
            const pattern = new RegExp(regexpItem.pattern);

            return pattern.test(DOMUtils.removeProtocol(content.getUrl()));
        });

        // FIXME: priority
        if (
            blockedSite &&
            (!banned || banned.blockType !== BlockType.HARD) &&
            (!regexp || regexp.blockType !== BlockType.HARD)
        ) {
            this.state = blockedSite.getState();

            if (DOMUtils.removeProtocol(content.getUrl()) === blockedSite.url) {
                this.blockReason = new BlockReason(
                    BlockReasonType.URL_EXACTLY,
                    content.getUrl(),
                    blockedSite.url,
                );
            } else {
                this.blockReason = new BlockReason(
                    BlockReasonType.URL,
                    content.getUrl(),
                    blockedSite.url,
                );
            }

            return;
        }
        if (banned) {
            this.state = banned.blockType.toString();
            this.blockReason = new BlockReason(
                BlockReasonType.WORD,
                content.getUrl(),
                banned.keyword,
            );
            return;
        }
        if (regexp) {
            this.state = regexp.blockType.toString();
            this.blockReason = new BlockReason(
                BlockReasonType.REGEXP,
                content.getUrl(),
                regexp.pattern,
            );
            return;
        }

        // check IDN
        if (autoBlockIDN) {
            const url = content.getUrl();
            const hostname = DOMUtils.getHostName(url);

            if (hostname.startsWith('xn--') || hostname.includes('.xn--')) {
                this.state = 'soft';
                this.blockReason = new BlockReason(BlockReasonType.IDN, url, $.message('IDN'));
                return;
            }
        }

        this.state = 'none';
    }

    public getReason(): BlockReason | undefined {
        return this.blockReason;
    }

    public getState(): string {
        return this.state;
    }
}

export default BlockState;
