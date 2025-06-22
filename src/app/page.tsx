

import React from "react";

const AboutUs: React.FC = () => {
  return (
    <section className="min-h-screen bg-white py-12 px-6 md:px-20 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-blue-700">
          About QuickShift 🚀
        </h1>

        <p className="text-lg text-center text-gray-700 mb-10">
          QuickShift is a student-driven initiative from the University of Moratuwa designed to empower the gig economy in Sri Lanka. Our mission is to connect students with reliable, short-term job opportunities while helping businesses find responsible temporary workers with ease.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Our Purpose</h2>
            <p className="text-gray-700 leading-relaxed">
              Youth unemployment in Sri Lanka remains above 26%. Many undergraduates struggle to find flexible work that fits their schedules. On the other side, small businesses and service providers often need temporary help for tasks like handbill distribution and event staffing. QuickShift bridges this gap by offering a trusted, mobile-first platform that matches gig workers with short-term jobs in their area.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Our Impact</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Reduces youth unemployment through real-time access to income opportunities.</li>
              <li>Streamlines hiring for businesses needing short-term staff quickly.</li>
              <li>Fosters social equity and inclusivity through open platform access.</li>
              <li>Promotes micro-employment to enhance economic resilience.</li>
            </ul>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 text-center">Why QuickShift Stands Out</h2>
          <div className="grid md:grid-cols-2 gap-8 text-gray-700">
            <ul className="list-disc pl-5 space-y-2">
              <li>📍 Hyperlocal job targeting using location-based filtering.</li>
              <li>⚡ Instant apply and auto-matching with available workers nearby.</li>
              <li>📱 Mobile-first design ideal for on-the-go users and students.</li>
            </ul>
            <ul className="list-disc pl-5 space-y-2">
              <li>⭐ Rating & review system to ensure accountability and trust.</li>
              <li>🧠 Simple onboarding with a focus on quick, low-barrier jobs.</li>
              <li>🔒 Strong data privacy and secure user authentication.</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Built with ❤️ by Team Xtruders – University of Moratuwa
          </h3>
          <p className="text-base text-gray-600">
            We're on a mission to revolutionize flexible work in Sri Lanka. <br />
            Join us in empowering the next generation of gig workers. 💼🎓
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
