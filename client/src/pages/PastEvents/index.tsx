import React from 'react';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users, Trophy, Heart } from 'lucide-react';

const PastEvents = () => {
  return (
    <div className="bg-white">
      <div className="bg-primary/5 py-12">
        <Container>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Past Events</h1>
          <p className="text-center text-gray-600 max-w-3xl mx-auto">
            At Rich Habits, we're proud to host events that bring communities together while showcasing incredible talent and sportsmanship. Browse through our past events to see the impact we've made.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        <Tabs defaultValue="pickleball" className="w-full">
          <TabsList className="mb-8 flex justify-center">
            <TabsTrigger value="pickleball" className="px-6 py-3">Birmingham Pickleball Tournament</TabsTrigger>
            {/* Add more tabs for future past events */}
          </TabsList>

          <TabsContent value="pickleball" className="space-y-16">
            {/* Event Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Birmingham Pickleball Championship</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>August 15-16, 2023</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <Users className="h-5 w-5 mr-2" />
                  <span>150+ Participants</span>
                </div>
                <p className="text-gray-700 mb-6">
                  Our inaugural Birmingham Pickleball Championship was a massive success, bringing together over 150 players from across the Southeast. With thousands in cash prizes, professional courts, and a vibrant community atmosphere, this event showcased the best of Birmingham's sports culture.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                    <DollarSign className="h-5 w-5 mr-1 text-primary" />
                    <span className="font-medium">$5,000+ in Prizes</span>
                  </div>
                  <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                    <Trophy className="h-5 w-5 mr-1 text-primary" />
                    <span className="font-medium">All Skill Levels</span>
                  </div>
                  <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                    <Heart className="h-5 w-5 mr-1 text-primary" />
                    <span className="font-medium">Community Impact</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/assets/team-photo.jpg" 
                  alt="Birmingham Pickleball Tournament Team" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Event Highlights */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Event Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/assets/event-venue.jpg" 
                    alt="Tournament Venue" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2">State-of-the-Art Venue</h4>
                    <p className="text-gray-600">Our tournament was held at Birmingham's premier indoor pickleball facility, featuring professional-grade courts and amenities.</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/assets/cash-prize.jpg" 
                    alt="Cash Prizes" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2">Substantial Cash Prizes</h4>
                    <p className="text-gray-600">Winners received generous cash prizes, with the championship team taking home the grand prize of $2,000.</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/assets/merchandise.jpg" 
                    alt="Rich Habits Merchandise" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2">Exclusive Merchandise</h4>
                    <p className="text-gray-600">Participants and spectators had access to limited-edition Rich Habits tournament merchandise and gear.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tournament Galleries */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Tournament Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <img 
                  src="/assets/player-team-1.jpg" 
                  alt="Player Team" 
                  className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                />
                <img 
                  src="/assets/player-team-2.jpg" 
                  alt="Player Team" 
                  className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                />
                <img 
                  src="/assets/court-action.jpg" 
                  alt="Court Action" 
                  className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                />
                <img 
                  src="/assets/winners-group.jpg" 
                  alt="Winners Group" 
                  className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Community Impact */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Community Impact</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-gray-700 mb-6">
                    Beyond the competitive aspect, our Birmingham Pickleball Tournament made a significant impact on the local community. A portion of all entry fees and merchandise sales was donated to support youth sports programs in underserved areas of Birmingham.
                  </p>
                  <p className="text-gray-700 mb-6">
                    The event also boosted local businesses, with participants and spectators patronizing nearby restaurants, hotels, and shops throughout the tournament weekend.
                  </p>
                  <p className="text-gray-700">
                    Rich Habits is committed to building community through sports, and this tournament exemplified our dedication to making a positive difference in Birmingham and beyond.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <img 
                    src="/assets/mixed-team.jpg" 
                    alt="Community Participants" 
                    className="w-full h-auto object-cover rounded-lg shadow-md"
                  />
                  <img 
                    src="/assets/winners-group.jpg" 
                    alt="Tournament Winners" 
                    className="w-full h-auto object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Next Event Callout */}
            <div className="bg-primary text-white rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Join Us For Our Next Event!</h3>
              <p className="max-w-2xl mx-auto mb-6">
                Stay tuned for upcoming Rich Habits events, including our next Birmingham Pickleball Championship. Don't miss the chance to compete, connect, and contribute to our community initiatives.
              </p>
              <div className="flex justify-center">
                <Button variant="secondary" className="mr-4">
                  View Upcoming Events
                </Button>
                <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary">
                  Join Our Mailing List
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default PastEvents;
