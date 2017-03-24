import * as fs from 'fs';
import * as path from 'path';
import {IgnoreInstance} from "ignore";
const ignore = require('ignore');

export type FileSystemNode = FileNode | DirectoryNode;

interface FileSystemNodeCommon {
  name: string;
  relativePath: string;
  size: number;
}

export interface FileNode extends FileSystemNodeCommon {
  _type: 'FileNode';
}

export interface DirectoryNode extends FileSystemNodeCommon {
  _type: 'DirectoryNode';
  children: FileSystemNode[];
}

export interface RepoScan extends DirectoryNode {
}


export function scanRepo(repoFolderArg: string): RepoScan {
  const repoFolder = path.resolve(repoFolderArg);
  const gitIgnoreFileName = path.join(repoFolder, '.gitignore');
  const ignoreInstance: IgnoreInstance = ignore();
  ignoreInstance.add(".git");
  if (fs.existsSync(gitIgnoreFileName)) {
    ignoreInstance.add(fs.readFileSync(gitIgnoreFileName).toString());
  }
  return scanRepoInternal(repoFolder, repoFolder, ignoreInstance);
}

function scanRepoInternal(repoFolder: string, directory: string, ignore: IgnoreInstance): RepoScan {
  const files = ignore.filter(fs.readdirSync(directory)
    .map(filename => path.join(directory, filename)));
  return {
    _type: 'DirectoryNode',
    name: path.basename(directory),
    relativePath: relativePath(repoFolder, directory),
    size: 0,
    children: files.map(fileName => {
      const stat = fs.statSync(fileName);
      if (stat.isDirectory()) {
        return scanRepoInternal(repoFolder, fileName, ignore);
      } else {
        const fileNode: FileNode = {
          _type: 'FileNode',
          size: stat.size,
          name: path.basename(fileName),
          relativePath: relativePath(repoFolder, fileName)
        };
        return fileNode;
      }
    })

  };
}

function relativePath(repoFolder: string, path: string) {
  return path.slice(repoFolder.length + 1);
}

export function filterRepoScan(repoScan: RepoScan, ignore: IgnoreInstance): RepoScan {
  function filterRepoScanInternal(children: FileSystemNode[]): FileSystemNode[] {
    return children.filter(child => !ignore.ignores(child.relativePath)).map(child => {
      if (child._type === 'DirectoryNode') {
        return {...child, children: filterRepoScanInternal(child.children)};
      }
      return child;
    });
  }

  return {...repoScan, children: filterRepoScanInternal(repoScan.children)};
}
