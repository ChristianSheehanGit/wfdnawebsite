import React, { useState } from 'react';
import './footer.css';
import Modal from './modal.jsx';

const Footer = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
 <footer>
    <br/>
      © 2026 WOLF PACK DNA. All Rights Reserved.
      <br/><br/>    <i style={{marginRight:"10px"}} class="fa-solid fa-envelope"></i>submissions@wolfpackdna.com
    <br/>
      <a
        href="#"
        className="footer-privacy-link"
        onClick={(e) => { e.preventDefault(); setPrivacyOpen(true); }}
        style={{color:"rgba(0, 0, 0, 0.7)"}}
      >
        Privacy Policy
      </a>
      <br/>

<br/>
    <div class="footer-links">
        <a title="LinkedIn" target = "_blank" href="https://www.linkedin.com/in/wolf-pack-dna-038609321/"><i class="fa-brands fa-linkedin"></i></a>
        <a title="Facebook" target = "_blank" href="https://www.facebook.com/people/Wolf-Pack-DNA/61563761730503/"><i class="fa-brands fa-facebook"></i></a>
    </div>
    <br/>

    <Modal
      isOpen={privacyOpen}
      onClose={() => setPrivacyOpen(false)}
      centeredHeader
      stickyHeader={<p style={{ fontWeight: "bold", fontSize: "17.5px", margin: 0, color: "rgba(0, 0, 0, 0.7)" }}>Privacy Policy</p>}
    >
<div style={{ color: "rgba(0, 0, 0, 0.7)" }}>
Last Updated: Sep 2, 2026
<br/><br/>
Wolfpack DNA is a nonprofit organization that assists with genetic genealogy research and forensic genetic genealogy cases for law enforcement. This policy explains what information we collect through our website, how it's used, and when it may be shared or published.
<br/><br/>
When you submit an inquiry through our website, we collect the information you provide, such as your name, contact information, case details, and any supporting documents or genetic/genealogical information relevant to your case. This information is reviewed by our team to evaluate and work on your case, and to communicate with you about it.
<br/><br/>
We maintain a public cases page where past genetic genealogy cases may be shared to support research and public awareness. If your case is posted there, we typically include basic case information, but we do not publish sensitive personal contact details like your phone number or email address. If you'd rather certain information not be included, let us know before your case is posted. If a case has already been posted and you'd like something removed or redacted, email us with your request and we'll take it down.
<br/><br/>
Cases submitted for law enforcement purposes are not posted publicly. These cases are handled under contract with the requesting agency, and information is shared only with that agency and our internal team working on the case.
<br/><br/>
Any information that isn't published on our public cases page is kept confidential. It's not shared with the general public, and is only accessible to our team and, where applicable, the law enforcement agency involved.
<br/><br/>
We take reasonable steps to keep submitted information secure, though no method of storage or transmission online is completely secure.
<br/><br/>
To request that information be withheld or redacted, or if you have questions about this policy or your case, contact us at submissions@wolfpackdna.com.
<br/><br/>
We may update this policy from time to time; the date above reflects the most recent revision.
    </div>
    </Modal>
 </footer>
);
};

export default Footer;