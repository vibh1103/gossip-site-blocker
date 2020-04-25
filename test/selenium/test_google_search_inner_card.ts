import { ok, strictEqual } from 'assert';
import { TestWebDriver } from './driver';
import TestBlockAnchor from './libs/block_anchor';

export default async function main(driver: TestWebDriver): Promise<void> {
    await driver.googleSearch(['自炊', '動画']);
    await driver.takeScreenShot('test_inner_card', 'search_result.png');

    // click 'block this page'
    const blockAnchor = new TestBlockAnchor(driver, '.block-google-inner-card');
    await blockAnchor.click();
    await driver.takeScreenShot('test_inner_card', 'block_dialog.png');

    // assert dialog
    const blockDialog = await driver.findDialog();
    strictEqual(await blockDialog.getDomainRadioValue(), 'www.youtube.com');

    // click block button
    await blockDialog.block();
    await driver.takeScreenShot('test_inner_card', 'block_clicked.png');

    // assert block target is hidden
    const blockTarget = await blockAnchor.getTarget('preceding-sibling::g-inner-card');
    const isDisplayed = await blockTarget.isDisplayed();
    ok(!isDisplayed);
}
