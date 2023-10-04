const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const curDir = path.dirname(__filename);
const convertFile = path.join(curDir, "convert.m");

/**
 *
 * @param {string[]} srcFiles
 * @param {string[]} destFiles
 */
async function ConvertMlxToM(srcFiles, destFiles) {
  const matString = `clear; clc;
srcFiles = [${srcFiles.map((file) => `"${file}"`).join(",")}];
destFiles = [${destFiles.map((file) => `"${file}"`).join(",")}];
for i = 1:length(srcFiles)
    mlxFile = srcFiles(i);
    mFile = destFiles(i);
    matlab.internal.liveeditor.openAndConvert(char(mlxFile), char(mFile));
    disp(sprintf('File %d converted %s -> %s', i, char(mlxFile), char(mFile)));
end
exit;`;

  //   const command = `matlab -nodisplay -nosplash -nodesktop -r "${matString}"`;
  //   console.log(command);
  //   exec(command, (err, stdout, stderr) => {
  //     if (err) {
  //       console.log(err);
  //       return;
  //     }
  //     console.log(stdout);
  //     console.log(stderr);
  //     console.log("Done!");
  //   });
  fs.writeFileSync(convertFile, matString);
  return await exec(
    `matlab -nodisplay -nosplash -nodesktop -r "clc;clear;run('${convertFile}');exit;"`,
    (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(stdout);
      console.log(stderr);
      console.log("Done!");
    }
  );
}

async function ConvertMToMlx(srcFiles, destFiles) {
  const matString = `clear; clc;
srcFiles = [${srcFiles.join(" ")}];
destFiles = [${destFiles.join(" ")}];
for i = 1:length(srcFiles)
    mlxFile = srcFiles(i);
    mFile = destFiles(i);
    matlab.internal.liveeditor.openAndSave(char(mFile), char(mlxFile));
    disp(sprintf('File %d converted %s -> %s', i, char(mFile), char(mlxFile)));
end
exit;`.replace(/\n/g, "");

  fs.writeFileSync(convertFile, matString);
  return await exec(
    `matlab -nodisplay -nosplash -nodesktop -r "clc;clear;run('${convertFile}');exit;"`,
    (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(stdout);
      console.log(stderr);
      console.log("Done!");
    }
  );
}

async function ConvertMlx(srcFiles) {
  const destFiles = srcFiles.map((file) => {
    const { dir, name } = path.parse(file);
    return path.join(dir, name + ".m");
  });
  const [updateSrcFiles, updateDestFiles] = filterUpdateFile(
    srcFiles,
    destFiles
  );
  return await ConvertMlxToM(updateSrcFiles, updateDestFiles);
}

async function ConvertM(srcFiles) {
  const destFiles = srcFiles.map((file) => {
    const { dir, name } = path.parse(file);
    return path.join(dir, name + ".mlx");
  });
  const [updateSrcFiles, updateDestFiles] = filterUpdateFile(
    srcFiles,
    destFiles
  );
  return await ConvertMToMlx(updateSrcFiles, updateDestFiles);
}

function isNewer(a, b) {
  if (!fs.existsSync(a)) return false;
  const stat1 = fs.statSync(a);
  const stat2 = fs.statSync(b);

  return stat1.mtimeMs > stat2.mtimeMs;
}

function filterUpdateFile(srcFiles, destFiles) {
  const updateSrcFiles = [];
  const updateDestFiles = [];
  for (let i = 0; i < srcFiles.length; i++) {
    const srcFile = srcFiles[i];
    const destFile = destFiles[i];
    if (!fs.existsSync(destFile) || isNewer(srcFile, destFile)) {
      updateSrcFiles.push(srcFile);
      updateDestFiles.push(destFile);
    }
  }
  return [updateSrcFiles, updateDestFiles];
}

module.exports = {
  ConvertMlx,
  ConvertM,
};
