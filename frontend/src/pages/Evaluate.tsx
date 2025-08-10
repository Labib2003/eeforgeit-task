import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Timer from "@/components/custom/Timer";
import { LEVEL_MAP, STEP_MAP } from "@/constants";
import { AxiosError } from "axios";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

type Submission = {
  id: string;
  step: string;
  level?: string;
  questionsAndAnswers: {
    question: string;
    imageUrl?: string;
    answer: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

type Question = {
  id: string;
  question: string;
  competency: string;
  imageUrl?: string;
  step: string;
  level: string;
};

const STEP_1 = "A";
const STEP_2 = "B";
const STEP_3 = "C";

export default function EvaluatePage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [refetch, setRefetch] = useState(false);
  const [started, setStarted] = useState(false);
  const [submission, setSubmission] = useState<Submission>();
  const [step, setStep] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [done, setDone] = useState(false);
  const [config, setConfig] = useState<{ examLengthInMinutes: number }>();

  const fetchSubmissions = async () => {
    try {
      const res = await axiosInstance.get("/submissions");
      setSubs(res?.data?.data?.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load submissions");
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [refetch]);

  const startEvaluation = async (targetStep: string) => {
    try {
      const qRes = await axiosInstance.get("/questions", {
        params: { page: 1, limit: 44, step: targetStep },
      });
      const fetched: Question[] = qRes?.data?.data?.data ?? [];
      if (!fetched.length)
        return toast.error(`No questions found for ${targetStep}`);

      const seed = {
        question: fetched[0].question,
        imageUrl: fetched[0].imageUrl || undefined,
        answer: "",
      };
      const createRes = await axiosInstance.post("/submissions", {
        step: targetStep,
        questionsAndAnswers: [seed],
      });

      const newId: string | undefined = createRes?.data?.data?.id;
      if (!newId) return toast.error("Failed to create submission.");

      const configRes = await axiosInstance.get("/config");

      setStep(targetStep);
      setSubmission(createRes?.data?.data);
      setConfig(configRes?.data?.data);
      setQuestions(fetched);
      setAnswers([]);
      setCurrentAnswer("");
      setDone(false);
      setStarted(true);
      toast.message("Started evaluation", {
        description: "Answer and submit to move to the next question.",
      });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to start submission");
    }
  };

  const submitCurrentAnswer = async () => {
    if (!submission) return;

    try {
      const answerText = (currentAnswer || "").trim();
      const newAnswers = [...answers, answerText];

      const questionsAndAnswers = questions
        .slice(0, newAnswers.length)
        .map((q, i) => ({
          question: q.question,
          imageUrl: q.imageUrl || undefined,
          answer: newAnswers[i] ?? "",
        }));

      await axiosInstance.patch(`/submissions/${submission.id}`, {
        questionsAndAnswers,
      });

      setAnswers(newAnswers);

      if (newAnswers.length >= questions.length) {
        setDone(true);
        setStarted(false);
        setRefetch((p) => !p);
        toast.success("All answers submitted for this step.");
      } else {
        setCurrentAnswer("");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save answer");
    }
  };

  const currentIndex = answers.length;
  const currentQ = questions[currentIndex];
  const hasAny = subs.length > 0;

  return (
    <div className="mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Evaluate</h1>

      {started && submission && step && currentQ ? (
        <Card className="border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="flex flex-col items-center text-center gap-1">
              <Timer
                initialTimeRemaining={
                  (new Date(submission.createdAt).getTime() +
                    config!.examLengthInMinutes * 60 * 1000 -
                    new Date().getTime()) /
                  1000
                }
              />
              Step {step} • Question {currentIndex + 1} / {questions.length}
            </CardTitle>
            <div className="mt-2 flex items-center gap-2 rounded-md bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
              <AlertTriangle className="h-3 w-3" />
              Do not refresh or close this page — the exam will end immediately.
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-md bg-muted p-4 space-y-2">
              <p className="font-semibold">Topic: {currentQ.competency}</p>
              <p>{currentQ.question}</p>
              {currentQ.imageUrl && (
                <a
                  href={currentQ.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline text-primary"
                >
                  View attached image
                </a>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your answer</label>
              <Textarea
                rows={4}
                placeholder="Type your answer..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Submission: {submission.id.slice(0, 8)}…
              </span>
              <Button onClick={submitCurrentAnswer}>Submit & Next</Button>
            </div>
          </CardContent>
        </Card>
      ) : !hasAny ? (
        <Card className="border-dashed border-primary/30 text-center py-10">
          <CardHeader>
            <CardTitle className="text-lg">No submissions yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              You don’t have any submissions. Start with Step 1.
            </p>
            <Button onClick={() => startEvaluation(STEP_1)}>
              Evaluate Step 1
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="bg-muted/30">
            <CardTitle>Your submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              <strong>Retake</strong> will delete the old submission for that
              step and create a new one.
            </p>

            {subs.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border p-3 bg-white shadow-sm"
              >
                <div>
                  <div className="font-medium">
                    Submission for Step {STEP_MAP[s.step]}
                  </div>
                  <div className="flex items-center gap-1">
                    Result:
                    {s.level ? (
                      <>
                        <span
                          className={
                            s.level === "FAIL"
                              ? "text-red-600 flex items-center gap-1"
                              : "text-green-600 flex items-center gap-1"
                          }
                        >
                          {s.level === "FAIL" && (
                            <XCircle className="h-3 w-3" />
                          )}
                          {s.level !== "FAIL" && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {s.step}
                          {LEVEL_MAP[s.level]}
                        </span>
                      </>
                    ) : (
                      "Pending"
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.updatedAt).toLocaleString()} •{" "}
                    {s.questionsAndAnswers.length} Qs
                  </div>
                </div>

                <div className="flex flex-wrap justify-end items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        await axiosInstance.get(
                          `/submissions/${s.id}/certificate`,
                        );
                        toast.success("Certificate sent to your email.");
                      } catch (error) {
                        if (error instanceof AxiosError)
                          toast.error(
                            error.response?.data?.message ||
                              "Failed to send certificate.",
                          );
                        else
                          toast.error(
                            "Something went wrong while sending the certificate.",
                          );
                      }
                    }}
                  >
                    Get Certificate
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => startEvaluation(s.step)}
                  >
                    Retake
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-x-2 pt-2">
              {!subs[1] && (
                <Button onClick={() => startEvaluation(STEP_2)}>
                  Evaluate Step 2
                </Button>
              )}
              {!subs[2] && (
                <Button onClick={() => startEvaluation(STEP_3)}>
                  Evaluate Step 3
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {done && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
          Finished the last evaluation. You can retake from the list above.
        </p>
      )}
    </div>
  );
}
