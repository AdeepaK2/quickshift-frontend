"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function QuickShiftLandingPage() {
  const { isAuthenticated, userType, logout } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      switch (userType) {
        case 'admin':
          router.push('/admin');
          break;
        case 'employer':
          router.push('/employer');
          break;
        default:
          router.push('/undergraduate');
          break;
      }
    } else {
      router.push('/auth/register?type=user');
    }
  };

  const handleFindJobs = () => {
    if (isAuthenticated) {
      router.push('/undergraduate');
    } else {
      router.push('/auth/register?type=user');
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const jobCategories = [
    {
      title: "Tutoring & Teaching",
      description: "Share your knowledge and earn money by tutoring fellow students.",
      icon: "📚",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Freelancing & Remote Work", 
      description: "Flexible online work that fits your schedule perfectly.",
      icon: "💻",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Delivery & Distribution",
      description: "Earn money through food delivery and handbill distribution.",
      icon: "🚴",
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Campus & Event Work",
      description: "Work at campus events, promotions, and university functions.",
      icon: "🎯",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const testimonials = [
    {
      quote: "QuickShift helped me find flexible tutoring opportunities that fit perfectly around my engineering classes. I've earned enough to cover my textbooks and even save for next semester!",
      name: "Sarah Chen",
      role: "Computer Science Student",
      avatar: "👩‍💻"
    },
    {
      quote: "The delivery jobs through QuickShift are perfect for my schedule. I can work between classes and on weekends. The pay is fair and helps me cover my living expenses without stress.",
      name: "Marcus Rodriguez", 
      role: "Business Major",
      avatar: "👨‍🎓"
    },
    {
      quote: "I found amazing freelance graphic design projects through QuickShift. Working remotely allows me to build my portfolio while earning money for my art supplies and materials.",
      name: "Emma Thompson",
      role: "Art & Design Student",
      avatar: "👩‍🎨"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-bounce" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 gap-4 h-full p-8">
            {Array.from({length: 48}).map((_, i) => (
              <div 
                key={i} 
                className="border border-white/5 rounded-lg animate-pulse"
                style={{animationDelay: `${i * 0.1}s`}}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute top-1/4 left-1/3 text-6xl animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>💼</div>
        <div className="absolute top-1/2 right-1/4 text-4xl animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}>🎓</div>
        <div className="absolute bottom-1/3 left-1/5 text-5xl animate-bounce" style={{animationDuration: '6s', animationDelay: '3s'}}>💰</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header Navigation */}
        <nav className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">Q</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  QuickShift
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors duration-300">How It Works</a>
                <a href="#categories" className="text-white/80 hover:text-white transition-colors duration-300">Job Categories</a>
                <a href="#contact" className="text-white/80 hover:text-white transition-colors duration-300">Contact Us</a>
              </div>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href={userType === 'admin' ? '/admin' : userType === 'employer' ? '/employer' : '/undergraduate'}
                    className="px-4 py-2 text-sm bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/auth/login"
                    className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors duration-300"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/auth/register"
                    className="px-6 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Enhanced Hero Section */}
        <section className="min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                    Find Your
                    <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent block">
                      Perfect
                    </span>
                    Part-Time Job Today!
                  </h1>
                  
                  <div className="space-y-4">
                    <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                      Work. Earn. Succeed.
                    </p>
                    <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                      Connect with flexible job opportunities perfect for university students - from tutoring and freelancing to delivery and promotional work.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleFindJobs}
                  className="group relative px-8 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-3">
                    <span className="text-lg">
                      {isAuthenticated ? 'Go to Dashboard' : 'Find Jobs Now'}
                    </span>
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </div>
                </button>
              </div>

              {/* Right Image */}
              <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                <div className="relative">
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-3xl scale-110 animate-pulse"></div>
                  
                  {/* Glass morphism container */}
                  <div className="relative backdrop-blur-sm bg-white/5 p-6 rounded-3xl border border-white/20 hover:bg-white/10 transition-all duration-500">
                    {/* Image container with modern styling */}
                    <div className="relative overflow-hidden rounded-2xl">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 z-10"></div>
                      <Image
                        src="/Girl photo.png"
                        alt="A girl working on a laptop - QuickShift student success"
                        width={600}
                        height={690}
                        className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                        priority
                      />
                      
                      {/* Floating stats overlay */}
                      <div className="absolute top-6 left-6 z-20">
                        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-4 text-white">
                          <div className="text-2xl font-black">450+</div>
                          <div className="text-sm font-medium text-white/80">Jobs Available</div>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-6 right-6 z-20">
                        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-4 text-white">
                          <div className="text-2xl font-black">92%</div>
                          <div className="text-sm font-medium text-white/80">Success Rate</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-green-400 to-teal-500 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { value: "450+", label: "Open Opportunities", icon: "💼" },
                  { value: "1.2K+", label: "Students Employed", icon: "👥" },
                  { value: "92%", label: "Placement Rate", icon: "📈" },
                  { value: "3.5K+", label: "Active Students", icon: "🎓" }
                ].map((stat, index) => (
                  <div key={index} className="text-center space-y-4 group">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-3xl lg:text-4xl font-black text-white">
                      {stat.value}
                    </div>
                    <div className="text-white/70 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative backdrop-blur-sm bg-white/10 p-8 rounded-3xl border border-white/20">
                  <div className="aspect-square bg-gradient-to-br from-green-400 to-teal-600 rounded-2xl flex items-center justify-center">
                    <div className="text-white text-center space-y-4">
                      <div className="text-6xl">🤝</div>
                      <div className="text-xl font-bold">Connecting Students</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-cyan-400 font-medium uppercase tracking-wider">About Us</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                    Connecting Students with
                    <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent block">
                      Perfect Part-Time Opportunities
                    </span>
                  </h2>
                </div>

                <p className="text-lg text-white/70 leading-relaxed">
                  At QuickShift, we understand that university life requires financial flexibility. Our platform connects ambitious students with part-time job opportunities that fit their schedules. Whether you're looking to earn through tutoring, freelancing, delivery services, promotional work, or handbill distribution, we make it easy to find legitimate, student-friendly employment that works around your studies.
                </p>

                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Join Now'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Job Categories Section */}
        <section id="categories" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-white">
                Explore Our
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                  Job Categories
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {jobCategories.map((category, index) => (
                <div
                  key={index}
                  className="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="space-y-6">
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-r ${category.gradient} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                        {category.icon}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                        {category.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    <button
                      onClick={handleFindJobs}
                      className={`w-full py-3 bg-gradient-to-r ${category.gradient} text-white font-semibold rounded-xl opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-6 mb-16">
              <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <span className="text-cyan-400 font-medium uppercase tracking-wider">Testimonials</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white">
                Success Stories from Our
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent block">
                  Student Community
                </span>
              </h2>
            </div>

            <div className="relative">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 lg:p-12">
                <div className="space-y-8">
                  <div className="text-center space-y-6">
                    <div className="text-6xl">
                      {testimonials[activeTestimonial].avatar}
                    </div>
                    <blockquote className="text-xl lg:text-2xl text-white/90 italic leading-relaxed max-w-4xl mx-auto">
                      "{testimonials[activeTestimonial].quote}"
                    </blockquote>
                    <div className="space-y-2">
                      <div className="text-xl font-bold text-white">
                        {testimonials[activeTestimonial].name}
                      </div>
                      <div className="text-white/70">
                        {testimonials[activeTestimonial].role}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === activeTestimonial 
                            ? 'bg-white scale-125' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 lg:p-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                      Start Earning Today with
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                        QuickShift!
                      </span>
                    </h2>

                    <div className="space-y-4">
                      <p className="text-xl font-bold text-white">
                        Your next part-time job is just a click away!
                      </p>
                      <p className="text-lg text-white/70 leading-relaxed">
                        At QuickShift, we make it simple for university students to find flexible, well-paying part-time work that fits around their studies. Join thousands of students who are already earning money through our platform.
                      </p>
                    </div>

                    <button
                      onClick={handleGetStarted}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      {isAuthenticated ? 'Go to Dashboard' : 'Join Now'}
                    </button>
                  </div>

                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-orange-400 to-pink-600 rounded-3xl flex items-center justify-center">
                      <div className="text-white text-center space-y-4">
                        <div className="text-8xl">💪</div>
                        <div className="text-2xl font-bold">Empower Your Future</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="py-20 bg-black/50 backdrop-blur-xl border-t border-white/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Contact</h3>
                <div className="space-y-3 text-white/70">
                  <p>2972 Westheimer Rd. Santa Ana, Illinois 85486</p>
                  <p>support@quickshift.com</p>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">For Students</h3>
                <div className="space-y-3">
                  <Link href={isAuthenticated ? "/undergraduate" : "/auth/register?type=user"} className="block text-white/70 hover:text-white transition-colors duration-300">
                    Find Jobs
                  </Link>
                  <a href="#how-it-works" className="block text-white/70 hover:text-white transition-colors duration-300">How It Works</a>
                  <a href="#" className="block text-white/70 hover:text-white transition-colors duration-300">Success Stories</a>
                  <a href="#" className="block text-white/70 hover:text-white transition-colors duration-300">Support</a>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">For Employers</h3>
                <div className="space-y-3">
                  <Link href={isAuthenticated && userType === 'employer' ? "/employer" : "/auth/register?type=employer"} className="block text-white/70 hover:text-white transition-colors duration-300">
                    Post a Job
                  </Link>
                  <a href="#" className="block text-white/70 hover:text-white transition-colors duration-300">Terms of Service</a>
                  <a href="#" className="block text-white/70 hover:text-white transition-colors duration-300">Privacy Policy</a>
                  <a href="#" className="block text-white/70 hover:text-white transition-colors duration-300">About QuickShift</a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 mt-12 pt-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">Q</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  QuickShift
                </span>
              </div>
              <p className="text-white/50">© 2025 QuickShift. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.7s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}