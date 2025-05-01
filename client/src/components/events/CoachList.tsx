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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <Card key={coach.id} className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={coach.image} alt={coach.name} />
                  <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{coach.name}</CardTitle>
                  <CardDescription className="text-sm">{coach.title}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{coach.bio}</p>
            </CardContent>
            {coach.school && (
              <CardFooter className="flex justify-between items-center border-t pt-4">
                <span className="text-xs font-medium">{coach.school}</span>
                {coach.schoolLogo && (
                  <div className="h-8 w-8">
                    <img 
                      src={coach.schoolLogo} 
                      alt={`${coach.school} logo`}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                )}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoachList;
