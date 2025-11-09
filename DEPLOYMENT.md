# Deployment Pipeline Documentation

## Overview

This document describes the automated deployment pipeline for the Axis Vedam apartment maintenance portal. The pipeline handles continuous integration, database migrations, and deployment to production in a streamlined workflow.

## Pipeline Architecture

The deployment pipeline consists of 5 main jobs that run sequentially:

1. **Build and Test** - Compiles the application and runs tests
2. **Database Migration** - Applies Prisma database migrations
3. **Deploy Backend API** - Deploys the Node.js/Express API to Vercel
4. **Deploy Frontend** - Deploys the React frontend to Vercel
5. **Post-deployment Verification** - Validates the deployment

## Workflow Triggers

The pipeline is triggered on:
- Push to `main` branch
- Pull requests to `main` branch
- Manual workflow dispatch

## Required GitHub Secrets

To enable the deployment pipeline, configure the following secrets in your GitHub repository:

### Navigate to: Settings → Secrets and variables → Actions → New repository secret

#### Database Configuration

```
DATABASE_URL
```
**Description:** PostgreSQL connection string for Prisma
**Example:** `postgresql://user:password@host:5432/database?schema=public`

```
DIRECT_URL
```
**Description:** Direct database connection URL (for connection pooling services like Supabase)
**Example:** `postgresql://user:password@host:6543/database`

#### Vercel Configuration

```
VERCEL_TOKEN
```
**Description:** Vercel authentication token
**How to get:** 
1. Go to Vercel Dashboard → Settings → Tokens
2. Create a new token with deployment permissions
3. Copy the token value

```
VERCEL_ORG_ID
```
**Description:** Your Vercel organization/team ID
**How to get:**
1. Run `vercel link` in your project
2. Find the value in `.vercel/project.json`

```
VERCEL_PROJECT_ID
```
**Description:** Your Vercel project ID
**How to get:**
1. Run `vercel link` in your project
2. Find the value in `.vercel/project.json`

#### API Configuration

```
API_URL
```
**Description:** Your deployed API base URL
**Example:** `https://your-api.vercel.app`

## Pipeline Jobs Breakdown

### Job 1: Build and Test

**Purpose:** Validates code quality and builds artifacts

**Steps:**
- Checkout code from repository
- Setup Node.js environment
- Install dependencies for both frontend and backend
- Generate Prisma client
- Run linting (continues on error)
- Run tests (continues on error)
- Build application
- Upload build artifacts for subsequent jobs

**Output:** Build artifacts stored for 7 days

### Job 2: Database Migration

**Purpose:** Applies database schema changes safely

**Runs:** Only on push to main branch

**Steps:**
- Checkout code
- Setup Node.js
- Install dependencies
- Run `prisma migrate deploy` (applies pending migrations)
- Generate Prisma client
- Optional database seeding

**Important:** This job runs before deployment to ensure database schema is up-to-date

### Job 3: Deploy Backend API

**Purpose:** Deploys the Express.js/Node.js API server

**Dependencies:** Requires successful build and database migration

**Steps:**
- Checkout code
- Download build artifacts
- Install Vercel CLI
- Pull Vercel environment configuration
- Deploy to Vercel production
- Verify API health endpoint

**Environment Variables Passed:**
- DATABASE_URL
- DIRECT_URL

### Job 4: Deploy Frontend

**Purpose:** Deploys the React frontend application

**Dependencies:** Requires successful API deployment

**Steps:**
- Checkout code
- Download build artifacts
- Deploy to Vercel using vercel-action

**Environment Variables Passed:**
- VITE_API_URL or REACT_APP_API_URL (for API connectivity)

### Job 5: Post-deployment Verification

**Purpose:** Validates successful deployment

**Steps:**
- Wait for deployment to stabilize (15 seconds)
- Test API connectivity
- Verify database connectivity through API
- Display deployment summary

## Setting Up the Pipeline

### Step 1: Configure GitHub Secrets

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add all required secrets listed above

### Step 2: Configure Vercel Project

