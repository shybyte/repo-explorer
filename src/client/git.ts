import * as child_process from 'child_process'
import * as readline from 'readline'

export interface  FileStat {
  commitCount: number;
}

export interface  FileStats { [filepath: string]: FileStat
}

export interface GitStats {
  fileStats: FileStats;
}

export function readGitStats(repoFolderArg: string): Promise<GitStats> {
  return new Promise<GitStats>((resolve) => {
    const fileStats: FileStats = {};
    const process = child_process.exec(`git log --pretty=format:'[%h] %an %ad %s' --date=short --numstat `,
      {encoding: 'utf-8', cwd: repoFolderArg});

    const rl = readline.createInterface({
      input: process.stdout,
    });

    rl.on('line', (line) => {
      let match = line.match(/^(\d+)\s+(\d+)\s+(\S+)$/);
      if (match) {
        const [_add, _del, file] = match.slice(1);
        const fileStat = fileStats[file] || {commitCount: 0};
        fileStat.commitCount += 1;
        fileStats[file] = fileStat;
      }
    });
    rl.on('close', () => {
      resolve({fileStats});
    });
  });
}
