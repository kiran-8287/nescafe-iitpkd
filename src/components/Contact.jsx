import React, { useState } from 'react';
import { contactInfo } from '../data/mock';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import whatsappLogo from '../assets/logos/whatsapp.png';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // idle, sending, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // Note: User needs to replace this with their actual Formspree endpoint
      const response = await fetch('https://formspree.io/f/xvzbkolo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-12 md:py-20 bg-[#FFF8E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#3E2723] mb-4">
            Visit Us Today
          </h2>
          <p className="text-base md:text-lg text-[#5D4037]">
            We'd love to serve you a perfect cup of coffee
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#3E2723] mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3E2723] mb-1">Address</h4>
                    <p className="text-[#5D4037]">{contactInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3E2723] mb-1">Opening Hours</h4>
                    <p className="text-[#5D4037]">Mon - Fri: {contactInfo.hours.weekdays}</p>
                    <p className="text-[#5D4037]">Sat - Sun: {contactInfo.hours.weekends}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3E2723] mb-1">Phone</h4>
                    <a href={`tel:${contactInfo.phone}`} className="text-[#5D4037] hover:text-[#D4AF37] transition-colors">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3E2723] mb-1">Email</h4>
                    <a href={`mailto:${contactInfo.email}`} className="text-[#5D4037] hover:text-[#D4AF37] transition-colors">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex-1 bg-[#3E2723] text-white py-3 rounded-full font-semibold hover:bg-[#5D4037] transition-colors duration-300 text-center"
                >
                  Call Now
                </a>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white py-3 rounded-full font-semibold hover:bg-[#20BA5A] transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <img src={whatsappLogo} alt="WhatsApp" className="h-6 w-6" />
                  WhatsApp
                </a>
              </div>
              <div className="mt-4">
                <a
                  href={contactInfo.navigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 text-center"
                >
                  Take Me There
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-64">
              <iframe
                src={contactInfo.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nescafe Restaurant Location"
              ></iframe>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#3E2723] mb-6">Send Us a Message</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-[#3E2723] font-semibold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#8D6E63] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="Anonymous works too"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[#3E2723] font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#8D6E63] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="We don't spam. We're caffeine dealers, not email marketers"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[#3E2723] font-semibold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#8D6E63] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                  placeholder="Compliments, complaints, coffee philosophy - all welcome"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${status === 'sending'
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-[#D4AF37] text-[#3E2723] hover:bg-[#c19d2f]'
                  }`}
              >
                {status === 'sending' ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Sending...
                  </>
                ) : 'Send It!'}
              </button>

              {status === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative animate-fade-in">
                  <span className="block sm:inline">Message sent successfully! We'll get back to you soon. ✨</span>
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">Something went wrong. Please try again or call us! ☕</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
