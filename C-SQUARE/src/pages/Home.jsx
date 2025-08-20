import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Globe,
  Coins,
  Recycle,
  Leaf,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-bg.jpg";

const Home = () => {
  const features = [
    {
      icon: Globe,
      title: "Transparency",
      description:
        "Every carbon credit is fully traceable on the blockchain, ensuring complete transparency.",
    },
    {
      icon: Shield,
      title: "Security",
      description:
        "Secure, immutable records protected by cutting-edge blockchain technology.",
    },
    {
      icon: Coins,
      title: "Tokenization",
      description:
        "Carbon credits are tokenized as NFTs, making them tradeable and verifiable.",
    },
    {
      icon: Recycle,
      title: "Sustainability",
      description:
        "Supporting verified environmental projects that make a real impact.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Project Verified",
      description:
        "Carbon offset projects are rigorously verified by certified third parties.",
    },
    {
      number: "02",
      title: "Credits Tokenized",
      description:
        "Each verified credit is minted as a unique NFT on the blockchain.",
    },
    {
      number: "03",
      title: "Companies Purchase",
      description:
        "Organizations buy tokens directly through their crypto wallets.",
    },
    {
      number: "04",
      title: "Retire & Certify",
      description:
        "Tokens are burned upon retirement, creating permanent certificates.",
    },
  ];

  const stats = [
    { value: "2.5M+", label: "Tons CO₂ Offset" },
    { value: "150+", label: "Verified Projects" },
    { value: "500+", label: "Active Companies" },
    { value: "99.9%", label: "Transparency Score" },
  ];

  const sampleCredits = [
    {
      id: 1,
      project: "Amazon Rainforest Conservation",
      type: "Forest Protection",
      location: "Brazil",
      tons: "1,200",
      price: "25",
      verifier: "Verra",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      project: "Solar Farm Development",
      type: "Renewable Energy",
      location: "India",
      tons: "800",
      price: "22",
      verifier: "Gold Standard",
      image:
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      project: "Wind Power Initiative",
      type: "Renewable Energy",
      location: "Denmark",
      tons: "950",
      price: "28",
      verifier: "CDM",
      image:
        "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <div className="animate-float">
            <h1 className="text-hero mb-6">Tokenize. Offset. Verify.</h1>
            <p className="text-subhero mb-8 max-w-2xl mx-auto">
              Buy verified carbon credits and offset emissions with confidence —
              fully traceable on blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-hero">
                <Link to="/marketplace">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="btn-hero-outline"
              >
                <Link to="#how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-title mb-6">
              The Future of Carbon Credits
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              C² revolutionizes carbon offsetting by bringing transparency,
              security, and trust to environmental impact. Every credit is
              verified, tokenized, and permanently recorded on the blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-feature text-center p-6">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-3">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-title mb-6">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process ensures every carbon credit is legitimate,
              traceable, and impactful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="card-elegant p-6 h-full">
                  <CardHeader>
                    <div className="text-4xl font-bold text-primary/20 mb-4">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg mb-3">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-title mb-6">Featured Carbon Credits</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore verified carbon offset projects from around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {sampleCredits.map((credit) => (
              <Card key={credit.id} className="card-marketplace">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={credit.image}
                    alt={credit.project}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {credit.project}
                  </h3>
                  <div className="text-sm text-muted-foreground mb-4">
                    <div className="flex justify-between mb-1">
                      <span>Type:</span>
                      <span>{credit.type}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Location:</span>
                      <span>{credit.location}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Available:</span>
                      <span>{credit.tons} tons</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Verifier:</span>
                      <span>{credit.verifier}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      ${credit.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /ton
                      </span>
                    </div>
                    <Button size="sm" className="btn-accent">
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="btn-hero">
              <Link to="/marketplace">
                View Full Marketplace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-accent-gradient">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-section-title text-accent-foreground mb-6">
            Making Real Impact
          </h2>
          <p className="text-lg text-accent-foreground/80 max-w-2xl mx-auto mb-12">
            Together, we're building a sustainable future through verified
            carbon offsetting and environmental project funding.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Leaf className="h-12 w-12 text-accent-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-accent-foreground mb-2">
                Environmental Projects
              </h3>
              <p className="text-accent-foreground/80">
                Supporting reforestation, renewable energy, and conservation
                initiatives worldwide.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-accent-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-accent-foreground mb-2">
                Community Impact
              </h3>
              <p className="text-accent-foreground/80">
                Creating jobs and supporting local communities through
                sustainable development.
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-accent-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-accent-foreground mb-2">
                Measurable Results
              </h3>
              <p className="text-accent-foreground/80">
                Providing transparent, verifiable data on environmental impact
                and progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
