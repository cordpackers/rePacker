import fs from "fs";
import tar from "tar";
import fse from 'fs-extra'
import glob from "glob";

import { calculate } from "./calculate.js";

const packFolder = "./packAsTarBR";

export async function pack(src) {

  if (fs.existsSync(packFolder)) {
    fs.rmSync(packFolder, { recursive: true, force: true })
    fs.mkdirSync(packFolder)
  } else {
    fs.mkdirSync(packFolder)
  }

  fs.mkdirSync(`${packFolder}/files/`)

  fse.copySync(src, `${packFolder}/files/`)

  if (fs.existsSync(`${packFolder}/files/Squirrel.exe`)) {
    fs.rmSync(`${packFolder}/files/Squirrel.exe`)
  }

  const files = glob.sync(`${packFolder}/files/**`, {
    realpath: true,
    nodir: true,
    dot: true,
    nounique: true,
  })

  const json = calculate(files)

  fs.writeFileSync(`${packFolder}/delta_manifest.json`, json, {
    flag: "w+",
    encoding: "utf-8",
  });
  
  console.log("Please package ./packAsTarBR")

};
