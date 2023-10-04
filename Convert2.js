/**
 * usage:
 *  node Convert.js D:\FDU\FDU-Course\docs\机械振动\01\HW\code\*.mlx
 */
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
srcFiles = [${srcFiles.join(",")}];
destFiles = [${destFiles.join(",")}];
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
  return await ConvertMlxToM(
    srcFiles.map((file) => {
      return `"${file}"`;
    }),
    destFiles.map((file) => {
      return `"${file}"`;
    })
  );
}

async function ConvertM(srcFiles) {
  const destFiles = srcFiles.map((file) => {
    const { dir, name } = path.parse(file);
    return path.join(dir, name + ".mlx");
  });
  return await ConvertMToMlx(
    srcFiles.map((file) => {
      return `"${file}"`;
    }),
    destFiles.map((file) => {
      return `"${file}"`;
    })
  );
}

const args = process.argv.slice(2);
const src = args[0];
const dst = args[1];

const srcDir = GetRightDir(src, process.cwd());
const srcExt = path.extname(src);
const dstDir = dst ? GetRightDir(dst, process.cwd()) : srcDir;

console.log("src: ", src);
console.log("dst: ", dstDir);

if (srcExt === ".mlx") {
  // get all .mlx files in srcDir
  const srcFiles = fs
    .readdirSync(srcDir)
    .filter((file) => {
      return path.extname(file) === ".mlx";
    })
    .map((file) => {
      return `${path.join(srcDir, file)}`;
    });
  ConvertMlx(srcFiles);
}

if (srcExt === ".m") {
  // get all .m files in srcDir
  const srcFiles = fs
    .readdirSync(srcDir)
    .filter((file) => {
      return path.extname(file) === ".m";
    })
    .map((file) => {
      return `${path.join(srcDir, file)}`;
    });
  ConvertM(srcFiles);
}

function isAbsolute(aPath) {
  return aPath.startsWith("/") || aPath.indexOf(":") !== -1;
}

function GetRightDir(aPath, cwd) {
  const srcDir = path.dirname(aPath);
  if (isAbsolute(srcDir)) {
    return srcDir;
  } else {
    return path.join(cwd, srcDir);
  }
}
