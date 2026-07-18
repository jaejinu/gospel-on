import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SurveyForm from "@/components/survey/SurveyForm";
import { getSurveyTheme } from "@/components/survey/theme";

export const dynamic = "force-dynamic";

type SurveyQuestion = {
  id: string;
  label: string;
  type: string;
  options: string | null;
  isRequired: boolean;
  sortOrder: number;
  placeholder: string | null;
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  questions: SurveyQuestion[];
};

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!survey) {
    notFound();
  }

  if (survey.status !== "active") {
    const theme = getSurveyTheme(survey);
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.pageBg} ${theme.closedText}`}>
        <div className="text-center">
          <p className="text-6xl mb-4">{theme.headerEmoji}</p>
          <h1 className="text-2xl font-bold mb-2">설문이 종료되었습니다</h1>
          <p className="opacity-60">참여해주셔서 감사합니다!</p>
        </div>
      </div>
    );
  }

  const serialized: Survey = {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    status: survey.status,
    questions: survey.questions.map((q) => ({
      id: q.id,
      label: q.label,
      type: q.type,
      options: q.options,
      isRequired: q.isRequired,
      sortOrder: q.sortOrder,
      placeholder: q.placeholder,
    })),
  };

  return <SurveyForm survey={serialized} />;
}
