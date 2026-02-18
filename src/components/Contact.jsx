import React, { useState } from 'react';
import { contactInfo } from '../data/mock';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

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
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#3E2723] mb-3 sm:mb-4">
            Visit Us Today
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#5D4037]">
            We'd love to serve you a perfect cup of coffee
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-[#3E2723] mb-4 sm:mb-6">Contact Information</h3>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3E2723] mb-1 text-sm sm:text-base">Address</h4>
                    <p className="text-[#5D4037] text-sm sm:text-base">{contactInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3E2723] mb-1 text-sm sm:text-base">Opening Hours</h4>
                    <p className="text-[#5D4037] text-sm sm:text-base">Mon - Fri: {contactInfo.hours.weekdays}</p>
                    <p className="text-[#5D4037] text-sm sm:text-base">Sat - Sun: {contactInfo.hours.weekends}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3E2723] mb-1 text-sm sm:text-base">Phone</h4>
                    <a href={`tel:${contactInfo.phone}`} className="text-[#5D4037] hover:text-[#D4AF37] transition-colors text-sm sm:text-base">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-[#D4AF37] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-[#3E2723] mb-1 text-sm sm:text-base">Email</h4>
                    <a href={`mailto:${contactInfo.email}`} className="text-[#5D4037] hover:text-[#D4AF37] transition-colors text-sm sm:text-base">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4">
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex-1 bg-[#3E2723] text-white py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-[#5D4037] transition-colors duration-300 text-center min-h-[44px] flex items-center justify-center"
                >
                  Call Now
                </a>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-[#20BA5A] transition-colors duration-300 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 fill-current flex-shrink-0" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.486a.5.5 0 0 0 .609.61l5.7-1.494A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.193-1.453l-.372-.22-3.853 1.01 1.028-3.758-.242-.386A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
              <div className="mt-3 sm:mt-4">
                <a
                  href={contactInfo.navigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors duration-300 text-center min-h-[44px] flex items-center justify-center"
                >
                  Take Me There
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-48 sm:h-56 md:h-64">
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

          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-[#3E2723] mb-4 sm:mb-6">Send Us a Message</h3>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-[#3E2723] font-semibold mb-2 text-sm sm:text-base">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-[#8D6E63] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="Anonymous works too"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[#3E2723] font-semibold mb-2 text-sm sm:text-base">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-[#8D6E63] focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="We don't spam. We're caffeine dealers, not email marketers"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[#3E2723] font-semibold mb-2 text-sm sm:text-base">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-[#8D6E63] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                  placeholder="Compliments, complaints, coffee philosophy - all welcome"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className={`w-full py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 min-h-[44px] ${status === 'sending'
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-[#D4AF37] text-[#3E2723] hover:bg-[#c19d2f]'
                  }`}
              >
                {status === 'sending' ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></span>
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
