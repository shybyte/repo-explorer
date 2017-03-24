import * as fs from 'fs';
import * as path from 'path';
import sloc = require('sloc');
import ignore = require('ignore');

export type FileSystemNode = FileNode | DirectoryNode;

interface FileSystemNodeCommon {
  name: string;
  relativePath: string;
  size: number;
  slocResult?: SlocResult;
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
    const gitIgnoreFileContent = fs.readFileSync(gitIgnoreFileName).toString();
    ignoreInstance.add(gitIgnoreFileContent);
  } else {
    console.warn('Missing .gitignore!');
  }
  return scanRepoInternal(repoFolder, '', ignoreInstance);
}

function scanRepoInternal(repoFolder: string, relativDirectoryPath: string, ignore: IgnoreInstance): RepoScan {
  const completeDirectoryPath = path.join(repoFolder, relativDirectoryPath);
  const relativeFilePaths = ignore.filter(fs.readdirSync(completeDirectoryPath)
    .map(filename => path.join(relativDirectoryPath, filename)));
  return {
    _type: 'DirectoryNode',
    name: path.basename(relativDirectoryPath),
    relativePath: relativDirectoryPath,
    size: 0,
    children: relativeFilePaths.map(relativePath => {
      const completeFilePath = path.join(repoFolder, relativePath);
      const stat = fs.statSync(completeFilePath);
      if (stat.isDirectory()) {
        return scanRepoInternal(repoFolder, relativePath, ignore);
      } else {
        const fileNode: FileNode = {
          _type: 'FileNode',
          size: stat.size,
          name: path.basename(relativePath),
          relativePath: relativePath,
          slocResult: countLoc(completeFilePath)
        };
        return fileNode;
      }
    })

  };
}

function countLoc(fileName: string): SlocResult | undefined {
  try {
    return sloc(fs.readFileSync(fileName, 'utf8'), path.extname(fileName).slice(1));
  } catch (_error) {
    return undefined;
  }
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
