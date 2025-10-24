import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, FileText, Headphones } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiRequest } from '../lib/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status.state === 'loading') return;

    setStatus({ state: 'loading', message: '' });

    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      });
      setStatus({ state: 'success', message: 'Thanks! We will get back to you within one business day.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send your message. Please try again.';
      setStatus({ state: 'error', message });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'info@squasre.co.in',
      description: 'Send us an email and we\'ll respond within 24 hours',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 8369919600',
      description: 'Available Monday to Friday, 9 AM to 6 PM IST',
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Mumbai, India',
      description: 'Visit us in the heart of the city',
    },
  ];

  const supportTypes = [
    {
      icon: MessageCircle,
      title: 'General Inquiry',
      description: 'Questions about our platform, pricing, or getting started',
    },
    {
      icon: FileText,
      title: 'Project Verification',
      description: 'Submit your environmental project for carbon credit verification',
    },
    {
      icon: Headphones,
      title: 'Technical Support',
      description: 'Help with platform features, integrations, or technical issues',
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-section-title mb-6">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about carbon credits, need help with verification, 
            or want to learn more about our platform? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Name *
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Your company name (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => handleInputChange('subject', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="What can we help you with?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Project Verification">Project Verification</SelectItem>
                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                        <SelectItem value="Partnership Opportunity">Partnership Opportunity</SelectItem>
                        <SelectItem value="Press & Media">Press & Media</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us more about how we can help you..."
                    />
                  </div>

                  {status.message && (
                    <div
                      className={`text-sm text-center ${
                        status.state === 'error' ? 'text-red-500' : 'text-green-600'
                      }`}
                    >
                      {status.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full btn-hero"
                    disabled={status.state === 'loading'}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {status.state === 'loading' ? 'Sending...' : 'Send Message'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our privacy policy. 
                    We'll respond within 24 hours.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              {contactInfo.map((info, index) => (
                <Card key={index} className="card-feature">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                        <div className="text-primary font-medium mb-2">{info.value}</div>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Support Types */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">How Can We Help?</h2>
              <div className="space-y-3">
                {supportTypes.map((type, index) => (
                  <Card key={index} className="card-elegant">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <type.icon className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">{type.title}</h4>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ Link */}
            <Card className="bg-accent-gradient text-accent-foreground">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">
                  Looking for Quick Answers?
                </h3>
                <p className="text-accent-foreground/80 mb-4">
                  Check out our comprehensive documentation and FAQ section.
                </p>
                <Button variant="outline" className="border-accent-foreground/20 hover:bg-accent-foreground/10">
                  View Documentation
                </Button>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    For urgent technical issues outside business hours, 
                    please email us and we'll respond as soon as possible.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
