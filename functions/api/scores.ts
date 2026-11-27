import {
  createScore,
  listScores,
  optionsResponse,
  type ScoreEnv,
} from "../../src/api/scores";

type PagesContext = EventContext<ScoreEnv, string, unknown>;

export const onRequestOptions: PagesFunction<ScoreEnv> = async () => optionsResponse();

export const onRequestGet: PagesFunction<ScoreEnv> = async (context: PagesContext) => {
  try {
    return await listScores(context.env);
  } catch (err) {
    console.error(JSON.stringify({ event: "scores_get_error", err: String(err) }));
    return new Response(JSON.stringify({ error: "Failed to load scores" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestPost: PagesFunction<ScoreEnv> = async (context: PagesContext) => {
  try {
    return await createScore(context.request, context.env);
  } catch (err) {
    console.error(JSON.stringify({ event: "scores_post_error", err: String(err) }));
    return new Response(JSON.stringify({ error: "Failed to save score" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
