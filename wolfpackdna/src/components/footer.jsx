import React, { useState } from 'react';
import './footer.css';
import Modal from './modal.jsx';

const Footer = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
 <footer>
    <br/>
      © 2026 WOLF PACK DNA. All Rights Reserved.
      <br/><br/>    <i style={{marginRight:"10px"}} class="fa-solid fa-envelope"></i>wolfpackdna@gmail.com
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
      stickyHeader={<p style={{ fontWeight: "bold", fontSize: "17.5px", margin: 0 }}>Privacy Policy</p>}
    >
      {/* Privacy policy content goes here. */}
    </Modal>
 </footer>
);
};

export default Footer;