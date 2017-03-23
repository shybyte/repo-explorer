import * as fs from 'fs';
import * as path from 'path';

export type FileSystemNode = FileNode | DirectoryNode;

interface FileSystemNodeCommon {
  name: string;
  size: number;
}

export interface FileNode extends FileSystemNodeCommon {
  _type: 'FileNode';
}

export interface DirectoryNode extends FileSystemNodeCommon {
  _type: 'DirectoryNode';
  children: FileSystemNode[];
}

interface RepoScan extends DirectoryNode {
}


export function scanRepo(directory: string, ignore: string[]): RepoScan {
  const files = fs.readdirSync(directory)
    .filter(f => ignore.indexOf(f) == -1)
    .map(filename => path.join(directory, filename));
  return {
    _type: 'DirectoryNode',
    name: directory,
    size: 0,
    children: files.map(fileName => {
      const stat = fs.statSync(fileName);
      if (stat.isDirectory()) {
        return scanRepo(fileName, ignore);
      } else {
        const fileNode: FileNode = {
          _type: 'FileNode',
          size: stat.size,
          name: fileName
        };
        return fileNode;
      }
    })

  };
}
