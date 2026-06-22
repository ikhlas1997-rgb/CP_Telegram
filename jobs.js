// Fetches active job openings from the Atlas public GraphQL API.
// No auth needed: this mirrors the exact public request the careers page makes.

const ENDPOINT = "https://api.recruitwithatlas.com/public-graphql";
const DEFAULT_AGENCY = process.env.AGENCY_ALIAS || "Cordell-Partners";

const QUERY = `query GetPublicJobOpenings($input: PublicJobOpeningInput!, $limit: Int!, $page: Int!) {
  publicJobOpenings(input: $input, limit: $limit, page: $page) {
    items { ...PublicJobOpening __typename }
    __typename
  }
}
fragment PublicJobOpening on PublicJobOpening {
  id
  jobRole
  location { ...Location __typename }
  contractType
  salary
  salaryCurrency
  __typename
}
fragment Location on Location {
  name country locality region geo street_address postal_code __typename
}`;

export async function fetchActiveJobs(agency = DEFAULT_AGENCY) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      operationName: "GetPublicJobOpenings",
      variables: { input: { agencyAlias: agency }, limit: 50, page: 1 },
      query: QUERY,
    }),
  });
  if (!res.ok) throw new Error("Atlas API HTTP " + res.status);
  const data = await res.json();
  if (data.errors) throw new Error("Atlas GraphQL error: " + JSON.stringify(data.errors).slice(0, 200));
  const items = (data.data && data.data.publicJobOpenings && data.data.publicJobOpenings.items) || [];
  return items.map((j) => ({
    id: j.id,
    role: j.jobRole,
    location: (j.location && (j.location.name || [j.location.locality, j.location.country].filter(Boolean).join(", "))) || "",
    contractType: j.contractType || "",
    salary: j.salary || "",
    salaryCurrency: j.salaryCurrency || "",
    url: "https://my.recruitwithatlas.com/public/" + j.id,
  }));
}

// Quick manual test: `node jobs.js`
if (process.argv[1] && process.argv[1].endsWith("jobs.js")) {
  fetchActiveJobs()
    .then((jobs) => { console.log("Active roles: " + jobs.length); jobs.forEach((j) => console.log("-", j.role, "|", j.location, "|", j.url)); })
    .catch((e) => { console.error(e.message); process.exit(1); });
}
