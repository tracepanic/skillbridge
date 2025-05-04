"use client";

import { Header } from "@/components/custom/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Brain, Briefcase, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: <Brain className="h-8 w-8 text-purple-600" />,
    title: "AI Skill Discovery",
    text: "Identify trending skills and career opportunities relevant to your goals using AI market analysis.",
  },
  {
    icon: <Briefcase className="h-8 w-8 text-purple-600" />,
    title: "Intelligent Job Matching",
    text: "Connect directly with personalized job listings within the platform, matched to your unique skill profile.",
  },
  {
    icon: <Bot className="h-8 w-8 text-purple-600" />,
    title: "Personalized AI Assistant",
    text: "Get real-time guidance, learning resources, and support throughout your entire skill development journey.",
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-purple-600" />,
    title: "AI-Powered Interview Prep",
    text: "Practice realistic mock interviews tailored to specific roles and receive instant AI-driven feedback.",
  },
];

export default function Page() {
  return (
    <>
      <Header />

      <div className="fixed inset-0 z-[-10] overflow-hidden">
        <Image
          src="/hero.svg"
          alt=""
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <section className="relative z-10 flex min-h-dvh items-center justify-center text-center px-4 overflow-hidden">
        <div className="container mx-auto px-4 max-w-3xl py-10">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6"
          >
            Empower Your Future with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
              AI-Driven Skills
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10"
          >
            SkillBridge uses cutting-edge AI to help you discover in-demand
            skills, find matching jobs, and ace your interviews.
          </motion.p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button size="lg" asChild className="shadow-lg">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-28 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            How SkillBridge Leverages AI
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Our platform integrates intelligent features to streamline your path
            to career success.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border/40 dark:bg-zinc-900/50">
                  <CardHeader className="items-center text-center pb-4">
                    <div className="p-3 rounded-full bg-primary/50 w-fit mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {feature.text}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 px-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-zinc-900 dark:to-black">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Ready to Build Your Future?
          </h3>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of others leveraging AI for career growth. Sign up
            today and unlock your potential.
          </p>
          <Button size="lg" asChild className="shadow-md">
            <Link href="/signup">
              Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