1. Install Vercel CLI locally:
   ```bash
   npm install -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Get your project IDs:
   ```bash
   cat .vercel/project.json
   ```

4. Add the IDs to GitHub secrets

### Step 3: Configure Database

1. Set up a PostgreSQL database (recommended: Supabase, Railway, or Neon)
2. Get the connection string
3. Add DATABASE_URL and DIRECT_URL to GitHub secrets

### Step 4: Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - Any other API keys or configuration needed

### Step 5: Test the Pipeline

1. Create a test branch:
   ```bash
   git checkout -b test-deployment
   ```

2. Make a small change and commit:
   ```bash
   git add .
   git commit -m "Test deployment pipeline"
   git push origin test-deployment
   ```

3. Create a pull request to `main`
4. The pipeline will run on the PR
5. Merge to `main` to trigger full deployment

## Monitoring Deployments

### GitHub Actions

1. Go to the **Actions** tab in your repository
2. Click on the latest workflow run
3. View logs for each job
4. Check for any errors or warnings

### Vercel Dashboard

1. Go to Vercel Dashboard
2. Select your project
3. View deployment status and logs
4. Check function logs for API issues

## Troubleshooting

### Build Failures

**Problem:** Build job fails

**Solutions:**
- Check Node.js version compatibility
- Verify all dependencies are listed in package.json
- Run `npm ci` locally to reproduce
- Check build logs for specific errors

### Database Migration Failures

**Problem:** Migration job fails

**Solutions:**
- Verify DATABASE_URL secret is correct
- Check database is accessible from GitHub Actions
- Ensure migration files are committed
- Run `npx prisma migrate status` locally

### Deployment Failures

**Problem:** Vercel deployment fails

**Solutions:**
- Verify VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID
- Check Vercel project exists and is accessible
- Review Vercel deployment logs
- Ensure environment variables are set in Vercel

### API Health Check Failures

**Problem:** API health check fails after deployment

**Solutions:**
- Verify API_URL secret points to correct domain
- Check if API has a /health or /api/health endpoint
- Review Vercel function logs
- Verify database connectivity from API

## Pipeline Customization

### Adding Tests

Update the Build job in `.github/workflows/deploy.yml`:

```yaml
- name: Run tests
  run: npm test
```

Remove `continue-on-error: true` to make tests mandatory.

### Adding Linting

```yaml
- name: Run linting
  run: npm run lint
```

### Adding Database Seeding

Update package.json:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

The pipeline already includes an optional seeding step.

### Adding Staging Environment

Create a new job for staging deployment:

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: [build, database]
  if: github.ref == 'refs/heads/develop'
  steps:
    # Similar steps but deploy to staging
```

## Best Practices

1. **Test Locally First:** Always test changes locally before pushing
2. **Use Pull Requests:** Create PRs to test pipeline before merging to main
3. **Monitor Deployments:** Check GitHub Actions and Vercel logs after deployment
4. **Rollback Plan:** Keep previous deployments accessible in Vercel for quick rollback
5. **Database Backups:** Always backup database before major migrations
6. **Environment Parity:** Keep local, staging, and production environments similar
7. **Secret Rotation:** Regularly rotate API tokens and database credentials

## Security Considerations

- Never commit secrets to the repository
- Use GitHub Secrets for all sensitive data
- Restrict Vercel token permissions to deployment only
- Use database connection pooling for better security
- Enable branch protection rules on main branch
- Review deployment logs for any exposed credentials

## Support

For issues with the deployment pipeline:

1. Check the [GitHub Actions logs](https://github.com/mohanpathuri7/axis-vedam/actions)
2. Review Vercel deployment logs
3. Verify all secrets are configured correctly
4. Ensure database is accessible and migrations are up-to-date

## Pipeline Status

[![Deploy Pipeline](https://github.com/mohanpathuri7/axis-vedam/actions/workflows/deploy.yml/badge.svg)](https://github.com/mohanpathuri7/axis-vedam/actions/workflows/deploy.yml)

---

**Last Updated:** November 2025
**Pipeline Version:** 1.0.0
