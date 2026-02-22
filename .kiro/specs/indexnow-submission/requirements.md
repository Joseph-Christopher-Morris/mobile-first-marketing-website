# Requirements Document

## Introduction

This feature implements IndexNow API integration to instantly notify search engines (Bing, Yandex, Seznam.cz, Naver) when website content is published or updated. IndexNow enables real-time indexing by submitting URLs directly to participating search engines, improving SEO visibility and reducing the time between content publication and search engine discovery.

The implementation will submit URLs identified from Ahrefs crawl data to the IndexNow API endpoint, using the project's existing S3 + CloudFront deployment architecture.

## Glossary

- **IndexNow_API**: A protocol that allows websites to instantly notify search engines about URL changes
- **API_Key**: A unique identifier used to authenticate IndexNow submissions (stored as a text file in the public directory)
- **Submission_Service**: The backend service that handles IndexNow API requests
- **URL_List**: A collection of URLs to be submitted to search engines for indexing
- **Search_Engine**: Services like Bing, Yandex, Seznam.cz, and Naver that support the IndexNow protocol
- **Deployment_Pipeline**: The existing GitHub Actions workflow that builds and deploys the static site to S3 + CloudFront
- **Ahrefs_Data**: Crawl data from Ahrefs Site Audit identifying pages that need indexing

## Requirements

### Requirement 1: Generate and Store IndexNow API Key

**User Story:** As a site owner, I want to generate and store an IndexNow API key, so that search engines can verify my submissions are authentic.

#### Acceptance Criteria

1. THE Submission_Service SHALL generate a unique API key in hexadecimal format with a minimum length of 8 characters and maximum length of 128 characters
2. THE Submission_Service SHALL store the API key as a text file at `/public/{api-key}.txt` containing only the API key value
3. THE Deployment_Pipeline SHALL include the API key file in the static build output
4. WHEN the API key file is requested via HTTPS, THE CloudFront_Distribution SHALL serve it with Content-Type `text/plain; charset=utf-8`

### Requirement 2: Submit URLs to IndexNow API

**User Story:** As a site owner, I want to submit URLs to the IndexNow API, so that search engines are immediately notified of new or updated content.

#### Acceptance Criteria

1. WHEN a URL submission is requested, THE Submission_Service SHALL send an HTTPS POST request to `https://api.indexnow.org/indexnow`
2. THE Submission_Service SHALL include the following JSON payload fields: `host`, `key`, `keyLocation`, and `urlList`
3. THE Submission_Service SHALL set the `host` field to `vividmediacheshire.com`
4. THE Submission_Service SHALL set the `keyLocation` field to the full HTTPS URL of the API key file
5. THE Submission_Service SHALL include up to 10,000 URLs per submission in the `urlList` array
6. THE Submission_Service SHALL use absolute HTTPS URLs with trailing slashes consistent with the site's canonical URL strategy
7. WHEN the API returns HTTP 200, THE Submission_Service SHALL log the successful submission
8. IF the API returns HTTP 429 (rate limit), THEN THE Submission_Service SHALL log the rate limit error and not retry immediately

### Requirement 3: Parse Ahrefs Data for URL Submission

**User Story:** As a site owner, I want to extract URLs from Ahrefs crawl data, so that I can submit the correct pages for indexing.

#### Acceptance Criteria

1. THE Submission_Service SHALL accept a list of URLs as input from Ahrefs crawl data
2. THE Submission_Service SHALL validate each URL matches the domain `vividmediacheshire.com`
3. THE Submission_Service SHALL normalize URLs to include HTTPS protocol and trailing slashes
4. THE Submission_Service SHALL exclude URLs marked with `noindex` meta tags
5. THE Submission_Service SHALL exclude the `/thank-you/` conversion page from submissions
6. WHEN duplicate URLs are provided, THE Submission_Service SHALL deduplicate the URL list before submission

### Requirement 4: Integrate with Deployment Pipeline

**User Story:** As a developer, I want IndexNow submissions to run automatically after deployment, so that new content is indexed without manual intervention.

#### Acceptance Criteria

1. THE Deployment_Pipeline SHALL execute the IndexNow submission script after successful CloudFront invalidation
2. WHEN the deployment completes successfully, THE Deployment_Pipeline SHALL submit all indexable URLs to IndexNow
3. THE Deployment_Pipeline SHALL log IndexNow submission results to the deployment logs
4. IF the IndexNow submission fails, THEN THE Deployment_Pipeline SHALL log the error but not fail the deployment
5. THE Deployment_Pipeline SHALL use environment variables for the API key and domain configuration

### Requirement 5: Manual Submission Script

**User Story:** As a developer, I want a manual script to submit URLs to IndexNow, so that I can trigger submissions outside of the deployment pipeline for testing or ad-hoc updates.

#### Acceptance Criteria

1. THE Submission_Service SHALL provide a Node.js script that can be executed via `node scripts/submit-indexnow.js`
2. THE Manual_Script SHALL accept a file path argument containing a newline-separated list of URLs
3. THE Manual_Script SHALL accept a `--dry-run` flag that validates URLs without submitting to the API
4. WHEN executed with `--dry-run`, THE Manual_Script SHALL output the URLs that would be submitted
5. THE Manual_Script SHALL display submission results including success/failure status and response codes
6. THE Manual_Script SHALL exit with code 0 on success and code 1 on failure

### Requirement 6: Error Handling and Logging

**User Story:** As a developer, I want comprehensive error handling and logging, so that I can troubleshoot submission failures.

#### Acceptance Criteria

1. WHEN a network error occurs, THE Submission_Service SHALL log the error message and URL endpoint
2. WHEN the API returns a non-200 status code, THE Submission_Service SHALL log the status code and response body
3. WHEN URL validation fails, THE Submission_Service SHALL log the invalid URL and reason for rejection
4. THE Submission_Service SHALL log the total number of URLs submitted and the submission timestamp
5. THE Submission_Service SHALL write logs to `logs/indexnow-submissions.json` in structured JSON format
6. WHEN the log file exceeds 10MB, THE Submission_Service SHALL rotate the log file with a timestamp suffix

### Requirement 7: Security and Configuration

**User Story:** As a site owner, I want secure configuration management, so that API keys are not exposed in the codebase.

#### Acceptance Criteria

1. THE Submission_Service SHALL read the API key from the environment variable `INDEXNOW_API_KEY`
2. THE Submission_Service SHALL read the site domain from the environment variable `SITE_DOMAIN` with a default value of `vividmediacheshire.com`
3. THE Deployment_Pipeline SHALL store the API key in GitHub Secrets
4. THE Submission_Service SHALL not log or expose the API key value in error messages or console output
5. THE API key text file SHALL be publicly accessible via HTTPS (required by IndexNow protocol)
6. THE Submission_Service SHALL validate the API key format before making API requests

### Requirement 8: Monitoring and Validation

**User Story:** As a site owner, I want to monitor IndexNow submission success rates, so that I can ensure search engines are receiving updates.

#### Acceptance Criteria

1. THE Submission_Service SHALL track the total number of successful submissions
2. THE Submission_Service SHALL track the total number of failed submissions
3. THE Submission_Service SHALL calculate and log the success rate percentage after each submission
4. THE Submission_Service SHALL log the timestamp of the last successful submission
5. WHEN the success rate falls below 90% over the last 10 submissions, THE Submission_Service SHALL log a warning message
6. THE Submission_Service SHALL provide a validation script that verifies the API key file is accessible via HTTPS
