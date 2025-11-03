import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import heroImage from '../assets/hero-bg.jpg';

const StillWorking = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center px-4 py-12 bg-background">
      <div className="max-w-4xl w-full bg-card rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-64 md:h-auto">
            <img
              src={heroImage}
              alt="Marketplace preview"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-8 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Coming soon</p>
              <h1 className="text-2xl font-semibold mt-2">We&apos;re still working on this</h1>
            </div>
            <p className="text-muted-foreground">
              We&apos;re still working on bringing this to you. Explore the marketplace more till
              then, and check back soon for project details and deeper insights.
            </p>
            <Button onClick={() => navigate('/marketplace')} className="self-start">
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StillWorking;
