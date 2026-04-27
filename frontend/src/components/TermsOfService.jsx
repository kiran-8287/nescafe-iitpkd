import React, { useEffect } from 'react';
import { Coffee, Gavel, AlertCircle, ShoppingBag, UserCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8E1] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#3E2723] font-bold mb-8 hover:text-[#D4AF37] transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-[#3E2723]/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[#3E2723] rounded-2xl">
              <Gavel className="text-[#D4AF37]" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#3E2723]">Terms of Service</h1>
              <p className="text-gray-500 text-sm">Last updated: April 27, 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <UserCheck size={20} className="text-[#D4AF37]" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Nescafe IITPKD web application, you agree to be bound by these Terms of Service and all applicable laws and regulations at IIT Palakkad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#D4AF37]" />
                2. Ordering and Pickup
              </h2>
              <p className="mb-4">
                The application is a platform to facilitate ordering from the Nescafe outlet at IIT Palakkad.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Orders must be picked up within a reasonable timeframe once marked as "Ready".</li>
                <li>Items are subject to availability. The outlet reserves the right to cancel orders if stock is depleted.</li>
                <li>Users are responsible for ensuring they provide the correct phone number for order verification.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <Coffee size={20} className="text-[#D4AF37]" />
                3. User Accounts
              </h2>
              <p>
                Users must provide accurate information during registration. Students are required to use institutional email addresses for account verification. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <AlertCircle size={20} className="text-[#D4AF37]" />
                4. Limitations of Liability
              </h2>
              <p>
                Nescafe IITPKD and the application developers are not liable for any indirect, incidental, or consequential damages arising from your use of the service. We do not guarantee that the service will be uninterrupted or error-free at all times.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <Gavel size={20} className="text-[#D4AF37]" />
                5. Modifications
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-100 mt-12">
              <p className="text-sm italic text-center">
                Enjoy your coffee responsibly! ☕
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
