import * as child_process from 'child_process'
import * as readline from 'readline'
import * as fs from 'fs';
import * as path from 'path';
import * as byline from 'byline';

export interface FileStat {
  commitCount: number;
  blameStats: BlameStats;
}

export interface  FileStats {
  [filepath: string]: FileStat
}

export interface GitStats {
  fileStats: FileStats;
}

export async function readGitStats(repoFolderArg: string): Promise<GitStats> {
  const repoFolder = path.resolve(repoFolderArg);
  const gitStats = await readGitLog(repoFolderArg);
  for (let file of Object.keys(gitStats.fileStats)) {
    const fileStat = gitStats.fileStats[file];
    console.log('blame', file);
    try {
      const stat = fs.statSync(path.join(repoFolder, file));
      if (stat && stat.size < 200000) {
        fileStat.blameStats = await readBlameStat(repoFolderArg, file);
      } else {
        console.log('to big');
      }
    } catch (_error) {

    }
  }
  return gitStats;
}

interface BlameStat {
  linesCount: number;
}

interface BlameStats {
  [user: string]: BlameStat
}

export function readBlameStat(repoFolderArg: string, file: string): Promise<BlameStats> {
  return new Promise<BlameStats>((resolve) => {
    const blameStats: BlameStats = {};
    const process = child_process.spawn('git', ['--no-pager', 'blame', '--line-porcelain', 'HEAD', file],
      {cwd: repoFolderArg});

    const rl = readline.createInterface({
      input: process.stdout,
      terminal: false
    });

    rl.on('line', (line: string) => {
      let match = line.match(/^author (.+)$/);
      if (match) {
        const author = match[1];
        const blameStat = blameStats[author] || {linesCount: 0};
        blameStat.linesCount += 1;
        blameStats[author] = blameStat;
      }
    });

    rl.on('close', () => {
      resolve(blameStats);
    });
  });
}


export function readGitLog(repoFolderArg: string): Promise<GitStats> {
  return new Promise<GitStats>((resolve) => {
    const fileStats: FileStats = {};
    const process = child_process.spawn('git', ['log', "--pretty=format:'[%h] %an %ad %s", '--date=short', '--numstat'],
      {cwd: repoFolderArg});

    const rl = readline.createInterface({
      input: process.stdout,
    });

    rl.on('line', (line) => {
      let match = line.match(/^(\d+)\s+(\d+)\s+(\S+)$/);
      if (match) {
        const [_add, _del, file] = match.slice(1);
        const fileStat: FileStat = fileStats[file] || {commitCount: 0};
        fileStat.commitCount += 1;
        fileStats[file] = fileStat;
      }
    });
    rl.on('close', () => {
      resolve({fileStats});
    });
  });
}

