// frontend/src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-gray-300 p-4 mt-8 text-center">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} The Solblist. All rights reserved.</p>
        <p className="text-sm mt-1">
          Made by d050. Data from the Solbris community.
        </p>
        {/* Add social links or other footer content here */}
      </div>
    </footer>
  );
};

export default Footer;
