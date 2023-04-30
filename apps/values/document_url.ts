class DocumentURL {
    private readonly url: URL;

    constructor(url: string) {
        this.url = new URL(url);
    }

    isGoogleSearchNewsTab(): boolean {
        const params = this.url.searchParams;
        return params.get("tbm") === "nws";
    }

    isGoogleSearchImageTab(): boolean {
        const params = this.url.searchParams;
        return params.get("tbm") === "isch";
    }

    isGoogleSearch(): boolean {
        return !this.isGoogleSearchNewsTab() && !this.isGoogleSearchImageTab();
    }

    buildSearchInEnglishURL(): string {
        const returnURL = new URL(this.url.toString());
        const params = returnURL.searchParams;
        params.set("gl", "us");
        params.set("hl", "en");
        return returnURL.toString();
    }
}

export default DocumentURL;
