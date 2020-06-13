/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import apiUrlGenerator from '../../api/generator';
import styles from './styles.module.scss';

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomId: props.roomId,
      abuseReported: false,
    };
  }

  handleUpdateRoomId(evt) {
    this.setState({
      roomId: evt.target.value,
    });
  }

  handleReportAbuse(evt) {
    evt.preventDefault();
    fetch(`${apiUrlGenerator('abuse')}/${this.state.roomId}`, {
      method: 'POST',
    });
    this.setState({
      abuseReported: true,
    });
  }

  render() {
    return (
      <div className={styles.base}>
        <div className={styles.links}>
          <div>
            <a href="#version">Version</a>
          </div>
          <div>
            <a href="#software">Software</a>
          </div>
          <div>
            <a href="#report-abuse">Report Abuse</a>
          </div>
          <div>
            <a href="#acceptable-use">Acceptable Use Policy</a>
          </div>
          <div>
            <a href="#disclaimer">Disclaimer</a>
          </div>
          <div>
            <a href="#terms">Terms of Service</a>
          </div>
          <div>
            <a href="#contact">Contact</a>
          </div>
          <div>
            <a href="#donate">Donate</a>
          </div>
        </div>

        <section id="version">
          <h4>Version</h4>
          <p>
            Commit SHA:{' '}
            <a
              target="_blank"
              href={`https://github.com/darkwire/darkwire.io/commit/${process.env.REACT_APP_COMMIT_SHA}`}
            >
              {process.env.REACT_APP_COMMIT_SHA}
            </a>
          </p>
        </section>

        <section id="software">
          <h4>Software</h4>
          <p>
            This software uses the{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto" target="_blank" rel="noopener noreferrer">
              Web Cryptography API
            </a>{' '}
            to encrypt data which is transferred using{' '}
            <a href="https://en.wikipedia.org/wiki/WebSocket" target="_blank" rel="noopener noreferrer">
              secure WebSockets
            </a>
            . Messages are never stored on a server or sent over the wire in plain-text.
          </p>
          <p>
            We believe in privacy and transparency. &nbsp;
            <a href="https://github.com/darkwire/darkwire.io" target="_blank" rel="noopener noreferrer">
              View the source code and documentation on GitHub.
            </a>
          </p>
        </section>

        <section id="report-abuse">
          <h4>Report Abuse</h4>
          <p>
            We encourage you to report problematic content to us. Please keep in mind that to help ensure the safety,
            confidentiality and security of your messages, we do not have the contents of messages available to us,
            which limits our ability to verify the report and take action.
          </p>
          <p>
            When needed, you can take a screenshot of the content and share it, along with any available contact info,
            with appropriate law enforcement authorities.
          </p>
          <p>
            To report any content, email us at abuse[at]darkwire.io or submit the room ID below to report anonymously.
          </p>
          <form onSubmit={this.handleReportAbuse.bind(this)}>
            {this.state.abuseReported && <div>Thank you!</div>}
            <div>
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Room ID"
                  onChange={this.handleUpdateRoomId.bind(this)}
                  value={this.state.roomId}
                  type="text"
                />
                <div className="input-group-append">
                  <button className="btn btn-secondary" type="submit">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </form>
          <br />
          <p>If you feel you or anyone else is in immediate danger, please contact your local emergency services.</p>
          <p>
            If you receive content from someone who wishes to hurt themselves, and you're concerned for their safety,
            please contact your local emergency services or a{' '}
            <a href="https://faq.whatsapp.com/en/general/28030010">suicide prevention hotline</a>.
          </p>
          <p>
            If you receive or encounter content indicating abuse or exploitation of a child, please contact the{' '}
            <a href="http://www.missingkids.com">National Center for Missing and Exploited Children (NCMEC)</a>.
          </p>
        </section>

        <section id="acceptable-use">
          <h4>Acceptable Use Policy</h4>
          <p>
            This Acceptable Use Policy (this “Policy”) describes prohibited uses of the web services offered by Darkwire
            and its affiliates (the “Services”) and the website located at https://darkwire.io (the “Darkwire Site”).
            The examples described in this Policy are not exhaustive. We may modify this Policy at any time by posting a
            revised version on the Darkwire Site. By using the Services or accessing the Darkwire Site, you agree to the
            latest version of this Policy. If you violate the Policy or authorize or help others to do so, we may
            suspend or terminate your use of the Services.
          </p>
          <strong>No Illegal, Harmful, or Offensive Use or Content</strong>
          <p>
            You may not use, or encourage, promote, facilitate or instruct others to use, the Services or Darkwire Site
            for any illegal, harmful, fraudulent, infringing or offensive use, or to transmit, store, display,
            distribute or otherwise make available content that is illegal, harmful, fraudulent, infringing or
            offensive. Prohibited activities or content include:
          </p>
          <ul>
            <li>
              <strong>Illegal, Harmful or Fraudulent Activities.</strong> Any activities that are illegal, that violate
              the rights of others, or that may be harmful to others, our operations or reputation, including
              disseminating, promoting or facilitating child pornography, offering or disseminating fraudulent goods,
              services, schemes, or promotions, make-money-fast schemes, ponzi and pyramid schemes, phishing, or
              pharming.
            </li>

            <li>
              <strong>Infringing Content.</strong> Content that infringes or misappropriates the intellectual property
              or proprietary rights of others.
            </li>

            <li>
              <strong>Offensive Content.</strong> Content that is defamatory, obscene, abusive, invasive of privacy, or
              otherwise objectionable, including content that constitutes child pornography, relates to bestiality, or
              depicts non-consensual sex acts.
            </li>

            <li>
              <strong>Harmful Content.</strong> Content or other computer technology that may damage, interfere with,
              surreptitiously intercept, or expropriate any system, program, or data, including viruses, Trojan horses,
              worms, time bombs, or cancelbots.
            </li>
          </ul>
          <strong>No Security Violations</strong>
          <br />
          You may not use the Services to violate the security or integrity of any network, computer or communications
          system, software application, or network or computing device (each, a “System”). Prohibited activities
          include:
          <ul>
            <li>
              <strong>Unauthorized Access.</strong> Accessing or using any System without permission, including
              attempting to probe, scan, or test the vulnerability of a System or to breach any security or
              authentication measures used by a System.
            </li>

            <li>
              <strong>Interception.</strong> Monitoring of data or traffic on a System without permission.
            </li>

            <li>
              <strong>Falsification of Origin.</strong> Forging TCP-IP packet headers, e-mail headers, or any part of a
              message describing its origin or route. The legitimate use of aliases and anonymous remailers is not
              prohibited by this provision.
            </li>
          </ul>
          <strong>No Network Abuse</strong>
          <br />
          You may not make network connections to any users, hosts, or networks unless you have permission to
          communicate with them. Prohibited activities include:
          <ul>
            <li>
              <strong>Monitoring or Crawling.</strong> Monitoring or crawling of a System that impairs or disrupts the
              System being monitored or crawled.
            </li>

            <li>
              <strong>Denial of Service (DoS).</strong> Inundating a target with communications requests so the target
              either cannot respond to legitimate traffic or responds so slowly that it becomes ineffective.
            </li>

            <li>
              <strong>Intentional Interference.</strong> Interfering with the proper functioning of any System,
              including any deliberate attempt to overload a system by mail bombing, news bombing, broadcast attacks, or
              flooding techniques.
            </li>

            <li>
              <strong>Operation of Certain Network Services.</strong> Operating network services like open proxies, open
              mail relays, or open recursive domain name servers.
            </li>

            <li>
              <strong>Avoiding System Restrictions.</strong> Using manual or electronic means to avoid any use
              limitations placed on a System, such as access and storage restrictions.
            </li>
          </ul>
          <strong>No E-Mail or Other Message Abuse</strong>
          <br />
          You will not distribute, publish, send, or facilitate the sending of unsolicited mass e-mail or other
          messages, promotions, advertising, or solicitations (like “spam”), including commercial advertising and
          informational announcements. You will not alter or obscure mail headers or assume a sender’s identity without
          the sender’s explicit permission. You will not collect replies to messages sent from another internet service
          provider if those messages violate this Policy or the acceptable use policy of that provider.
          <strong>Our Monitoring and Enforcement</strong>
          <br />
          We reserve the right, but do not assume the obligation, to investigate any violation of this Policy or misuse
          of the Services or Darkwire Site. We may:
          <ul>
            <li>investigate violations of this Policy or misuse of the Services or Darkwire Site; or</li>
            <li>
              remove, disable access to, or modify any content or resource that violates this Policy or any other
              agreement we have with you for use of the Services or the Darkwire Site.
            </li>
            <li>
              We may report any activity that we suspect violates any law or regulation to appropriate law enforcement
              officials, regulators, or other appropriate third parties. Our reporting may include disclosing
              appropriate customer information. We also may cooperate with appropriate law enforcement agencies,
              regulators, or other appropriate third parties to help with the investigation and prosecution of illegal
              conduct by providing network and systems information related to alleged violations of this Policy.
            </li>
          </ul>
          Reporting of Violations of this Policy
          <br />
          If you become aware of any violation of this Policy, you will immediately notify us and provide us with
          assistance, as requested, to stop or remedy the violation. To report any violation of this Policy, please
          follow our abuse reporting process.
        </section>

        <section id="terms">
          <h4>Terms of Service ("Terms")</h4>
          <p>Last updated: December 11, 2017</p>
          <p>
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the
            https://darkwire.io website (the "Service") operated by Darkwire ("us", "we", or "our").
          </p>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
            These Terms apply to all visitors, users and others who access or use the Service.
          </p>
          <p>
            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the
            terms then you may not access the Service.
          </p>
          <strong>Links To Other Web Sites</strong>
          <p>
            Our Service may contain links to third-party web sites or services that are not owned or controlled by
            Darkwire.
          </p>
          <p>
            Darkwire has no control over, and assumes no responsibility for, the content, privacy policies, or practices
            of any third party web sites or services. You further acknowledge and agree that Darkwire shall not be
            responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or
            in connection with use of or reliance on any such content, goods or services available on or through any
            such web sites or services.
          </p>
          <p>
            We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or
            services that you visit.
          </p>
          <strong>Termination</strong>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any
            reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            All provisions of the Terms which by their nature should survive termination shall survive termination,
            including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of
            liability.
          </p>
          <strong>Governing Law</strong>
          <p>
            These Terms shall be governed and construed in accordance with the laws of New York, United States, without
            regard to its conflict of law provisions.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
            rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining
            provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us
            regarding our Service, and supersede and replace any prior agreements we might have between us regarding the
            Service.
          </p>
        </section>

        <section id="disclaimer">
          <h4>Disclaimer</h4>
          <p className="bold">
            WARNING: Darkwire does not mask IP addresses nor can verify the integrity of parties recieving messages.
            &nbsp;Proceed with caution and always confirm recipients beforre starting a chat session.
          </p>
          <p>
            Please also note that <strong>ALL CHATROOMS</strong> are public. &nbsp;Anyone can guess your room URL. If
            you need a more-private room, use the lock feature or set the URL manually by entering a room ID after
            &quot;darkwire.io/&quot;.
          </p>
          <br />
          <strong>No Warranties; Exclusion of Liability; Indemnification</strong>
          <p>
            <strong>
              OUR WEBSITE IS OPERATED BY Darkwire ON AN "AS IS," "AS AVAILABLE" BASIS, WITHOUT REPRESENTATIONS OR
              WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, Darkwire SPECIFICALLY DISCLAIMS ALL
              WARRANTIES AND CONDITIONS OF ANY KIND, INCLUDING ALL IMPLIED WARRANTIES AND CONDITIONS OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NONINFRINGEMENT FOR OUR WEBSITE AND ANY CONTRACTS AND SERVICES
              YOU PURCHASE THROUGH IT. Darkwire SHALL NOT HAVE ANY LIABILITY OR RESPONSIBILITY FOR ANY ERRORS OR
              OMISSIONS IN THE CONTENT OF OUR WEBSITE, FOR CONTRACTS OR SERVICES SOLD THROUGH OUR WEBSITE, FOR YOUR
              ACTION OR INACTION IN CONNECTION WITH OUR WEBSITE OR FOR ANY DAMAGE TO YOUR COMPUTER OR DATA OR ANY OTHER
              DAMAGE YOU MAY INCUR IN CONNECTION WITH OUR WEBSITE. YOUR USE OF OUR WEBSITE AND ANY CONTRACTS OR SERVICES
              ARE AT YOUR OWN RISK. IN NO EVENT SHALL EITHER Darkwire OR THEIR AGENTS BE LIABLE FOR ANY DIRECT,
              INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN ANY WAY CONNECTED
              WITH THE USE OF OUR WEBSITE, CONTRACTS AND SERVICES PURCHASED THROUGH OUR WEBSITE, THE DELAY OR INABILITY
              TO USE OUR WEBSITE OR OTHERWISE ARISING IN CONNECTION WITH OUR WEBSITE, CONTRACTS OR RELATED SERVICES,
              WHETHER BASED ON CONTRACT, TORT, STRICT LIABILITY OR OTHERWISE, EVEN IF ADVISED OF THE POSSIBILITY OF ANY
              SUCH DAMAGES. IN NO EVENT SHALL Darkwire’s LIABILITY FOR ANY DAMAGE CLAIM EXCEED THE AMOUNT PAID BY YOU TO
              Darkwire FOR THE TRANSACTION GIVING RISE TO SUCH DAMAGE CLAIM.
            </strong>
          </p>
          <p>
            <strong>
              SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE
              ABOVE EXCLUSION MAY NOT APPLY TO YOU.
            </strong>
          </p>
          <p>
            <strong>
              WITHOUT LIMITING THE FOREGOING, Darkwire DO NOT REPRESENT OR WARRANT THAT THE INFORMATION ON THE WEBITE IS
              ACCURATE, COMPLETE, RELIABLE, USEFUL, TIMELY OR CURRENT OR THAT OUR WEBSITE WILL OPERATE WITHOUT
              INTERRUPTION OR ERROR.
            </strong>
          </p>
          <p>
            <strong>
              YOU AGREE THAT ALL TIMES, YOU WILL LOOK TO ATTORNEYS FROM WHOM YOU PURCHASE SERVICES FOR ANY CLAIMS OF ANY
              NATURE, INCLUDING LOSS, DAMAGE, OR WARRANTY. Darkwire AND THEIR RESPECTIVE AFFILIATES MAKE NO
              REPRESENTATION OR GUARANTEES ABOUT ANY CONTRACTS AND SERVICES OFFERED THROUGH OUR WEBSITE.
            </strong>
          </p>
          <p>
            <strong>
              Darkwire MAKES NO REPRESENTATION THAT CONTENT PROVIDED ON OUR WEBSITE, CONTRACTS, OR RELATED SERVICES ARE
              APPLICABLE OR APPROPRIATE FOR USE IN ALL JURISDICTIONS.
            </strong>
          </p>
          <strong>Indemnification</strong>
          <p>
            You agree to defend, indemnify and hold Darkwire harmless from and against any and all claims, damages,
            costs and expenses, including attorneys' fees, arising from or related to your use of our Website or any
            Contracts or Services you purchase through it.
          </p>
          <strong>Changes</strong>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material we will try to provide at least 30 days notice prior to any new terms taking effect. What
            constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by
            the revised terms. If you do not agree to the new terms, please stop using the Service.
          </p>
          <strong>Contact Us</strong>
          <p>If you have any questions about these Terms, please contact us at hello[at]darkwire.io.</p>
        </section>

        <section id="contact">
          <h4>Contact</h4>
          <p>Questions/comments? Email us at hello[at]darkwire.io</p>
          <p>
            Found a bug or want a new feature?{' '}
            <a href="https://github.com/darkwire/darkwire.io/issues" target="_blank" rel="noopener noreferrer">
              Open a ticket on Github
            </a>
            .
          </p>
        </section>

        <section id="donate">
          <h4>Donate</h4>
          <p>
            Darkwire is maintained and hosted by two developers with full-time jobs. If you get some value from this
            service we would appreciate any donation you can afford. We use these funds for server and DNS costs. Thank
            you!
          </p>
          <strong>Bitcoin</strong>
          <p>189sPnHGcjP5uteg2UuNgcJ5eoaRAP4Bw4</p>
          <strong>Ethereum</strong>
          <p>0x36dc407bB28aA1EE6AafBee0379Fe6Cff881758E</p>
          <strong>Litecoin</strong>
          <p>LUViQeSggBBtYoN2qNtXSuxYoRMzRY8CSX</p>
          <strong>PayPal:</strong>
          <br />
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value="UAH5BCLA9Y8VW" />
            <input
              type="image"
              src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
              border="0"
              name="submit"
              alt="PayPal - The safer, easier way to pay online!"
            />
            <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" />
          </form>
        </section>
      </div>
    );
  }
}

About.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default About;
