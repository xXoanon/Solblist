// frontend/src/components/Navbar.jsx
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-xl font-bold hover:text-gray-300">Solblist</a>
        <div className="space-x-4">
          <a href="/" className="hover:text-gray-300">List</a>
          <a href="/profiles" className="hover:text-gray-300">Profiles</a>
          <a href="/compare" className="hover:text-gray-300">Compare</a>
          <a href="/stats" className="hover:text-gray-300">Stats</a>
          <a href="/changelog" className="hover:text-gray-300">Changelog</a>
          <a href="/about" className="hover:text-gray-300">About</a>
          {/* Add more links as needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
