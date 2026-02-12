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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 bg-[#FFF8E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#3E2723] mb-4">
            Visit Us Today
          </h2>
          <p className="text-lg text-[#5D4037]">
            We'd love to serve you a perfect cup of coffee
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
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
                className="w-full bg-[#D4AF37] text-[#3E2723] py-4 rounded-full font-bold text-lg hover:bg-[#c19d2f] transition-all duration-300 hover:scale-105"
              >
                Send It!
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
