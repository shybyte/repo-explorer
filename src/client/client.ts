import * as d3 from "d3";

import * as reactDom from "react-dom";
import {FileSystemNode, scanRepo} from "./scan-repo";
import * as electron from "electron";
import {CommandsToClient} from "../common/commands";
import {mainComponent} from "./components/main-component";
import {readGitStats} from "./git";


const DEFAULT_REPO_KEY = 'defaultRepo';

electron.ipcRenderer.on(CommandsToClient.selectRepo, (_event: any, repoPath: any) => {
  console.log('Load Repo', repoPath);
  localStorage.setItem(DEFAULT_REPO_KEY, repoPath);
  loadRepo(repoPath);
});

async function loadRepo(repoPath: string)  {
  const repoScan = scanRepo(repoPath);
  const gitStats = await readGitStats(repoPath);
  console.log('loadedRepo', repoPath, repoScan);
  const appEl= document.getElementById('app')!;

  reactDom.render(mainComponent({
    repoScan, gitStats,
    parentElement: appEl
  }), appEl);
}


loadRepo(localStorage.getItem(DEFAULT_REPO_KEY) || '.');
