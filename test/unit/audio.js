import assert from 'assert';
import AudioHandler from '../../src/js/audio.js';
import sinon from 'sinon';

describe('Audio', () => {

  describe('playing sounds', () => {

    describe('when window.Audio is supported', () => {

      describe('when sound is enabled', () => {
        let playStub;

        before(() => {
          let audio = new AudioHandler();
          playStub = sinon.stub(audio._beep, 'play');
          audio.play();
        });

        after(() => {
          playStub.reset();
        });

        it('should play sounds', () => {
          assert(playStub.called);
        });
      });

      describe('sound is not enabled', () => {
        let playStub;

        before(() => {
          let audio = new AudioHandler();
          audio.soundEnabled = false;
          playStub = sinon.stub(audio._beep, 'play');
          audio.play();
        });

        after(() => {
          playStub.reset();
        });

        it('should not play sounds', () => {
          assert(playStub.notCalled);
        });

      });

    });

  });

});
