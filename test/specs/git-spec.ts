import {assert} from 'chai';
import {readGitStats} from "../../src/client/git";

describe('readGitStats', () => {
  it('works', async () => {
    const stats = await readGitStats('../repo-explorer-test-repo');
    assert.isObject(stats.fileStats);
    console.log(stats.fileStats);
  });
});

