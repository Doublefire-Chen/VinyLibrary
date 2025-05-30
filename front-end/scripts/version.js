const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    // Get the latest git tag
    const version = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();

    // Update package.json version
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Remove 'v' prefix if present (e.g., v1.0.0 -> 1.0.0)
    const cleanVersion = version.startsWith('v') ? version.substring(1) : version;
    packageJson.version = cleanVersion;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated package.json version to ${cleanVersion}`);

    // Ensure public directory exists
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write version to public/version.json
    const versionPath = path.join(publicDir, 'version.json');
    fs.writeFileSync(versionPath, JSON.stringify({
        version,
        buildTime: new Date().toISOString(),
        gitHash: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 8)
    }, null, 2));

    console.log(`✅ Version ${version} written to public/version.json`);
} catch (error) {
    console.warn('⚠️  Could not determine version from git tags:', error.message);

    // Create fallback version file
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const versionPath = path.join(publicDir, 'version.json');
    fs.writeFileSync(versionPath, JSON.stringify({
        version: 'development',
        buildTime: new Date().toISOString(),
        gitHash: 'unknown'
    }, null, 2));

    console.log('📝 Fallback version file created');
    console.log('📝 package.json version left unchanged due to git error');
}