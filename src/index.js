import electronInstaller from "electron-winstaller";
import packager from "electron-packager";
import fs from "fs-extra";
import path from "path";
import Database from "better-sqlite3";

import { pack } from "./pack.js";

const version = JSON.parse(fs.readFileSync("./input/resources/build_info.json")).version;

const installer_info = JSON.parse(fs.readFileSync("./installer_info.json"))

await packager({
  dir: "./",
  prebuiltAsar: "./input/resources/app.asar",
  out: "./output/unpacked",
  platform: ["win32", "darwin", "linux"],
  arch: ["x64"],
  appVersion: version,
  name: installer_info.name,
  icon: "./input/app.ico",
});

const folders = fs
  .readdirSync("./output/unpacked/", { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => path.join("./output/unpacked/", dirent.name));

for (const folder of folders) {
  fs.copySync("./input/swiftshader", path.join(folder, "swiftshader"));
  /* if (fs.existsSync(path.join(folder, "contents", "resources"))) {
    fs.copySync(
      "./input/resources",
      path.join(folder, "contents", "resources")
    );
  } else {
    fs.copySync("./appData/resources", path.join(folder, "resources"));
  } */
  fs.readdirSync("./input/resources").forEach((fileOrFolder) => {
    if (!fileOrFolder.includes("app")) {
      fs.copySync(`./input/resources/${fileOrFolder}`, path.join(folder, "resources"));
    }
  })
  if (folder.includes("win32")) {
    fs.copyFileSync("./input/app.ico", path.join(folder, "app.ico"));
    fs.copyFileSync(
      "./input/installer.db",
      path.join(folder, "installer.db")
    );
    // fs.copyFileSync('./appData/updater.node', path.join(folder, "updater.node"));
    fs.copySync("./input/updater", path.join(folder, "updater"));
  }
}

pack(`./output/unpacked/${installer_info.name}-win32-x64/`);

const db = new Database(`./output/unpacked/${installer_info.name}-win32-x64/installer.db`);

const installedHostsAndModules = JSON.parse(db
  .prepare(`SELECT value FROM key_values WHERE key = 'host/app/stable/win/x64'`)
  .all()[0].value)[0];

installedHostsAndModules.distro_manifest = JSON.parse(
  fs.readFileSync("./packAsTarBR/delta_manifest.json", {
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

fs.copyFileSync(
  `./output/unpacked/${installer_info.name}-win32-x64/installer.db`,
  "./packAsTarBR/files/installer.db"
);

try {
  await electronInstaller.createWindowsInstaller({
    appDirectory: `./output/unpacked/${installer_info.name}-win32-x64/`,
    outputDirectory: "./output/packed/win32",
    authors: installer_info.authors,
    owners: installer_info.owners,
    exe: `${installer_info.name}.exe`,
    version: version,
    description: installer_info.description,
    title: installer_info.title,
    name: installer_info.name,
    noDelta: true,
    noMsi: true,
    setupIcon: "./input/app.ico",
    loadingGif: fs.existsSync("./input/install.gif")
      ? "./input/install.gif"
      : undefined,
    setupExe: installer_info.setupExe,
    fixUpPaths: false,
    skipUpdateIcon: true,
  });
  console.log("Windows Installer packed!");
} catch (e) {
  console.log(`Windows Installer packing failed: ${e.message}`);
}
