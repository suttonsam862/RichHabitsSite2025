function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rich Habits</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="/" className="hover:text-orange-200">Home</a></li>
              <li><a href="/events" className="hover:text-orange-200">Events</a></li>
              <li><a href="/shop" className="hover:text-orange-200">Shop</a></li>
              <li><a href="/contact" className="hover:text-orange-200">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          <section className="mb-10">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Rich Habits</h2>
              <p className="text-gray-700 mb-6">
                A comprehensive athlete-centric e-commerce and event management platform providing 
                advanced, interactive experiences for sports enthusiasts through intelligent media 
                handling and dynamic content presentation.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <a href="/events" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                  Explore Events
                </a>
                <a href="/shop" className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded">
                  Shop Now
                </a>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Featured Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Birmingham Slam Camp Card */}
              <div className="bg-gradient-to-br from-orange-500 to-red-700 text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="p-4">
                  <div className="font-bold text-xl mb-1">Birmingham Slam Camp</div>
                  <div className="font-bold mb-2">Birmingham, AL</div>
                  <p className="text-sm">June 19-21, 2025</p>
                  <p className="text-sm mb-4">Clay-Chalkville Middle School</p>
                  <a href="/events/birmingham-slam-camp" className="block text-center bg-white text-orange-600 font-bold py-1 px-4 rounded-full text-sm hover:bg-orange-100 transition-colors">
                    Learn More
                  </a>
                </div>
              </div>

              {/* National Champ Camp Card */}
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="p-4">
                  <div className="font-bold text-xl mb-1">National Champ Camp</div>
                  <div className="font-bold mb-2">Las Vegas, NV</div>
                  <p className="text-sm">June 5-7, 2025</p>
                  <p className="text-sm mb-4">Roy Martin Middle School</p>
                  <a href="/events/national-champ-camp" className="block text-center bg-white text-blue-700 font-bold py-1 px-4 rounded-full text-sm hover:bg-blue-100 transition-colors">
                    Learn More
                  </a>
                </div>
              </div>

              {/* Texas Recruiting Clinic Card */}
              <div className="bg-gradient-to-br from-red-600 to-blue-700 text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="p-4">
                  <div className="font-bold text-xl mb-1">Texas Recruiting Clinic</div>
                  <div className="font-bold mb-2">Arlington, TX</div>
                  <p className="text-sm">June 12-13, 2025</p>
                  <p className="text-sm mb-4">Arlington Martin High School</p>
                  <a href="/events/texas-recruiting-clinic" className="block text-center bg-white text-red-600 font-bold py-1 px-4 rounded-full text-sm hover:bg-blue-100 transition-colors">
                    Learn More
                  </a>
                </div>
              </div>

              {/* Panther Train Tour Card */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-900 text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="p-4">
                  <div className="font-bold text-xl mb-1">Panther Train Tour</div>
                  <div className="font-bold mb-2">Multiple Locations</div>
                  <p className="text-sm">July 23-25, 2025</p>
                  <p className="text-sm mb-4">Various Venues</p>
                  <a href="/events/panther-train-tour" className="block text-center bg-white text-purple-700 font-bold py-1 px-4 rounded-full text-sm hover:bg-purple-100 transition-colors">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white p-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold mb-4">Rich Habits</h2>
              <p className="text-sm text-gray-400">
                High-performance athletic gear and events for athletes who demand excellence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Contact Us</h3>
              <p className="text-sm text-gray-400">Email: admin@rich-habits.com</p>
              <p className="text-sm text-gray-400">Phone: +1 (480) 810-4477</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Rich Habits. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
