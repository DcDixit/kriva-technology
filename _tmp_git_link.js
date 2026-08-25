const fs = require("fs");
const path = require("path");
const auth = JSON.parse(
  fs.readFileSync(path.join(process.env.APPDATA, "xdg.data", "com.vercel.cli", "auth.json"), "utf8")
);
const token = auth.token || auth.accessToken;
const teamId = "team_LMjrJOibWRv5QUzrlXaC9PPA";

async function api(method, url, body) {
  const res = await fetch("https://api.vercel.com" + url, {
    method,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

(async () => {
  const q = "?teamId=" + teamId;
  const link = await api("POST", "/v9/projects/kriva-v2/link" + q, {
    type: "github",
    repo: "DcDixit/kriva-technology",
  });
  const err = link.json.error || link.json;
  console.log("LINK", link.status);
  console.log(JSON.stringify(err, null, 2).slice(0, 2000));

  const searches = [
    "/v1/integrations/search-repo?query=kriva-technology&teamId=" + teamId,
    "/v1/integrations/search-repo?query=kriva&host=github.com&teamId=" + teamId,
    "/v9/integrations/github/repos?search=kriva&teamId=" + teamId,
    "/v1/integrations/git-repos?host=github.com&teamId=" + teamId,
  ];
  for (const u of searches) {
    const r = await api("GET", u);
    const preview = JSON.stringify(r.json).slice(0, 400);
    console.log("GET", r.status, u.split("?")[0], preview);
  }
})();
