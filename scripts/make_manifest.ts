import path from "path";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { format } from "date-fns";

// Create if there is no dist directory
const projectDir = path.dirname(__dirname);
const distDir = projectDir + "/dist";
const manifestJsonPath = projectDir + "/apps/manifest.json";
const firefoxManifestJsonPath = projectDir + "/apps/manifest.firefox.json";

if (!existsSync(distDir)) {
    mkdirSync(distDir);
}

// Load manifest.json
const manifest = JSON.parse(readFileSync(manifestJsonPath).toString());
const firefoxManifest = JSON.parse(readFileSync(firefoxManifestJsonPath).toString());

// set version_name
const branch = process.env.CIRCLE_BRANCH;
if (branch) {
    const version = manifest.version;
    const now = format(new Date(), "yyyyMMdd-HHmm");
    manifest.version_name = `${version}-snapshot(${now})`;
    manifest.name = "Gossip Site Blocker(beta)";
    firefoxManifest.version_name = `${version}-snapshot(${now})`;
    firefoxManifest.name = "Gossip Site Blocker(beta)";
}

const manifestWriteJsonPath = distDir + "/manifest.json";
writeFileSync(manifestWriteJsonPath, JSON.stringify(manifest, null, 2));

const firefoxManifestWriteJsonPath = distDir + "/manifest.firefox.json";
writeFileSync(firefoxManifestWriteJsonPath, JSON.stringify(firefoxManifest, null, 2));
