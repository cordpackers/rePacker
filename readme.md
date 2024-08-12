# rePacker

Creates a Discord-like setup, full.distro and delta.distro (experimental)

## Roadmap

### *.distro
- [ ] delta.distro compiling

# Usage
1. Update Electron version if needed
2. Create `input` folder and create `installer_info.json` file from project root directory.
3. Place in all the files into input as if it's a Discord app directory without Electron stuff, like: `installer.db`, `app.ico` and [reUpdater in the updater folder](https://github.com/cordpackers/reUpdater)
4. Put in infor in `installer_info.json`, for example:
```json
{
    "authors": "Howdycord Team",
    "owners": "Howdycord Team",
    "exe": "Howdycord.exe",
    "description": "Howdycord - https://howdycordapp.com",
    "title": "Howdycord",
    "name": "Howdycord",
    "setupExe": "HowdycordSetup.exe"
}
```
5. Run `npm run start`
6. Pack in the contents of `packAsTarBr` as .tar.br and rename it as `full.distro`