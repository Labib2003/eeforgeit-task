import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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

  // evaluation session state
  const [started, setStarted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [done, setDone] = useState(false);

  // list student’s submissions (max 3)
  const fetchSubmissions = async () => {
    try {
      const res = await axiosInstance.get("/submissions");
      const list = (res?.data?.data?.data as Submission[]) ?? [];
      setSubs(list);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to load submissions");
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [refetch]);

  // start or retake a step
  const startEvaluation = async (targetStep: string) => {
    try {
      // 1) fetch 22 questions for the target step
      const qRes = await axiosInstance.get("/questions", {
        params: { page: 1, limit: 22, step: targetStep },
      });
      const fetched: Question[] = qRes?.data?.data?.data ?? [];
      if (!fetched.length) {
        toast.error(`No questions found for ${targetStep}`);
        return;
      }

      // 2) create submission with first question + empty answer (satisfy min(1))
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
      if (!newId) {
        toast.error("Failed to create submission.");
        return;
      }

      // init evaluation session state
      setStep(targetStep);
      setSubmissionId(newId);
      setQuestions(fetched);
      setAnswers([]); // local answered list
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

  // submit current answer and append (PATCH) then advance
  const submitCurrentAnswer = async () => {
    if (!submissionId) return;

    try {
      const answerText = (currentAnswer || "").trim();

      const newAnswers = [...answers, answerText];

      // build full appended questionsAndAnswers using duplicated question content
      const questionsAndAnswers = questions
        .slice(0, newAnswers.length)
        .map((q, i) => ({
          question: q.question,
          imageUrl: q.imageUrl || undefined,
          answer: newAnswers[i] ?? "",
        }));

      await axiosInstance.patch(`/submissions/${submissionId}`, {
        questionsAndAnswers,
      });

      setAnswers(newAnswers);

      // advance or finish
      if (newAnswers.length >= questions.length) {
        setDone(true);
        setStarted(false); // end the inline session UI
        setRefetch((p) => !p); // refresh the list
        toast.success("All answers submitted for this step.");
      } else {
        setCurrentAnswer("");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save answer");
    }
  };

  const hasAny = subs.length > 0;
  const currentIndex = answers.length; // 0-based
  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Evaluate</h1>

      {/* Inline evaluation UI (one question at a time) */}
      {started && submissionId && step && currentQ ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {step} • Question {currentIndex + 1} / {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">{currentQ.question}</p>
              {currentQ.imageUrl && (
                <div className="rounded border p-2">
                  <a
                    href={currentQ.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline"
                  >
                    View attached image
                  </a>
                </div>
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

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Submission: {submissionId.slice(0, 8)}…
              </div>
              <Button onClick={submitCurrentAnswer}>Submit & Next</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {!hasAny ? (
            <Card>
              <CardHeader>
                <CardTitle>No submissions yet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You don’t have any submissions. Start with Step 1.
                </p>
                <Button onClick={() => startEvaluation(STEP_1)}>
                  Evaluate Step 1
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Retake</strong> will delete the old submission for
                  that step and create a new one.
                </p>

                <div className="space-y-3">
                  {subs.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{s.step}</div>
                        <div className="text-sm font-medium">
                          {s.level || "Pending"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(s.updatedAt).toLocaleString()} •{" "}
                          {s.questionsAndAnswers.length} Qs
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => startEvaluation(s.step)}
                        >
                          Retake
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="space-x-2">
                    {!subs[1] && (
                      <Button
                        onClick={() => {
                          startEvaluation(STEP_2);
                        }}
                      >
                        Evaluate Step 2
                      </Button>
                    )}
                    {!subs[2] && (
                      <Button
                        onClick={() => {
                          startEvaluation(STEP_3);
                        }}
                      >
                        Evaluate Step 3
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {done && (
            <p className="text-sm text-green-700">
              Finished the last evaluation. You can retake from the list above.
            </p>
          )}
        </>
      )}
    </div>
  );
}
