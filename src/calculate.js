import crypto from "crypto";
import fs from "fs";

export function calculate(files) {
  let mappedFiles = {};
  for (const file of files) {
    if (!file.includes("installer.db")) {
      const fileName = file.replace(/.*(files)\\/, "").replace(/\\/g, "/");
      const hash = crypto
        .createHash("sha256")
        .update(fs.readFileSync(file))
        .digest("hex");
      let mappedFile = {};
      mappedFile[fileName] = { New: { Sha256: hash } };
      mappedFiles = { ...mappedFiles, ...mappedFile };
    }
  }
  let finalJson = { manifest_version: 1, files: { ...mappedFiles } };
  return JSON.stringify(finalJson);
}
