import electronInstaller from "electron-winstaller";
import packager from "electron-packager";
import fs from "fs-extra";
import path from "path";
import Database from "better-sqlite3";

import { pack } from "./pack.js";

const rootFolder = path.join(import.meta.dirname, "..")
const inputFolder = path.join(rootFolder, "input")
const resourcesFolder = path.join(inputFolder, "resources")
const outputFolder = path.join(rootFolder, "output")
const unpackedFolder = path.join(outputFolder, "unpacked")

const version = JSON.parse(fs.readFileSync(path.join(resourcesFolder, "build_info.json"))).version;

const installer_info = JSON.parse(fs.readFileSync(path.join(rootFolder, "installer_info.json")))

await packager({
  dir: rootFolder,
  prebuiltAsar: path.join(resourcesFolder, "app.asar"),
  out: unpackedFolder,
  platform: ["win32", "darwin", "linux"],
  arch: ["x64"],
  appVersion: version,
  name: installer_info.name,
  icon: path.join(inputFolder, "app.ico"),
});

const folders = fs
  .readdirSync(unpackedFolder, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => path.join(unpackedFolder, dirent.name));

for (const folder of folders) {
  fs.copySync(path.join(inputFolder, "swiftshader"), path.join(folder, "swiftshader"));
  /* if (fs.existsSync(path.join(folder, "contents", "resources"))) {
    fs.copySync(
      "./input/resources",
      path.join(folder, "contents", "resources")
    );
  } else {
    fs.copySync("./appData/resources", path.join(folder, "resources"));
  } */
  fs.readdirSync(resourcesFolder).forEach((fileOrFolder) => {
    if (!fileOrFolder.includes("app")) {
      fs.copySync(path.join(resourcesFolder, fileOrFolder), path.join(folder, "resources", fileOrFolder));
    }
  })
  if (folder.includes("win32")) {
    fs.copyFileSync(path.join(inputFolder, "app.ico"), path.join(folder, "app.ico"));
    fs.copyFileSync(
      path.join(inputFolder, "installer.db"),
      path.join(folder, "installer.db")
    );
    // fs.copyFileSync('./appData/updater.node', path.join(folder, "updater.node"));
    fs.copySync(path.join(inputFolder, "updater"), path.join(folder, "updater"));
  }
}

const windowsUnpackedFolder = path.join(unpackedFolder, `${installer_info.name}-win32-x64`)
const installerDB = path.join(windowsUnpackedFolder, "installer.db")
pack(windowsUnpackedFolder)

const db = new Database(installerDB);

const installedHostsAndModules = JSON.parse(db
  .prepare(`SELECT value FROM key_values WHERE key = 'host/app/stable/win/x64'`)
  .all()[0].value)[0];

installedHostsAndModules.distro_manifest = JSON.parse(
  fs.readFileSync(path.join(rootFolder, "packAsTarBr", "delta_manifest.json"), {
    encoding: "utf8",
    flag: "r",
  })
);

db.prepare(
  `
  UPDATE key_values
  SET value = '[${JSON.stringify(installedHostsAndModules)}]'
  WHERE key = 'host/app/stable/win/x64'
`
).run();

db.close();

try {
  await electronInstaller.createWindowsInstaller({
    appDirectory: windowsUnpackedFolder,
    outputDirectory: path.join(outputFolder, "packed", "win32"),
    authors: installer_info.authors,
    owners: installer_info.owners,
    exe: `${installer_info.name}.exe`,
    version: version,
    description: installer_info.description,
    title: installer_info.title,
    name: installer_info.name,
    noDelta: true,
    noMsi: true,
    setupIcon: path.join(inputFolder, "app.ico"),
    loadingGif: fs.existsSync(path.join(inputFolder, "install.gif"))
      ? path.join(inputFolder, "install.gif")
      : undefined,
    setupExe: installer_info.setupExe,
    fixUpPaths: false,
    skipUpdateIcon: true,
  });
  console.log("Windows Installer packed!");
} catch (e) {
  console.log(`Windows Installer packing failed: ${e.message}`);
}
