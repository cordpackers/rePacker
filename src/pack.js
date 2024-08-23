import fs from "fs";
import path from "path";
import fse from 'fs-extra'
import {glob} from "glob";

import { calculate } from "./calculate.js";

const rootFolder = path.join(import.meta.dirname, "..")
const packFolder = path.join(rootFolder, "packAsTarBr");
const filesFolder = path.join(packFolder, "files")

export async function pack(src) {

  if (fs.existsSync(packFolder)) {
    fs.rmSync(packFolder, { recursive: true, force: true })
    fs.mkdirSync(packFolder)
  } else {
    fs.mkdirSync(packFolder)
  }

  fs.mkdirSync(filesFolder)

  fse.copySync(src, filesFolder)

  if (fs.existsSync(path.join(filesFolder, "Squirrel.exe"))) {
    fs.rmSync(path.join(filesFolder, "Squirrel.exe"))
  }

  const files = glob.sync("**", {
    cwd: path.join(filesFolder).replace(/\\/g, "\\\\"),
    realpath: true,
    nodir: true,
    dot: true,
    nounique: true,
  })

  const json = calculate(files)

  fs.writeFileSync(path.join(packFolder, "delta_manifest.json"), json, {
    flag: "w+",
    encoding: "utf-8",
  });
  
  console.log("Please package ./packAsTarBR")

};
