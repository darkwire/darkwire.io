/*jshint -W030 */
import App from '../../package.json';

describe('Darkwire', () => {

  describe('Creating a room', () => {

    var testingRoom = null;
    let browser;

    before((client, done) => {
      browser = client
        .url('http://localhost:3000/', () => {
          done();
        });
    });

    after((client, done) => {
      browser.end(() => {
        done();
      });
    });

    afterEach((client, done) => {
      done();
    });

    beforeEach((client, done) => {
      done();
    });

    it('Should show welcome modal', () => {
      browser
      .waitForElementVisible('#first-modal', 5000)
      .expect.element('#first-modal').to.be.visible;
    });

    it('Should be started with NPM', () => {
      browser.expect.element('#first-modal .modal-title').text.to.equal('Welcome to darkwire.io v' + App.version);
    });

    describe('Joining chat room', () => {

      before((client, done) => {
        // Close modal
        browser.click('#first-modal .modal-footer button');
        browser.url((result) => {
          let urlSplit = result.value.split('/');
          testingRoom = urlSplit[urlSplit.length - 1];
          let url = 'http://localhost:3000/' + testingRoom;
          browser.execute(() => {
            window.open('http://localhost:3000/', '_blank');
          }, [], () => {
            browser.windowHandles((result) => {
              browser.switchWindow(result.value[1], () => {
                browser.execute((id) => {
                  // Open a new chat room at the same URL so we have 2 participants
                  window.open('http://localhost:3000/' + id, '_self');
                }, [testingRoom], () => {
                  done();
                });
              });
            });
          });
        });
      });

      it('Should not show welcome modal', () => {
        browser.assert.hidden('#first-modal');
      });

      describe('Sending chat message', () => {

        before((client, done) => {
          browser
          .waitForElementPresent('ul.users li:nth-child(2)', 5000)
          .waitForElementPresent('textarea.inputMessage', 5000)
          .setValue('textarea.inputMessage', ['Hello world!', browser.Keys.RETURN], () => {
            done();
          });
        });

        it('Should send a message', (client) => {
          browser.windowHandles((result) => {
            browser.switchWindow(result.value[0], () => {
              browser
              .waitForElementVisible('span.messageBody', 5000)
              .assert.containsText('span.messageBody', 'Hello world!');
            });
          });
        });

      });

      describe('Slash Commands', () => {

        describe('/me', () => {

          before((client, done) => {
            browser
            .waitForElementPresent('textarea.inputMessage', 5000)
            .clearValue('textarea.inputMessage')
            .setValue('textarea.inputMessage', ['/me is no stranger to love', browser.Keys.RETURN])
            .waitForElementVisible('.action span.messageBody', 5000, () => {
              done();
            });
          });

          it('Should express an interactive action', () => {
            browser.assert.containsText('.action span.messageBody', 'is no stranger to love');
          });

        });

        describe('/nick', () => {

          before((client, done) => {
            browser
            .waitForElementPresent('textarea.inputMessage', 5000)
            .clearValue('textarea.inputMessage')
            .setValue('textarea.inputMessage', ['/nick rickAnsley', browser.Keys.RETURN])
            .waitForElementVisible('.change-username-warning', 5000)
            .clearValue('textarea.inputMessage')
            .setValue('textarea.inputMessage', ['/nick rickAnsley', browser.Keys.RETURN])
            .waitForElementVisible('.log.changed-name', 5000, () => {
              done();
            });
          });

          it('Should change username', () => {
            browser.assert.containsText('.log.changed-name', 'rickAnsley');
          });

        });

      });

      describe('Before file transfer: Image: Confirm sending', () => {

        before((client, done) => {
          browser.waitForElementPresent('#send-file', 5000, () => {
            browser.execute(() => {
              $('input[name="fileUploader"]').show();
            }, [], () => {
              browser.waitForElementPresent('input[name="fileUploader"]', 5000, () => {
                let testFile = __dirname + '/ricky.jpg';
                browser.setValue('input[name="fileUploader"]', testFile, (result) => {
                  done();
                });
              });
            });
          });
        });

        it('Should prompt user confirmation', () => {
          browser
          .waitForElementVisible('span.messageBody .file-presend-prompt', 5000)
          .assert.containsText('span.messageBody .file-presend-prompt', 'You are about to send ricky.jpg to all participants in this chat. Confirm | Cancel');
        });

        it('Should show sent confirmation message', () => {
          browser
          .waitForElementVisible('a.file-trigger-confirm', 5000)
          .click('a.file-trigger-confirm')
          .waitForElementNotPresent('a.file-trigger-confirm', 5000)
          .assert.containsText('.message .file-presend-prompt', 'Sent ricky.jpg');
        });

      });
    });

  });
});
