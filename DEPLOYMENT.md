# Deploying Candor to AWS

Architecture:

```
User
 │
 ▼
CloudFront  ──────────────►  S3 (React static build)
 │
 ▼
Elastic Beanstalk (Spring Boot API)
 │
 ├──────────────► RDS (PostgreSQL)
 │
 └──────────────► GitHub REST API
```

This assumes you already have an AWS account and the AWS CLI configured locally
(`aws configure`). None of these steps can be run from a sandboxed environment -
they need your real AWS credentials and console access.

## 1. RDS (PostgreSQL)

1. AWS Console → RDS → **Create database**.
2. Engine: PostgreSQL. Template: Free tier.
3. DB instance identifier: `candor-db`. Master username/password: set your own -
   do not reuse the local `postgres`/`postgres` defaults in production.
4. Public access: **No**.
5. Initial database name: `candor`.
6. Note the endpoint and port (5432 by default) after creation.

## 2. Backend on Elastic Beanstalk

1. AWS Console → Elastic Beanstalk → **Create application**.
2. Platform: **Java** (Corretto 21, or closest available Java 21 platform).
3. Upload the jar built by `mvn clean package` from `backend/`, or let CI/CD do it.
4. Set these environment variables under Configuration → Software:

   | Variable | Value |
   |---|---|
   | `DB_HOST` | Your RDS endpoint |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `candor` |
   | `DB_USERNAME` | RDS master username |
   | `DB_PASSWORD` | RDS master password |
   | `FRONTEND_ORIGIN` | Your CloudFront domain |
   | `JWT_SECRET` | A real random secret (32+ bytes) - never the dev default in `application.properties` |

5. Allow the Beanstalk security group to reach RDS on port 5432.
6. Note the Beanstalk environment's URL for the frontend build.

## 3. Frontend on S3 + CloudFront

1. `VITE_API_BASE_URL=http://<beanstalk-url>/api npm run build`
2. Create an S3 bucket, keep it private, use CloudFront with Origin Access Control.
3. `aws s3 sync dist/ s3://<bucket> --delete`
4. Create a CloudFront distribution, default root object `index.html`.
5. Update `FRONTEND_ORIGIN` in Beanstalk to the CloudFront domain.

## 4. Secrets

Nothing should be hardcoded. Locally, defaults live in `application.properties`.
In production, every value comes from Beanstalk environment variables (or AWS
Secrets Manager feeding into those same variables).

## 5. Automating with CI/CD

`.github/workflows/ci-cd.yml` is wired for this flow. Add these as GitHub
repository secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`,
`S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`, `EB_APPLICATION`,
`EB_ENVIRONMENT`, `PRODUCTION_API_BASE_URL`. Until set, the deploy job fails
at the AWS CLI steps - expected, not a pipeline bug. Test/build jobs still
gate deployment regardless.

## Known limitations

- No autoscaling configured by default (single instance).
- RDS is single-AZ to stay in free tier - no failover replica.
- No custom domain/HTTPS certificate step - CloudFront's default domain is used as-is.
- This guide does not cover deploying Kafka or Ollama to AWS. A real deployment would replace
  the local single-node Kafka container with Amazon MSK (or a managed Kafka service), and would
  need a GPU-backed EC2 instance or a hosted LLM API to replace locally-running Ollama - neither
  is set up here, since this project runs both locally for development/demo purposes.
