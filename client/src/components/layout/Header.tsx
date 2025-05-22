import React from "react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="fixed w-full top-0 bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Rich Habits
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-orange-200">
                Home
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-orange-200">
                Events
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-orange-200">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-orange-200">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}