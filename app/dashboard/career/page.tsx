"use client";

import { Loader } from "@/components/custom/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { fetchCareerPaths } from "@/lib/server";
import { CareerPath } from "@/lib/types";
import { capitalize, formatSalary } from "@/lib/utils";
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
  Info,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setAtive] = useState(0);

  useEffect(() => {
    (async function fetchCareers() {
      const res = await fetchCareerPaths();

      if (res && res.data) {
        setCareers(res.data);
      } else {
        toast.error("Failed to load careers");
      }

      setLoading(false);
    })();
  }, []);

  const handleGenerateCourse = async (id: number) => {
    console.log(id);
    toast.error("Under development");
  };

  const handleDeleteCareer = async (id: number) => {
    console.log(id);
    toast.error("Under development");
  };

  const activeCareer = active ? careers.find((c) => c.id === active) : null;

  if (loading) {
    return (
      <div className="w-full h-fit">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-semibold mb-6">Saved Career Paths</h1>

      {careers.length === 0 ? (
        <Alert className="mx-auto max-w-2xl">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-xl font-semibold">
            No Saved Careers Yet!
          </AlertTitle>
          <AlertDescription>
            You haven't saved any career paths. Create your own career paths
            under Career {`>`} Generate page and save the ones that interest
            you.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.map((path) => (
            <Card key={path.id} className="p-0 py-2 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium line-clamp-1">
                  {path.title}
                </CardTitle>
                <Badge variant="secondary">{path.domain}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
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
                    {formatSalary(path.salaryRangeMin)} -{" "}
                    {formatSalary(path.salaryRangeMax)}
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
                  onClick={() => handleGenerateCourse(path.id)}
                >
                  <Wand2 className="h-4 w-4 mr-1" /> Generate Course
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      className="flex-1 cursor-pointer"
                      onClick={() => setAtive(path.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                  </SheetTrigger>
                  {activeCareer && activeCareer.id === path.id && (
                    <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto p-0 flex flex-col">
                      <div className="pt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-12 relative">
                        <Badge className="bg-white text-blue-600 font-medium">
                          {activeCareer.domain}
                        </Badge>
                        <SheetHeader className="mb-2 text-left">
                          <SheetTitle className="text-2xl font-bold text-white">
                            {activeCareer.title}
                          </SheetTitle>
                          <SheetDescription className="text-blue-100">
                            {activeCareer.description}
                          </SheetDescription>
                        </SheetHeader>
                      </div>
                      <div className="px-6 -mt-6 overflow-y-auto flex-grow pb-6">
                        <div className="bg-white rounded-xl shadow-md p-4 mb-6 grid grid-cols-2 gap-4">
                          <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center text-blue-600 mb-1">
                              <Award className="h-5 w-5 mr-1" />
                              <span className="font-medium text-xs sm:text-sm">
                                Match Score
                              </span>
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-xl font-bold">
                                {activeCareer.confidenceScore}
                              </span>
                              <span className="text-sm text-gray-500">/10</span>
                            </div>
                            <Progress
                              value={activeCareer.confidenceScore * 10}
                              className="h-1.5 w-full mt-1 bg-blue-100"
                            />
                          </div>
                          <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center text-green-600 mb-1">
                              <DollarSign className="h-5 w-5 mr-1" />
                              <span className="font-medium text-xs sm:text-sm">
                                Salary Range (USD)
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-center">
                              {formatSalary(activeCareer.salaryRangeMin)} -{" "}
                              {formatSalary(activeCareer.salaryRangeMax)}
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg">
                            <div className="flex items-center text-amber-600 mb-1">
                              <Clock className="h-5 w-5 mr-1" />
                              <span className="font-medium text-xs sm:text-sm">
                                Time to Entry
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-center">
                              {activeCareer.estimatedTimeToEntry}
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center text-purple-600 mb-1">
                              <TrendingUp className="h-5 w-5 mr-1" />
                              <span className="font-medium text-xs sm:text-sm">
                                Growth
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-medium capitalize">
                              {capitalize(activeCareer.growthOutlook)}
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                            <Award className="h-5 w-5 mr-2 text-amber-500" />
                            Why This Matches You
                          </h3>
                          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
                            <ul className="space-y-2 text-sm">
                              {activeCareer.relevanceReasons.map(
                                (reason, i) => (
                                  <li key={i} className="flex items-start">
                                    <Check className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
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
                            {activeCareer.jobTitles.map((title, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
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
                            {activeCareer.requiredSkills.map((skill, i) => (
                              <Badge
                                key={i}
                                className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 border-0 text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {activeCareer.optionalSkills &&
                          activeCareer.optionalSkills.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                                <ChevronRight className="h-5 w-5 mr-2 text-purple-600" />
                                Optional Skills
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {activeCareer.optionalSkills.map((skill, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="px-3 py-1 text-purple-700 border-purple-200 hover:bg-purple-50 text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {activeCareer.certifications &&
                          activeCareer.certifications.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                                <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                                Recommended Certifications
                              </h3>
                              <div className="space-y-2">
                                {activeCareer.certifications.map((cert, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center p-3 bg-indigo-50 rounded-lg"
                                  >
                                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                      <GraduationCapIcon className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm">
                                      {cert}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                            <ArrowRight className="h-5 w-5 mr-2 text-gray-600" />
                            Related Career Paths
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {activeCareer.relatedPaths.map((relatedPath, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs"
                              >
                                {relatedPath}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <SheetFooter className="px-6 py-4 border-t mt-auto gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full cursor-pointer"
                          onClick={() => handleDeleteCareer(activeCareer.id)}
                          // disabled={deletingId === activeCareer.id} // Disable only this button while deleting
                        >
                          Delete
                        </Button>
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full cursor-pointer"
                          >
                            Close
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  )}
                </Sheet>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
