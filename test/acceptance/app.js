describe('Darkwire', () => {

  describe('starting a room', () => {

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

    it('should show welcome modal', () => {
      browser
      .waitForElementVisible('#first-modal', 5000)
      .assert.containsText('#first-modal .modal-title', 'Welcome to darkwire.io');
    });

    it('should have correct header', () => {
      browser.expect.element('#first-modal .modal-title').text.to.equal('Welcome to darkwire.io');
    });

    describe('opening a second window', () => {

      before((client, done) => {
        browser.url((result) => {
          let urlSplit = result.value.split('/');
          let roomId = urlSplit[urlSplit.length - 1];
          let url = 'http://localhost:3000/' + roomId;
          browser.execute(() => {
            window.open('http://localhost:3000/', '_blank');
          }, [], () => {
            browser.window_handles((result) => {
              browser.switchWindow(result.value[1], () => {
                browser.execute((id) => {
                  window.open('http://localhost:3000/' + id, '_self');
                }, [roomId], () => {
                  done();
                });
              });
            });
          });
        });
      });

      it('should not show welcome modal', () => {
        browser.assert.hidden('#first-modal');
      });

      describe('sending messages', () => {

        before((client, done) => {
          browser.waitForElementPresent('ul.users li:nth-child(2)', 5000, () => {
            browser.setValue('input.inputMessage', ['Hello world', browser.Keys.RETURN], () => {
              done();
            });
          });
        });

        it('should work', () => {
          browser.window_handles((result) => {
            browser.switchWindow(result.value[0], () => {
              browser.waitForElementPresent('span.messageBody', 5000, () => {
                browser.assert.containsText('span.messageBody', 'Hello world');
              });
            });
          });
        });

      });

    });

  });
});
