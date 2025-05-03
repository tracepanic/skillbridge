import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { FaBook, FaCertificate, FaChartBar } from "react-icons/fa";

export default async function Page() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Welcome back, {user.name}
        </h1>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Your Progress"
            description="You've completed 3 out of 5 courses. Keep it up!"
            icon={<FaChartBar size={28} className="text-blue-600" />}
          />
          <Card
            title="New Courses"
            description="Explore new community-focused courses."
            icon={<FaBook size={28} className="text-purple-600" />}
          />
          <Card
            title="Certificates"
            description="View and download your verified certificates."
            icon={<FaCertificate size={28} className="text-yellow-500" />}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Available Courses
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Basic Computer Skills", level: "Beginner" },
              { title: "Digital Marketing", level: "Intermediate" },
              { title: "Creative Thinking", level: "All Levels" },
            ].map((course, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all p-6 border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{course.level}</p>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm">
                  Start Course
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl">
      <div className="mb-3">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
