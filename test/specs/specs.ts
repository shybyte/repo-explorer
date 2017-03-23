import {assert} from 'chai';
import {scanRepo} from "../../src/client/scan-repo";

describe('scan repo', () => {
  describe('integration', () => {

    it('works', () => {
      console.log(JSON.stringify(scanRepo('./app'), null, 2));
      assert.equal(1, 1);
    });


  });
});
