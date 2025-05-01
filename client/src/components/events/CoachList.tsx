import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Coach {
  id: number;
  name: string;
  title: string;
  bio: string;
  image: string;
  school?: string;
  schoolLogo?: string;
}

interface CoachListProps {
  eventId: string | number;
}

const CoachList = ({ eventId }: CoachListProps) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/coaches`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch coaches: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCoaches(data);
      } catch (error) {
        console.error('Error fetching coaches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load coaches. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, [eventId, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Clinicians</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative w-full h-48 bg-muted flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (coaches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Clinicians</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coaches.map((coach) => (
          <div key={coach.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="aspect-square overflow-hidden relative">
              <img 
                src={`/attached_assets/${coach.image.split('/').pop()}`} 
                alt={coach.name} 
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
              {coach.schoolLogo && (
                <div className="absolute top-3 right-3 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg school-logo-pulse">
                  <img 
                    src={coach.schoolLogo} 
                    alt={coach.school || ""} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-800">{coach.name}</h4>
              <p className="text-[#bf0a30] text-sm mb-2">{coach.title}</p>
              <p className="text-gray-700 text-sm">{coach.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachList;
