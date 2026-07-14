import React from 'react';
import './footer.css';

const Footer = () => {
  return (
 <footer>
    <br/>
    © 2026 WOLF PACK DNA. All Rights Reserved.
    <br/><br/>
    <i style={{marginRight:"10px"}} class="fa-solid fa-envelope"></i>wolfpackdna@gmail.com
    <br/>
    <i style={{marginRight:"10px"}} class="fa-solid fa-phone"></i>123-456-7890
    <br/><br/>
    <div class="footer-links">
        <a title="LinkedIn" target = "_blank" href="https://www.linkedin.com/in/wolf-pack-dna-038609321/"><i class="fa-brands fa-linkedin"></i></a>
        <a title="Facebook" target = "_blank" href="https://www.facebook.com/people/Wolf-Pack-DNA/61563761730503/"><i class="fa-brands fa-facebook"></i></a>
    </div>
    <br/>
 </footer>
);
};

export default Footer;