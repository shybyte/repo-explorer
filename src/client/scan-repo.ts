import * as fs from 'fs';
import * as path from 'path';
import {IgnoreInstance} from "ignore";
const ignore = require('ignore');

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


export function scanRepo(directory: string): RepoScan {
  const gitIgnoreFileName = path.join(directory, '.gitignore');
  const ignoreInstance: IgnoreInstance = ignore();
  ignoreInstance.add(".git");
  if (fs.existsSync(gitIgnoreFileName)) {
    ignoreInstance.add(fs.readFileSync(gitIgnoreFileName).toString())
  }
  return scanRepoInternal(directory, ignoreInstance);
}

function scanRepoInternal(directory: string, ignore: IgnoreInstance): RepoScan {
  const files = ignore.filter(fs.readdirSync(directory)
    .map(filename => path.join(directory, filename)));
  return {
    _type: 'DirectoryNode',
    name: directory,
    size: 0,
    children: files.map(fileName => {
      const stat = fs.statSync(fileName);
      if (stat.isDirectory()) {
        return scanRepoInternal(fileName, ignore);
      } else {
        const fileNode: FileNode = {
          _type: 'FileNode',
          size: stat.size,
          name: path.basename(fileName)
        };
        return fileNode;
      }
    })

  };
}
