# Configuration Overview
Documents the necessary configurations per environment.

## Local
Create a `.env.local` file in the root directory with these variables:

| Variable                                                                 | Purpose                                                                                 |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `SSO_CLIENT_ID`, `SSO_TENANT_ID`, `SSO_CLIENT_SECRET`, `NEXTAUTH_SECRET` | Azure authentication with next-auth                                                     |
| `SSO_CUSTOM_SCOPE`                                                       | Assign correct AD scope on Auth-callback                                                |
| `NEXTAUTH_URL`                                                           | Redirect URL after authentication (e.g., `http://localhost:3000` for local development) |
| `NODE_TLS_REJECT_UNAUTHORIZED`                                           | Certificate verification control (see note below)                                       |
| `NEXT_PUBLIC_DEBUG_MODE=true`                                            | Enables debugging features like clicking through WorkflowItems and showing extra flags  |
| `NEXT_PUBLIC_DEBUG_ROLE_OVERRIDE='FN_TEILNEHMERINNEN_ANLEGEN,...'`       | Override roles for development                                                          |

## Test
...

## Pre-Prod
...

## Production
...
