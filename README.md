# matlab file converter

- `*.mlx` more readable and better interact
- `*.m` portable

## usage

```bash
node Convert.js D:\FDU\FDU-Course\docs\机械振动\01\HW\code\*.mlx
```

## API

command call matlab and execute a string

```bash
matlab -nodisplay -nosplash -nodesktop -r "clear; clc; a = 1; b = 2; c = a + b; disp(c); exit;"
```

```matlab
% mlx2m
matlab.internal.liveeditor.openAndConvert(mlxFiles(i).path,mFiles(i).path)
% m2mlx
matlab.internal.liveeditor.openAndSave(mFiles(i).path,mlxFiles(i).path)
```

it's better to pass array and call matlab once than call matlab many times

## References

- [aminya/mlxTools.m: Convert mlx files to m files and vice versa](https://github.com/aminya/mlxTools.m)
