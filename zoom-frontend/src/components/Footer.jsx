import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Branding */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Meetings</h2>
          <p className="text-gray-500 mt-2 text-sm">
            A modern real-time video conferencing platform built for speed and performance.
          </p>
        </div>

        {/* Product links */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Product</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li><Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
            <li><Link to="/features" className="hover:text-blue-600">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-blue-600">Pricing</Link></li>
            <li><Link to="/docs" className="hover:text-blue-600">Documentation</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Company</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li><Link to="/about" className="hover:text-blue-600">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-blue-600">Careers</Link></li>
            <li><Link to="/blog" className="hover:text-blue-600">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Legal</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-blue-600">Terms of Use</Link></li>
            <li><Link to="/security" className="hover:text-blue-600">Security</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-4">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Meetings. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
