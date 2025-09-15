import React, { useState } from 'react';
import { Users, MapPin, Phone, Clock, CheckCircle, Loader } from 'lucide-react';
import ShelterCard from '../components/ShelterCard';
import { createRequest, findBestMatch as findBestMatchRequest, calculateRoute } from '../services/requests';

export default function IntakePage() {
  const [form, setForm] = useState({
    name: 'Johnson Family',
    people_count: 4,
    needs: 'Family with elderly mother (75) who needs wheelchair access and daily medication. Also have a small dog.',
    features_required: ['wheelchair', 'elderly-care', 'pet-friendly'] as string[],
    lat: '13.0827',
    lng: '80.2707',
    phone: '+91 9876543210',
    urgency: 'high'
  });
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [assignment, setAssignment] = useState<any>(null);
  const [step, setStep] = useState('form'); // 'form', 'processing', 'assigned'

  const urgencyOptions = [
    { value: 'low', label: 'Low - Can wait', color: 'text-green-600' },
    { value: 'medium', label: 'Medium - Standard', color: 'text-yellow-600' },
    { value: 'high', label: 'High - Urgent', color: 'text-red-600' }
  ];

  const featureOptions = [
    'medical', 'wheelchair', 'pet-friendly', 'child-friendly', 'elderly-care', 'mental-health'
  ];

  const toggleFeature = (feature: string) => {
    setForm(prev => ({
      ...prev,
      features_required: prev.features_required.includes(feature)
        ? prev.features_required.filter(f => f !== feature)
        : [...prev.features_required, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep('processing');
    setCurrentStep(2);
    
    try {
      // Step 1: Create request (Intake Agent)
      const requestData = {
        name: form.name,
        people_count: form.people_count,
        needs: form.needs,
        features_required: form.features_required,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        phone: form.phone,
        urgency: form.urgency as 'low' | 'medium' | 'high'
      };
      
      await createRequest(requestData);
      
      // Step 2: Find best match (Matching Agent)
      setCurrentStep(3);
      const matchResult = await findBestMatchRequest({
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        people_count: form.people_count,
        features_required: form.features_required,
        urgency: form.urgency
      });
      
      // Step 3: Calculate route (Routing Agent)
      setCurrentStep(4);
      const routeResult = await calculateRoute({
        origin_lat: parseFloat(form.lat),
        origin_lng: parseFloat(form.lng),
        destination_lat: matchResult.lat,
        destination_lng: matchResult.lng
      });
      
      // Create assignment
      const assignment = {
        id: matchResult.shelter_id,
        name: matchResult.shelter_name,
        capacity: 120,
        occupancy: 85,
        features: matchResult.features?.join(', ') || 'Standard shelter amenities',
        distance: `${matchResult.distance_km} km`,
        eta: `${routeResult.duration_minutes} minutes`,
        address: matchResult.shelter_name,
        lat: matchResult.lat,
        lng: matchResult.lng,
        phone: '(555) 123-4567'
      };
      
      setAssignment(assignment);
      setCurrentStep(5);
      setStep('assigned');
      
    } catch (error) {
      console.error('Error processing request:', error);
      alert('There was an error processing your request. Please try again.');
      setCurrentStep(1);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Loader className="h-8 w-8 text-white animate-spin" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
              Processing Request
            </h2>
            <p className="text-slate-600 mb-8 text-lg">Our AI agents are finding the best shelter match...</p>
            
            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-center text-sm bg-slate-50 p-3 rounded-xl">
                {currentStep >= 2 ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                ) : (
                  <Loader className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                )}
                <span className="font-medium">Intake agent: Request received</span>
              </div>
              <div className="flex items-center text-sm bg-slate-50 p-3 rounded-xl">
                {currentStep >= 3 ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                ) : currentStep === 2 ? (
                  <Loader className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                ) : (
                  <Clock className="h-5 w-5 text-slate-400 mr-3" />
                )}
                <span className="font-medium">Matching agent: Finding best shelter</span>
              </div>
              <div className="flex items-center text-sm bg-slate-50 p-3 rounded-xl">
                {currentStep >= 4 ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                ) : currentStep === 3 ? (
                  <Loader className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                ) : (
                  <Clock className="h-5 w-5 text-slate-400 mr-3" />
                )}
                <span className="font-medium">Routing agent: Calculating distances</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'assigned' && assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                Shelter Assigned!
              </h2>
              <p className="text-slate-600 text-lg">
                {form.name}, your family of {form.people_count} has been assigned to the following shelter:
              </p>
            </div>

            <ShelterCard shelter={assignment} onClick={() => {}} showDistance />

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
            <h3 className="font-semibold text-slate-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Please arrive at the shelter within the next 2 hours</li>
              <li>• Bring identification and any essential medications</li>
              <li>• Call {assignment.phone || '(555) 123-4567'} if you need directions</li>
              <li>• Check-in at the front desk upon arrival</li>
            </ul>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setStep('form');
                setAssignment(null);
                setForm({
                  name: 'Sarah Johnson',
                  people_count: 3,
                  needs: 'Family with elderly mother (75) who needs wheelchair access and daily medication. Also have a small dog.',
                  features_required: ['wheelchair', 'elderly-care', 'pet-friendly'],
                  lat: '13.0827',
                  lng: '80.2707',
                  phone: '(555) 123-4567',
                  urgency: 'high'
                });
              }}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Submit Another Request
            </button>
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 font-semibold">
              View on Map
            </button>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-6">
            <Users className="h-4 w-4 mr-2" />
            AI-Powered Emergency Response
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Emergency Shelter Request
          </h1>
          <p className="text-xl text-slate-600 max-w-lg mx-auto">
            Fill out this form to request emergency shelter placement. Our AI system will find the best match for your family's needs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 space-y-8">
        {/* Family Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Family Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Primary Contact Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of People *
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.people_count}
                onChange={(e) => setForm({ ...form, people_count: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Phone className="h-4 w-4 inline mr-1" />
              Contact Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Needs and Requirements */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Special Needs & Requirements</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Describe any specific needs or circumstances
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={form.needs}
              onChange={(e) => setForm({ ...form, needs: e.target.value })}
              placeholder="e.g., elderly parent with mobility issues, infant requiring formula, pet cat..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Required Shelter Features (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {featureOptions.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    form.features_required.includes(feature)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {feature.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Current Location
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Latitude
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                placeholder="13.0827"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Longitude
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                placeholder="80.2707"
              />
            </div>
          </div>
          
          <p className="text-xs text-slate-500 mt-2">
            GPS coordinates help us find the nearest suitable shelter. You can also provide a street address.
          </p>
        </div>

        {/* Urgency Level */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Urgency Level
          </h3>
          
          <div className="space-y-2">
            {urgencyOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value={option.value}
                  checked={form.urgency === option.value}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  className="mr-3"
                />
                <span className={`${option.color} font-medium`}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>



        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Processing Request...
              </>
            ) : (
              'Submit Shelter Request'
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Your request will be processed immediately by our AI matching system. 
          You'll receive shelter assignment details within minutes.
        </p>
      </form>
    </div>
    </div>
  );
}