import React, { useEffect } from 'react';
import { Coffee, Shield, Eye, Lock, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              <Shield className="text-[#D4AF37]" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#3E2723]">Privacy Policy</h1>
              <p className="text-gray-500 text-sm">Last updated: April 27, 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <Eye size={20} className="text-[#D4AF37]" />
                Information We Collect
              </h2>
              <p className="mb-4">
                When you use the Nescafe IITPKD ordering system, we collect certain information to provide and improve our services:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-bold text-[#3E2723]">Personal Identification:</span> Name, institutional email address (@smail.iitpkd.ac.in for students), and phone number.</li>
                <li><span className="font-bold text-[#3E2723]">Location Information:</span> Hostel or block details provided during registration.</li>
                <li><span className="font-bold text-[#3E2723]">Order History:</span> Details of items ordered, timestamps, and order status.</li>
                <li><span className="font-bold text-[#3E2723]">Usage Data:</span> Information on how you interact with our application.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <Coffee size={20} className="text-[#D4AF37]" />
                How We Use Your Information
              </h2>
              <p>Your data is used specifically for:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Processing and fulfilling your coffee and snack orders.</li>
                <li>Sending real-time notifications about your order status.</li>
                <li>Identifying you at the pickup counter.</li>
                <li>Analyzing popular items to improve our menu offerings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <Lock size={20} className="text-[#D4AF37]" />
                Data Security
              </h2>
              <p>
                We prioritize your data security. Authentication and data storage are managed through <span className="font-bold text-[#3E2723]">Supabase</span>, which employs industry-standard encryption and security protocols. We do not sell or share your personal data with third-party advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                <FileText size={20} className="text-[#D4AF37]" />
                Your Rights
              </h2>
              <p>
                You have the right to access, correct, or request the deletion of your personal information at any time through your profile dashboard or by contacting the system administrator.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-100 mt-12">
              <p className="text-sm italic">
                By using Nescafe IITPKD, you consent to the data practices described in this policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
