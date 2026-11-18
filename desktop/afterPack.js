// Mac only: give the finished .app a local ("ad-hoc") signature. Unsigned arm64 apps downloaded from the internet otherwise show "is damaged and can't be opened".
const { execSync } = require('child_process');
const path = require('path');
exports.default = async function (context) {
    if (context.electronPlatformName !== 'darwin') return;
    const app = path.join(context.appOutDir, context.packager.appInfo.productFilename + '.app');
    execSync(`codesign --force --deep --sign - "${app}"`, { stdio: 'inherit' });
};
