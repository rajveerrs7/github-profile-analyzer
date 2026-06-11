import { Router } from "express";
import { pool } from "../config/db.js";
import { fetchUserProfile, fetchUserRepos } from "../services/github.js";

/**
 * Convert ISO 8601 date string (e.g. "2011-01-25T18:44:36Z") to MySQL DATETIME format.
 */
function toMySQLDate(iso) {
  if (!iso) return null;
  return iso.replace("T", " ").replace("Z", "");
}

const router = Router();

// ---------------------------------------------------------------
//  POST /api/analyze/:username — Analyze & store a GitHub profile
// ---------------------------------------------------------------
router.post("/analyze/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // 1. Fetch data from GitHub API
    const [profile, repos] = await Promise.all([
      fetchUserProfile(username),
      fetchUserRepos(username),
    ]);

    // 2. Compute insights
    const totalStars = repos.reduce(
      (sum, r) => sum + (r.stargazers_count || 0),
      0,
    );
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    const languageMap = {};
    repos.forEach((r) => {
      if (r.language) {
        languageMap[r.language] = (languageMap[r.language] || 0) + 1;
      }
    });
    const topLanguages = Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // 3. Upsert into MySQL
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        "SELECT id FROM profiles WHERE username = ?",
        [username],
      );

      let profileId;
      const profileData = [
        profile.name || null,
        profile.bio || null,
        profile.avatar_url || null,
        profile.html_url || null,
        profile.blog || null,
        profile.company || null,
        profile.location || null,
        profile.email || null,
        profile.twitter_username || null,
        profile.public_repos || 0,
        profile.public_gists || 0,
        profile.followers || 0,
        profile.following || 0,
        totalStars,
        totalForks,
        toMySQLDate(profile.created_at),
        toMySQLDate(profile.updated_at),
        profile.hireable ? 1 : 0,
      ];

      if (rows.length > 0) {
        // Update existing
        profileId = rows[0].id;
        await conn.query(
          `UPDATE profiles SET
                        name=?, bio=?, avatar_url=?, html_url=?, blog=?, company=?,
                        location=?, email=?, twitter_username=?, public_repos=?,
                        public_gists=?, followers=?, following=?, total_stars=?,
                        total_forks=?, account_created_at=?, account_updated_at=?,
                        hireable=?, last_analyzed_at=NOW()
                    WHERE id=?`,
          [...profileData, profileId],
        );
        // Clear old languages
        await conn.query("DELETE FROM profile_languages WHERE profile_id = ?", [
          profileId,
        ]);
      } else {
        // Insert new
        const [result] = await conn.query(
          `INSERT INTO profiles
                        (username, name, bio, avatar_url, html_url, blog, company,
                         location, email, twitter_username, public_repos, public_gists,
                         followers, following, total_stars, total_forks,
                         account_created_at, account_updated_at, hireable, last_analyzed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [username, ...profileData],
        );
        profileId = result.insertId;
      }

      // Insert languages
      if (topLanguages.length > 0) {
        const langValues = topLanguages.map(([lang, count]) => [
          profileId,
          lang,
          count,
        ]);
        await conn.query(
          "INSERT INTO profile_languages (profile_id, language, repo_count) VALUES ?",
          [langValues],
        );
      }

      // 4. Return the saved profile
      const [saved] = await conn.query("SELECT * FROM profiles WHERE id = ?", [
        profileId,
      ]);
      const [langs] = await conn.query(
        "SELECT language, repo_count FROM profile_languages WHERE profile_id = ? ORDER BY repo_count DESC",
        [profileId],
      );

      res.json({
        success: true,
        data: { ...saved[0], top_languages: langs },
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res
        .status(404)
        .json({ success: false, message: "GitHub user not found" });
    }
    if (err.response && err.response.status === 403) {
      return res
        .status(429)
        .json({
          success: false,
          message: "GitHub API rate limit exceeded. Try again later.",
        });
    }
    console.error("Analyze error:", err.message || err);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: err.message || String(err),
      });
  }
});

// ---------------------------------------------------------------
//  GET /api/profiles — List all stored analyzed profiles
// ---------------------------------------------------------------
router.get("/profiles", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      "SELECT username, name, avatar_url, public_repos, followers, total_stars, last_analyzed_at FROM profiles ORDER BY last_analyzed_at DESC LIMIT ? OFFSET ?",
      [parseInt(limit), offset],
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM profiles",
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ---------------------------------------------------------------
//  GET /api/profiles/:username — Get single profile details
// ---------------------------------------------------------------
router.get("/profiles/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM profiles WHERE username = ?",
      [username],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Profile not found. Use POST /api/analyze/:username first.",
        });
    }

    const [langs] = await pool.query(
      "SELECT language, repo_count FROM profile_languages WHERE profile_id = ? ORDER BY repo_count DESC",
      [rows[0].id],
    );

    res.json({
      success: true,
      data: { ...rows[0], top_languages: langs },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
