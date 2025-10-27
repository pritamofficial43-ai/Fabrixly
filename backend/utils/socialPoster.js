import axios from "axios";

/**
 * Simple multi-platform poster.
 * NOTE: These are minimal examples — for production follow each platform's official SDK & app setup.
 */
export async function postToSocialPlatforms(content) {
  try {
    // Meta (Facebook Page / Instagram via page)
    if (process.env.META_ACCESS_TOKEN && process.env.META_PAGE_ID) {
      try {
        await axios.post(
          `https://graph.facebook.com/${process.env.META_PAGE_ID}/feed`,
          { message: content, access_token: process.env.META_ACCESS_TOKEN }
        );
      } catch (e) {
        console.error("Meta post error:", e?.response?.data || e.message || e);
      }
    }

    // X (Twitter) v2 simple tweet (no media)
    if (process.env.X_BEARER_TOKEN) {
      try {
        await axios.post(
          "https://api.twitter.com/2/tweets",
          { text: content },
          { headers: { Authorization: process.env.X_BEARER_TOKEN, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.error("X post error:", e?.response?.data || e.message || e);
      }
    }

    // LinkedIn UGC post (simple)
    if (process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PROFILE_ID) {
      try {
        await axios.post(
          "https://api.linkedin.com/v2/ugcPosts",
          {
            author: `urn:li:person:${process.env.LINKEDIN_PROFILE_ID}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: content },
                shareMediaCategory: "NONE"
              }
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
      } catch (e) {
        console.error("LinkedIn post error:", e?.response?.data || e.message || e);
      }
    }

    console.log("✅ Social post attempts completed for content length:", (content || "").length);
  } catch (err) {
    console.error("postToSocialPlatforms overall error:", err);
    throw err;
  }
}
