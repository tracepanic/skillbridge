"use client";

import { motion } from "framer-motion";
import { FaBrain, FaBriefcase, FaRobot, FaComments } from "react-icons/fa";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 font-sans">
      {/* Hero Section */}
      <section className="text-center px-6 py-20 relative overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl sm:text-6xl font-extrabold text-gray-800 leading-tight"
        >
          Empowering Communities with{" "}
          <span className="text-purple-600">AI-Powered</span> Skill Building
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-600 mt-6 max-w-xl mx-auto"
        >
          SkillBridge helps you discover in-demand skills, match with jobs, and
          prepare for interviews — all powered by cutting-edge AI.
        </motion.p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10"
        >
          <Link
            href="/signup"
            className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-6 py-3 rounded-full shadow-lg transition"
          >
            Get Started
          </Link>
        </motion.div>

        {/* Animated AI Background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 0.15, y: 0 }}
            transition={{ duration: 2 }}
            className="absolute w-full h-full bg-[url('/ai-bg.svg')] bg-cover bg-center"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          How SkillBridge Uses AI
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {[
            {
              icon: <FaBrain />,
              title: "Skill Discovery",
              text: "Identify skills that are trending in the job market.",
            },
            {
              icon: <FaBriefcase />,
              title: "Job Matching",
              text: "Connect with jobs on LinkedIn, Upwork and more.",
            },
            {
              icon: <FaRobot />,
              title: "AI Assistant",
              text: "Get real-time help with your learning journey.",
            },
            {
              icon: <FaComments />,
              title: "Interview Prep",
              text: "AI-powered mock interviews and tips.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all text-center"
            >
              <div className="text-4xl text-purple-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="text-center py-16 bg-purple-50">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Join the movement. Build your future today.
        </h3>
        <Link
          href="/signup"
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg shadow-lg transition"
        >
          Sign Up Now
        </Link>
      </section>
    </div>
  );
}
