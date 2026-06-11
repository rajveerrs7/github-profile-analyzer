import axios from 'axios';

const BASE_URL = 'https://api.github.com';

function githubHeaders() {
    return {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'github-profile-analyzer/1.0',
    };
}

/**
 * Fetch a GitHub user's public profile
 */
async function fetchUserProfile(username) {
    const { data } = await axios.get(`${BASE_URL}/users/${username}`, {
        headers: githubHeaders(),
    });
    return data;
}

/**
 * Fetch all public repos for a user (up to 300 for free tier safety)
 */
async function fetchUserRepos(username) {
    const repos = [];
    let page = 1;
    while (page <= 3) {
        const { data } = await axios.get(`${BASE_URL}/users/${username}/repos`, {
            headers: githubHeaders(),
            params: { per_page: 100, page, sort: 'updated' },
        });
        if (!data.length) break;
        repos.push(...data);
        page++;
    }
    return repos;
}

export { fetchUserProfile, fetchUserRepos };