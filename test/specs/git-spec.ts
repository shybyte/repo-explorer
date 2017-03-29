import {assert} from 'chai';
import * as mocha from 'mocha';
import {readBlameStat, readGitStats} from "../../src/client/git";


describe('readGitStats', () => {
  it('works', async () => {
    const stats = await readGitStats('../repo-explorer-test-repo');
    assert.isObject(stats.fileStats);
  });
});



describe('readBlameStats', () => {
  it('works', async () => {
    const stats = await readBlameStat('../repo-explorer-test-repo', 'bower.json');
    assert.isObject(stats);
  });
});
