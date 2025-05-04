"use client";

import { ChatInput } from "@/components/custom/chat-input";
import { Loader } from "@/components/custom/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { extractTextFromPDFUrl } from "@/lib/pdf";
import { PromptLab } from "@/lib/prompts";
import { CareerPathArraySchema, CareerPathSchema } from "@/lib/schemas";
import { generateAIResponseAction, getUserCV } from "@/lib/server";
import { AIMessage, CVInfo } from "@/lib/types";
import {
  ArrowRight,
  Award,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  GraduationCap,
  GraduationCapIcon,
  Loader2,
  Save,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export default function Page() {
  const [cv, setCV] = useState<CVInfo | null>(null);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [careers, setCareers] = useState<
    z.infer<typeof CareerPathSchema>[] | []
  >([]);

  const showSuggestions = false;
  const setShowSuggestions = () => {};

  useEffect(() => {
    (async function fetchCV() {
      const res = await getUserCV();

      if (res && res.success && res.data) {
        setCV(res.data);
      }

      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (text?: string) => {
    if (!text?.trim()) {
      toast.error("Cannot submit empty chat");
      return;
    }

    if (!cv) {
      toast.error("Resume not found");
      return;
    }

    setIsLoading(true);
    const pdfText = await extractTextFromPDFUrl(cv.ufsUrl);

    if (!pdfText) {
      toast.error("Resume not found");
      setIsLoading(false);
      return;
    }

    const promptLabs = new PromptLab();

    const messages: AIMessage[] = [
      {
        role: "user",
        content: promptLabs.getCareerPathPrompt(pdfText, question),
      },
    ];

    setQuestion("");
    const res = await generateAIResponseAction(messages);

    if (res && res.success && res.data) {
      try {
        const parsedJson = JSON.parse(stripJsonCodeBlock(res.data));
        const parsedAiRes = CareerPathArraySchema.safeParse(parsedJson);

        if (parsedAiRes.success) {
          setCareers(parsedAiRes.data);
        } else {
          toast.error("Invalid response format from AI");
          console.log(parsedAiRes.error);
        }
      } catch (e) {
        toast.error("Failed to parse AI response");
        console.log("JSON parse error:", e);
      }
    }

    setIsLoading(false);
  };

  function stripJsonCodeBlock(input: string): string {
    return input.replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1").trim();
  }

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  if (loading) {
    return (
      <div className="w-full h-fit">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-semibold">Career Path Finder</h1>
        <p className="text-sm text-gray-600 mb-4">
          Provide details about your skills, experience, education, interests,
          and career goals.
        </p>
      </div>

      <div className="flex flex-col" style={{ height: "calc(100dvh - 100px)" }}>
        {careers.length > 0 && (
          <div className="mx-auto max-w-3xl w-full mb-10">
            <h2 className="text-2xl font-medium mb-4">
              Recommended Career Paths
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {careers.map((path, index) => (
                <Card key={index} className="p-0 py-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium line-clamp-1">
                      {path.title}
                    </CardTitle>
                    <Badge>{path.domain}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-amber-500" /> Match:{" "}
                        {path.confidenceScore}/10
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-500" />{" "}
                        {path.estimatedTimeToEntry}
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        {formatSalary(path.salaryRangeUSD.min)} -{" "}
                        {formatSalary(path.salaryRangeUSD.max)}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-purple-600" />{" "}
                        {capitalize(path.growthOutlook)} growth
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 cursor-pointer"
                    >
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1 cursor-pointer"
                          onClick={() => setActive(index)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Details
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto p-0">
                        <div className="pt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-12 relative">
                          <div className="">
                            <Badge className="bg-white text-blue-600 font-medium">
                              {careers[active].domain}
                            </Badge>
                          </div>
                          <SheetHeader className="mb-2">
                            <SheetTitle className="text-2xl font-bold text-white">
                              {careers[active].title}
                            </SheetTitle>
                            <SheetDescription className="text-blue-100">
                              {careers[active].description}
                            </SheetDescription>
                          </SheetHeader>
                        </div>

                        <div className="px-6 -mt-6">
                          <div className="bg-white rounded-xl shadow-md p-4 mb-6 grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center text-blue-600 mb-1">
                                <Award className="h-5 w-5 mr-1" />
                                <span className="font-medium">Match Score</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xl font-bold">
                                  {careers[active].confidenceScore}
                                </span>
                                <span className="text-sm text-gray-500">
                                  /10
                                </span>
                              </div>
                              <Progress
                                value={careers[active].confidenceScore * 10}
                                className="h-1.5 w-full mt-1 bg-blue-100"
                              />
                            </div>

                            <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center text-green-600 mb-1">
                                <DollarSign className="h-5 w-5 mr-1" />
                                <span className="font-medium">
                                  Salary Range
                                </span>
                              </div>
                              <div className="text-sm font-medium">
                                {formatSalary(
                                  careers[active].salaryRangeUSD.min,
                                )}{" "}
                                -{" "}
                                {formatSalary(
                                  careers[active].salaryRangeUSD.max,
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg">
                              <div className="flex items-center text-amber-600 mb-1">
                                <Clock className="h-5 w-5 mr-1" />
                                <span className="font-medium">
                                  Time to Entry
                                </span>
                              </div>
                              <div className="text-sm font-medium">
                                {careers[active].estimatedTimeToEntry}
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center text-purple-600 mb-1">
                                <TrendingUp className="h-5 w-5 mr-1" />
                                <span className="font-medium">Growth</span>
                              </div>
                              <div className="text-sm font-medium capitalize">
                                {capitalize(careers[active].growthOutlook)}
                              </div>
                            </div>
                          </div>

                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                              <Award className="h-5 w-5 mr-2 text-amber-500" />
                              Why This Matches You
                            </h3>
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
                              <ul className="space-y-2">
                                {careers[active].relevanceReasons.map(
                                  (reason, i) => (
                                    <li key={i} className="flex items-start">
                                      <Check className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                                      <span>{reason}</span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                              <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                              Common Job Titles
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {careers[active].jobTitles.map((title, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
                                >
                                  {title}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                              <Check className="h-5 w-5 mr-2 text-green-600" />
                              Required Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {careers[active].requiredSkills.map(
                                (skill, i) => (
                                  <Badge
                                    key={i}
                                    className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 border-0"
                                  >
                                    {skill}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>

                          {careers[active].optionalSkills &&
                            careers[active].optionalSkills.length > 0 && (
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                                  <ChevronRight className="h-5 w-5 mr-2 text-purple-600" />
                                  Optional Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {careers[active].optionalSkills.map(
                                    (skill, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="px-3 py-1 text-purple-700 border-purple-200 hover:bg-purple-50"
                                      >
                                        {skill}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {careers[active].certifications &&
                            careers[active].certifications.length > 0 && (
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                                  <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                                  Recommended Certifications
                                </h3>
                                <div className="space-y-2">
                                  {careers[active].certifications.map(
                                    (cert, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center p-3 bg-indigo-50 rounded-lg"
                                      >
                                        <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                          <GraduationCapIcon className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <span className="font-medium text-gray-700">
                                          {cert}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                              <ArrowRight className="h-5 w-5 mr-2 text-gray-600" />
                              Related Career Paths
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {careers[active].relatedPaths.map(
                                (relatedPath, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  >
                                    {relatedPath}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        </div>

                        <SheetFooter className="px-6 py-4 border-t mt-4 flex justify-between gap-4">
                          <SheetClose asChild>
                            <Button
                              variant="outline"
                              className="flex-1 cursor-pointer"
                            >
                              Close
                            </Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mx-auto max-w-3xl w-full">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p>Thinking...</p>
            </div>
          </div>
        )}

        {!cv && (
          <Alert variant="destructive" className="mt-2 mx-auto max-w-3xl">
            <AlertDescription>
              Please upload your CV in the media page before generating a career
              path
            </AlertDescription>
          </Alert>
        )}

        <div className="w-full md:max-w-3xl mx-auto px-4 bg-background pt-5 pb-2 md:pb-6">
          <ChatInput
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
          />
        </div>
      </div>
    </>
  );
}
