import catchAsync from "@/utils/catchAsync";
import pick from "@/utils/pick";
import { status as httpStatus } from "http-status";
import ApiError from "@/utils/ApiError";
import { EvaluationLevel } from "@/generated/prisma";
import transporter from "@/utils/nodemailer";
import env from "@/config/env";
import { LEVEL_MAP, STEP_MAP } from "@/constants";
import submissionService from "./submission.service";
import configService from "../config/config.service";

const createSubmission = catchAsync(async (req, res) => {
  const data = req.body;
  data.submittedById = res.locals.user.id;
  const newAccessToken = res.locals.accessToken;

  const response = await submissionService.createSubmission(data);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Submission created successfully",
    data: response,
    newAccessToken,
  });
});

const getSubmissionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newAccessToken = res.locals.accessToken;

  const response = await submissionService.getSubmissionById(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission fetched successfully",
    data: response,
    newAccessToken,
  });
});

const getPaginatedSubmissions = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["search", "step", "level"]);
  const options = pick(req.query, ["sort_by", "sort_order", "limit", "page"]);
  const newAccessToken = res.locals.accessToken;

  if (res.locals.user.role === "STUDENT")
    filters.submittedById = res.locals.user.id;

  const response = await submissionService.getPaginatedSubmissions(
    filters,
    options,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submissions fetched successfully",
    data: response,
    newAccessToken,
  });
});

const updateSubmission = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const newAccessToken = res.locals.accessToken;

  const submission = await submissionService.getSubmissionById(id);

  if (!submission)
    throw new ApiError(httpStatus.NOT_FOUND, "Submission not found");
  if (res.locals.user.role === "STUDENT") {
    const config = await configService.getConfig();

    const deadline =
      new Date(submission.createdAt).getTime() +
      config!.examLengthInMinutes * 60 * 1000;

    if (new Date().getTime() > new Date().setTime(deadline))
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Submission deadline has passed. Refresh the page to return to the submission list.",
      );

    if (
      submission.submittedById !== res.locals.user.id ||
      data.questionsAndAnswers?.find((q: Record<string, unknown>) => q.correct)
    )
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to update this submission",
      );
  } else {
    data.examinedById = res.locals.user.id;

    // Use the incoming QA list if provided; otherwise fall back to current
    const qa: Array<{ correct?: boolean }> =
      (data.questionsAndAnswers as any[]) ??
      (submission.questionsAndAnswers as any[]);

    const total = 44;
    const correctCount = qa.reduce(
      (acc, cur) => (cur?.correct ? acc + 1 : acc),
      0,
    );
    const pct = total ? (correctCount / total) * 100 : 0;

    let level: EvaluationLevel;
    if (pct < 25) {
      level = EvaluationLevel.FAIL;
    } else if (pct < 50) {
      level = EvaluationLevel.ONE;
    } else if (pct < 75) {
      level = EvaluationLevel.TWO;
    } else {
      level = EvaluationLevel.READY_TO_PROCEED;
    }

    data.level = level;
  }

  const response = await submissionService.updateSubmission(id, data);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission updated successfully",
    data: response,
    newAccessToken,
  });
});

const deleteSubmission = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newAccessToken = res.locals.accessToken;

  const response = await submissionService.deleteSubmission(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Submission deleted successfully",
    data: response,
    newAccessToken,
  });
});

const sendCertificate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newAccessToken = res.locals.accessToken;

  const submission = await submissionService.getSubmissionById(id);
  if (submission?.submittedById !== res.locals.user.id)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You do not have permission to download this certificate",
    );
  if (!submission || !submission.level || submission.level === "FAIL")
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot send certificate for a pending or failed submission",
    );

  const mail = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 8px; padding: 30px; border: 1px solid #e5e5e5;">
      <h2 style="text-align: center; color: #2e7d32; margin-bottom: 10px;">Certificate of Completion</h2>
      <p style="text-align: center; font-size: 14px; color: #666; margin-top: 0;">
        Issued on ${new Date(submission.updatedAt).toLocaleDateString()}
      </p>
      <hr style="margin: 20px 0;">

      <p style="font-size: 16px;">This is to certify that</p>
      <h3 style="margin: 10px 0; font-size: 20px; color: #333;">
        ${submission.submittedBy.name}
      </h3>
      <p style="font-size: 14px; color: #555;">
        Email: ${submission.submittedBy.email}
      </p>

      <p style="font-size: 16px; margin-top: 20px;">
        has successfully completed <strong>Evaluation Step ${STEP_MAP[submission.step]}</strong> 
        with the level: <strong>${submission.step}${LEVEL_MAP[submission.level]}</strong>.
      </p>

      ${submission.examinedBy
      ? `
          <p style="font-size: 14px; color: #555; margin-top: 10px;">
            Evaluated by: ${submission.examinedBy.name} (${submission.examinedBy.email})
          </p>
          `
      : ""
    }

      <div style="margin-top: 30px; text-align: center;">
        <p style="font-size: 14px; color: #777;">Congratulations on your achievement!</p>
      </div>
    </div>
  </div>
`;
  await transporter.sendMail({
    from: env.email.user,
    to: submission.submittedBy.email,
    subject: "Certificate of Completion",
    html: mail,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: "Certificate sent successfully",
    newAccessToken,
  });
});

const submissionController = {
  createSubmission,
  getSubmissionById,
  getPaginatedSubmissions,
  updateSubmission,
  deleteSubmission,
  sendCertificate,
};
export default submissionController;
