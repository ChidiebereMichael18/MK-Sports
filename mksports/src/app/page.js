'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  
  // ...existing useEffect...

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Your Ultimate Sports Analytics Platform
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Get accurate predictions, live scores, and comprehensive fixtures for all major sports in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="border border-gray-200 px-8 py-4 rounded-lg font-medium hover:border-blue-600 hover:text-blue-600 transition-colors">
              View Predictions
            </button>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { value: "10K+", label: "Active Users" },
            { value: "95%", label: "Accuracy Rate" },
            { value: "15+", label: "Sports Covered" },
            { value: "24/7", label: "Live Updates" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Live Scores",
                description: "Real-time updates from matches across all major sports leagues.",
                icon: "🎯"
              },
              {
                title: "Expert Predictions",
                description: "AI-powered predictions combined with expert analysis.",
                icon: "📊"
              },
              {
                title: "Match Fixtures",
                description: "Comprehensive schedule of upcoming sports events.",
                icon: "📅"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-lg border transition-all ${
                  activeFeature === index 
                    ? "border-blue-600 shadow-lg" 
                    : "border-gray-200"
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="container mx-auto px-4 py-20 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Supported Sports</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Football", icon: "⚽" },
            { name: "Basketball", icon: "🏀" },
            { name: "Tennis", icon: "🎾" },
            { name: "Cricket", icon: "🏏" }
          ].map((sport, index) => (
            <div
              key={index}
              className="p-6 text-center border border-gray-200 rounded-lg hover:border-blue-600 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-3">{sport.icon}</div>
              <h3 className="font-medium text-gray-900">{sport.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of sports fans who trust our platform for accurate predictions.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-bold text-gray-900">MK Sports</div>
              <p className="text-gray-600 mt-2">Your Sports Analytics Partner</p>
            </div>
            <div className="flex gap-6">
              {["About", "Terms", "Privacy", "Contact"].map((item, index) => (
                <a key={index} href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
