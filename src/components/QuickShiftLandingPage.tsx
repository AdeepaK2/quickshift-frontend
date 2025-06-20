"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function QuickShiftLandingPage() {
  const { isAuthenticated, userType, logout } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect to appropriate dashboard
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

  return (
    <div className="flex overflow-hidden flex-col bg-white">
      <div className="flex flex-col pr-5 pl-12 w-full max-md:pl-5 max-md:max-w-full">
        {/* Header Navigation */}
        <div className="flex flex-wrap gap-5 justify-between w-full text-sm font-medium max-w-[1314px] text-neutral-600 max-md:max-w-full">          
          <Image
            src="/bird_2.jpg"
            alt="QuickShift Logo"
            width={150}
            height={88}
            className="object-contain shrink-0 max-w-full aspect-[1.7] w-[150px]"
            priority
          />
          <div className="flex flex-wrap gap-8 items-center self-start mt-3.5 max-md:max-w-full">
            <div className="grow self-stretch my-auto text-neutral-600 hover:text-[#0077B6] cursor-pointer transition-colors">
              How It Works
            </div>
            <div className="self-stretch my-auto text-neutral-600 hover:text-[#0077B6] cursor-pointer transition-colors">
              Job Categories
            </div>
            <div className="self-stretch my-auto text-neutral-600 hover:text-[#0077B6] cursor-pointer transition-colors">
              Contact Us
            </div>
            
            {/* Conditional Navigation based on auth status */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link 
                  href={userType === 'admin' ? '/admin' : userType === 'employer' ? '/employer' : '/undergraduate'}
                  className="gap-2.5 self-stretch p-2.5 text-xs text-center rounded-md text-[#0077B6] hover:bg-blue-50 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="gap-2.5 self-stretch p-2.5 text-xs text-center bg-red-600 rounded-md shadow-sm text-slate-50 hover:bg-red-700 transition-colors w-[80px]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/auth/login"
                  className="gap-2.5 self-stretch p-2.5 w-16 text-xs text-center rounded-md text-neutral-600 hover:text-[#0077B6] hover:bg-blue-50 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/register"
                  className="gap-2.5 self-stretch p-2.5 text-xs text-center bg-sky-600 rounded-md shadow-sm text-slate-50 hover:bg-sky-700 transition-colors w-[80px]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="self-end mt-15 w-full max-w-[1339px] max-md:mt-10 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col max-md:">
            <div className="w-6/12 max-md:ml-0 max-md:w-full">
              <div className="flex flex-col pb-3 mt-16 w-full max-md:mt-10 max-md:max-w-full ">
                <div className="max-md:max-w-full">
                  <div className={`text-5xl font-bold text-stone-900 max-md:max-w-full max-md:text-4xl transition-all duration-700 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                    Find Your Perfect Part-Time Job Today!
                  </div>
                  <div className={`mt-10 pb-10 text-2xl text-black max-md:max-w-full transition-all duration-700 delay-200 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                    <p className="text-4xl font-bold mb-10">
                      Work. Earn. Succeed.
                    </p>
                 
                    <div className={"mt-0"}>
                    
                    <span className="text-base">
                      Connect with flexible job opportunities perfect for university students - from tutoring and freelancing to delivery and promotional work.
                    </span>

                    </div>
                   
                  </div>
                </div>
                
                {/* CTA Button */}
                <button
                  onClick={handleFindJobs}
                  className={`flex gap-2 justify-center items-center self-start px-6 py-5 mt-16 text-lg font-semibold leading-none text-white bg-sky-600 rounded-2xl shadow-sm hover:bg-sky-700 transition-all duration-300 hover:scale-105 max-md:mt-10 ${isVisible ? 'animate-fade-in-up delay-500' : 'opacity-0'}`}
                >
                  <div className="self-stretch my-auto text-white">
                    {isAuthenticated ? 'Go to Dashboard' : 'Find Jobs Now'}
                  </div>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </button>

              
              </div>
            </div>
            <div className="ml-5 w-6/12 max-md:ml-0 max-md:w-full">
              <Image
                src="/Girl photo.png"
                className={`grow w-full aspect-[0.98] max-md:mt-10 max-md:max-w-full transition-all duration-700 delay-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
                alt="A girl working on a laptop"
                width={600}
                height={690}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex flex-col justify-center items-start px-16 py-16 w-full bg-cyan-100 max-md:px-5 max-md:max-w-full">
        <div className="px-20 py-14 max-w-full rounded-[200px] w-[1320px] max-md:px-5">
          <div className="flex gap-5 max-md:flex-col max-md:">
            <div className="w-9/12 max-md:ml-0 max-md:w-full">
              <div className="flex grow gap-5 justify-between leading-none text-sky-950 max-md:mt-10">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/30268fe193f6d4ce42d1af1c1042492e142e73bc?placeholderIfAbsent=true"
                  className="object-contain shrink-0 aspect-square rounded-[39px] w-[78px]"
                  alt="Open Opportunities icon"
                  width={78}
                  height={78}
                />
                <div className="flex flex-col my-auto">
                  <div className="self-start text-4xl font-bold">450+</div>
                  <div className="mt-7 text-lg">Open Opportunities</div>
                </div>
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/d9311bdf9014d2c9159e63f60430d4a53ac56d9a?placeholderIfAbsent=true"
                  className="object-contain shrink-0 aspect-square rounded-[39px] w-[78px]"
                  alt="Students Employed icon"
                  width={78}
                  height={78}
                />
                <div className="flex flex-col my-auto">
                  <div className="self-start text-4xl font-bold">1.2K+</div>
                  <div className="mt-7 text-lg">Students Employed</div>
                </div>
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/6b9b66fa873989f083fe0f017ee88389925ebbf4?placeholderIfAbsent=true"
                  className="object-contain shrink-0 aspect-square rounded-[39px] w-[78px]"
                  alt="Placement Rate icon"
                  width={78}
                  height={78}
                />
                <div className="flex flex-col my-auto">
                  <div className="self-start text-4xl font-bold">92%</div>
                  <div className="mt-7 text-lg">Placement Rate</div>
                </div>
              </div>
            </div>
            <div className="ml-5 w-3/12 max-md:ml-0 max-md:w-full">
              <div className="flex grow gap-5 leading-none text-sky-950 max-md:mt-10">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/8709b69cce85b3d079e8c6c9bf0810adf3fb225b?placeholderIfAbsent=true"
                  className="object-contain shrink-0 aspect-square rounded-[39px] w-[78px]"
                  alt="Active Students icon"
                  width={78}
                  height={78}
                />
                <div className="flex flex-col my-auto">
                  <div className="self-start text-4xl font-bold">3.5K+</div>
                  <div className="mt-7 text-lg">Active Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="self-center mt-24 w-full max-w-[1298px] max-md:mt-10 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col max-md:">
          <div className="w-6/12 max-md:ml-0 max-md:w-full">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Students working together on laptops"
              className="object-contain grow w-full aspect-[0.98] max-md:mt-10 max-md:max-w-full"
              width={800}
              height={800}
            />
          </div>
          <div className="ml-5 w-6/12 max-md:ml-0 max-md:w-full">
            <div className="flex flex-col mt-20 w-full max-md:mt-10 max-md:max-w-full">
              <div className="flex gap-1.5 self-start text-lg leading-loose text-cyan-500 uppercase">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/d08d92b7d1e75018b774046dc399ea474fcd93a6?placeholderIfAbsent=true"
                  className="object-contain shrink-0 w-3.5 aspect-[0.87]"
                  alt="About Us icon"
                  width={14}
                  height={14}
                />
                <div>about us</div>
              </div>
              <div className="flex flex-col items-start pl-1.5 mt-8 max-md:max-w-full">
                <div className="text-4xl font-bold leading-[50px] text-sky-950 max-md:max-w-full max-md:text-4xl max-md:leading-[49px]">
                  Connecting Students with Perfect Part-Time Opportunities
                </div>
                <div className="self-stretch mt-7 text-base leading-8 text-neutral-600 max-md:max-w-full">
                  At QuickShift, we understand that university life requires financial flexibility. Our platform connects ambitious students with part-time job opportunities that fit their schedules. Whether you&apos;re looking to earn through tutoring, freelancing, delivery services, promotional work, or handbill distribution, we make it easy to find legitimate, student-friendly employment that works around your studies.
                </div>
                <button
                  onClick={handleGetStarted}
                  className="px-16 py-6 mt-11 text-base leading-4 text-center text-white uppercase bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 transition-all duration-300 hover:scale-105 max-md:px-5 max-md:mt-10"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Join Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Categories Section */}
      <div className="flex flex-col px-7 pt-20 pb-40 mt-12 w-full bg-teal-200 bg-opacity-40 max-md:px-5 max-md:pb-24 max-md:mt-10 max-md:max-w-full">
        <div className="self-center text-5xl font-bold leading-none text-center text-sky-950 max-md:max-w-full max-md:text-4xl">
          Explore Our Job Categories
        </div>
        <div className="mt-24 mb-0 max-md:mt-10 max-md:mb-2.5 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col max-md:">
            {/* Job Category Cards */}
            {[
              {
                title: "Tutoring & Teaching",
                description: "Share your knowledge and earn money by tutoring fellow students.",
                icon: "0d1c9b10efd5ef7e0569d6a82bc09cb99ec4ae7b"
              },
              {
                title: "Freelancing & Remote Work", 
                description: "Flexible online work that fits your schedule perfectly.",
                icon: "06d35471050634b8a68f7ac8e71af600c2a80b2d"
              },
              {
                title: "Delivery & Distribution",
                description: "Earn money through food delivery and handbill distribution.",
                icon: "3c2d6fcdfa0195d2f066d6b9003de37b3483edf7"
              },
              {
                title: "Campus & Event Work",
                description: "Work at campus events, promotions, and university functions.",
                icon: "8f6c66c5bb131860440ec411f33afb40fe1f800b"
              }
            ].map((category, index) => (
              <div key={index} className="w-3/12 max-md:ml-0 max-md:w-full">
                <div className="flex flex-col items-center px-2 py-9 mx-auto w-full text-center bg-white rounded-3xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:shadow-lg transition-all duration-300 hover:scale-105 max-md:mt-10">
                  <Image
                    src={`https://cdn.builder.io/api/v1/image/assets/TEMP/${category.icon}?placeholderIfAbsent=true`}
                    className="object-contain max-w-full aspect-square rounded-[45px] w-[108px]"
                    alt={`${category.title} icon`}
                    width={108}
                    height={108}
                  />
                  <div className="mt-6 text-2xl font-bold leading-6 text-sky-950">
                    {category.title}
                  </div>
                  <div className="self-stretch mt-7 text-base leading-8 text-indigo-900">
                    {category.description}
                  </div>
                  <button
                    onClick={handleFindJobs}
                    className="flex gap-3.5 px-7 py-6 mt-11 max-w-full text-base tracking-normal leading-4 text-white bg-gradient-to-r from-sky-600 to-blue-600 rounded-[200px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:from-sky-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 w-[156px] max-md:mt-10"
                  >
                    <div>View Details</div>
                    <Image
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/5fa84eddbccfb8e58a2c48fc7fbe7610e214c7dd?placeholderIfAbsent=true"
                      className="object-contain shrink-0 aspect-[1.21] w-[17px]"
                      alt="View Details icon"
                      width={17}
                      height={17}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="flex z-10 flex-wrap gap-1.5 self-start mt-36 max-md:mt-10">
        <div className="flex shrink-0 self-end mt-56 w-10 rounded-3xl bg-sky-600 bg-opacity-0 h-[301px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:mt-10" />
        <div className="grow shrink-0 basis-0 w-fit max-md:max-w-full">
          <div className="flex flex-col pb-20 pl-11 w-full max-w-[1350px] max-md:pl-5 max-md:max-w-full">
            <div className="z-10 self-center mt-0 max-w-full w-[697px]">
              <div className="flex gap-5 max-md:flex-col max-md:">
                <div className="w-[24%] max-md:ml-0 max-md:w-full">
                  <div className="flex shrink-0 mx-auto w-60 rounded-full aspect-square bg-cyan-500 bg-opacity-20 h-[234px]" />
                </div>
                <div className="ml-5 w-[57%] max-md:ml-0 max-md:w-full">
                  <div className="flex flex-col mt-20 mr-0 text-center max-md:mt-10 max-md:max-w-full">
                    <div className="self-center px-6 py-3 max-w-full text-sm leading-loose text-cyan-500 uppercase whitespace-nowrap bg-white rounded-md w-[142px] max-md:px-5">
                      testimonial
                    </div>
                    <div className="mt-8 text-5xl font-bold leading-[59px] text-sky-950 max-md:max-w-full max-md:text-4xl max-md:leading-[58px]">
                      Success Stories from Our
                      <br />
                      Student Community.
                    </div>
                  </div>
                </div>
                <div className="ml-5 w-[19%] max-md:ml-0 max-md:w-full">
                  <div className="flex shrink-0 mx-auto mt-20 rounded-full bg-sky-600 bg-opacity-10 h-[195px] w-[195px] max-md:mt-10" />
                </div>
              </div>
            </div>

            {/* Testimonial Cards */}
            <div className="mt-8 max-md:mr-0 max-md:max-w-full">
              <div className="flex gap-5 max-md:flex-col max-md:">
                {[
                  {
                    quote: "QuickShift helped me find flexible tutoring opportunities that fit perfectly around my engineering classes. I've earned enough to cover my textbooks and even save for next semester!",
                    name: "Sarah Chen",
                    role: "Computer Science Student"
                  },
                  {
                    quote: "The delivery jobs through QuickShift are perfect for my schedule. I can work between classes and on weekends. The pay is fair and helps me cover my living expenses without stress.",
                    name: "Marcus Rodriguez", 
                    role: "Business Major"
                  },
                  {
                    quote: "I found amazing freelance graphic design projects through QuickShift. Working remotely allows me to build my portfolio while earning money for my art supplies and materials.",
                    name: "Emma Thompson",
                    role: "Art & Design Student"
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="w-[33%] max-md:ml-0 max-md:w-full">
                    <div className="grow pb-9 w-full text-lg bg-blue-50 rounded-3xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:shadow-lg transition-all duration-300 hover:scale-105 max-md:mt-10">
                      <Image
                        src={`https://cdn.builder.io/api/v1/image/assets/TEMP/${index === 0 ? 'cafe4f8ac438a458c3105fc1b0f1253c79858fc1' : index === 1 ? 'd36b16ce378eb0d3ead9e49471eedd39d398569f' : '9dd232a8d1db8bf453da9c1a927defe1085fd6bd'}?placeholderIfAbsent=true`}
                        className="object-contain aspect-[3] w-[51px]"
                        alt={`Success Story ${index + 1} icon`}
                        width={51}
                        height={51}
                      />
                      <div className="flex flex-col items-start px-8 mt-6 max-md:px-5">                      
                        <div className="self-stretch leading-8 text-neutral-700">
                          &quot;{testimonial.quote}&quot;
                        </div>
                        <div className="mt-6 text-xl font-bold leading-none text-sky-950">
                          {testimonial.name}
                        </div>
                        <div className="mt-5 leading-loose text-neutral-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-20 pt-32 pb-0.5 w-full bg-cyan-100 max-md:px-5 max-md:pt-24 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col max-md:">
          <div className="w-[56%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col max-md:mt-10 max-md:max-w-full">
              <div className="self-start text-5xl font-bold leading-[59px] text-sky-950 max-md:max-w-full max-md:text-4xl max-md:leading-[58px]">
                Start Earning Today with QuickShift!
              </div>
              <div className="flex flex-col pl-1.5 mt-11 max-md:mt-10 max-md:max-w-full">
                <div className="text-lg leading-8 text-neutral-600 max-md:max-w-full">
                  <span className="text-xl font-bold">
                    Your next part-time job is just a click away!
                  </span>
                  <br />
                  At QuickShift, we make it simple for university students to find flexible, well-paying part-time work that fits around their studies. Join thousands of students who are already earning money through our platform.
                </div>
                <button
                  onClick={handleGetStarted}
                  className="self-start px-16 py-6 mt-11 text-base leading-4 text-center text-white uppercase bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 transition-all duration-300 hover:scale-105 max-md:px-5 max-md:mt-10"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Join Now'}
                </button>
              </div>
            </div>
          </div>
          <div className="ml-5 w-[44%] max-md:ml-0 max-md:w-full">
            <Image
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Students earning money through part-time work"
              className="object-contain grow mt-20 w-full aspect-[0.83] max-md:mt-10 max-md:max-w-full"
              width={600}
              height={720}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-20 pt-20 pb-44 w-full bg-sky-600 bg-opacity-70 max-md:px-5 max-md:pb-24 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col max-md:">
          <div className="w-[33%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col font-medium max-md:mt-10">
              <div className="self-start text-2xl text-neutral-50">Contact</div>
              <div className="mt-10 text-base text-white max-md:mt-10">
                2972 Westheimer Rd. Santa Ana, Illinois 85486 <br />
                support@quickshift.com<br />
                +1 (555) 123-4567
              </div>
            </div>
          </div>
          <div className="ml-5 w-[33%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow text-base font-medium text-white max-md:mt-10">
              <div className="text-2xl text-neutral-50 max-md:mr-2.5">
                For Students
              </div>
              <Link href={isAuthenticated ? "/undergraduate" : "/auth/register?type=user"} className="self-start mt-9 hover:text-cyan-200 transition-colors">
                Find Jobs
              </Link>
              <div className="mt-7 hover:text-cyan-200 cursor-pointer transition-colors">How It Works</div>
              <div className="self-start mt-6 hover:text-cyan-200 cursor-pointer transition-colors">Success Stories</div>
              <div className="self-start mt-6 hover:text-cyan-200 cursor-pointer transition-colors">Support</div>
            </div>
          </div>
          <div className="ml-5 w-[33%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow items-start text-base font-medium text-white max-md:mt-10">
              <div className="text-2xl text-neutral-50">For Employers</div>
              <Link href={isAuthenticated && userType === 'employer' ? "/employer" : "/auth/register?type=employer"} className="self-stretch mt-9 hover:text-cyan-200 transition-colors">
                Post a Job
              </Link>
              <div className="mt-6 hover:text-cyan-200 cursor-pointer transition-colors">Terms of Service</div>
              <div className="mt-7 hover:text-cyan-200 cursor-pointer transition-colors">Privacy Policy</div>
              <div className="mt-7 hover:text-cyan-200 cursor-pointer transition-colors">About QuickShift</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}