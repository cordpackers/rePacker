import crypto from "crypto";
import path from "path";
import fs from "fs";

const rootFolder = path.join(import.meta.dirname, "..")
const packFolder = path.join(rootFolder, "packAsTarBr");

export function calculate(files) {
  let mappedFiles = {};
  for (const file of files) {
    if (!file.includes("installer.db")) {
      const fileName = file.replace(/\\/g, "/");
      const hash = crypto
        .createHash("sha256")
        .update(fs.readFileSync(path.join(packFolder, "files", file)))
        .digest("hex");
      let mappedFile = {};
      mappedFile[fileName] = { New: { Sha256: hash } };
      mappedFiles = { ...mappedFiles, ...mappedFile };
    }
  }
  let finalJson = { manifest_version: 1, files: { ...mappedFiles } };
  return JSON.stringify(finalJson);
}
