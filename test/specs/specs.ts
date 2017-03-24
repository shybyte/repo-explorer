import {assert} from 'chai';
import {filterRepoScan, scanRepo} from "../../src/client/scan-repo";
import {IgnoreInstance} from "ignore";
import sloc = require('sloc');
const ignore = require('ignore');

describe('scan repo', () => {
  describe('integration', () => {

    it.only('works', () => {
      console.log(JSON.stringify(scanRepo('./app'), null, 2));
      assert.equal(1, 1);
    });

    it('filterRepoScan', () => {
      const repoScan = scanRepo('test/data');
      const ignoreInstance: IgnoreInstance = ignore();
      ignoreInstance.add("ignored");
      const filteredRepoScan = filterRepoScan(repoScan, ignoreInstance);
      console.log(JSON.stringify(filteredRepoScan, null, 2));
      assert.equal(filteredRepoScan.children.length, 2);
    });


  });
});


describe('sloc', () => {
  it('works', () => {
    const slocResult: SlocResult = sloc(`alert();
    // comment`
      , 'js');
    console.log(slocResult);
    assert.equal(slocResult.total, 2);
    assert.equal(slocResult.source, 1);
  });
});

